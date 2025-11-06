import { GoogleGenAI, Modality, Type } from "@google/genai";
import type { Beat, StoryboardRow, ExtractedPrompt, TranscriptionWord, ImageSelection, PreEditScanItem, VoiceoverSegment } from '../types';

// The API key is assumed to be available from process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateSummary = async (title: string, bookContent: string): Promise<string> => {
  // const prompt = `Summarize the following book content titled "${title}". Focus on character development, plot progression, and key themes to provide a solid foundation for a video script. Highlight the most engaging parts of the story to capture audience attention.\n\nBook Content:\n${bookContent || 'The user did not upload a book, but wants a video about ' + title}`;
  // const response = await ai.models.generateContent({
  //   model: 'gemini-2.5-pro',
  //   contents: prompt,
  // });
  // return response.text;
  await sleep(500);
  return `This is a placeholder summary for the book titled **"${title}"**. It would normally contain details about character development, plot progression, and key themes. For testing purposes, we are using this static text. The content provided was ${bookContent ? bookContent.length : 0} characters long.`;
};

export const generateHooks = async (summary: string, title: string): Promise<string[]> => {
  // const prompt = `Based on this summary for a book titled "${title}", generate 3 short, engaging hooks for a YouTube video script. Each hook should be a single, compelling sentence designed to grab the viewer's attention.\n\nSummary:\n${summary}`;
  // const response = await ai.models.generateContent({
  //   model: 'gemini-2.5-flash',
  //   contents: prompt,
  //   config: {
  //     responseMimeType: 'application/json',
  //     responseSchema: {
  //       type: Type.OBJECT,
  //       properties: {
  //         hooks: {
  //           type: Type.ARRAY,
  //           items: {
  //             type: Type.STRING,
  //             description: "An engaging hook for the video."
  //           }
  //         }
  //       },
  //       required: ['hooks']
  //     }
  //   }
  // });
  // const result = JSON.parse(response.text.trim());
  // return result.hooks;
  await sleep(500);
  return [
    `Placeholder Hook 1: What if everything you knew about "${title}" was a lie?`,
    `Placeholder Hook 2: Discover the dark secret hidden within "${title}".`,
    `Placeholder Hook 3: You won't believe what happens in the final chapter of "${title}".`
  ];
};

export const generateOutline = async (summary: string, title: string, hook: string): Promise<string> => {
  // const prompt = `Create a video script outline for a book titled "${title}", based on the provided summary. The video should start with the hook: "${hook}". The outline should structure the video into an introduction, several parts exploring the story, and a conclusion.\n\nSummary:\n${summary}`;
  // const response = await ai.models.generateContent({
  //   model: 'gemini-2.5-flash',
  //   contents: prompt,
  // });
  // return response.text;
  await sleep(500);
  return `# Video Outline for: ${title}\n\n## Introduction\n- **Hook:** ${hook}\n- Briefly introduce the book and its author.\n- State what the video will cover.\n\n## Part 1: The Setup\n- Introduce the main characters.\n- Describe the initial setting and conflict.\n\n## Part 2: The Rising Action\n- Key plot points and challenges the characters face.\n- Placeholder for major event 1.\n- Placeholder for major event 2.\n\n## Part 3: The Climax\n- The turning point of the story.\n- How the main conflict is addressed.\n\n## Conclusion\n- Summarize the key takeaways.\n- Discuss the book's themes.\n- Call to action (like, subscribe, read the book).`;
};

export const generateFullScript = async (outline: string, hook: string): Promise<string> => {
    // const prompt = `Based on the following outline and starting with the hook "${hook}", write a full, detailed YouTube video script. Expand on each point, add engaging narration, and ensure a smooth flow between sections. The tone should be conversational and exciting.\n\nOutline:\n${outline}`;
    // const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    // return response.text;
    await sleep(1000);
    return `
# Full Video Script

**(Intro Music with dramatic visuals)**

**Host:** ${hook} Today, we're diving deep into one of the most talked-about books of the year.

**(Scene showing the book cover)**

**Host:** We'll explore the characters, uncover the secrets, and break down the moments that made this story unforgettable. This is a placeholder script based on the generated outline. It would typically contain detailed narration for each section of the video, bringing the story to life for the audience.

... (more placeholder script content) ...
    `;
};

export const generateVoiceoverSegments = async (fullScript: string): Promise<string[]> => {
    // const prompt = `Split the following script into short, logical segments for voiceover recording. Each segment should be a complete sentence or a few related sentences. Return the result as a JSON array of strings.\n\nScript:\n${fullScript}`;
    // const response = await ai.models.generateContent({
    //     model: 'gemini-2.5-flash',
    //     contents: prompt,
    //     config: {
    //         responseMimeType: 'application/json',
    //         responseSchema: { type: Type.OBJECT, properties: { segments: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ['segments'] }
    //     }
    // });
    // const result = JSON.parse(response.text.trim());
    // return result.segments;
    await sleep(500);
    return [
        "This is placeholder voiceover segment one.",
        "Here is the second segment, for testing purposes.",
        "And a third, to make sure the list renders correctly.",
        "Finally, the last placeholder segment."
    ];
};

export const generateVoiceover = async (text: string): Promise<string> => {
    // const response = await ai.models.generateContent({
    //     model: 'gemini-2.5-flash-preview-tts',
    //     contents: [{ parts: [{ text }] }],
    //     config: { responseModalities: [Modality.AUDIO] }
    // });
    // const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    // if (!base64Audio) throw new Error("No audio data returned from API.");
    // return base64Audio;
    await sleep(700);
    // This is a short, silent WAV file encoded in base64.
    return "UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";
};

export const generateBeats = async (fullScript: string): Promise<Beat[]> => {
    // const prompt = `Analyze the following script and break it down into key "beats" or moments. For each beat, provide a number and the corresponding script phrase. Return a JSON array of objects, where each object has "beat_number" and "script_phrase".\n\nScript:\n${fullScript}`;
    // const response = await ai.models.generateContent({
    //     model: 'gemini-2.5-flash',
    //     contents: prompt,
    //     config: {
    //         responseMimeType: 'application/json',
    //         responseSchema: { type: Type.OBJECT, properties: { beats: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { beat_number: { type: Type.STRING }, script_phrase: { type: Type.STRING } } } } }, required: ['beats'] }
    //     }
    // });
    // const result = JSON.parse(response.text.trim());
    // return result.beats;
    await sleep(500);
    return [
        { beat_number: "Beat 1", script_phrase: "This is placeholder voiceover segment one." },
        { beat_number: "Beat 2", script_phrase: "Here is the second segment, for testing purposes." },
        { beat_number: "Beat 3", script_phrase: "And a third, to make sure the list renders correctly." },
        { beat_number: "Beat 4", script_phrase: "Finally, the last placeholder segment." }
    ];
};

export const generateStoryboard = async (beats: Beat[], style: string): Promise<StoryboardRow[]> => {
    // const prompt = `Create a storyboard from these script beats in the style of "${style}". For each shot, provide details for transition, AI image prompt, text overlay, kinetic text, and SFX. Return a JSON array of objects with keys: "shot_number", "beat_number", "script_phrase", "transition_type", "ai_prompt", "text_overlay", "kinetic_text", "sfx".\n\nBeats:\n${JSON.stringify(beats)}`;
    // const response = await ai.models.generateContent({
    //     model: 'gemini-2.5-pro',
    //     contents: prompt,
    //     config: {
    //         responseMimeType: 'application/json',
    //         responseSchema: { /* ... complex schema ... */ }
    //     }
    // });
    // const result = JSON.parse(response.text.trim());
    // return result.storyboard;
    await sleep(1000);
    return beats.map((beat, index) => ({
        shot_number: index + 1,
        beat_number: beat.beat_number,
        script_phrase: beat.script_phrase,
        transition_type: "Cut",
        ai_prompt: `Placeholder prompt for ${beat.beat_number} in a ${style} style.`,
        text_overlay: "Placeholder Text",
        kinetic_text: `Kinetic Text for Beat ${index + 1}`,
        sfx: "Whoosh.mp3"
    }));
};

export const extractPrompts = async (storyboard: StoryboardRow[]): Promise<ExtractedPrompt[]> => {
    // This can be done client-side, but we simulate it as a service call
    await sleep(100);
    return storyboard.map(row => ({
        shot_number: row.shot_number,
        beat_number: row.beat_number,
        script_phrase: row.script_phrase,
        transition_type: row.transition_type,
        ai_prompt: row.ai_prompt
    }));
};

export const generateImage = async (prompt: string): Promise<string> => {
    // const response = await ai.models.generateImages({
    //     model: 'imagen-4.0-generate-001',
    //     prompt: prompt,
    //     config: { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio: '1:1' }
    // });
    // const base64Image = response.generatedImages[0].image.imageBytes;
    // return `data:image/jpeg;base64,${base64Image}`;
    await sleep(1500); // Simulate image generation time
    const encodedPrompt = encodeURIComponent(prompt.substring(0, 50));
    return `https://via.placeholder.com/512x512.png/1a202c/FFFFFF?text=${encodedPrompt}`;
};

export const refineText = async (textToRefine: string, instruction: string): Promise<string> => {
    // const prompt = `Refine the following text based on this instruction: "${instruction}".\n\nOriginal Text:\n${textToRefine}`;
    // const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    // return response.text;
    await sleep(800);
    return `${textToRefine}\n\n**Refinement:** This is a placeholder refinement based on the instruction: "${instruction}". The original text has been updated accordingly.`;
};

export const convertToSvg = async (imageUrl: string, onProgress: (progress: number) => void): Promise<string> => {
    // Simulate API call and progress
    for (let p = 0; p <= 100; p += 10) {
      await sleep(150);
      onProgress(p);
    }
    const svgContent = `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#4A5568"/><text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle">Converted SVG</text><text x="50%" y="60%" font-family="Arial, sans-serif" font-size="16" fill="white" text-anchor="middle" dominant-baseline="middle">(Placeholder)</text></svg>`;
    const svgDataUrl = `data:image/svg+xml;base64,${btoa(svgContent)}`;
    return svgDataUrl;
};

const formatTimestamp = (seconds: number): string => {
    const hh = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const mm = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const ss = Math.floor(seconds % 60).toString().padStart(2, '0');
    const ms = Math.round((seconds - Math.floor(seconds)) * 1000).toString().padStart(3, '0');
    return `${hh}:${mm}:${ss},${ms}`;
};

export const generateTranscription = async (fullScript: string): Promise<TranscriptionWord[]> => {
    // const prompt = `Generate a word-level transcription with timestamps for the following script. Return a JSON array of objects with "word", "startTime", "endTime".\n\nScript:\n${fullScript}`;
    // ... API call logic ...
    await sleep(1200);

    const words = fullScript.split(/\s+/).filter(w => w.length > 0);
    let currentTime = 0;
    
    return words.map(word => {
        const startTime = currentTime;
        // Simulate word duration based on length
        const duration = 0.1 + (word.length * 0.05); 
        const endTime = startTime + duration;
        currentTime = endTime + 0.05; // Add a small gap

        return {
            word,
            startTime: formatTimestamp(startTime),
            endTime: formatTimestamp(endTime),
        };
    });
};

const parseTimestamp = (ts: string): number => {
    if (!ts) return 0;
    const [hms, ms] = ts.split(',');
    const [h, m, s] = hms.split(':').map(Number);
    return h * 3600 + m * 60 + s + (Number(ms) || 0) / 1000;
};

export const generatePreEditScan = async (
    storyboard: StoryboardRow[],
    transcription: TranscriptionWord[],
    imageSelection: ImageSelection
): Promise<PreEditScanItem[]> => {
    await sleep(500); // Simulate processing

    if (!storyboard.length || !transcription.length) {
        return [];
    }

    const transcriptionWords = transcription.map(t => t.word.toLowerCase().replace(/[.,!?]/g, ''));

    const scanData: PreEditScanItem[] = [];

    for (const row of storyboard) {
        const phraseWords = row.script_phrase.toLowerCase().replace(/[.,!?]/g, '').split(/\s+/).filter(Boolean);
        if (phraseWords.length === 0) continue;

        let startIndex = -1;
        // A more robust search for the start of the phrase
        for (let i = 0; i <= transcriptionWords.length - phraseWords.length; i++) {
            const slice = transcriptionWords.slice(i, i + phraseWords.length);
            if (slice.join(' ') === phraseWords.join(' ')) {
                startIndex = i;
                break;
            }
        }
        
        let startTime = 0;
        let endTime = 0;

        if (startIndex !== -1) {
            const endIndex = startIndex + phraseWords.length - 1;
            if (endIndex < transcription.length) {
                startTime = parseTimestamp(transcription[startIndex].startTime);
                endTime = parseTimestamp(transcription[endIndex].endTime);
            }
        }

        // Fallback if phrase not found, just give it a duration based on order
        if (startTime === 0 && endTime === 0) {
             const lastItemEnd = scanData.length > 0 ? scanData[scanData.length - 1].end : 0;
             startTime = lastItemEnd + 0.1;
             endTime = startTime + 3.0; // Default 3 second duration
        }

        const selectedImage = imageSelection[row.beat_number];

        scanData.push({
            beat_number: row.beat_number,
            start: parseFloat(startTime.toFixed(2)),
            end: parseFloat(endTime.toFixed(2)),
            text: row.kinetic_text === 'None' ? null : row.kinetic_text,
            photo: selectedImage ? selectedImage.url : '',
            sfx: row.sfx === 'None' ? null : row.sfx,
        });
    }

    return scanData;
};

export const combineVoiceovers = async (segments: VoiceoverSegment[]): Promise<string> => {
    // In a real app, this would concatenate audio blobs. Here, we just simulate.
    await sleep(200);
    // This is a short, silent WAV file encoded in base64.
    const silentAudioBase64 = "UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";
    return `data:audio/wav;base64,${silentAudioBase64}`;
};

export const generateVideo = async (scanData: PreEditScanItem[], voiceoverUrl: string): Promise<string> => {
    // This is now handled client-side by the Remotion player.
    // In a real application, this service could be used for the final server-side render.
    console.log("Client-side rendering is used. This function is a placeholder for a final server-side render.");
    await sleep(500);
    // No video URL is returned as the composition happens in the browser.
    return "";
};