/**
 * Utility to extract prompts from project directory and format as JavaScript array
 * Usage: node backend/utils/extractPrompts.js <projectPath> <style>
 * Example: node backend/utils/extractPrompts.js "D:\Projects\Youtube-Pipeline\projects\my-project" illustration
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

function extractPrompts(projectPath, style) {
  const promptsFilePath = path.join(projectPath, 'prompts', `prompts-${style}.js`);
  
  console.log(`Reading prompts from: ${promptsFilePath}`);
  
  if (!fs.existsSync(promptsFilePath)) {
    console.error(`Error: Prompts file not found at ${promptsFilePath}`);
    process.exit(1);
  }
  
  try {
    // Read the file content
    const fileContent = fs.readFileSync(promptsFilePath, 'utf-8');
    
    // Extract the prompts array from the file
    // The file exports: export default [...]
    const promptsMatch = fileContent.match(/export\s+default\s+(\[[\s\S]*\])/);
    
    if (!promptsMatch) {
      console.error('Error: Could not find prompts array in file');
      process.exit(1);
    }
    
    // Parse the array
    const prompts = eval(promptsMatch[1]);
    
    console.log(`\n✓ Successfully extracted ${prompts.length} prompts for ${style}\n`);
    
    // Format as JavaScript code
    const output = `const prompts = ${JSON.stringify(prompts, null, 2)};\n\nexport default prompts;`;
    
    // Print to console
    console.log('='.repeat(80));
    console.log('FORMATTED PROMPTS:');
    console.log('='.repeat(80));
    console.log(output);
    console.log('='.repeat(80));
    
    // Optionally save to file
    const outputPath = path.join(projectPath, 'prompts', `prompts-${style}-formatted.js`);
    fs.writeFileSync(outputPath, output, 'utf-8');
    console.log(`\n✓ Saved formatted prompts to: ${outputPath}`);
    
    return prompts;
  } catch (error) {
    console.error('Error extracting prompts:', error.message);
    process.exit(1);
  }
}

// Command line usage
if (process.argv.length < 4) {
  console.log('Usage: node backend/utils/extractPrompts.js <projectPath> <style>');
  console.log('Example: node backend/utils/extractPrompts.js "D:\\Projects\\Youtube-Pipeline\\projects\\my-project" illustration');
  console.log('\nAvailable styles: illustration, clear, consistent');
  process.exit(1);
}

const projectPath = process.argv[2];
const style = process.argv[3];

if (!['illustration', 'clear', 'consistent'].includes(style)) {
  console.error('Error: Style must be one of: illustration, clear, consistent');
  process.exit(1);
}

extractPrompts(projectPath, style);
