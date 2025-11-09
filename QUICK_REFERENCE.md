# Quick Reference Guide

## 🚀 Start Commands

```bash
# Backend
cd backend && npm run dev

# Frontend  
npm run dev

# Test API
cd backend && npm test
```

## 🌐 URLs

- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- API Base: http://localhost:3001/api

## 📁 Key Files

| File | Purpose |
|------|---------|
| `backend/server.js` | Main backend server |
| `backend/routes/project.js` | Project creation endpoint |
| `services/apiService.ts` | Frontend API client |
| `components/steps/Step1_ProjectSetup.tsx` | Integrated step component |
| `backend/.env` | Backend environment config |
| `.env` | Frontend environment config |

## 🔌 API Endpoints Quick Reference

```javascript
// Project Creation
POST /api/project
Body: { projectPath: string, bookContent: string }
Response: { success: boolean, message: string }

// Content Generation
POST /api/summarize
Body: { projectPath: string }
Response: { success: boolean, summary: string }

POST /api/script
Body: { projectPath: string }
Response: { success: boolean, script: string }

POST /api/beats
Body: { projectPath: string }
Response: { success: boolean, beats: string }

POST /api/storyboards
Body: { projectPath: string }
Response: { success: boolean, message: string }

POST /api/prompts
Body: { projectPath: string }
Response: { success: boolean, message: string }

// Image Generation
POST /api/generate-images
Body: { projectPath: string }
Response: { success: boolean, taskId: string }

GET /api/status/images/:taskId
Response: { status: string, progress: number, message: string }

POST /api/select-image
Body: { projectPath, beatNumber, sourceImagePath, isFlagged }
Response: { success: boolean, message: string }

// Other
POST /api/voiceover
POST /api/convert-svg
POST /api/upload-transcription
POST /api/pre-edit-scan
```

## 💻 Frontend API Usage

```typescript
import * as apiService from '../../services/apiService';

// Create project
const response = await apiService.createProject(path, content);

// Generate summary
const response = await apiService.summarize(projectPath);

// Generate script
const response = await apiService.generateScript(projectPath);

// Generate beats
const response = await apiService.generateBeats(projectPath);

// Generate storyboards
const response = await apiService.generateStoryboards(projectPath);

// Extract prompts
const response = await apiService.extractPrompts(projectPath);

// Generate images (async)
const response = await apiService.generateImages(projectPath);
const taskId = response.data.taskId;

// Check status
const status = await apiService.checkImageGenerationStatus(taskId);

// Select image
const response = await apiService.selectImage(
  projectPath, 
  beatNumber, 
  sourceImagePath, 
  isFlagged
);

// Convert to SVG
const response = await apiService.convertToSvg(projectPath);

// Upload transcription
const response = await apiService.uploadTranscription(projectPath, file);

// Generate pre-edit scan
const response = await apiService.generatePreEditScan(projectPath);
```

## 🔧 Environment Variables

**Backend (.env)**
```bash
GEMINI_API_KEY=your_api_key_here
PORT=3001
```

**Frontend (.env)**
```bash
VITE_API_URL=http://localhost:3001/api
```

## 📂 Project Directory Structure

```
/path/to/project/
├── book.txt                    # Original book content
├── summary.txt                 # Generated summary
├── script.md                   # Full script
├── beats.md                    # Narrative beats
├── storyboards/
│   ├── illustration.md
│   ├── clear.md
│   └── consistent.md
├── prompts/
│   ├── prompts-illustration.js
│   ├── prompts-clear.js
│   └── prompts-consistent.js
├── voiceover/
│   ├── 1.mp3
│   └── 2.mp3
├── images/
│   ├── illustration/
│   ├── clear/
│   └── consistent/
├── finalImage/
├── finalImageSVG/
└── transcription.txt
```

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| Backend won't start | Check port 3001 is free, verify .env exists |
| Frontend can't connect | Ensure backend is running, check VITE_API_URL |
| "Invalid path" error | Use absolute paths, no `..` in path |
| CORS error | Check backend CORS config, restart server |
| Gemini API error | Verify API key in backend/.env |

## 🧪 Testing Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can create project directory
- [ ] book.txt is created with correct content
- [ ] Success message appears
- [ ] Error handling works (try invalid path)
- [ ] File upload works
- [ ] Form validation works

## 📝 Integration Pattern

```typescript
// 1. State
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [data, setData] = useState<any>(null);

// 2. Handler
const handleGenerate = async () => {
  setIsLoading(true);
  setError(null);
  
  try {
    const response = await apiService.functionName(projectPath);
    
    if (response.success) {
      setData(response.data);
    } else {
      setError(response.error || 'Failed');
    }
  } catch (error) {
    setError('Failed to connect to backend');
  } finally {
    setIsLoading(false);
  }
};

// 3. UI
{isLoading && <div>Loading...</div>}
{error && <div className="text-red-500">{error}</div>}
{data && <div>{/* Display data */}</div>}
```

## 🎯 Step Status

| Step | Backend | Frontend | Status |
|------|---------|----------|--------|
| 1. Project Setup | ✅ | ✅ | Complete |
| 2. Summarize | ✅ | 🔄 | Ready |
| 3. Scripting | ✅ | 🔄 | Ready |
| 4. Voiceover | ⚠️ | 🔄 | Placeholder |
| 5. Beats | ✅ | 🔄 | Ready |
| 6. Storyboard | ✅ | 🔄 | Ready |
| 7. Prompts | ✅ | 🔄 | Ready |
| 8. Images | ✅ | 🔄 | Ready |
| 9. Select | ✅ | 🔄 | Ready |
| 10. SVG Convert | ⚠️ | 🔄 | Placeholder |
| 11. Transcription | ✅ | 🔄 | Ready |
| 12. Pre-Edit Scan | ✅ | 🔄 | Ready |
| 13. Video Edit | - | 🔄 | Client-side |

Legend:
- ✅ Complete
- 🔄 Ready for integration
- ⚠️ Needs library implementation
- - Not applicable

## 🔐 Security Notes

- Path sanitization prevents `../` attacks
- Input validation on both frontend and backend
- CORS configured for localhost only
- No authentication (single-user local app)
- File operations scoped to project directories

## 📊 Performance Tips

- Image generation is async (use task polling)
- Large files may take time to upload
- Gemini API has rate limits
- Consider implementing caching for repeated operations

## 🎨 Code Style

**Backend (JavaScript/ES Modules)**
```javascript
import express from 'express';
export const router = express.Router();
```

**Frontend (TypeScript/React)**
```typescript
import React, { useState } from 'react';
export const Component: React.FC<Props> = ({ prop }) => {
  // ...
};
```

## 📞 Getting Help

1. Check `QUICKSTART.md` for setup
2. Check `INTEGRATION.md` for integration details
3. Check `ARCHITECTURE.md` for system overview
4. Check backend console for errors
5. Check browser console for frontend errors
6. Review `CHECKLIST.md` for status

## 🎉 Quick Win

Test Step 1 in 2 minutes:

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
npm run dev

# Browser
# 1. Go to http://localhost:3000
# 2. Fill form
# 3. Upload test.txt
# 4. Enter path: C:\Temp\Test-Project
# 5. Click "Create Project Directory"
# 6. See success message!
```

## 📈 Next Steps

1. ✅ Step 1 is working
2. 🔄 Integrate Step 2 (Summarize)
3. 🔄 Continue with Steps 3-13
4. 🔄 Implement TTS and SVG conversion
5. 🔄 Add progress indicators
6. 🔄 Deploy to production

---

**Quick Links:**
- [Quick Start](QUICKSTART.md)
- [Integration Guide](INTEGRATION.md)
- [Architecture](ARCHITECTURE.md)
- [Checklist](CHECKLIST.md)
- [Summary](IMPLEMENTATION_SUMMARY.md)
