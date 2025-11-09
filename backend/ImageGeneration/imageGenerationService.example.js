/**
 * Example configuration for imageGenerationService.js
 * 
 * Copy this file to imageGenerationService.js and replace with your actual API keys
 */

import { GoogleGenAI, Modality } from "@google/genai";
import * as fs from "node:fs";
import * as path from "node:path";

// ============================================================================
// CONFIGURATION - REPLACE WITH YOUR ACTUAL API KEYS
// ============================================================================

// API Keys for each style to avoid rate limits
// Each style should have 2-3 keys for optimal performance
const API_KEYS = {
  illustration: [
    "YOUR_GEMINI_API_KEY_1",  // Replace with actual key
    "YOUR_GEMINI_API_KEY_2",  // Replace with actual key
  ],
  clear: [
    "YOUR_GEMINI_API_KEY_3",  // Replace with actual key
    "YOUR_GEMINI_API_KEY_4",  // Replace with actual key
  ],
  consistent: [
    "YOUR_GEMINI_API_KEY_5",  // Replace with actual key
    "YOUR_GEMINI_API_KEY_6",  // Replace with actual key
  ]
};

// Model configuration
const MODEL_NAME = "gemini-2.0-flash-preview-image-generation";

// Rate limiting (adjust based on your API quota)
const REQUESTS_PER_MINUTE = 9; // 9 requests per minute = safe for 10 RPM limit
const DELAY_BETWEEN_REQUESTS_MS = (60 / REQUESTS_PER_MINUTE) * 1000;

// Style reference image path (optional)
const STYLE_REFERENCE_IMAGE_PATH = path.join(process.cwd(), "backend/ImageGeneration/style_reference.png");

// ============================================================================
// TIPS FOR CONFIGURATION
// ============================================================================

/*
1. API KEYS:
   - Get keys from: https://makersuite.google.com/app/apikey
   - Each key has a rate limit (typically 10 requests/minute)
   - Use different keys for each style to avoid conflicts
   - Minimum 2 keys per style recommended
   - More keys = faster generation

2. RATE LIMITING:
   - Default: 9 requests/minute (safe for 10 RPM limit)
   - If you have higher quota, increase REQUESTS_PER_MINUTE
   - If you hit rate limits, decrease REQUESTS_PER_MINUTE
   - System automatically rotates keys on 429 errors

3. STYLE REFERENCE:
   - Place your reference image at: backend/ImageGeneration/style_reference.png
   - Used for hard cut transitions (transition_type: 'H')
   - Maintains consistent visual style
   - Optional but recommended
   - Format: PNG, recommended size: 1024x1024

4. PERFORMANCE:
   - With 2 keys per style: ~5-10 minutes for 30 beats
   - With 3 keys per style: ~3-7 minutes for 30 beats
   - All 3 styles generate concurrently
   - Progress saved after each image

5. COST ESTIMATION:
   - Check current pricing at: https://ai.google.dev/pricing
   - Typical: ~$0.01-0.05 per image
   - 90 images (30 beats × 3 styles) ≈ $1-5
   - Monitor your usage in Google Cloud Console
*/

// ============================================================================
// EXAMPLE CONFIGURATIONS
// ============================================================================

// Example 1: Development (minimal keys)
/*
const API_KEYS = {
  illustration: ["dev_key_1"],
  clear: ["dev_key_2"],
  consistent: ["dev_key_3"]
};
const REQUESTS_PER_MINUTE = 5; // Slower, safer
*/

// Example 2: Production (optimal keys)
/*
const API_KEYS = {
  illustration: ["prod_key_1", "prod_key_2", "prod_key_3"],
  clear: ["prod_key_4", "prod_key_5", "prod_key_6"],
  consistent: ["prod_key_7", "prod_key_8", "prod_key_9"]
};
const REQUESTS_PER_MINUTE = 9; // Balanced
*/

// Example 3: High-speed (many keys)
/*
const API_KEYS = {
  illustration: ["key_1", "key_2", "key_3", "key_4"],
  clear: ["key_5", "key_6", "key_7", "key_8"],
  consistent: ["key_9", "key_10", "key_11", "key_12"]
};
const REQUESTS_PER_MINUTE = 12; // Faster, if quota allows
*/

// ============================================================================
// DO NOT MODIFY BELOW THIS LINE (unless you know what you're doing)
// ============================================================================

// Track current API key index for each style
const currentApiKeyIndex = {
  illustration: 0,
  clear: 0,
  consistent: 0
};

// Store AI instances for each style
const aiInstances = {};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function initializeAI(style) {
  const keys = API_KEYS[style];
  const index = currentApiKeyIndex[style];
  aiInstances[style] = new GoogleGenAI({ apiKey: keys[index] });
}

function switchApiKey(style) {
  const keys = API_KEYS[style];
  currentApiKeyIndex[style] = (currentApiKeyIndex[style] + 1) % keys.length;
  initializeAI(style);
  console.log(`[${style}] Switched to API Key index ${currentApiKeyIndex[style]}`);
}

function getProgressFilePath(projectPath, style) {
  return path.join(projectPath, `image_progress_${style}.json`);
}

function loadProgress(projectPath, style) {
  const progressFile = getProgressFilePath(projectPath, style);
  try {
    if (fs.existsSync(progressFile)) {
      const data = JSON.parse(fs.readFileSync(progressFile, "utf-8"));
      return data.completedBeats || [];
    }
  } catch (error) {
    console.warn(`Could not read progress file for ${style}:`, error.message);
  }
  return [];
}

function saveProgress(projectPath, style, completedBeats) {
  const progressFile = getProgressFilePath(projectPath, style);
  fs.writeFileSync(progressFile, JSON.stringify({ completedBeats, lastUpdated: new Date().toISOString() }));
}

async function generateImageForBeat(projectPath, style, prompt, onProgress) {
  const { shot_number, beat_number, transition_type, ai_prompt } = prompt;
  
  const outputDir = path.join(projectPath, "generated_images", style, `Shot_${shot_number}`);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const imageName = `Beat_${beat_number}.png`;
  const imagePath = path.join(outputDir, imageName);
  
  // Check if already exists
  if (fs.existsSync(imagePath)) {
    console.log(`[${style}] Image already exists for Beat ${beat_number}, skipping...`);
    return { success: true, imagePath, skipped: true };
  }
  
  // Initialize AI if not done
  if (!aiInstances[style]) {
    initializeAI(style);
  }
  
  let generationPrompt = ai_prompt;
  let imageReferencePath = null;
  
  // Use style reference for hard cuts
  if (transition_type === 'H' && fs.existsSync(STYLE_REFERENCE_IMAGE_PATH)) {
    imageReferencePath = STYLE_REFERENCE_IMAGE_PATH;
  }
  
  let success = false;
  let attempts = 0;
  const maxAttempts = API_KEYS[style].length;
  
  while (!success && attempts < maxAttempts) {
    try {
      const contents = [{ text: generationPrompt }];
      
      if (imageReferencePath) {
        const imageData = fs.readFileSync(imageReferencePath);
        contents.push({
          inlineData: {
            mimeType: "image/png",
            data: imageData.toString("base64"),
          },
        });
      }
      
      const apiResponse = await aiInstances[style].models.generateContent({
        model: MODEL_NAME,
        contents: contents,
        config: {
          responseModalities: [Modality.TEXT, Modality.IMAGE],
        },
      });
      
      let imageGeneratedAndSaved = false;
      if (apiResponse.candidates?.[0]?.content?.parts) {
        for (const part of apiResponse.candidates[0].content.parts) {
          if (part.inlineData?.mimeType.startsWith("image/")) {
            const buffer = Buffer.from(part.inlineData.data, "base64");
            fs.writeFileSync(imagePath, buffer);
            console.log(`[${style}] Image saved: Beat ${beat_number}`);
            imageGeneratedAndSaved = true;
            success = true;
            break;
          }
        }
      }
      
      if (!imageGeneratedAndSaved) {
        throw new Error("No image data found in API response.");
      }
      
    } catch (error) {
      console.error(`[${style}] Error generating Beat ${beat_number}:`, error.message);
      
      if (error.message.includes("429")) {
        attempts++;
        if (attempts < maxAttempts) {
          switchApiKey(style);
          await sleep(2000);
        } else {
          console.error(`[${style}] All API keys exhausted for Beat ${beat_number}`);
          return { success: false, error: "Rate limit exceeded on all API keys" };
        }
      } else {
        return { success: false, error: error.message };
      }
    }
  }
  
  if (success) {
    return { success: true, imagePath };
  }
  
  return { success: false, error: "Failed after all attempts" };
}

export async function generateImagesForStyle(projectPath, style, prompts, onProgress) {
  console.log(`\n[${style}] Starting image generation for ${prompts.length} prompts...`);
  
  const completedBeats = loadProgress(projectPath, style);
  const remainingPrompts = prompts.filter(p => !completedBeats.includes(p.beat_number));
  
  if (remainingPrompts.length === 0) {
    console.log(`[${style}] All images already generated!`);
    onProgress?.({ style, completed: prompts.length, total: prompts.length, status: 'complete' });
    return { success: true, message: "All images already generated" };
  }
  
  console.log(`[${style}] Resuming from ${completedBeats.length}/${prompts.length} completed`);
  
  for (let i = 0; i < remainingPrompts.length; i++) {
    const prompt = remainingPrompts[i];
    
    onProgress?.({
      style,
      beat_number: prompt.beat_number,
      completed: completedBeats.length + i,
      total: prompts.length,
      status: 'generating'
    });
    
    const result = await generateImageForBeat(projectPath, style, prompt, onProgress);
    
    if (result.success) {
      completedBeats.push(prompt.beat_number);
      saveProgress(projectPath, style, completedBeats);
      
      onProgress?.({
        style,
        beat_number: prompt.beat_number,
        completed: completedBeats.length,
        total: prompts.length,
        status: result.skipped ? 'skipped' : 'complete',
        imagePath: result.imagePath
      });
    } else {
      onProgress?.({
        style,
        beat_number: prompt.beat_number,
        completed: completedBeats.length,
        total: prompts.length,
        status: 'error',
        error: result.error
      });
    }
    
    // Delay between requests
    if (i < remainingPrompts.length - 1) {
      await sleep(DELAY_BETWEEN_REQUESTS_MS);
    }
  }
  
  console.log(`[${style}] Completed ${completedBeats.length}/${prompts.length} images`);
  return { success: true, completed: completedBeats.length, total: prompts.length };
}

export async function generateAllImages(projectPath, promptsByStyle, onProgress) {
  const styles = ['illustration', 'clear', 'consistent'];
  
  // Run all three styles concurrently
  const promises = styles.map(style => {
    const prompts = promptsByStyle[style] || [];
    if (prompts.length === 0) {
      console.log(`[${style}] No prompts found, skipping...`);
      return Promise.resolve({ success: true, style });
    }
    return generateImagesForStyle(projectPath, style, prompts, onProgress);
  });
  
  const results = await Promise.all(promises);
  
  return {
    success: results.every(r => r.success),
    results
  };
}
