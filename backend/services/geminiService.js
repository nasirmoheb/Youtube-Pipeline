import { GoogleGenAI } from '@google/genai';
import { config } from '../config.js';

const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });

export async function generateText(prompt, systemInstruction = '') {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      systemInstruction
    }
  });

  return response.text;
}

// Helper function to create WAV file with proper headers
function createWavBuffer(pcmData, sampleRate = 24000, channels = 1, bitsPerSample = 16) {
  const byteRate = sampleRate * channels * (bitsPerSample / 8);
  const blockAlign = channels * (bitsPerSample / 8);
  const dataSize = pcmData.length;
  const headerSize = 44;
  const fileSize = headerSize + dataSize - 8;

  const buffer = Buffer.alloc(headerSize + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(fileSize, 4);
  buffer.write('WAVE', 8);

  // fmt chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // fmt chunk size
  buffer.writeUInt16LE(1, 20); // audio format (1 = PCM)
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

  // data chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  pcmData.copy(buffer, 44);

  return buffer;
}

export async function generateVoiceoverAudio(text) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!data) {
      throw new Error('No audio data returned from Gemini TTS API');
    }

    // Convert base64 to PCM buffer
    const pcmBuffer = Buffer.from(data, 'base64');

    // Create proper WAV file with headers
    const wavBuffer = createWavBuffer(pcmBuffer, 24000, 1, 16);

    return wavBuffer;
  } catch (error) {
    console.error('Error generating voiceover:', error);

    // Provide more detailed error messages
    if (error.status === 404) {
      throw new Error('TTS model not available. Please check the model name or API access.');
    } else if (error.status === 403) {
      throw new Error('API key does not have access to TTS. Please check your API permissions.');
    } else if (error.message) {
      throw new Error(`TTS generation failed: ${error.message}`);
    } else {
      throw new Error('Failed to generate voiceover audio. Please try again.');
    }
  }
}

export async function generateImage(prompt) {
  const response = await ai.models.generateContent({
    model: 'imagen-3.0-generate-001',
    contents: prompt
  });
  return response.candidates[0].content.parts[0].inlineData.data;
}

export async function generateBeatsStructured(script) {
  try {
    const prompt = `Analyze the following script and break it down into key "beats" or moments. For each beat, provide a number (e.g., "Beat 1", "Beat 2") and the corresponding script phrase. Return a JSON array of objects, where each object has "beat_number" and "script_phrase".\n\nScript:\n${script}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
      config: {
        systemInstruction: 'You are a video script analyzer. Break down scripts into key narrative beats for visual storytelling.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            beats: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  beat_number: { type: 'STRING' },
                  script_phrase: { type: 'STRING' }
                },
                required: ['beat_number', 'script_phrase']
              }
            }
          },
          required: ['beats']
        }
      }
    });

    const parsed = JSON.parse(response.text);
    return parsed.beats || [];
  } catch (error) {
    console.error('Error generating beats:', error);
    throw error;
  }
}

export async function extractVoiceoverSegments(script) {
  try {
    const prompt = `Split the following script into segments for voiceover recording. 

IMPORTANT RULES:
- Each segment should be approximately 1 minute of speech (roughly 150-200 words or 2-4 sentences)
- Segments must end at natural breaks (end of sentence, paragraph, or thought)
- Keep segments cohesive - don't break in the middle of an idea
- Aim for segments that are easy to record in one take

Return ONLY a JSON object with a "segments" array containing strings.

Example format:
{
  "segments": ["First segment with 2-4 sentences that form a complete thought.", "Second segment also with 2-4 sentences."]
}

Script:
${script}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are a script segmentation expert. Split scripts into ~1 minute segments (150-200 words each) for voiceover recording. Each segment should be a complete, cohesive unit.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            segments: {
              type: 'ARRAY',
              items: {
                type: 'STRING'
              }
            }
          },
          required: ['segments']
        }
      }
    });

    const parsed = JSON.parse(response.text);
    return parsed.segments || [];
  } catch (error) {
    console.error('Error extracting voiceover segments:', error);
    throw error;
  }
}

export async function generateStoryboardStructured(beats, style) {
  try {
    const beatsText = JSON.stringify(beats, null, 2);

    const styleDescriptions = {
      illustration: 'artistic, hand-drawn illustration style with vibrant colors and creative compositions',
      clear: 'clean, minimalist style with clear focus and simple compositions',
      consistent: 'consistent, professional style with uniform look and cohesive visual language'
    };

    const prompt = `Create a detailed storyboard from these script beats in the "${style}" style (${styleDescriptions[style]}).

For each beat, create a shot with:
- shot_number: Sequential number (1, 2, 3...)
- beat_number: The beat identifier (e.g., "Beat 1")
- script_phrase: The exact script text from the beat
- transition_type: Type of transition (Cut, Fade, Dissolve, Wipe, etc.)
- ai_prompt: Detailed image generation prompt in ${style} style
- text_overlay: Any text to display on screen (or "None")
- kinetic_text: Animated text effect (or "None")
- sfx: Sound effect name (or "None")

Return a JSON object with a "storyboard" array.

Beats:
${beatsText}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: `You are a professional storyboard artist. Create detailed, visual storyboards optimized for ${style} style. Each shot should have a compelling visual description.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            storyboard: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  shot_number: { type: 'INTEGER' },
                  beat_number: { type: 'STRING' },
                  script_phrase: { type: 'STRING' },
                  transition_type: { type: 'STRING' },
                  ai_prompt: { type: 'STRING' },
                  text_overlay: { type: 'STRING' },
                  kinetic_text: { type: 'STRING' },
                  sfx: { type: 'STRING' }
                },
                required: ['shot_number', 'beat_number', 'script_phrase', 'transition_type', 'ai_prompt', 'text_overlay', 'kinetic_text', 'sfx']
              }
            }
          },
          required: ['storyboard']
        }
      }
    });

    const parsed = JSON.parse(response.text);
    return parsed.storyboard || [];
  } catch (error) {
    console.error('Error generating storyboard:', error);
    throw error;
  }
}
