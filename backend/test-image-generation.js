/**
 * Test script for Step 8 Image Generation
 * Run with: node test-image-generation.js
 */

import { generateAllImages } from './ImageGeneration/imageGenerationService.js';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Test configuration
const TEST_PROJECT_PATH = './test-project';
const TEST_PROMPTS = {
  illustration: [
    {
      shot_number: 1,
      beat_number: "1.1",
      script_phrase: "Test phrase 1",
      transition_type: "H",
      ai_prompt: "A beautiful sunset over mountains, digital art style"
    },
    {
      shot_number: 1,
      beat_number: "1.2",
      script_phrase: "Test phrase 2",
      transition_type: "C",
      ai_prompt: "Zoom into the mountain peaks, maintaining the sunset lighting"
    }
  ],
  clear: [
    {
      shot_number: 1,
      beat_number: "1.1",
      script_phrase: "Test phrase 1",
      transition_type: "H",
      ai_prompt: "A beautiful sunset over mountains, photorealistic style"
    },
    {
      shot_number: 1,
      beat_number: "1.2",
      script_phrase: "Test phrase 2",
      transition_type: "C",
      ai_prompt: "Zoom into the mountain peaks, maintaining the sunset lighting"
    }
  ],
  consistent: [
    {
      shot_number: 1,
      beat_number: "1.1",
      script_phrase: "Test phrase 1",
      transition_type: "H",
      ai_prompt: "A beautiful sunset over mountains, consistent art style"
    },
    {
      shot_number: 1,
      beat_number: "1.2",
      script_phrase: "Test phrase 2",
      transition_type: "C",
      ai_prompt: "Zoom into the mountain peaks, maintaining the sunset lighting"
    }
  ]
};

// Setup test project directory
function setupTestProject() {
  console.log('Setting up test project...');
  if (!fs.existsSync(TEST_PROJECT_PATH)) {
    fs.mkdirSync(TEST_PROJECT_PATH, { recursive: true });
  }
  console.log('✓ Test project directory created');
}

// Cleanup test project
function cleanupTestProject() {
  console.log('\nCleaning up test project...');
  if (fs.existsSync(TEST_PROJECT_PATH)) {
    fs.rmSync(TEST_PROJECT_PATH, { recursive: true, force: true });
  }
  console.log('✓ Test project cleaned up');
}

// Progress callback
function onProgress(progress) {
  const { style, beat_number, completed, total, status, error } = progress;
  
  if (status === 'generating') {
    console.log(`[${style}] Generating Beat ${beat_number}... (${completed}/${total})`);
  } else if (status === 'complete') {
    console.log(`[${style}] ✓ Beat ${beat_number} complete (${completed}/${total})`);
  } else if (status === 'skipped') {
    console.log(`[${style}] ⊙ Beat ${beat_number} already exists (${completed}/${total})`);
  } else if (status === 'error') {
    console.log(`[${style}] ✗ Beat ${beat_number} failed: ${error} (${completed}/${total})`);
  }
}

// Verify output
function verifyOutput() {
  console.log('\nVerifying output...');
  
  const styles = ['illustration', 'clear', 'consistent'];
  let allSuccess = true;
  
  for (const style of styles) {
    console.log(`\nChecking ${style}:`);
    
    // Check progress file
    const progressFile = path.join(TEST_PROJECT_PATH, `image_progress_${style}.json`);
    if (fs.existsSync(progressFile)) {
      const progress = JSON.parse(fs.readFileSync(progressFile, 'utf-8'));
      console.log(`  ✓ Progress file exists: ${progress.completedBeats.length} beats completed`);
    } else {
      console.log(`  ✗ Progress file missing`);
      allSuccess = false;
    }
    
    // Check images
    const imagesDir = path.join(TEST_PROJECT_PATH, 'generated_images', style, 'Shot_1');
    if (fs.existsSync(imagesDir)) {
      const files = fs.readdirSync(imagesDir);
      console.log(`  ✓ Images directory exists: ${files.length} images`);
      files.forEach(file => console.log(`    - ${file}`));
    } else {
      console.log(`  ✗ Images directory missing`);
      allSuccess = false;
    }
  }
  
  return allSuccess;
}

// Main test function
async function runTest() {
  console.log('='.repeat(60));
  console.log('Step 8 Image Generation - Integration Test');
  console.log('='.repeat(60));
  
  try {
    // Setup
    setupTestProject();
    
    console.log('\nStarting image generation...');
    console.log('This will test:');
    console.log('  - Concurrent generation across 3 styles');
    console.log('  - Progress tracking');
    console.log('  - File system operations');
    console.log('  - API key rotation (if rate limits hit)');
    console.log('');
    
    // Run generation
    const startTime = Date.now();
    const result = await generateAllImages(TEST_PROJECT_PATH, TEST_PROMPTS, onProgress);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('\n' + '='.repeat(60));
    console.log('Generation Complete!');
    console.log('='.repeat(60));
    console.log(`Duration: ${duration} seconds`);
    console.log(`Success: ${result.success}`);
    
    // Verify output
    const verified = verifyOutput();
    
    console.log('\n' + '='.repeat(60));
    if (result.success && verified) {
      console.log('✓ TEST PASSED - All images generated successfully!');
    } else {
      console.log('✗ TEST FAILED - Some images failed to generate');
    }
    console.log('='.repeat(60));
    
    // Test resumption
    console.log('\n\nTesting resumption...');
    console.log('Running generation again to test skip logic...');
    
    const resumeStartTime = Date.now();
    const resumeResult = await generateAllImages(TEST_PROJECT_PATH, TEST_PROMPTS, onProgress);
    const resumeDuration = ((Date.now() - resumeStartTime) / 1000).toFixed(2);
    
    console.log('\n' + '='.repeat(60));
    console.log('Resumption Test Complete!');
    console.log('='.repeat(60));
    console.log(`Duration: ${resumeDuration} seconds (should be much faster)`);
    console.log(`Success: ${resumeResult.success}`);
    
    if (parseFloat(resumeDuration) < parseFloat(duration) / 2) {
      console.log('✓ RESUMPTION TEST PASSED - Skipped existing images');
    } else {
      console.log('⚠ RESUMPTION TEST WARNING - May have regenerated images');
    }
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n✗ TEST FAILED WITH ERROR:');
    console.error(error);
  } finally {
    // Cleanup (comment out to inspect output)
    // cleanupTestProject();
    console.log('\n✓ Test project preserved at:', TEST_PROJECT_PATH);
    console.log('  (Delete manually or uncomment cleanupTestProject() to auto-cleanup)');
  }
}

// Run the test
console.log('\n⚠️  IMPORTANT: Make sure you have configured API keys in imageGenerationService.js');
console.log('⚠️  This test will make real API calls and may incur costs\n');

// Uncomment to run the test
// runTest().catch(console.error);

console.log('To run this test:');
console.log('1. Configure API keys in backend/ImageGeneration/imageGenerationService.js');
console.log('2. Uncomment the runTest() line at the bottom of this file');
console.log('3. Run: node backend/test-image-generation.js');
