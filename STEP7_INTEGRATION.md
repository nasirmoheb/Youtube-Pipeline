# Step 7: Prompt Extraction & Saving - Integration Guide

## Overview
Step 7 automatically extracts image generation prompts from storyboards (generated in Step 6) and saves them to files. Prompts are extracted and saved automatically when storyboards are generated.

## Architecture

### Automatic Extraction
Prompts are extracted automatically in Step 6 when storyboards are generated. Step 7 displays these prompts and they are saved to files.

### Backend Implementation

#### API Endpoint (`backend/routes/content.js`)
```javascript
POST /api/save-prompts
```

**Request:**
```json
{
  "projectPath": "C:\\Projects\\YouTube\\My-Video",
  "style": "illustration",
  "prompts": [
    {
      "shot_number": 1,
      "beat_number": "Beat 1",
      "script_phrase": "...",
      "transition_type": "Fade",
      "ai_prompt": "Detailed image prompt..."
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Prompts for illustration saved successfully."
}
```

**Files Created:**
- `{projectPath}/prompts/prompts-{style}.json` - JSON format
- `{projectPath}/prompts/prompts-{style}.js` - JavaScript module
- `{projectPath}/prompts/prompts-{style}.txt` - Text format

### Frontend Implementation

#### 1. API Service (`services/apiService.ts`)
```typescript
export async function savePrompts(
  projectPath: string, 
  style: 'illustration' | 'clear' | 'consistent',
  prompts: ExtractedPrompt[]
)
```

#### 2. App Component (`App.tsx`)
Prompts are extracted and saved automatically in `handleGenerateStoryboard()`:

```typescript
// Extract prompts from storyboard
const prompts = response.storyboard.map(row => ({
  shot_number: row.shot_number,
  beat_number: row.beat_number,
  script_phrase: row.script_phrase,
  transition_type: row.transition_type,
  ai_prompt: row.ai_prompt
}));

// Save to state
setExtractedPrompts(prev => ({ ...prev, [style]: prompts }));

// Save to backend files
await apiService.savePrompts(metadata.projectPath, style, prompts);
```

#### 3. UI Component (`components/steps/Step7_Prompts.tsx`)
- Tab interface for 3 styles
- Displays prompts using PromptCodeDisplay component
- Read-only view (no generation button needed)

## Data Flow

```
Step 6: User generates storyboard
         ↓
Storyboard received from backend
         ↓
Frontend extracts prompts from storyboard
         ↓
Frontend → POST /api/save-prompts
  - Body: { projectPath, style, prompts }
         ↓
Backend saves 3 file formats:
  - prompts-{style}.json
  - prompts-{style}.js
  - prompts-{style}.txt
         ↓
User navigates to Step 7
         ↓
Prompts displayed in UI
```

## Prompt Structure

```typescript
interface ExtractedPrompt {
  shot_number: number;
  beat_number: string;
  script_phrase: string;
  transition_type: string;
  ai_prompt: string;
}
```

## File Formats

### 1. prompts-illustration.json
**Purpose:** Machine-readable format for Step 8 (image generation)

```json
[
  {
    "shot_number": 1,
    "beat_number": "Beat 1",
    "script_phrase": "In a world where AI transforms everything...",
    "transition_type": "Fade",
    "ai_prompt": "Artistic illustration of a futuristic cityscape with AI elements, vibrant neon colors, hand-drawn style"
  }
]
```

### 2. prompts-illustration.js
**Purpose:** JavaScript module for easy import

```javascript
export const prompts = [
  {
    "shot_number": 1,
    "beat_number": "Beat 1",
    "script_phrase": "In a world where AI transforms everything...",
    "transition_type": "Fade",
    "ai_prompt": "Artistic illustration of a futuristic cityscape with AI elements, vibrant neon colors, hand-drawn style"
  }
];
```

### 3. prompts-illustration.txt
**Purpose:** Human-readable format for review

```
=== Beat 1 (Shot 1) ===
Artistic illustration of a futuristic cityscape with AI elements, vibrant neon colors, hand-drawn style

=== Beat 2 (Shot 2) ===
Illustration of a character discovering AI technology, dramatic lighting, artistic style
```

## Features

### 1. Automatic Extraction
- Prompts extracted when storyboard is generated
- No manual extraction step needed
- Happens in Step 6 automatically

### 2. Three File Formats
- **JSON:** For programmatic use in Step 8
- **JavaScript:** For easy import in code
- **Text:** For human review and editing

### 3. Style-Specific Prompts
- Each style has its own prompt files
- Prompts reflect style characteristics
- Organized by style in prompts/ folder

### 4. Display in UI
- Tab interface for switching styles
- Code display component
- Easy to copy prompts

## File Structure

After Step 7 (prompts saved):
```
C:\Projects\YouTube\My-Video\
├── book.txt
├── summary.txt
├── script.md
├── voiceover/
├── beats.json
├── beats.md
├── storyboards/
│   ├── illustration.json
│   ├── clear.json
│   └── consistent.json
└── prompts/                    ← NEW
    ├── prompts-illustration.json  ← NEW
    ├── prompts-illustration.js    ← NEW
    ├── prompts-illustration.txt   ← NEW
    ├── prompts-clear.json         ← NEW
    ├── prompts-clear.js           ← NEW
    ├── prompts-clear.txt          ← NEW
    ├── prompts-consistent.json    ← NEW
    ├── prompts-consistent.js      ← NEW
    └── prompts-consistent.txt     ← NEW
```

## Integration Points

### Input (from Step 6)
- Storyboards contain AI prompts
- Prompts extracted from storyboard rows
- One prompt per shot

### Output (to Step 8)
- `prompts/{style}.json` used for image generation
- Each prompt generates one image
- Organized by style and beat

## Error Handling

- Backend validates projectPath, style, and prompts
- Checks prompts directory can be created
- Handles file write errors gracefully
- Frontend logs errors to console
- Prompts still available in state even if save fails

## Testing

See `TEST_STEP7.md` for comprehensive testing guide.

## Performance

- **Save Time:** < 1 second per style
- **File Size:** ~2-5KB per style
- **Prompt Count:** Matches shot count from storyboard

## Next Steps

After Step 7 completion:
- **Step 8**: Generate images using extracted prompts
- Each prompt generates an image
- Images organized by style and beat

---

**Status:** ✅ COMPLETE

Prompt extraction and saving is fully integrated. Prompts are automatically extracted in Step 6 and saved to files.
