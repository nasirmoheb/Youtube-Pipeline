import { GoogleGenAI, Modality } from "@google/genai";
import * as fs from "node:fs";
import * as path from "node:path";

// API Keys for each style to avoid rate limits
const API_KEYS = {
    illustration: [
        "AIzaSyCvNyRcEYUheM2NTwyBisEduBznhJlEhC0",
        "AIzaSyBmMAB_bRHcFKeQdSHyV3udJPuX5AmK-5w",
    ],
    clear: [
        "AIzaSyCvNyRcEYUheM2NTwyBisEduBznhJlEhC0",
        "AIzaSyCvNyRcEYUheM2NTwyBisEduBznhJlEhC0",
    ],
    consistent: [
        "AIzaSyCvNyRcEYUheM2NTwyBisEduBznhJlEhC0",
        "AIzaSyBmMAB_bRHcFKeQdSHyV3udJPuX5AmK-5w",
    ]
};

const MODEL_NAME = "gemini-2.0-flash-preview-image-generation";
const REQUESTS_PER_MINUTE = 9;
const DELAY_BETWEEN_REQUESTS_MS = (60 / REQUESTS_PER_MINUTE) * 1000;
const STYLE_REFERENCE_IMAGE_PATH = path.join(process.cwd(), "backend/ImageGeneration/style_reference.png");

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
    console.log(`[${style}] generateImageForBeat called for Beat ${beat_number}`);

    const outputDir = path.join(projectPath, "generated_images", style, `Shot_${shot_number}`);
    if (!fs.existsSync(outputDir)) {
        console.log(`[${style}] Creating output directory: ${outputDir}`);
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const imageName = `Beat_${beat_number}.png`;
    const imagePath = path.join(outputDir, imageName);
    console.log(`[${style}] Target image path: ${imagePath}`);

    // Check if already exists
    if (fs.existsSync(imagePath)) {
        console.log(`[${style}] Image already exists for Beat ${beat_number}, skipping...`);
        return { success: true, imagePath, skipped: true };
    }

    // Initialize AI if not done
    if (!aiInstances[style]) {
        console.log(`[${style}] Initializing AI instance...`);
        initializeAI(style);
    }

    let generationPrompt = ai_prompt;
    let imageReferencePath = null;

    // Use style reference for hard cuts
    if (transition_type === 'H' && fs.existsSync(STYLE_REFERENCE_IMAGE_PATH)) {
        imageReferencePath = STYLE_REFERENCE_IMAGE_PATH;
        console.log(`[${style}] Using style reference for hard cut`);
    }

    let success = false;
    let attempts = 0;
    const maxAttempts = API_KEYS[style].length;

    while (!success && attempts < maxAttempts) {
        try {
            console.log(`[${style}] Attempt ${attempts + 1}/${maxAttempts} - Calling Gemini API...`);
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

            console.log(`[${style}] Sending request to Gemini API...`);
            const apiResponse = await aiInstances[style].models.generateContent({
                model: MODEL_NAME,
                contents: contents,
                config: {
                    responseModalities: [Modality.TEXT, Modality.IMAGE],
                },
            });
            console.log(`[${style}] Received response from Gemini API`);

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
    console.log(`\n[${style}] ========================================`);
    console.log(`[${style}] Starting image generation for ${prompts.length} prompts...`);
    console.log(`[${style}] Project path: ${projectPath}`);

    const completedBeats = loadProgress(projectPath, style);
    console.log(`[${style}] Loaded progress: ${completedBeats.length} completed beats`);

    const remainingPrompts = prompts.filter(p => !completedBeats.includes(p.beat_number));
    console.log(`[${style}] Remaining prompts to generate: ${remainingPrompts.length}`);

    if (remainingPrompts.length === 0) {
        console.log(`[${style}] All images already generated!`);
        onProgress?.({ style, completed: prompts.length, total: prompts.length, status: 'complete' });
        return { success: true, message: "All images already generated" };
    }

    console.log(`[${style}] Resuming from ${completedBeats.length}/${prompts.length} completed`);
    console.log(`[${style}] First prompt to generate: Beat ${remainingPrompts[0].beat_number}`);

    for (let i = 0; i < remainingPrompts.length; i++) {
        const prompt = remainingPrompts[i];
        console.log(`\n[${style}] -------- Processing ${i + 1}/${remainingPrompts.length} --------`);
        console.log(`[${style}] Beat: ${prompt.beat_number}`);
        console.log(`[${style}] Prompt: ${prompt.ai_prompt.substring(0, 50)}...`);

        onProgress?.({
            style,
            beat_number: prompt.beat_number,
            completed: completedBeats.length + i,
            total: prompts.length,
            status: 'generating'
        });

        console.log(`[${style}] Calling generateImageForBeat...`);
        const result = await generateImageForBeat(projectPath, style, prompt, onProgress);
        console.log(`[${style}] Result:`, result.success ? 'SUCCESS' : 'FAILED', result.error || '');

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
    process.stdout.write('\n🚀 generateAllImages CALLED!\n');
    console.log('generateAllImages - projectPath:', projectPath);
    console.log('generateAllImages - promptsByStyle keys:', Object.keys(promptsByStyle));

    const styles = ['illustration', 'clear', 'consistent'];

    // Run all three styles concurrently
    const promises = styles.map(style => {
        const prompts = promptsByStyle[style] || [];
        console.log(`[${style}] Found ${prompts.length} prompts`);
        if (prompts.length === 0) {
            console.log(`[${style}] No prompts found, skipping...`);
            return Promise.resolve({ success: true, style });
        }
        return generateImagesForStyle(projectPath, style, prompts, onProgress);
    });

    console.log('Waiting for all styles to complete...');
    const results = await Promise.all(promises);

    console.log('All styles completed!');
    return {
        success: results.every(r => r.success),
        results
    };
}
