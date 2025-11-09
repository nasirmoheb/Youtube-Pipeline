import express from 'express';
import path from 'path';
import { sanitizePath, ensureDir, readFile, writeFile } from '../utils/fileSystem.js';
import { generateText } from '../services/geminiService.js';

export const contentRouter = express.Router();

contentRouter.post('/summarize', async (req, res, next) => {
  try {
    const { projectPath } = req.body;
    const safePath = sanitizePath(projectPath);

    const bookContent = await readFile(path.join(safePath, 'book.txt'));
    const summary = await generateText(
      bookContent,
      'Summarize the following book content concisely for a video script.'
    );

    await writeFile(path.join(safePath, 'summary.txt'), summary);
    res.json({ success: true, summary });
  } catch (error) {
    next(error);
  }
});

contentRouter.post('/script', async (req, res, next) => {
  try {
    const { projectPath } = req.body;
    const safePath = sanitizePath(projectPath);

    const summary = await readFile(path.join(safePath, 'summary.txt'));
    const script = await generateText(
      summary,
      'Generate a compelling video script in Markdown format based on this summary.'
    );

    await writeFile(path.join(safePath, 'script.md'), script);
    res.json({ success: true, script });
  } catch (error) {
    next(error);
  }
});

contentRouter.post('/beats', async (req, res, next) => {
  try {
    const { projectPath } = req.body;
    const safePath = sanitizePath(projectPath);

    const script = await readFile(path.join(safePath, 'script.md'));

    // Import the generateBeatsStructured function
    const { generateBeatsStructured } = await import('../services/geminiService.js');
    const beatsArray = await generateBeatsStructured(script);

    // Save as JSON for easy parsing
    const beatsJson = JSON.stringify(beatsArray, null, 2);
    await writeFile(path.join(safePath, 'beats.json'), beatsJson);

    // Also save as markdown for human readability
    const beatsMd = beatsArray.map(b => `## ${b.beat_number}\n${b.script_phrase}\n`).join('\n');
    await writeFile(path.join(safePath, 'beats.md'), beatsMd);

    res.json({ success: true, beats: beatsArray });
  } catch (error) {
    next(error);
  }
});

contentRouter.post('/storyboard', async (req, res, next) => {
  try {
    const { projectPath, style } = req.body;

    if (!projectPath || !style) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: projectPath or style'
      });
    }

    if (!['illustration', 'clear', 'consistent'].includes(style)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid style. Must be: illustration, clear, or consistent'
      });
    }

    const safePath = sanitizePath(projectPath);
    const storyboardsDir = path.join(safePath, 'storyboards');

    await ensureDir(storyboardsDir);

    // Read beats from JSON file
    const beatsJson = await readFile(path.join(safePath, 'beats.json'));
    const beats = JSON.parse(beatsJson);

    // Generate storyboard using Gemini API
    const { generateStoryboardStructured } = await import('../services/geminiService.js');
    const storyboard = await generateStoryboardStructured(beats, style);

    // Save as JSON
    const storyboardJson = JSON.stringify(storyboard, null, 2);
    await writeFile(path.join(storyboardsDir, `${style}.json`), storyboardJson);

    // Save as Markdown for readability
    const storyboardMd = storyboard.map(row => 
      `## Shot ${row.shot_number} - ${row.beat_number}\n` +
      `**Script:** ${row.script_phrase}\n` +
      `**Transition:** ${row.transition_type}\n` +
      `**AI Prompt:** ${row.ai_prompt}\n` +
      `**Text Overlay:** ${row.text_overlay}\n` +
      `**Kinetic Text:** ${row.kinetic_text}\n` +
      `**SFX:** ${row.sfx}\n`
    ).join('\n');
    await writeFile(path.join(storyboardsDir, `${style}.md`), storyboardMd);

    res.json({ success: true, storyboard });
  } catch (error) {
    console.error('Error in /storyboard endpoint:', error);

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate storyboard. Please try again.'
    });
  }
});

contentRouter.post('/save-prompts', async (req, res, next) => {
  try {
    const { projectPath, style, prompts } = req.body;

    if (!projectPath || !style || !prompts) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: projectPath, style, or prompts'
      });
    }

    const safePath = sanitizePath(projectPath);
    const promptsDir = path.join(safePath, 'prompts');

    await ensureDir(promptsDir);

    // Save as JSON
    const promptsJson = JSON.stringify(prompts, null, 2);
    await writeFile(path.join(promptsDir, `prompts-${style}.json`), promptsJson);

    // Save as JavaScript module for easy import
    const promptsJs = `export const prompts = ${JSON.stringify(prompts, null, 2)};`;
    await writeFile(path.join(promptsDir, `prompts-${style}.js`), promptsJs);

    // Save as text file for easy reading
    const promptsText = prompts.map((p, i) => 
      `=== ${p.beat_number} (Shot ${p.shot_number}) ===\n${p.ai_prompt}\n`
    ).join('\n');
    await writeFile(path.join(promptsDir, `prompts-${style}.txt`), promptsText);

    res.json({ success: true, message: `Prompts for ${style} saved successfully.` });
  } catch (error) {
    console.error('Error in /save-prompts endpoint:', error);

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to save prompts. Please try again.'
    });
  }
});

contentRouter.post('/extract-voiceover-segments', async (req, res, next) => {
  try {
    const { projectPath } = req.body;

    if (!projectPath) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: projectPath'
      });
    }

    const safePath = sanitizePath(projectPath);
    const voiceoverDir = path.join(safePath, 'voiceover');

    await ensureDir(voiceoverDir);

    const script = await readFile(path.join(safePath, 'script.md'));

    // Extract segments using Gemini API
    const { extractVoiceoverSegments } = await import('../services/geminiService.js');
    const segments = await extractVoiceoverSegments(script);

    // Save segments to JSON file for reference
    const segmentsJson = JSON.stringify(segments, null, 2);
    await writeFile(path.join(voiceoverDir, 'segments.json'), segmentsJson);

    // Also save as text file for easy reading
    const segmentsText = segments.map((seg, i) => `=== Segment ${i} ===\n${seg}\n`).join('\n');
    await writeFile(path.join(voiceoverDir, 'segments.txt'), segmentsText);

    res.json({
      success: true,
      segments
    });
  } catch (error) {
    console.error('Error in /extract-voiceover-segments endpoint:', error);

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to extract voiceover segments. Please try again.'
    });
  }
});

contentRouter.post('/generate-voiceover', async (req, res, next) => {
  try {
    const { projectPath, text, segmentId } = req.body;

    if (!projectPath || !text || segmentId === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: projectPath, text, or segmentId'
      });
    }

    const safePath = sanitizePath(projectPath);
    const voiceoverDir = path.join(safePath, 'voiceover');

    await ensureDir(voiceoverDir);

    // Generate voiceover using Gemini TTS API
    const { generateVoiceoverAudio } = await import('../services/geminiService.js');
    const audioBuffer = await generateVoiceoverAudio(text);

    // Save as WAV file
    const filename = `${segmentId}.wav`;
    const filepath = path.join(voiceoverDir, filename);

    // Write buffer to file
    const fs = await import('fs/promises');
    await fs.writeFile(filepath, audioBuffer);

    res.json({
      success: true,
      message: 'Voiceover generated successfully.',
      filename,
      filepath
    });
  } catch (error) {
    console.error('Error in /generate-voiceover endpoint:', error);

    // Send user-friendly error message to frontend
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate voiceover. Please try again.'
    });
  }
});

contentRouter.post('/save-summary', async (req, res, next) => {
  try {
    const { projectPath, summary } = req.body;

    if (!projectPath || !summary) {
      return res.status(400).json({ success: false, error: 'Missing projectPath or summary' });
    }

    const safePath = sanitizePath(projectPath);
    await writeFile(path.join(safePath, 'summary.txt'), summary);

    res.json({ success: true, message: 'Summary saved successfully.' });
  } catch (error) {
    next(error);
  }
});

contentRouter.post('/save-script', async (req, res, next) => {
  try {
    const { projectPath, script } = req.body;

    if (!projectPath || !script) {
      return res.status(400).json({ success: false, error: 'Missing projectPath or script' });
    }

    const safePath = sanitizePath(projectPath);
    await writeFile(path.join(safePath, 'script.md'), script);

    res.json({ success: true, message: 'Script saved successfully.' });
  } catch (error) {
    next(error);
  }
});

contentRouter.post('/save-beats', async (req, res, next) => {
  try {
    const { projectPath, beats } = req.body;

    if (!projectPath || !beats) {
      return res.status(400).json({ success: false, error: 'Missing projectPath or beats' });
    }

    const safePath = sanitizePath(projectPath);

    // Save as JSON
    const beatsJson = JSON.stringify(beats, null, 2);
    await writeFile(path.join(safePath, 'beats.json'), beatsJson);

    // Also save as markdown
    const beatsMd = beats.map(b => `## ${b.beat_number}\n${b.script_phrase}\n`).join('\n');
    await writeFile(path.join(safePath, 'beats.md'), beatsMd);

    res.json({ success: true, message: 'Beats saved successfully.' });
  } catch (error) {
    next(error);
  }
});

contentRouter.post('/refine', async (req, res, next) => {
  try {
    const { content, instruction } = req.body;

    if (!content || !instruction) {
      return res.status(400).json({ success: false, error: 'Missing content or instruction' });
    }

    const refined = await generateText(
      content,
      `Refine the following content based on this instruction: ${instruction}`
    );

    res.json({ success: true, refined });
  } catch (error) {
    next(error);
  }
});

contentRouter.post('/pre-edit-scan', async (req, res, next) => {
  try {
    const { projectPath } = req.body;
    const safePath = sanitizePath(projectPath);

    const transcription = await readFile(path.join(safePath, 'transcription.txt'));
    const storyboard = await readFile(path.join(safePath, 'storyboards', 'illustration.md'));

    // Placeholder - alignment logic would go here
    const scanData = [];

    res.json({ success: true, scanData });
  } catch (error) {
    next(error);
  }
});

function extractPrompts(storyboard) {
  const lines = storyboard.split('\n');
  const prompts = [];

  for (const line of lines) {
    if (line.includes('ai_prompt:') || line.includes('prompt:')) {
      const match = line.match(/(?:ai_)?prompt:\s*(.+)/i);
      if (match) prompts.push(match[1].trim());
    }
  }

  return prompts;
}
