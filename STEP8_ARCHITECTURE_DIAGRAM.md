# Step 8 Image Generation - Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                           USER INTERFACE                             │
│                     components/steps/Step8_Images.tsx                │
│                                                                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐    │
│  │  Illustration   │  │      Clear      │  │   Consistent    │    │
│  │  ┌───────────┐  │  │  ┌───────────┐  │  │  ┌───────────┐  │    │
│  │  │ Progress  │  │  │  │ Progress  │  │  │  │ Progress  │  │    │
│  │  │   Bar     │  │  │  │   Bar     │  │  │  │   Bar     │  │    │
│  │  └───────────┘  │  │  └───────────┘  │  │  └───────────┘  │    │
│  │  Beat 1.1: ✓    │  │  Beat 1.1: ✓    │  │  Beat 1.1: ⟳    │    │
│  │  Beat 1.2: ⟳    │  │  Beat 1.2: ◦    │  │  Beat 1.2: ◦    │    │
│  │  Beat 2.1: ◦    │  │  Beat 2.1: ◦    │  │  Beat 2.1: ◦    │    │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘    │
│                                                                       │
│  [Generate All Images] ← User clicks                                │
└───────────────────────────────┬───────────────────────────────────┘
                                │
                                │ HTTP POST /api/generate-images
                                │ { projectPath, promptsByStyle }
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         BACKEND SERVER                               │
│                        backend/server.js                             │
│                                                                       │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │              imageGenerationRouter                             │  │
│  │         backend/routes/imageGeneration.js                      │  │
│  │                                                                 │  │
│  │  POST /api/generate-images                                     │  │
│  │  ├─ Validate request                                           │  │
│  │  ├─ Check for active session                                   │  │
│  │  ├─ Setup SSE stream                                           │  │
│  │  └─ Call generateAllImages()                                   │  │
│  │                                                                 │  │
│  │  GET /api/generation-status/:projectPath                       │  │
│  │  └─ Return isGenerating status                                 │  │
│  └───────────────────────────────┬─────────────────────────────────┘  │
│                                  │                                     │
│                                  │ Calls                               │
│                                  ▼                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │           imageGenerationService.js                            │  │
│  │     backend/ImageGeneration/imageGenerationService.js          │  │
│  │                                                                 │  │
│  │  generateAllImages(projectPath, promptsByStyle, onProgress)    │  │
│  │  └─ Spawns 3 concurrent style generators                       │  │
│  │                                                                 │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  generateImagesForStyle(style, prompts, onProgress)     │  │  │
│  │  │                                                           │  │  │
│  │  │  1. Load progress from disk                              │  │  │
│  │  │     ├─ Read image_progress_{style}.json                  │  │  │
│  │  │     └─ Filter out completed beats                        │  │  │
│  │  │                                                           │  │  │
│  │  │  2. For each remaining prompt:                           │  │  │
│  │  │     ├─ Check if image exists (skip if yes)               │  │  │
│  │  │     ├─ Call generateImageForBeat()                       │  │  │
│  │  │     ├─ Save progress after each image                    │  │  │
│  │  │     ├─ Send progress update via onProgress()             │  │  │
│  │  │     └─ Delay before next request                         │  │  │
│  │  │                                                           │  │  │
│  │  │  3. Return completion status                             │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  │                                                                 │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  generateImageForBeat(projectPath, style, prompt)       │  │  │
│  │  │                                                           │  │  │
│  │  │  1. Setup output directory                               │  │  │
│  │  │     └─ {projectPath}/generated_images/{style}/Shot_X/    │  │  │
│  │  │                                                           │  │  │
│  │  │  2. Check if image already exists                        │  │  │
│  │  │     └─ Return {success: true, skipped: true}             │  │  │
│  │  │                                                           │  │  │
│  │  │  3. Prepare generation request                           │  │  │
│  │  │     ├─ Use ai_prompt as text                             │  │  │
│  │  │     └─ Add style_reference.png if hard cut               │  │  │
│  │  │                                                           │  │  │
│  │  │  4. Call Google Gemini API                               │  │  │
│  │  │     ├─ Try with current API key                          │  │  │
│  │  │     ├─ If 429 error: rotate to next key                  │  │  │
│  │  │     └─ Retry up to max attempts                          │  │  │
│  │  │                                                           │  │  │
│  │  │  5. Save image to disk                                   │  │  │
│  │  │     └─ Beat_X.X.png                                      │  │  │
│  │  │                                                           │  │  │
│  │  │  6. Return result                                        │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                │ Progress Updates (SSE)
                                │ data: {"type":"progress",...}
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                               │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              Google Gemini API                               │   │
│  │         gemini-2.0-flash-preview-image-generation            │   │
│  │                                                               │   │
│  │  API Key Pool per Style:                                     │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │   │
│  │  │Illustration  │  │    Clear     │  │  Consistent  │      │   │
│  │  │  Keys 1-2    │  │  Keys 3-4    │  │  Keys 5-6    │      │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘      │   │
│  │                                                               │   │
│  │  Rate Limit: 10 requests/minute per key                      │   │
│  │  Auto-rotation on 429 error                                  │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                │ Generated Images
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         FILE SYSTEM                                  │
│                                                                       │
│  {projectPath}/                                                      │
│  ├─ generated_images/                                                │
│  │  ├─ illustration/                                                 │
│  │  │  ├─ Shot_1/                                                    │
│  │  │  │  ├─ Beat_1.1.png ✓                                          │
│  │  │  │  ├─ Beat_1.2.png ✓                                          │
│  │  │  │  └─ Beat_2.1.png ⟳                                          │
│  │  │  └─ Shot_2/                                                    │
│  │  │     └─ ...                                                     │
│  │  ├─ clear/                                                        │
│  │  │  └─ Shot_1/                                                    │
│  │  │     └─ ...                                                     │
│  │  └─ consistent/                                                   │
│  │     └─ Shot_1/                                                    │
│  │        └─ ...                                                     │
│  │                                                                    │
│  ├─ image_progress_illustration.json                                 │
│  │  {                                                                │
│  │    "completedBeats": ["1.1", "1.2"],                              │
│  │    "lastUpdated": "2025-11-09T..."                                │
│  │  }                                                                │
│  │                                                                    │
│  ├─ image_progress_clear.json                                        │
│  └─ image_progress_consistent.json                                   │
└─────────────────────────────────────────────────────────────────────┘
```

## Concurrent Execution Flow

```
Time ──────────────────────────────────────────────────────────────▶

Style: Illustration
       │
       ├─ Beat 1.1 ──────────┐
       │                     ✓ (saved)
       │                      │
       │                      ├─ Beat 1.2 ──────────┐
       │                      │                     ✓
       │                      │                      │
       │                      │                      ├─ Beat 2.1 ───▶
       │                      │                      │
       │                      │                      │

Style: Clear
       │
       ├─ Beat 1.1 ──────────┐
       │                     ✓
       │                      │
       │                      ├─ Beat 1.2 ──────────┐
       │                      │                     ✓
       │                      │                      │
       │                      │                      ├─ Beat 2.1 ───▶
       │                      │                      │

Style: Consistent
       │
       ├─ Beat 1.1 ──────────┐
       │                     ✓
       │                      │
       │                      ├─ Beat 1.2 ──────────┐
       │                      │                     ✓
       │                      │                      │
       │                      │                      ├─ Beat 2.1 ───▶

All 3 styles run in parallel, each with its own API key pool
```

## API Key Rotation Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    API Key Management                        │
│                                                               │
│  Style: Illustration                                         │
│  Keys: [Key1, Key2]                                          │
│  Current Index: 0                                            │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  1. Try generation with Key1                        │    │
│  │     └─ Success ✓                                    │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  2. Try generation with Key1                        │    │
│  │     └─ Error 429 (Rate Limit) ✗                     │    │
│  │                                                       │    │
│  │  3. Rotate to Key2 (Index: 1)                       │    │
│  │     └─ Retry with Key2                              │    │
│  │        └─ Success ✓                                 │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  4. Continue with Key2                              │    │
│  │     └─ Success ✓                                    │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  5. Try generation with Key2                        │    │
│  │     └─ Error 429 (Rate Limit) ✗                     │    │
│  │                                                       │    │
│  │  6. Rotate to Key1 (Index: 0)                       │    │
│  │     └─ Retry with Key1                              │    │
│  │        └─ Success ✓                                 │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  Each style has independent key rotation                     │
└─────────────────────────────────────────────────────────────┘
```

## Progress Tracking Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Progress Lifecycle                        │
│                                                               │
│  Initial State:                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  image_progress_illustration.json                   │    │
│  │  {                                                   │    │
│  │    "completedBeats": [],                            │    │
│  │    "lastUpdated": null                              │    │
│  │  }                                                   │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  After Beat 1.1:                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  {                                                   │    │
│  │    "completedBeats": ["1.1"],                       │    │
│  │    "lastUpdated": "2025-11-09T10:00:00Z"           │    │
│  │  }                                                   │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  After Beat 1.2:                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  {                                                   │    │
│  │    "completedBeats": ["1.1", "1.2"],               │    │
│  │    "lastUpdated": "2025-11-09T10:01:00Z"           │    │
│  │  }                                                   │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  On Resume:                                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  1. Load progress file                              │    │
│  │  2. Filter prompts:                                 │    │
│  │     All Prompts: [1.1, 1.2, 2.1, 2.2]              │    │
│  │     Completed:   [1.1, 1.2]                         │    │
│  │     Remaining:   [2.1, 2.2] ← Process these        │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## SSE Communication Flow

```
Frontend                          Backend
   │                                 │
   │  POST /api/generate-images      │
   ├────────────────────────────────▶│
   │                                 │
   │  SSE Connection Established     │
   │◀────────────────────────────────┤
   │                                 │
   │  data: {"type":"start"}         │
   │◀────────────────────────────────┤
   │  Update UI: "Starting..."       │
   │                                 │
   │  data: {"type":"progress",      │
   │         "style":"illustration", │
   │         "beat_number":"1.1",    │
   │         "status":"generating"}  │
   │◀────────────────────────────────┤
   │  Update UI: Beat 1.1 ⟳          │
   │                                 │
   │  data: {"type":"progress",      │
   │         "style":"illustration", │
   │         "beat_number":"1.1",    │
   │         "status":"complete"}    │
   │◀────────────────────────────────┤
   │  Update UI: Beat 1.1 ✓          │
   │                                 │
   │  ... more progress updates ...  │
   │                                 │
   │  data: {"type":"complete"}      │
   │◀────────────────────────────────┤
   │  Update UI: "All complete!"     │
   │                                 │
   │  Connection Closed              │
   │◀────────────────────────────────┤
   │                                 │
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Error Scenarios                           │
│                                                               │
│  Scenario 1: Rate Limit Error                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Generate Image                                     │    │
│  │    └─ Error 429                                     │    │
│  │       └─ Rotate API Key                             │    │
│  │          └─ Retry                                   │    │
│  │             └─ Success ✓                            │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  Scenario 2: Network Error                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Generate Image                                     │    │
│  │    └─ Network Error                                 │    │
│  │       └─ Log Error                                  │    │
│  │          └─ Mark as Error ✗                         │    │
│  │             └─ Continue with Next Beat              │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  Scenario 3: Invalid Response                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Generate Image                                     │    │
│  │    └─ No Image Data in Response                     │    │
│  │       └─ Log Error                                  │    │
│  │          └─ Mark as Error ✗                         │    │
│  │             └─ Continue with Next Beat              │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  Scenario 4: All Keys Exhausted                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Generate Image                                     │    │
│  │    └─ Error 429 with Key1                           │    │
│  │       └─ Rotate to Key2                             │    │
│  │          └─ Error 429 with Key2                     │    │
│  │             └─ All Keys Tried                       │    │
│  │                └─ Mark as Error ✗                   │    │
│  │                   └─ Continue with Next Beat        │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## State Management

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend State                            │
│                                                               │
│  progressState: {                                            │
│    illustration: {                                           │
│      "1.1": "complete",    ✓                                │
│      "1.2": "generating",  ⟳                                │
│      "2.1": "pending"      ◦                                │
│    },                                                        │
│    clear: { ... },                                           │
│    consistent: { ... }                                       │
│  }                                                           │
│                                                               │
│  styleProgress: {                                            │
│    illustration: { completed: 5, total: 30 },               │
│    clear: { completed: 4, total: 30 },                      │
│    consistent: { completed: 6, total: 30 }                  │
│  }                                                           │
│                                                               │
│  isGenerating: true                                          │
│  overallMessage: "[illustration] Processing Beat 1.2..."    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Backend State                             │
│                                                               │
│  activeSessions: Map {                                       │
│    "/path/to/project" => 1699999999999                       │
│  }                                                           │
│                                                               │
│  currentApiKeyIndex: {                                       │
│    illustration: 0,                                          │
│    clear: 1,                                                 │
│    consistent: 0                                             │
│  }                                                           │
│                                                               │
│  aiInstances: {                                              │
│    illustration: GoogleGenAI { ... },                        │
│    clear: GoogleGenAI { ... },                               │
│    consistent: GoogleGenAI { ... }                           │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
```

## Legend

```
Symbols:
  ✓  Complete
  ⟳  Generating
  ◦  Pending
  ✗  Error

Arrows:
  ──▶  Data flow
  ◀──  Response
  │    Vertical connection
  └──  Branch

Components:
  ┌──┐  Container/Box
  │  │  Vertical border
  └──┘  Bottom border
```
