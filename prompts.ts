import { Type } from "@google/genai";
import type { Beat } from './types';

export const getSummaryPrompt = (title: string, bookContent: string): string =>
  `Summarize the following book content titled "${title}". Focus on character development, plot progression, and key themes to provide a solid foundation for a video script. Highlight the most engaging parts of the story to capture audience attention.\n\nBook Content:\n${bookContent || 'The user did not upload a book, but wants a video about ' + title}`;

export const getHooksPrompt = (summary: string, title: string): string =>
  `Based on this summary for a book titled "${title}", generate 3 short, engaging hooks for a YouTube video script. Each hook should be a single, compelling sentence designed to grab the viewer's attention.\n\nSummary:\n${summary}`;

export const hooksSchema = {
  type: Type.OBJECT,
  properties: {
    hooks: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
        description: "An engaging hook for the video."
      }
    }
  },
  required: ['hooks']
};

export const getOutlinePrompt = (summary: string, title: string, hook: string): string =>
  `Create a video script outline for a book titled "${title}", based on the provided summary. The video should start with the hook: "${hook}". The outline should structure the video into an introduction, several parts exploring the story, and a conclusion.\n\nSummary:\n${summary}`;

export const getFullScriptPrompt = (outline: string, hook: string): string =>
  `Based on the following outline and starting with the hook "${hook}", write a full, detailed YouTube video script. Expand on each point, add engaging narration, and ensure a smooth flow between sections. The tone should be conversational and exciting.\n\nOutline:\n${outline}`;

export const getVoiceoverSegmentsPrompt = (fullScript: string): string =>
  `Split the following script into short, logical segments for voiceover recording. Each segment should be a complete sentence or a few related sentences. Return the result as a JSON array of strings.\n\nScript:\n${fullScript}`;

export const voiceoverSegmentsSchema = {
  type: Type.OBJECT,
  properties: {
    segments: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    }
  },
  required: ['segments']
};

export const getBeatsPrompt = (fullScript: string): string =>
  `Analyze the following script and break it down into key "beats" or moments. For each beat, provide a number and the corresponding script phrase. Return a JSON array of objects, where each object has "beat_number" and "script_phrase".\n\nScript:\n${fullScript}`;

export const beatsSchema = {
  type: Type.OBJECT,
  properties: {
    beats: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          beat_number: { type: Type.STRING },
          script_phrase: { type: Type.STRING }
        }
      }
    }
  },
  required: ['beats']
};


export const getStoryboardPrompt = (beats: Beat[], style: string): string =>
  `Create a storyboard from these script beats in the style of "${style}". For each shot, provide details for transition, AI image prompt, text overlay, kinetic text, and SFX. Return a JSON array of objects with keys: "shot_number", "beat_number", "script_phrase", "transition_type", "ai_prompt", "text_overlay", "kinetic_text", "sfx".\n\nBeats:\n${JSON.stringify(beats)}`;

export const storyboardSchema = {
    type: Type.OBJECT,
    properties: {
        storyboard: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    shot_number: { type: Type.INTEGER },
                    beat_number: { type: Type.STRING },
                    script_phrase: { type: Type.STRING },
                    transition_type: { type: Type.STRING },
                    ai_prompt: { type: Type.STRING },
                    text_overlay: { type: Type.STRING },
                    kinetic_text: { type: Type.STRING },
                    sfx: { type: Type.STRING },
                },
                required: ["shot_number", "beat_number", "script_phrase", "transition_type", "ai_prompt", "text_overlay", "kinetic_text", "sfx"]
            }
        }
    },
    required: ['storyboard']
};


export const getRefineTextPrompt = (textToRefine: string, instruction: string): string =>
  `Refine the following text based on this instruction: "${instruction}".\n\nOriginal Text:\n${textToRefine}`;

export const getTranscriptionPrompt = (fullScript: string): string =>
  `Generate a word-level transcription with timestamps for the following script. Return a JSON array of objects with "word", "startTime", and "endTime".\n\nScript:\n${fullScript}`;

export const transcriptionSchema = {
    type: Type.OBJECT,
    properties: {
        transcription: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    word: { type: Type.STRING },
                    startTime: { type: Type.STRING },
                    endTime: { type: Type.STRING },
                },
                required: ["word", "startTime", "endTime"]
            }
        }
    },
    required: ["transcription"]
};
