# Step 6: Storyboard Generation - Integration Guide

## Overview
Step 6 generates detailed storyboards from narrative beats using Gemini AI. Three different visual styles are available: illustration, clear, and consistent.

## Architecture

### Backend Implementation

#### 1. Gemini Service (`backend/services/geminiService.js`)
```javascript
export async function generateStoryboardStructured(beats, style)
```

**Features:**
- Uses `gemini-2.0-flash-exp` model
- Structured JSON output with schema validation
- Three style options with unique descriptions
- Returns array of storyboard rows

**Style Descriptions:**
- **illustration:** Artistic, hand-drawn illustration style with vibrant colors
- **clear:** Clean, minimalist style with clear focus
- **consistent:** Consistent, professional style with uniform look

#### 2. API Endpoint (`backend/routes/content.js`)
```javascript
POST /api/storyboard
```

**Request:**
```json
{
  "projectPath": "C:\\Projects\\YouTube\\My-Video",
  "style": "illustration"
}
```

**Response:**
```json
{
  "success": true,
  "storyboard": [
    {
      "shot_number": 1,
      "beat_number": "Beat 1",
      "script_phrase": "Introduction to the story...",
      "transition_type": "Fade",
      "ai_prompt": "Detailed image prompt in illustration style...",
      "text_overlay": "Welcome",
      "kinetic_text": "Animated title",
      "sfx": "Whoosh.mp3"
    }
  ]
}
```

**Files Created:**
- `{projectPath}/storyboards/{style}.json` - JSON format
- `{projectPath}/storyboards/{style}.md` - Markdown format

### Frontend Implementation

#### 1. API Service (`services/apiService.ts`)
```typescript
export async function generateStoryboard(
  projectPath: string, 
  style: 'illustration' | 'clear' | 'consistent'
)
```

#### 2. App Component (`App.tsx`)
```typescript
const handleGenerateStoryboard = useCallback(async (style) => {
  // Calls backend API
  // Updates storyboards state
  // Extracts prompts for Step 7
  // Handles errors
}, [metadata.projectPath]);
```

#### 3. UI Component (`components/steps/Step6_Storyboard.tsx`)
- Tab interface for 3 styles
- Table display for storyboard rows
- Generate button for each style
- Loading states

## Data Flow

```
User clicks "Generate {style} Storyboard"
         ↓
Frontend → POST /api/storyboard
  - Body: { projectPath, style }
         ↓
Backend reads beats.json
         ↓
Gemini API (gemini-2.0-flash-exp)
  - Structured JSON output
  - Style-specific prompts
         ↓
Backend saves:
  - storyboards/{style}.json
  - storyboards/{style}.md
         ↓
Frontend receives storyboard array
         ↓
Display in table format
         ↓
Extract prompts for Step 7
```

## Storyboard Row Structure

```typescript
interface StoryboardRow {
  shot_number: number;        // Sequential shot number
  beat_number: string;        // e.g., "Beat 1"
  script_phrase: string;      // Script text from beat
  transition_type: string;    // Cut, Fade, Dissolve, etc.
  ai_prompt: string;          // Image generation prompt
  text_overlay: string;       // On-screen text or "None"
  kinetic_text: string;       // Animated text or "None"
  sfx: string;                // Sound effect or "None"
}
```

## Features

### 1. Three Visual Styles
Each style has unique characteristics:

**Illustration:**
- Artistic, hand-drawn look
- Vibrant colors
- Creative compositions
- Best for: Storytelling, creative content

**Clear:**
- Clean, minimalist design
- Clear focus
- Simple compositions
- Best for: Educational, professional content

**Consistent:**
- Uniform visual language
- Professional look
- Cohesive style throughout
- Best for: Brand content, series

### 2. Detailed Shot Information
Each shot includes:
- Visual description (AI prompt)
- Transition type
- Text overlays
- Kinetic text effects
- Sound effects

### 3. File Management
- **JSON format:** Machine-readable for Step 7
- **Markdown format:** Human-readable for review

## Example Output

### storyboards/illustration.json
```json
[
  {
    "shot_number": 1,
    "beat_number": "Beat 1",
    "script_phrase": "In a world where technology has advanced beyond imagination...",
    "transition_type": "Fade",
    "ai_prompt": "Artistic illustration of a futuristic cityscape with flying vehicles, vibrant neon colors, hand-drawn style with visible brush strokes, dynamic composition",
    "text_overlay": "The Future",
    "kinetic_text": "Animated title with glowing effect",
    "sfx": "Sci-fi ambient.mp3"
  },
  {
    "shot_number": 2,
    "beat_number": "Beat 2",
    "script_phrase": "Our hero discovers a hidden truth...",
    "transition_type": "Cut",
    "ai_prompt": "Illustration of a character looking at a holographic display with shocked expression, dramatic lighting, artistic style with bold colors",
    "text_overlay": "None",
    "kinetic_text": "None",
    "sfx": "Discovery.mp3"
  }
]
```

### storyboards/illustration.md
```markdown
## Shot 1 - Beat 1
**Script:** In a world where technology has advanced beyond imagination...
**Transition:** Fade
**AI Prompt:** Artistic illustration of a futuristic cityscape with flying vehicles, vibrant neon colors, hand-drawn style with visible brush strokes, dynamic composition
**Text Overlay:** The Future
**Kinetic Text:** Animated title with glowing effect
**SFX:** Sci-fi ambient.mp3

## Shot 2 - Beat 2
**Script:** Our hero discovers a hidden truth...
**Transition:** Cut
**AI Prompt:** Illustration of a character looking at a holographic display with shocked expression, dramatic lighting, artistic style with bold colors
**Text Overlay:** None
**Kinetic Text:** None
**SFX:** Discovery.mp3
```

## Error Handling

- Backend validates projectPath and style
- Checks beats.json exists
- Handles Gemini API errors gracefully
- Frontend displays user-friendly error messages
- All errors logged to console

## Testing

See `TEST_STEP6.md` for comprehensive testing guide.

## Integration Points

### Input (from Step 5)
- Reads `beats.json` containing narrative beats
- Each beat becomes one or more shots

### Output (to Step 7)
- `storyboards/{style}.json` used for prompt extraction
- AI prompts extracted for image generation
- Each style generates separate prompt set

## Performance

- **Generation Time:** 10-15 seconds per style
- **API Model:** gemini-2.0-flash-exp
- **File Size:** ~5-10KB per storyboard

## Next Steps

After Step 6 completion:
- **Step 7**: Extract image prompts from storyboards
- **Step 8**: Generate images using extracted prompts
- **Step 9**: Select final images for video

---

**Status:** ✅ COMPLETE

Storyboard generation is fully integrated with real Gemini API and ready for testing.
