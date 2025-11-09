import express from 'express';
import { generateAllImages } from '../ImageGeneration/imageGenerationService.js';

export const imageGenerationRouter = express.Router();

// Store active generation sessions with stop flags
const activeSessions = new Map();
const stopFlags = new Map();

imageGenerationRouter.post('/generate-images', async (req, res) => {
  // Force immediate output
  process.stdout.write('\n========================================\n');
  process.stdout.write('POST /api/generate-images - HANDLER EXECUTING\n');
  process.stdout.write('========================================\n');
  
  console.log('POST /api/generate-images - Request received');
  console.log('Request body keys:', Object.keys(req.body));
  
  const { projectPath, promptsByStyle } = req.body;
  
  console.log('Project Path:', projectPath);
  console.log('Prompts by style:', {
    illustration: promptsByStyle?.illustration?.length || 0,
    clear: promptsByStyle?.clear?.length || 0,
    consistent: promptsByStyle?.consistent?.length || 0
  });
  
  if (!projectPath || !promptsByStyle) {
    console.log('ERROR: Missing projectPath or promptsByStyle');
    return res.status(400).json({ success: false, error: 'Missing projectPath or promptsByStyle' });
  }
  
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
    
    console.log('Calling generateAllImages...');
    const result = await generateAllImages(projectPath, promptsByStyle, (progress) => {
      // Check stop flag
      if (stopFlags.get(projectPath)) {
        throw new Error('Generation stopped by user');
      }
      sendProgress({ type: 'progress', ...progress });
    });
    
    console.log('Generation complete! Result:', result);
    sendProgress({ type: 'complete', result });
    res.end();
  } catch (error) {
    console.error('Image generation error:', error);
    console.error('Error stack:', error.stack);
    sendProgress({ type: 'error', error: error.message });
    res.end();
  } finally {
    console.log('Cleaning up session...');
    activeSessions.delete(projectPath);
    stopFlags.delete(projectPath);
    console.log('Session cleaned up');
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
