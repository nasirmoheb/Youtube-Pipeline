import express from 'express';
import path from 'path';
import { sanitizePath, ensureDir, readFile, copyFile, listFiles } from '../utils/fileSystem.js';
import { generateImage } from '../services/geminiService.js';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

export const imageRouter = express.Router();

const tasks = new Map();

imageRouter.post('/generate-images', async (req, res, next) => {
  try {
    const { projectPath } = req.body;
    const taskId = uuidv4();
    
    tasks.set(taskId, { status: 'processing', progress: 0, message: 'Starting...' });
    
    // Start async processing
    generateImagesAsync(projectPath, taskId).catch(err => {
      tasks.set(taskId, { status: 'error', progress: 0, message: err.message });
    });
    
    res.status(202).json({ success: true, taskId });
  } catch (error) {
    next(error);
  }
});

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

async function generateImagesAsync(projectPath, taskId) {
  const safePath = sanitizePath(projectPath);
  const imagesDir = path.join(safePath, 'images');
  const promptsDir = path.join(safePath, 'prompts');
  
  const styles = ['illustration', 'clear', 'consistent'];
  let totalPrompts = 0;
  let processedPrompts = 0;
  
  for (const style of styles) {
    await ensureDir(path.join(imagesDir, style));
    const promptFile = await readFile(path.join(promptsDir, `prompts-${style}.js`));
    const prompts = eval(promptFile.replace('export const prompts =', ''));
    totalPrompts += prompts.length;
  }
  
  for (const style of styles) {
    const promptFile = await readFile(path.join(promptsDir, `prompts-${style}.js`));
    const prompts = eval(promptFile.replace('export const prompts =', ''));
    
    for (let i = 0; i < prompts.length; i++) {
      try {
        const imageData = await generateImage(prompts[i]);
        const buffer = Buffer.from(imageData, 'base64');
        await fs.writeFile(
          path.join(imagesDir, style, `Beat ${i + 1}.png`),
          buffer
        );
        
        processedPrompts++;
        const progress = Math.round((processedPrompts / totalPrompts) * 100);
        tasks.set(taskId, {
          status: 'processing',
          progress,
          message: `Generated ${processedPrompts} of ${totalPrompts} images.`
        });
      } catch (err) {
        console.error(`Error generating image for ${style} Beat ${i + 1}:`, err);
      }
    }
  }
  
  tasks.set(taskId, {
    status: 'completed',
    progress: 100,
    message: 'All images generated successfully.'
  });
}
