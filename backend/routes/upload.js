import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { sanitizePath } from '../utils/fileSystem.js';

export const uploadRouter = express.Router();

const upload = multer({ dest: 'uploads/' });

uploadRouter.post('/upload-transcription', upload.single('file'), async (req, res, next) => {
  try {
    const { projectPath } = req.body;
    const safePath = sanitizePath(projectPath);
    
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    
    const destPath = path.join(safePath, 'transcription.txt');
    await fs.rename(req.file.path, destPath);
    
    res.json({ success: true, message: 'Transcription file uploaded successfully.' });
  } catch (error) {
    next(error);
  }
});
