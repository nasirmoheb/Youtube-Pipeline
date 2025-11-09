# AI YouTube Video Pipeline - Backend

Node.js backend API for the AI YouTube Video Pipeline application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Add your Gemini API key to `.env`:
```
GEMINI_API_KEY=your_actual_api_key
PORT=3001
```

## Running

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

All endpoints are prefixed with `/api`:

- `POST /api/project` - Create project
- `POST /api/summarize` - Generate summary
- `POST /api/script` - Generate script
- `POST /api/beats` - Generate beats
- `POST /api/storyboards` - Create storyboards
- `POST /api/prompts` - Extract prompts
- `POST /api/voiceover` - Generate voiceover (placeholder)
- `POST /api/generate-images` - Generate images (async)
- `GET /api/status/images/:taskId` - Check image generation status
- `POST /api/select-image` - Save selected image
- `POST /api/convert-svg` - Convert to SVG (placeholder)
- `POST /api/upload-transcription` - Upload transcription file
- `POST /api/pre-edit-scan` - Generate pre-edit scan

## Notes

- TTS (voiceover) and SVG conversion are placeholders - implement with appropriate libraries
- Image generation uses Gemini's Imagen API
- All file operations are scoped to the provided `projectPath`
- Path sanitization prevents directory traversal attacks
