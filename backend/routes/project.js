import express from 'express';
import path from 'path';
import { sanitizePath, ensureDir, writeFile } from '../utils/fileSystem.js';

export const projectRouter = express.Router();

projectRouter.post('/project', async (req, res, next) => {
  try {
    const { projectPath, bookContent, videoTitle } = req.body;
    
    if (!projectPath || !bookContent || !videoTitle) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Sanitize the video title for use as a folder name
    const sanitizedTitle = videoTitle.replace(/[<>:"/\\|?*]/g, '-').trim();
    
    // Create the full project path with video title folder
    const fullProjectPath = path.join(projectPath, sanitizedTitle);
    const safePath = sanitizePath(fullProjectPath);
    
    await ensureDir(safePath);
    await writeFile(path.join(safePath, 'book.txt'), bookContent);

    res.status(201).json({ 
      success: true, 
      message: 'Project created successfully.',
      projectPath: safePath
    });
  } catch (error) {
    next(error);
  }
});
