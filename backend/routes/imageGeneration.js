import express from 'express';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { generateAllImages } from '../ImageGeneration/imageGenerationService.js';

export const imageGenerationRouter = express.Router();

// Store active generation sessions with stop flags
const activeSessions = new Map();
const stopFlags = new Map();

// Simple test route to verify routing works
imageGenerationRouter.get('/test-route', (req, res) => {
  console.log('TEST ROUTE HIT!');
  res.json({ success: true, message: 'Route is working!' });
});

// Debug endpoint to check file structure
imageGenerationRouter.post('/debug-images', (req, res) => {
  try {
    const { projectPath } = req.body;
    console.log('\n========================================');
    console.log('DEBUG IMAGES - Checking file structure');
    console.log('Project Path:', projectPath);
    
    const genImagesDir = path.join(projectPath, 'generated_images');
    console.log('Generated images dir:', genImagesDir);
    console.log('Exists?', fs.existsSync(genImagesDir));
    
    if (fs.existsSync(genImagesDir)) {
      const styles = fs.readdirSync(genImagesDir, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => d.name);
      console.log('Style directories:', styles);
      
      for (const style of styles) {
        const styleDir = path.join(genImagesDir, style);
        const shots = fs.readdirSync(styleDir, { withFileTypes: true })
          .filter(d => d.isDirectory())
          .map(d => d.name);
        console.log(`\n${style} shots:`, shots);
        
        for (const shot of shots.slice(0, 2)) { // First 2 shots only
          const shotDir = path.join(styleDir, shot);
          const files = fs.readdirSync(shotDir);
          console.log(`  ${shot} files:`, files.slice(0, 5));
        }
      }
    }
    console.log('========================================\n');
    
    res.json({ success: true, message: 'Check backend console for details' });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

imageGenerationRouter.post('/generate-images', async (req, res) => {
  try {
    // Force immediate output
    process.stdout.write('\n========================================\n');
    process.stdout.write('POST /api/generate-images - HANDLER EXECUTING\n');
    process.stdout.write('========================================\n');

    console.log('POST /api/generate-images - Request received');
    console.log('Request body:', req.body);
    console.log('Request body keys:', Object.keys(req.body || {}));

    const { projectPath } = req.body || {};

    console.log('Project Path:', projectPath);

    if (!projectPath) {
      console.log('ERROR: Missing projectPath');
      return res.status(400).json({ success: false, error: 'Missing projectPath' });
    }

    // Load prompts from project directory files
    console.log('Loading prompts from project directory...');
    const promptsByStyle = {};
    const styles = ['illustration', 'clear', 'consistent'];

    for (const style of styles) {
      const promptsFilePath = path.join(projectPath, 'prompts', `prompts-${style}.js`);
      console.log(`Looking for prompts file: ${promptsFilePath}`);

      try {
        if (fs.existsSync(promptsFilePath)) {
          // Read the file content
          const fileContent = fs.readFileSync(promptsFilePath, 'utf-8');
          console.log(`File content length: ${fileContent.length} characters`);

          // Try multiple patterns to extract the prompts array
          let promptsArray = null;

          // Pattern 1: export default [...]
          let promptsMatch = fileContent.match(/export\s+default\s+(\[[\s\S]*\]);?\s*$/);
          if (promptsMatch) {
            console.log(`Matched pattern: export default [...]`);
            promptsArray = promptsMatch[1];
          }

          // Pattern 2: const prompts = [...]; export default prompts;
          if (!promptsArray) {
            promptsMatch = fileContent.match(/const\s+prompts\s*=\s*(\[[\s\S]*\]);/);
            if (promptsMatch) {
              console.log(`Matched pattern: const prompts = [...]`);
              promptsArray = promptsMatch[1];
            }
          }

          // Pattern 3: export const prompts = [...]
          if (!promptsArray) {
            promptsMatch = fileContent.match(/export\s+const\s+prompts\s*=\s*(\[[\s\S]*\]);?/);
            if (promptsMatch) {
              console.log(`Matched pattern: export const prompts = [...]`);
              promptsArray = promptsMatch[1];
            }
          }

          if (promptsArray) {
            // Use eval to parse the array (safe since it's our own file)
            try {
              promptsByStyle[style] = eval(promptsArray);
              console.log(`✓ Loaded ${promptsByStyle[style].length} prompts for ${style}`);

              // Log first prompt as sample
              if (promptsByStyle[style].length > 0) {
                console.log(`Sample prompt:`, JSON.stringify(promptsByStyle[style][0], null, 2));
              }
            } catch (evalError) {
              console.error(`Error evaluating prompts array:`, evalError.message);
              promptsByStyle[style] = [];
            }
          } else {
            console.log(`✗ Could not parse prompts from ${style} file`);
            console.log(`File preview (first 200 chars):`, fileContent.substring(0, 200));
            promptsByStyle[style] = [];
          }
        } else {
          console.log(`✗ Prompts file not found for ${style}`);
          promptsByStyle[style] = [];
        }
      } catch (error) {
        console.error(`Error loading prompts for ${style}:`, error.message);
        console.error(`Error stack:`, error.stack);
        promptsByStyle[style] = [];
      }
    }

    console.log('Prompts loaded:', {
      illustration: promptsByStyle.illustration?.length || 0,
      clear: promptsByStyle.clear?.length || 0,
      consistent: promptsByStyle.consistent?.length || 0
    });

    // Check if already generating
    if (activeSessions.has(projectPath)) {
      console.log('ERROR: Generation already in progress for this project');
      return res.status(409).json({ success: false, error: 'Image generation already in progress' });
    }

    console.log('Setting up SSE connection...');
    // Set up SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    console.log('SSE headers sent, connection established');

    const sessionId = Date.now();
    activeSessions.set(projectPath, sessionId);
    stopFlags.set(projectPath, false);
    console.log('Session created:', sessionId);

    const sendProgress = (data) => {
      try {
        console.log('Sending progress update:', data.type, data.style || '', data.beat_number || '');
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      } catch (error) {
        console.error('Error sending progress:', error.message);
      }
    };

    // Handle client disconnect
    req.on('close', () => {
      console.log(`Client disconnected for ${projectPath}, but generation continues...`);
    });

    try {
      console.log('Sending start message...');
      sendProgress({ type: 'start', message: 'Starting image generation...' });
      console.log('Start message sent');

      console.log('About to call generateAllImages...');
      console.log('Parameters:', {
        projectPath,
        promptCounts: {
          illustration: promptsByStyle.illustration?.length || 0,
          clear: promptsByStyle.clear?.length || 0,
          consistent: promptsByStyle.consistent?.length || 0
        }
      });

      const result = await generateAllImages(projectPath, promptsByStyle, (progress) => {
        console.log('Progress callback received:', progress);
        // Check stop flag
        if (stopFlags.get(projectPath)) {
          throw new Error('Generation stopped by user');
        }
        sendProgress({ type: 'progress', ...progress });
      });

      console.log('Generation complete! Result:', JSON.stringify(result, null, 2));
      sendProgress({ type: 'complete', result });
      res.end();
      console.log('Response ended');
    } catch (error) {
      console.error('!!! IMAGE GENERATION ERROR !!!');
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Error details:', error);
      sendProgress({ type: 'error', error: error.message, stack: error.stack });
      res.end();
    } finally {
      console.log('Cleaning up session...');
      activeSessions.delete(projectPath);
      stopFlags.delete(projectPath);
      console.log('Session cleaned up');
    }
  } catch (handlerError) {
    console.error('!!! HANDLER ERROR - CAUGHT AT TOP LEVEL !!!');
    console.error('Handler error:', handlerError);
    console.error('Handler error message:', handlerError.message);
    console.error('Handler error stack:', handlerError.stack);
    try {
      res.status(500).json({ success: false, error: handlerError.message, stack: handlerError.stack });
    } catch (e) {
      console.error('Could not send error response:', e.message);
    }
  }
});

imageGenerationRouter.post('/stop-generation', (req, res) => {
  const { projectPath } = req.body;

  if (!projectPath) {
    return res.status(400).json({ success: false, error: 'Missing projectPath' });
  }

  if (activeSessions.has(projectPath)) {
    stopFlags.set(projectPath, true);
    res.json({ success: true, message: 'Stop signal sent' });
  } else {
    res.json({ success: false, error: 'No active generation found' });
  }
});

imageGenerationRouter.get('/generation-status/:projectPath', (req, res) => {
  const { projectPath } = req.params;
  const isGenerating = activeSessions.has(projectPath);
  res.json({ success: true, isGenerating });
});

// Get current generation progress from files
imageGenerationRouter.post('/get-generation-progress', (req, res) => {
  try {
    const { projectPath } = req.body;

    if (!projectPath) {
      return res.status(400).json({ success: false, error: 'Missing projectPath' });
    }

    const progress = {};
    const styles = ['illustration', 'clear', 'consistent'];

    for (const style of styles) {
      const progressFilePath = path.join(projectPath, `image_progress_${style}.json`);

      if (fs.existsSync(progressFilePath)) {
        try {
          const progressData = JSON.parse(fs.readFileSync(progressFilePath, 'utf-8'));
          progress[style] = {
            completedBeats: progressData.completedBeats || [],
            lastUpdated: progressData.lastUpdated
          };
        } catch (error) {
          console.error(`Error reading progress for ${style}:`, error.message);
          progress[style] = { completedBeats: [], lastUpdated: null };
        }
      } else {
        progress[style] = { completedBeats: [], lastUpdated: null };
      }
    }

    res.json({ success: true, progress });
  } catch (error) {
    console.error('Error getting generation progress:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get generated images for a project
imageGenerationRouter.post('/get-generated-images', (req, res) => {
  try {
    console.log('\n========================================');
    console.log('GET GENERATED IMAGES - Request received');
    const { projectPath } = req.body;
    console.log('Project Path:', projectPath);

    if (!projectPath) {
      return res.status(400).json({ success: false, error: 'Missing projectPath' });
    }

    const images = {};
    const styles = ['illustration', 'clear', 'consistent'];

    for (const style of styles) {
      images[style] = {};
      const styleDir = path.join(projectPath, 'generated_images', style);
      console.log(`Checking ${style} directory:`, styleDir);

      if (fs.existsSync(styleDir)) {
        console.log(`✓ ${style} directory exists`);
        // Get all shot directories
        const shotDirs = fs.readdirSync(styleDir, { withFileTypes: true })
          .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('Shot_'))
          .map(dirent => dirent.name);

        console.log(`Found ${shotDirs.length} shot directories:`, shotDirs);

        for (const shotDir of shotDirs) {
          const shotPath = path.join(styleDir, shotDir);
          const files = fs.readdirSync(shotPath);
          console.log(`Files in ${shotDir}:`, files.slice(0, 5)); // Show first 5

          for (const file of files) {
            if (file.endsWith('.png')) {
              // Extract beat number from filename
              // Handle multiple formats: Beat_1.1.png, Beat 1.png, Beat_1.png
              let match = file.match(/Beat[_\s]([\d.]+)\.png/);
              if (match) {
                const beatNumberOnly = match[1];
                const filePath = path.join(shotPath, file);
                // Return relative path from project directory
                const relativePath = path.relative(projectPath, filePath);
                
                // Store with multiple keys to handle different formats
                // Key 1: Just the number (e.g., "1", "1.1")
                images[style][beatNumberOnly] = relativePath;
                // Key 2: With "Beat " prefix (e.g., "Beat 1", "Beat 1.1")
                images[style][`Beat ${beatNumberOnly}`] = relativePath;
                
                console.log(`  Mapped: ${file} → beat "${beatNumberOnly}" and "Beat ${beatNumberOnly}"`);
              } else {
                console.log(`  Skipped: ${file} (doesn't match pattern)`);
              }
            }
          }
        }
        console.log(`${style}: Found ${Object.keys(images[style]).length} images`);
      } else {
        console.log(`✗ ${style} directory does not exist`);
      }
    }

    console.log('\nTotal images by style:');
    for (const style of styles) {
      console.log(`  ${style}: ${Object.keys(images[style]).length} images`);
    }
    console.log('========================================\n');

    res.json({ success: true, images });
  } catch (error) {
    console.error('Error getting generated images:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Save image selection
imageGenerationRouter.post('/save-image-selection', async (req, res) => {
  try {
    console.log('\n========================================');
    console.log('SAVE IMAGE SELECTION - Request received');
    const { projectPath, beatNumber, style, isFlagged } = req.body;
    console.log('Request body:', { projectPath, beatNumber, style, isFlagged });

    if (!projectPath || !beatNumber || !style) {
      console.error('Missing required fields!');
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Create selected_images directory
    const selectedDir = path.join(projectPath, 'selected_images');
    console.log('Selected images directory:', selectedDir);
    if (!fs.existsSync(selectedDir)) {
      console.log('Creating selected_images directory...');
      fs.mkdirSync(selectedDir, { recursive: true });
    }

    // Clean beat number: remove "Beat " prefix if present
    const cleanBeatNumber = String(beatNumber).replace(/^Beat\s+/i, '').trim();
    console.log(`Beat number: "${beatNumber}" → cleaned: "${cleanBeatNumber}"`);
    
    // Find source image
    const sourceDir = path.join(projectPath, 'generated_images', style);
    console.log('Source directory:', sourceDir);
    let sourceFile = null;

    // Search through shot directories
    const shotDirs = fs.readdirSync(sourceDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('Shot_'))
      .map(dirent => dirent.name);
    
    console.log('Shot directories found:', shotDirs);

    for (const shotDir of shotDirs) {
      const shotPath = path.join(sourceDir, shotDir);
      const fileName = `Beat_${cleanBeatNumber}.png`;
      const filePath = path.join(shotPath, fileName);
      console.log(`Looking for: ${filePath}`);

      if (fs.existsSync(filePath)) {
        sourceFile = filePath;
        console.log('✓ Source file found:', sourceFile);
        break;
      } else {
        console.log('✗ Not found');
      }
    }

    if (!sourceFile) {
      console.error('Source image not found!');
      console.log('Available files in shot directories:');
      for (const shotDir of shotDirs) {
        const shotPath = path.join(sourceDir, shotDir);
        const files = fs.readdirSync(shotPath);
        console.log(`  ${shotDir}:`, files);
      }
      return res.status(404).json({ success: false, error: 'Source image not found' });
    }

    // Copy to selected_images with appropriate name (use clean beat number)
    const destFileName = isFlagged ? `Beat_${cleanBeatNumber}_flagged.png` : `Beat_${cleanBeatNumber}.png`;
    const destPath = path.join(selectedDir, destFileName);
    console.log('Copying to:', destPath);

    fs.copyFileSync(sourceFile, destPath);
    console.log('✓ File copied successfully');

    // Save selection metadata (use original beatNumber as key for consistency)
    const metadataPath = path.join(projectPath, 'image_selections.json');
    let metadata = {};

    if (fs.existsSync(metadataPath)) {
      metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
    }

    metadata[beatNumber] = {
      style,
      isFlagged,
      selectedAt: new Date().toISOString()
    };

    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    console.log('✓ Metadata saved');
    console.log('========================================\n');

    res.json({ success: true, message: 'Image selection saved' });
  } catch (error) {
    console.error('!!! ERROR SAVING IMAGE SELECTION !!!');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Serve image file
imageGenerationRouter.get('/serve-image', (req, res) => {
  try {
    const imagePath = req.query.path;
    
    if (!imagePath) {
      return res.status(400).json({ success: false, error: 'Missing image path' });
    }

    console.log('Serving image:', imagePath);

    if (!fs.existsSync(imagePath)) {
      console.error('Image not found:', imagePath);
      return res.status(404).json({ success: false, error: 'Image not found' });
    }

    // Set proper headers for image
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
    
    // Stream the file
    const fileStream = fs.createReadStream(imagePath);
    fileStream.pipe(res);
    
    fileStream.on('error', (error) => {
      console.error('Error streaming image:', error);
      if (!res.headersSent) {
        res.status(500).json({ success: false, error: 'Error streaming image' });
      }
    });
  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Debug endpoint to check beat number formats
imageGenerationRouter.post('/debug-beat-formats', (req, res) => {
  try {
    const { projectPath } = req.body;
    
    if (!projectPath) {
      return res.status(400).json({ success: false, error: 'Missing projectPath' });
    }

    const debug = {
      generatedImages: {},
      beatFiles: []
    };

    // Check what's in generated_images
    const styles = ['illustration', 'clear', 'consistent'];
    for (const style of styles) {
      const styleDir = path.join(projectPath, 'generated_images', style);
      if (fs.existsSync(styleDir)) {
        const shotDirs = fs.readdirSync(styleDir, { withFileTypes: true })
          .filter(d => d.isDirectory() && d.name.startsWith('Shot_'))
          .map(d => d.name);
        
        for (const shotDir of shotDirs) {
          const shotPath = path.join(styleDir, shotDir);
          const files = fs.readdirSync(shotPath).filter(f => f.endsWith('.png'));
          debug.beatFiles.push(...files.map(f => `${style}/${shotDir}/${f}`));
        }
      }
    }

    res.json({ success: true, debug });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get image selections
imageGenerationRouter.post('/get-image-selections', (req, res) => {
  try {
    const { projectPath } = req.body;

    if (!projectPath) {
      return res.status(400).json({ success: false, error: 'Missing projectPath' });
    }

    const metadataPath = path.join(projectPath, 'image_selections.json');

    if (fs.existsSync(metadataPath)) {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
      res.json({ success: true, selections: metadata });
    } else {
      res.json({ success: true, selections: {} });
    }
  } catch (error) {
    console.error('Error getting image selections:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test endpoint to verify API configuration
imageGenerationRouter.get('/test-api-keys', async (req, res) => {
  try {
    const { GoogleGenAI } = await import('@google/genai');

    // Test with first illustration key
    const testKey = "AIzaSyCvNyRcEYUheM2NTwyBisEduBznhJlEhC0";
    const ai = new GoogleGenAI({ apiKey: testKey });

    console.log('Testing API key...');
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-preview-image-generation',
      contents: [{ text: 'A simple test image of a red circle' }],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    const hasImage = response.candidates?.[0]?.content?.parts?.some(
      part => part.inlineData?.mimeType.startsWith('image/')
    );

    res.json({
      success: true,
      message: 'API key is working!',
      hasImage,
      response: hasImage ? 'Image generated successfully' : 'No image in response'
    });
  } catch (error) {
    console.error('API key test failed:', error);
    res.json({
      success: false,
      error: error.message,
      details: error.toString()
    });
  }
});
