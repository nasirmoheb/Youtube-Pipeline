import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { config } from './config.js';
import { projectRouter } from './routes/project.js';
import { contentRouter } from './routes/content.js';
import { imageRouter } from './routes/images.js';
import { uploadRouter } from './routes/upload.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.use('/api', projectRouter);
app.use('/api', contentRouter);
app.use('/api', imageRouter);
app.use('/api', uploadRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: err.message });
});

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
