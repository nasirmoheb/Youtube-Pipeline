# Step 5: Beat Generation - Integration Guide

## Overview
Step 5 generates narrative beats from the video script using Gemini AI. Beats are key moments or segments that will be used for visual storytelling in subsequent steps.

## Architecture

### Backend Implementation

#### 1. Gemini Service (`backend/services/geminiService.js`)
```javascript
export async function generateBeatsStructured(script)
```
- Uses `gemini-2.0-flash-exp` model
- Structured JSON output with schema validation
- Returns array of beat objects: `{ beat_number, script_phrase }`

#### 2. API Endpoint (`backend/routes/content.js`)
```javascript
POST /api/beats
```
**Request:**
```json
{
  "projectPath": "C:\\Projects\\YouTube\\My-Video"
}
```

**Response:**
```json
{
  "success": true,
  "beats": [
    {
      "beat_number": "Beat 1",
      "script_phrase": "Introduction to the story..."
    }
  ]
}
```

**Files Created:**
- `{projectPath}/beats.json` - JSON format for programmatic use
- `{projectPath}/beats.md` - Markdown format for human readability

#### 3. Save Beats Endpoint
```javascript
POST /api/save-beats
```
Used when refining beats through chat interaction.

### Frontend Implementation

#### 1. API Service (`services/apiService.ts`)
```typescript
export async function generateBeats(projectPath: string)
export async function saveBeats(projectPath: string, beats: Beat[])
```

#### 2. App Component (`App.tsx`)
```typescript
const handleGenerateBeats = useCallback(async () => {
  // Calls backend API
  // Updates state with beats array
  // Handles errors
}, [metadata.projectPath]);

const handleRefineBeats = useCallback(async (instruction: string) => {
  // Uses Gemini to refine beats based on user instruction
  // Saves refined beats to backend
}, [beats, metadata.projectPath]);
```

#### 3. UI Component (`components/steps/Step5_Beats.tsx`)
- Displays beats in a table format
- Shows beat number and script phrase
- Includes GeminiInteraction component for refinement

## Data Flow

```
User clicks "Generate Beats"
         ↓
Frontend → POST /api/beats
         ↓
Backend reads script.md
         ↓
Gemini API (structured output)
         ↓
Backend saves beats.json & beats.md
         ↓
Frontend receives beats array
         ↓
Display in table format
```

## Beat Structure

```typescript
interface Beat {
  beat_number: string;  // e.g., "Beat 1", "Beat 2"
  script_phrase: string; // The narrative content for this beat
}
```

## Features

### 1. Generate Beats
- Analyzes full script
- Identifies key narrative moments
- Creates numbered beats with corresponding phrases
- Saves to both JSON and Markdown formats

### 2. Refine Beats
- Chat-based refinement using Gemini
- User provides instructions (e.g., "Make beat 2 more dramatic")
- Automatically saves refined version

### 3. File Management
- **beats.json**: Machine-readable format
- **beats.md**: Human-readable format with headers

## Example Output

### beats.json
```json
[
  {
    "beat_number": "Beat 1",
    "script_phrase": "In a world where technology has advanced beyond imagination..."
  },
  {
    "beat_number": "Beat 2",
    "script_phrase": "Our hero discovers a hidden truth that changes everything..."
  }
]
```

### beats.md
```markdown
## Beat 1
In a world where technology has advanced beyond imagination...

## Beat 2
Our hero discovers a hidden truth that changes everything...
```

## Error Handling

- Backend validates projectPath exists
- Checks script.md file exists
- Handles Gemini API errors gracefully
- Frontend displays user-friendly error messages
- All errors logged to console

## Testing

See `TEST_STEP5.md` for comprehensive testing guide.

## Next Steps

After Step 5 completion:
- **Step 6**: Generate storyboards from beats (3 different styles)
- Beats are used as input for visual planning
- Each beat will have corresponding visual prompts
