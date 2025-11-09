/**
 * Simple test to verify image generation works
 * Run with: node backend/test-simple-generation.js
 */

import { generateAllImages } from './ImageGeneration/imageGenerationService.js';
import * as fs from 'node:fs';
import * as path from 'node:path';

const TEST_PROJECT_PATH = './test-simple-project';
const TEST_PROMPTS = {
  illustration: [
    {
      shot_number: 1,
      beat_number: "1.1",
      script_phrase: "Test",
      transition_type: "H",
      ai_prompt: "A simple red circle on white background"
    }
  ],
  clear: [],
  consistent: []
};

console.log('========================================');
console.log('Simple Image Generation Test');
console.log('========================================\n');

// Create test directory
if (!fs.existsSync(TEST_PROJECT_PATH)) {
  fs.mkdirSync(TEST_PROJECT_PATH, { recursive: true });
  console.log('✓ Created test directory');
}

console.log('Starting generation with 1 test prompt...\n');

const startTime = Date.now();

generateAllImages(TEST_PROJECT_PATH, TEST_PROMPTS, (progress) => {
  console.log('Progress update:', JSON.stringify(progress, null, 2));
})
  .then(result => {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('\n========================================');
    console.log('Test Complete!');
    console.log('========================================');
    console.log('Duration:', duration, 'seconds');
    console.log('Result:', JSON.stringify(result, null, 2));
    
    // Check if image was created
    const imagePath = path.join(TEST_PROJECT_PATH, 'generated_images', 'illustration', 'Shot_1', 'Beat_1.1.png');
    if (fs.existsSync(imagePath)) {
      console.log('\n✓ SUCCESS: Image file created at:', imagePath);
      const stats = fs.statSync(imagePath);
      console.log('  File size:', (stats.size / 1024).toFixed(2), 'KB');
    } else {
      console.log('\n✗ FAILED: Image file not found at:', imagePath);
    }
    
    console.log('\nTest project preserved at:', TEST_PROJECT_PATH);
    console.log('(Delete manually to clean up)');
  })
  .catch(error => {
    console.error('\n✗ TEST FAILED:');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  });
