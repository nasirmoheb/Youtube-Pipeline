import { GoogleGenAI, Modality } from "@google/genai";
import * as fs from "node:fs";
import * as path from "node:path";

// Import the prompts from the dedicated file
import prompts from './prompts.js';

// --- Configuration ---
const API_KEYS = [
"AIzaSyBo0_GK7uL-dwQSmiYTUwncj3OdVSjcqOs",
"AIzaSyBmMAB_bRHcFKeQdSHyV3udJPuX5AmK-5w",
"AIzaSyCYrfWxiKyrnHuVjSpSU_NOEY2dbt6B5Yc",
"AIzaSyCvNyRcEYUheM2NTwyBisEduBznhJlEhC0"
];

let currentApiKeyIndex = 0;
const MODEL_NAME = "gemini-2.0-flash-preview-image-generation";

const REQUESTS_PER_MINUTE = 9;
const DELAY_BETWEEN_REQUESTS_MS = (60 / REQUESTS_PER_MINUTE) * 1000;

const PROGRESS_FILE = "progress.json";
const OUTPUT_DIRECTORY = "generated_images";

// ADDED: Define the path to your master style reference image.
// This image will be used for all 'Hard Cut' transitions to maintain a consistent style.
const STYLE_REFERENCE_IMAGE_PATH = "style_reference.png";

// This Map will store the path to the most recently generated image for each shot.
// Key: shot_number (e.g., 1), Value: imagePath (e.g., "generated_images/Shot_1/Beat_1.2.png")
const shotLastImagePath = new Map();

// Helper function to introduce a delay
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Scans the output directory to rebuild the state of the last generated image
 * for each shot. This makes the script restartable.
 */
function rebuildShotStateFromFiles() {
    console.log("Rebuilding shot state from existing files...");
    if (!fs.existsSync(OUTPUT_DIRECTORY)) return;

    const shotDirs = fs.readdirSync(OUTPUT_DIRECTORY, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() && dirent.name.startsWith("Shot_"))
        .map(dirent => dirent.name);

    for (const dirName of shotDirs) {
        const shotNumberMatch = dirName.match(/Shot_(\d+)/);
        if (!shotNumberMatch) continue;
        const shotNumber = parseInt(shotNumberMatch[1], 10);

        const shotPath = path.join(OUTPUT_DIRECTORY, dirName);
        const files = fs.readdirSync(shotPath);

        let lastBeat = -1;
        let lastFile = null;

        for (const file of files) {
            const match = file.match(/Beat_([\d.]+)\.png/);
            if (match) {
                const beatNum = parseFloat(match[1]);
                if (beatNum > lastBeat) {
                    lastBeat = beatNum;
                    lastFile = file;
                }
            }
        }

        if (lastFile) {
            const fullPath = path.join(shotPath, lastFile);
            shotLastImagePath.set(shotNumber, fullPath);
            console.log(`- Found last image for Shot ${shotNumber}: ${lastFile}`);
        }
    }
}


async function main() {
  if (!API_KEYS || API_KEYS.length === 0 || API_KEYS[0].startsWith("YOUR")) {
    console.error("Please provide at least one actual Google GenAI API key in the API_KEYS array.");
    return;
  }

  // ADDED: Check if the style reference image exists before starting the loop.
  if (!fs.existsSync(STYLE_REFERENCE_IMAGE_PATH)) {
      console.warn(`\nWARNING: Style reference image not found at "${STYLE_REFERENCE_IMAGE_PATH}".`);
      console.warn("Hard cut transitions will be generated without a style reference.\n");
  }


  if (!fs.existsSync(OUTPUT_DIRECTORY)) {
    fs.mkdirSync(OUTPUT_DIRECTORY);
  }

  rebuildShotStateFromFiles();

  let ai = new GoogleGenAI({ apiKey: API_KEYS[currentApiKeyIndex] });
  let startIndex = 0;

  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      const progressData = JSON.parse(fs.readFileSync(PROGRESS_FILE, "utf-8"));
      startIndex = progressData.lastProcessedIndex + 1;
      console.log(`Resuming from prompt index: ${startIndex}`);
    }
  } catch (error) {
    console.warn("Could not read progress file. Starting from scratch.", error.message);
  }

  if (startIndex >= prompts.length) {
    console.log("All prompts have already been processed.");
    return;
  }

  for (let i = startIndex; i < prompts.length; i++) {
    const currentBeat = prompts[i];
    
    const outputDir = path.join(OUTPUT_DIRECTORY, `Shot_${currentBeat.shot_number}`);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const imageName = `Beat_${currentBeat.beat_number}.png`;
    const imagePath = path.join(outputDir, imageName);

    // --- CHANGED: Rewritten logic for handling transitions ---
    let generationPrompt = currentBeat.ai_prompt;
    let imageReferencePath = null; // This will hold the path for either style or editing.

    if (currentBeat.transition_type === 'C' && shotLastImagePath.has(currentBeat.shot_number)) {
        // --- CONTINUOUS TRANSITION: Use the last frame for *editing*.
        imageReferencePath = shotLastImagePath.get(currentBeat.shot_number);
        console.log(`\n[${i + 1}/${prompts.length}] Processing Shot ${currentBeat.shot_number}, Beat ${currentBeat.beat_number} (Transition: Continuous)`);
        console.log(`   > Editing from base image: ${path.basename(imageReferencePath)}`);
        console.log(`   > Edit Instruction: "${generationPrompt}"`);

    } else { // --- HARD CUT (or first frame): Use the master image for *style*.
        console.log(`\n[${i + 1}/${prompts.length}] Processing Shot ${currentBeat.shot_number}, Beat ${currentBeat.beat_number} (Transition: Hard Cut)`);
        if (fs.existsSync(STYLE_REFERENCE_IMAGE_PATH)) {
            imageReferencePath = STYLE_REFERENCE_IMAGE_PATH;
            console.log(`   > Using style reference: ${STYLE_REFERENCE_IMAGE_PATH}`);
        } else {
             console.log(`   > No style reference found. Generating from text only.`);
        }
        console.log(`   > Generation Prompt: "${generationPrompt}"`);

        // For a hard cut, we clear the last image path for this shot to ensure the next 'C' transition
        // starts from the newly generated hard-cut image, not an old one from a previous scene.
        shotLastImagePath.delete(currentBeat.shot_number);
    }
    // --- END OF CHANGED LOGIC BLOCK ---
    
    let success = false;
    let attempts = 0;

    while (!success && attempts < API_KEYS.length) {
      try {
        const contents = [{ text: generationPrompt }];

        // --- CHANGED: Unified logic to add image data if a reference path is set ---
        if (imageReferencePath) {
            const imageData = fs.readFileSync(imageReferencePath);
            contents.push({
                inlineData: {
                    mimeType: "image/png",
                    data: imageData.toString("base64"),
                },
            });
        }
        
        const apiResponse = await ai.models.generateContent({
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
                console.log(`   > Image saved as ${path.relative(process.cwd(), imagePath)}`);
                imageGeneratedAndSaved = true;
                
                // CRITICAL: Update the tracker with the path of the newly created image for the current shot
                shotLastImagePath.set(currentBeat.shot_number, imagePath);
                console.log(`   > Updated last image for Shot ${currentBeat.shot_number} to be this frame.`);
                break; 
              }
            }
        }
        
        if (!imageGeneratedAndSaved) throw new Error("No image data found in API response.");

        fs.writeFileSync(PROGRESS_FILE, JSON.stringify({ lastProcessedIndex: i }));
        success = true;

      } catch (error) {
        console.error(`   > Error during generation: ${error.message}`);
        if (error.message.includes("429")) {
          console.error(`   > Rate limit error with API Key index ${currentApiKeyIndex}.`);
          attempts++;
          if (attempts < API_KEYS.length) {
            currentApiKeyIndex = (currentApiKeyIndex + 1) % API_KEYS.length;
            ai = new GoogleGenAI({ apiKey: API_KEYS[currentApiKeyIndex] });
            console.log(`   > Switched to API Key index ${currentApiKeyIndex}. Retrying in 2s...`);
            await sleep(2000);
          } else {
            console.error("   > All API keys have hit rate limit. Stopping for this prompt.");
            break;
          }
        } else {
          break; // Stop on other errors
        }
      }
    }

    if (i < prompts.length - 1) {
      console.log(`Waiting for ${DELAY_BETWEEN_REQUESTS_MS / 1000} seconds...`);
      await sleep(DELAY_BETWEEN_REQUESTS_MS);
    }
  }

  console.log("\nAll prompts processed!");
}

main().catch(err => {
  console.error("Unhandled error in main function:", err);
});