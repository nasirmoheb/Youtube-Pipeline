import express from 'express';
import path from 'path';
import { sanitizePath, ensureDir, readFile, copyFile, listFiles } from '../utils/fileSystem.js';
import { generateImage } from '../services/geminiService.js';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

export const imageRouter = express.Router();

const tasks = new Map();

// OLD generate-images route removed - now handled by imageGeneration.js

imageRouter.get('/status/images/:taskId', (req, res) => {
  const { taskId } = req.params;
  const task = tasks.get(taskId);

  if (!task) {
    return res.status(404).json({ success: false, error: 'Task not found' });
  }

  res.json(task);
});

imageRouter.post('/select-image', async (req, res, next) => {
  try {
    const { projectPath, beatNumber, sourceImagePath, isFlagged } = req.body;
    const safePath = sanitizePath(projectPath);
    const finalImageDir = path.join(safePath, 'finalImage');

    await ensureDir(finalImageDir);

    const filename = isFlagged ? `${beatNumber}-flag.png` : `${beatNumber}.png`;
    const destPath = path.join(finalImageDir, filename);

    await copyFile(sourceImagePath, destPath);

    res.json({ success: true, message: `Image for ${beatNumber} selected and saved.` });
  } catch (error) {
    next(error);
  }
});

imageRouter.post('/convert-svg', async (req, res, next) => {
  try {
    const { projectPath } = req.body;
    const safePath = sanitizePath(projectPath);
    const finalImageDir = path.join(safePath, 'finalImage');
    const svgDir = path.join(safePath, 'finalImageSVG');

    await ensureDir(svgDir);

    // Placeholder - SVG conversion would require additional library
    res.json({
      success: true,
      message: 'SVG conversion not yet implemented. Consider using potrace or similar library.'
    });
  } catch (error) {
    next(error);
  }
});

// OLD generateImagesAsync function removed - now handled by imageGenerationService.js
