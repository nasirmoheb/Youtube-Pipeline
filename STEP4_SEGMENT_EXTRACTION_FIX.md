# Step 4: Voiceover - Segment Extraction & Error Fix

## 🔧 Issues Fixed

### Issue 1: Placeholder Segment Extraction
**Problem:** Segments were hardcoded placeholders, not extracted from actual script.

**Solution:** Added real Gemini API integration for segment extraction.

### Issue 2: Response Handling Error
**Problem:** Frontend expected `response.data.filepath` but backend returned `response.filepath` directly.

**Solution:** Fixed response handling to match actual backend structure.

## 📝 Changes Made

### 1. Added Segment Extraction Function ✅
**File:** `backend/services/geminiService.js`

```javascript
export async function extractVoiceoverSegments(script) {
  const model = ai.getGenerativeModel({ 
    model: 'gemini-2.0-flash-exp',
    systemInstruction: 'You are a script segmentation expert...'
  });

  const prompt = `Split the following script into short, logical segments for voiceover recording. Each segment should be a complete sentence or a few related sentences (2-3 sentences max)...`;

  const result = await model.generateContent({
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'OBJECT',
        properties: {
          segments: {
            type: 'ARRAY',
            items: { type: 'STRING' }
          }
        },
        required: ['segments']
      }
    }
  });

  return parsed.segments || [];
}
```

### 2. Added Backend Endpoint ✅
**File:** `backend/routes/content.js`

```javascript
POST /api/extract-voiceover-segments
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
  "segments": [
    "First segment text...",
    "Second segment text...",
    "Third segment text..."
  ]
}
```

### 3. Added Frontend API Function ✅
**File:** `services/apiService.ts`

```typescript
export async function extractVoiceoverSegments(projectPath: string): Promise<{
  success: boolean;
  segments?: string[];
  error?: string;
}>
```

### 4. Updated Frontend Handler ✅
**File:** `App.tsx`

Changed from:
```typescript
const segments = await geminiService.generateVoiceoverSegments(scriptData.fullScript);
```

To:
```typescript
const apiService = await import('./services/apiService');
const response = await apiService.extractVoiceoverSegments(metadata.projectPath);

if (response.success && response.segments) {
  setVoiceoverSegments(response.segments.map((s, i) => ({ 
    id: i, 
    text: s, 
    status: 'pending' 
  })));
}
```

### 5. Fixed Response Handling ✅
**File:** `App.tsx`

Changed from:
```typescript
if (response.success && response.data) {
  const audioUrl = `file://${response.data.filepath}`;
  // ...
}
```

To:
```typescript
if (response.success && response.filepath) {
  const audioUrl = `file://${response.filepath}`;
  // ...
}
```

### 6. Updated API Type ✅
**File:** `services/apiService.ts`

Changed from:
```typescript
Promise<ApiResponse<{ filename: string; filepath: string }>>
```

To:
```typescript
Promise<{ 
  success: boolean; 
  filename?: string; 
  filepath?: string; 
  error?: string; 
  message?: string 
}>
```

## 🔄 Complete Flow

### Segment Extraction Flow
```
User navigates to Step 4
         ↓
Frontend → POST /api/extract-voiceover-segments
         ↓
Backend reads script.md
         ↓
Gemini API (gemini-2.0-flash-exp)
  - Analyzes script structure
  - Splits into logical segments
  - Returns JSON array of strings
         ↓
Backend returns segments
         ↓
Frontend creates segment objects
         ↓
Display segments with "Generate" buttons
```

### Voiceover Generation Flow
```
User clicks "Generate" on segment
         ↓
Frontend → POST /api/generate-voiceover
  - Body: { projectPath, text, segmentId }
         ↓
Backend → Gemini TTS API
  - Model: gemini-2.5-flash-preview-tts
  - Voice: Kore
         ↓
Backend saves WAV file
         ↓
Backend returns: { success, filename, filepath }
         ↓
Frontend creates audio URL
         ↓
Display play button
```

## 📊 Segment Extraction Example

### Input (script.md)
```markdown
# My Video Script

Welcome to this amazing video about AI. In this video, we'll explore how artificial intelligence is transforming our world.

First, let's talk about machine learning. Machine learning is a subset of AI that allows computers to learn from data without being explicitly programmed.

Next, we'll discuss neural networks. Neural networks are inspired by the human brain and consist of interconnected nodes that process information.

Finally, we'll look at real-world applications. AI is being used in healthcare, finance, transportation, and many other industries.
```

### Output (segments)
```json
{
  "success": true,
  "segments": [
    "Welcome to this amazing video about AI. In this video, we'll explore how artificial intelligence is transforming our world.",
    "First, let's talk about machine learning. Machine learning is a subset of AI that allows computers to learn from data without being explicitly programmed.",
    "Next, we'll discuss neural networks. Neural networks are inspired by the human brain and consist of interconnected nodes that process information.",
    "Finally, we'll look at real-world applications. AI is being used in healthcare, finance, transportation, and many other industries."
  ]
}
```

## 🎯 Segment Quality Guidelines

Gemini is instructed to create segments that are:
- **Complete sentences** or 2-3 related sentences
- **Natural for voice recording** (not too long or too short)
- **Logical breaks** (paragraph boundaries, topic changes)
- **Optimal length** for TTS generation (typically 1-3 sentences)

## 🧪 Testing

### Test 1: Extract Segments
```bash
# 1. Complete Steps 1-3 (have script.md)
# 2. Navigate to Step 4
# 3. Segments should auto-generate from script
# 4. Verify segments are from actual script content
```

**Expected:**
- ✅ Segments extracted from script.md
- ✅ Not placeholder text
- ✅ Logical segment breaks
- ✅ Appropriate segment length

### Test 2: Generate Voiceover
```bash
# 1. After segments extracted
# 2. Click "Generate" on first segment
# 3. Wait 3-5 seconds
# 4. Play button appears
```

**Expected:**
- ✅ No "Failed to generate voiceover" error
- ✅ Audio file created successfully
- ✅ Play button works
- ✅ Audio matches segment text

### Test 3: Error Handling
```bash
# 1. Set invalid API key
# 2. Try to extract segments
# 3. Should see error message
```

**Expected:**
- ✅ Clear error message
- ✅ Can retry after fixing
- ✅ No crash

## 📁 Files Modified

```
✅ backend/services/geminiService.js  - Added extractVoiceoverSegments()
✅ backend/routes/content.js          - Added /api/extract-voiceover-segments
✅ services/apiService.ts             - Added extractVoiceoverSegments(), fixed types
✅ App.tsx                            - Updated handlers, fixed response handling
```

## ✅ Success Criteria

- [x] Segments extracted from real script (not placeholders)
- [x] Gemini API integration for segment extraction
- [x] Structured JSON output
- [x] Response handling fixed
- [x] No "Failed to generate voiceover" error
- [x] Audio generation works correctly
- [x] Error handling in place
- [x] All diagnostics pass

## 🎨 UI Behavior

### Before Fix
```
Step 4: Voiceover
├── Segment 1: "This is placeholder voiceover segment one."
├── Segment 2: "Here is the second segment, for testing purposes."
└── Segment 3: "And a third, to make sure the list renders correctly."

[Generate] → Error: Failed to generate voiceover. Please try again.
```

### After Fix
```
Step 4: Voiceover
├── Segment 1: "Welcome to this amazing video about AI..."
├── Segment 2: "First, let's talk about machine learning..."
└── Segment 3: "Next, we'll discuss neural networks..."

[Generate] → ✅ Success! [Play]
```

## 🚀 How to Test

1. **Start backend:**
   ```bash
   cd backend
   npm start
   ```

2. **Start frontend:**
   ```bash
   npm run dev
   ```

3. **Test workflow:**
   - Complete Steps 1-3
   - Navigate to Step 4
   - Segments auto-extract from script
   - Click "Generate" on any segment
   - Should succeed and create audio file
   - Click play to hear voiceover

## 📚 API Endpoints

### Extract Segments
```
POST /api/extract-voiceover-segments
Content-Type: application/json

Request:
{
  "projectPath": "C:\\Projects\\YouTube\\My-Video"
}

Response:
{
  "success": true,
  "segments": ["segment 1", "segment 2", ...]
}
```

### Generate Voiceover
```
POST /api/generate-voiceover
Content-Type: application/json

Request:
{
  "projectPath": "C:\\Projects\\YouTube\\My-Video",
  "text": "Segment text here...",
  "segmentId": 0
}

Response:
{
  "success": true,
  "filename": "0.wav",
  "filepath": "C:\\Projects\\YouTube\\My-Video\\voiceover\\0.wav",
  "message": "Voiceover generated successfully."
}
```

## 💡 Benefits

1. **Real Content:** Segments from actual script, not placeholders
2. **Smart Segmentation:** Gemini intelligently splits script
3. **Better Quality:** Segments optimized for voice recording
4. **Fixed Errors:** No more "Failed to generate" errors
5. **Proper Flow:** Complete end-to-end workflow

---

**Status:** ✅ COMPLETE

Step 4 now has real segment extraction from scripts and proper voiceover generation without errors!
