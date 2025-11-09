# System Architecture

## Overview

The AI YouTube Video Pipeline consists of a React frontend and a Node.js backend that work together to automate video creation.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│                    (React + TypeScript)                      │
│                   http://localhost:3000                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐                     │
│  │   App.tsx    │──────│  Step1_      │                     │
│  │              │      │  ProjectSetup│                     │
│  │  - State     │      │              │                     │
│  │  - Routing   │      │  - Form UI   │                     │
│  │  - Handlers  │      │  - Validation│                     │
│  └──────┬───────┘      └──────┬───────┘                     │
│         │                     │                              │
│         │                     │                              │
│         └─────────┬───────────┘                              │
│                   │                                          │
│         ┌─────────▼──────────┐                              │
│         │  apiService.ts     │                              │
│         │                    │                              │
│         │  - createProject() │                              │
│         │  - summarize()     │                              │
│         │  - generateScript()│                              │
│         │  - ...             │                              │
│         └─────────┬──────────┘                              │
│                   │                                          │
└───────────────────┼──────────────────────────────────────────┘
                    │
                    │ HTTP/JSON
                    │ POST /api/project
                    │ { projectPath, bookContent }
                    │
┌───────────────────▼──────────────────────────────────────────┐
│                         BACKEND                              │
│                    (Node.js + Express)                       │
│                   http://localhost:3001                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐                                            │
│  │  server.js   │                                            │
│  │              │                                            │
│  │  - CORS      │                                            │
│  │  - Routes    │                                            │
│  │  - Errors    │                                            │
│  └──────┬───────┘                                            │
│         │                                                    │
│         ├─────────┬─────────┬─────────┬──────────┐          │
│         │         │         │         │          │          │
│  ┌──────▼──┐ ┌───▼────┐ ┌──▼─────┐ ┌─▼──────┐ ┌─▼──────┐  │
│  │project  │ │content │ │images  │ │upload  │ │...     │  │
│  │.js      │ │.js     │ │.js     │ │.js     │ │        │  │
│  │         │ │        │ │        │ │        │ │        │  │
│  │POST     │ │POST    │ │POST    │ │POST    │ │        │  │
│  │/project │ │/summ.. │ │/gen... │ │/upload │ │        │  │
│  └────┬────┘ └───┬────┘ └───┬────┘ └───┬────┘ └────────┘  │
│       │          │           │          │                   │
│       │          │           │          │                   │
│  ┌────▼──────────▼───────────▼──────────▼────┐             │
│  │         geminiService.js                   │             │
│  │                                            │             │
│  │  - generateText()                          │             │
│  │  - generateImage()                         │             │
│  │  - generateAudio()                         │             │
│  └────────────────┬───────────────────────────┘             │
│                   │                                          │
│  ┌────────────────▼───────────────────────────┐             │
│  │         fileSystem.js                      │             │
│  │                                            │             │
│  │  - sanitizePath()                          │             │
│  │  - ensureDir()                             │             │
│  │  - readFile()                              │             │
│  │  - writeFile()                             │             │
│  └────────────────┬───────────────────────────┘             │
│                   │                                          │
└───────────────────┼──────────────────────────────────────────┘
                    │
                    │ File System Operations
                    │
┌───────────────────▼──────────────────────────────────────────┐
│                    FILE SYSTEM                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  /path/to/project/                                           │
│  ├── book.txt              ← Created by Step 1               │
│  ├── summary.txt           ← Created by Step 2               │
│  ├── script.md             ← Created by Step 3               │
│  ├── beats.md              ← Created by Step 5               │
│  ├── storyboards/          ← Created by Step 6               │
│  ├── prompts/              ← Created by Step 7               │
│  ├── voiceover/            ← Created by Step 4               │
│  ├── images/               ← Created by Step 8               │
│  ├── finalImage/           ← Created by Step 9               │
│  ├── finalImageSVG/        ← Created by Step 10              │
│  └── transcription.txt     ← Created by Step 11              │
│                                                               │
└───────────────────────────────────────────────────────────────┘
                    │
                    │ API Calls
                    │
┌───────────────────▼──────────────────────────────────────────┐
│                    GEMINI API                                │
│                 (Google AI Studio)                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  - Text Generation (gemini-1.5-flash)                        │
│  - Image Generation (imagen-3.0)                             │
│  - Audio Generation (TTS - to be implemented)                │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Data Flow - Step 1 (Project Setup)

```
┌─────────────┐
│    User     │
└──────┬──────┘
       │ 1. Fills form
       │    - Video Title
       │    - Uploads book.txt
       │    - Project Path
       │
┌──────▼──────────────────┐
│  Step1_ProjectSetup.tsx │
└──────┬──────────────────┘
       │ 2. Validates inputs
       │
       │ 3. Calls API
       │    apiService.createProject(path, content)
       │
┌──────▼──────────────────┐
│   apiService.ts         │
└──────┬──────────────────┘
       │ 4. HTTP POST
       │    /api/project
       │    { projectPath, bookContent }
       │
┌──────▼──────────────────┐
│   Backend Server        │
│   routes/project.js     │
└──────┬──────────────────┘
       │ 5. Sanitizes path
       │    sanitizePath(projectPath)
       │
       │ 6. Creates directory
       │    ensureDir(projectPath)
       │
       │ 7. Writes file
       │    writeFile('book.txt', content)
       │
┌──────▼──────────────────┐
│   File System           │
│   /path/to/project/     │
│   └── book.txt          │
└──────┬──────────────────┘
       │ 8. Success response
       │    { success: true, message: "..." }
       │
┌──────▼──────────────────┐
│   Frontend              │
│   Shows success message │
└─────────────────────────┘
```

## Component Hierarchy

```
App.tsx
├── Stepper
│   └── Step indicators (1-13)
│
├── Step1_ProjectSetup ✅ Integrated
│   ├── Title input
│   ├── File upload
│   ├── Path input
│   └── Create button
│
├── Step2_Summarize 🔄 Ready
├── Step3_Scripting 🔄 Ready
├── Step4_Voiceover 🔄 Ready
├── Step5_Beats 🔄 Ready
├── Step6_Storyboard 🔄 Ready
├── Step7_Prompts 🔄 Ready
├── Step8_Images 🔄 Ready
├── Step9_Select 🔄 Ready
├── Step10_SvgConvert 🔄 Ready
├── Step11_Transcription 🔄 Ready
├── Step12_PreEditScan 🔄 Ready
└── Step13_VideoEdit 🔄 Ready
```

## API Routes Structure

```
/api
├── /project              POST   Create project
├── /summarize            POST   Generate summary
├── /script               POST   Generate script
├── /beats                POST   Generate beats
├── /storyboards          POST   Create storyboards
├── /prompts              POST   Extract prompts
├── /voiceover            POST   Generate voiceover
├── /generate-images      POST   Start image generation
├── /status/images/:id    GET    Check generation status
├── /select-image         POST   Save selected image
├── /convert-svg          POST   Convert to SVG
├── /upload-transcription POST   Upload transcription
└── /pre-edit-scan        POST   Generate scan data
```

## State Management

```
App.tsx (Main State)
├── currentStep: number
├── metadata: ProjectMetadata
│   ├── title: string
│   ├── bookName: string
│   └── projectPath: string
├── bookContent: string
├── summary: string
├── scriptData: ScriptData
├── voiceoverSegments: VoiceoverSegment[]
├── beats: Beat[]
├── storyboards: { [style]: StoryboardRow[] }
├── extractedPrompts: { [style]: ExtractedPrompt[] }
├── images: { [style]: { [beat]: string } }
├── imageSelection: ImageSelection
├── svgConversionStatus: { [beat]: SvgConversionStatus }
├── transcriptionData: TranscriptionWord[]
└── preEditScanData: PreEditScanItem[]
```

## Security Layers

```
┌─────────────────────────────────────┐
│  Frontend Validation                │
│  - Required fields                  │
│  - File type checking               │
│  - Path format validation           │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  Backend Validation                 │
│  - Path sanitization                │
│  - Directory traversal prevention   │
│  - Input validation                 │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  File System Operations             │
│  - Scoped to project directories    │
│  - Permission checks                │
│  - Error handling                   │
└─────────────────────────────────────┘
```

## Technology Stack

**Frontend:**
- React 18
- TypeScript
- Vite
- Tailwind CSS (implied from classes)
- Remotion (for video editing)

**Backend:**
- Node.js
- Express.js
- Multer (file uploads)
- Google Generative AI SDK
- UUID (task IDs)

**External Services:**
- Google Gemini API (text & image generation)

## Environment Configuration

**Frontend (.env):**
```
VITE_API_URL=http://localhost:3001/api
```

**Backend (.env):**
```
GEMINI_API_KEY=your_api_key_here
PORT=3001
```

## Deployment Considerations

For production deployment:

1. **Frontend:**
   - Build: `npm run build`
   - Serve static files
   - Update `VITE_API_URL` to production backend

2. **Backend:**
   - Use process manager (PM2)
   - Set `NODE_ENV=production`
   - Configure proper CORS origins
   - Use HTTPS
   - Add rate limiting
   - Implement authentication if needed

3. **File Storage:**
   - Consider cloud storage (S3, GCS)
   - Implement cleanup policies
   - Add backup strategy
