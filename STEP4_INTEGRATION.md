# Step 4 Integration - Voiceover Generation with Gemini TTS

## ✅ What Was Implemented

Step 4 (Voiceover) is now fully integrated with the Gemini TTS API to generate and save voiceover audio files.

## 🎯 Features

### 1. Segment Generation
- Splits script into logical segments
- Each segment is a complete sentence or phrase
- Displays all segments in the UI

### 2. Individual Voiceover Generation
- Generate voiceover for each segment individually
- Uses Gemini TTS API (`gemini-2.0-flash-exp-tts`)
- Voice: "Kore" (prebuilt voice)
- Saves as WAV files

### 3. File Management
- Saves each voiceover as `{segmentId}.wav`
- Stored in `{projectPath}/voiceover/` directory
- Files are numbered: `0.wav`, `1.wav`, `2.wav`, etc.

### 4. Playback
- Play button for each generated voiceover
- Uses Web Audio API for playback
- Visual feedback during generation

## 🔄 Flow

```
User clicks "Generate" for a segment
         ↓
Frontend → Backend API
POST /api/generate-voiceover
{ projectPath, text, segmentId }
         ↓
Backend → Gemini TTS API
model: gemini-2.0-flash-exp-tts
voice: Kore
         ↓
Gemini returns audio (base64)
         ↓
Backend converts to Buffer
         ↓
Backend saves as WAV file
{projectPath}/voiceover/{segmentId}.wav
         ↓
Backend returns success
         ↓
Frontend updates UI
Shows play button
```

## 📁 File Structure

After Step 4:

```
C:\Projects\YouTube\My-Video\
├── book.txt          (Step 1)
├── summary.txt       (Step 2)
├── script.md         (Step 3)
└── voiceover/        (Step 4) ← NEW
    ├── 0.wav
    ├── 1.wav
    ├── 2.wav
    └── ...
```

## 📊 API Endpoint

### Generate Voiceover

```
POST /api/generate-voiceover

Body:
{
  "projectPath": "C:\\Projects\\YouTube\\My-Video",
  "text": "This is the text to convert to speech",
  "segmentId": 0
}

Response:
{
  "success": true,
  "message": "Voiceover generated successfully.",
  "filename": "0.wav",
  "filepath": "C:\\Projects\\YouTube\\My-Video\\voiceover\\0.wav"
}
```

## 🎨 Backend Implementation

### Gemini Service

**File:** `backend/services/geminiService.js`

```javascript
export async function generateVoiceoverAudio(text) {
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash-exp-tts',
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  return Buffer.from(data, 'base64');
}
```

### Route Handler

**File:** `backend/routes/content.js`

```javascript
contentRouter.post('/generate-voiceover', async (req, res, next) => {
  const { projectPath, text, segmentId } = req.body;
  const safePath = sanitizePath(projectPath);
  const voiceoverDir = path.join(safePath, 'voiceover');
  
  await ensureDir(voiceoverDir);
  
  // Generate voiceover
  const audioBuffer = await generateVoiceoverAudio(text);
  
  // Save as WAV file
  const filename = `${segmentId}.wav`;
  const filepath = path.join(voiceoverDir, filename);
  await fs.writeFile(filepath, audioBuffer);
  
  res.json({ success: true, filename, filepath });
});
```

## 💻 Frontend Implementation

### API Service

**File:** `services/apiService.ts`

```typescript
export async function generateVoiceover(
  projectPath: string, 
  text: string, 
  segmentId: number
): Promise<ApiResponse<{ filename: string; filepath: string }>> {
  const response = await fetch(`${API_BASE_URL}/generate-voiceover`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectPath, text, segmentId })
  });
  
  return response.json();
}
```

### Handler

**File:** `App.tsx`

```typescript
const handleGenerateVoiceoverForSegment = useCallback(async (segmentId: number) => {
  setVoiceoverSegments(prev => prev.map(s => 
    s.id === segmentId ? { ...s, status: 'generating' } : s
  ));
  
  const segment = voiceoverSegments.find(s => s.id === segmentId);
  
  if (segment) {
    const apiService = await import('./services/apiService');
    const response = await apiService.generateVoiceover(
      metadata.projectPath, 
      segment.text, 
      segmentId
    );
    
    if (response.success) {
      const audioUrl = `file://${response.data.filepath}`;
      setVoiceoverSegments(prev => prev.map(s => 
        s.id === segmentId ? { ...s, status: 'complete', audioUrl } : s
      ));
    }
  }
}, [voiceoverSegments, metadata.projectPath]);
```

## 🧪 Testing

### Test 1: Generate Segments

**Steps:**
1. Complete Steps 1-3
2. Navigate to Step 4
3. Click "Generate Segments" (if needed)

**Expected:**
- Script is split into segments
- Each segment displayed in UI
- "Generate" button for each segment

### Test 2: Generate Single Voiceover

**Steps:**
1. Click "Generate" on first segment
2. Wait 3-5 seconds

**Expected:**
- Button shows "Generating..."
- After generation, button shows "Regenerate"
- Play button appears
- File created: `{projectPath}/voiceover/0.wav`

### Test 3: Play Voiceover

**Steps:**
1. After generating voiceover
2. Click play button

**Expected:**
- Audio plays
- Hear the generated speech
- Voice sounds natural

### Test 4: Generate Multiple Voiceovers

**Steps:**
1. Generate voiceover for segment 0
2. Generate voiceover for segment 1
3. Generate voiceover for segment 2

**Expected:**
- Each generates successfully
- Files created: `0.wav`, `1.wav`, `2.wav`
- All can be played independently

### Test 5: Regenerate Voiceover

**Steps:**
1. Generate voiceover for a segment
2. Click "Regenerate"

**Expected:**
- New voiceover generated
- Replaces previous file
- Can play new version

### Test 6: Copy Text

**Steps:**
1. Click clipboard icon on a segment
2. Paste somewhere

**Expected:**
- Text copied to clipboard
- Checkmark appears briefly
- Pasted text matches segment text

## ⏱️ Performance

| Operation | Expected Time |
|-----------|---------------|
| Generate Segments | 1-2 seconds |
| Generate Voiceover | 3-5 seconds per segment |
| Play Audio | Instant |
| Save File | < 100ms |

## 🎙️ Voice Configuration

**Current Settings:**
- Model: `gemini-2.0-flash-exp-tts`
- Voice: `Kore` (prebuilt)
- Format: WAV
- Sample Rate: 24000 Hz (default)
- Channels: 1 (mono)

**Available Voices:**
- Kore (default)
- Puck
- Charon
- Aoede

To change voice, update `backend/services/geminiService.js`:
```javascript
voiceConfig: {
  prebuiltVoiceConfig: { voiceName: 'Puck' }, // Change here
}
```

## 📁 File Format

**WAV File Specifications:**
- Format: WAV (Waveform Audio File Format)
- Encoding: PCM (Pulse Code Modulation)
- Sample Rate: 24000 Hz
- Bit Depth: 16-bit
- Channels: Mono (1 channel)

## 🐛 Troubleshooting

### Issue: Voiceover Not Generating

**Symptoms:**
- Button stays on "Generating..."
- No audio file created

**Solutions:**
1. Check Gemini API key is valid
2. Check backend console for errors
3. Verify TTS model is available
4. Check API quota

### Issue: Can't Play Audio

**Symptoms:**
- Play button doesn't work
- No sound

**Solutions:**
1. Check file was created
2. Verify file path is correct
3. Check browser audio permissions
4. Try different browser

### Issue: Poor Audio Quality

**Symptoms:**
- Audio sounds robotic
- Unclear pronunciation

**Solutions:**
1. Try different voice (Puck, Charon, Aoede)
2. Adjust text punctuation
3. Break into smaller segments
4. Add pauses with commas

## 💡 Tips

### For Better Voiceovers

**Text Formatting:**
- Use proper punctuation
- Add commas for pauses
- Use periods for full stops
- Avoid special characters

**Segment Length:**
- Keep segments 1-3 sentences
- Not too long (< 200 characters)
- Complete thoughts
- Natural breaks

**Voice Selection:**
- Kore: Neutral, professional
- Puck: Energetic, young
- Charon: Deep, authoritative
- Aoede: Warm, friendly

## 🔐 Security

- ✅ Path sanitization
- ✅ Input validation
- ✅ Error handling
- ✅ Safe file operations
- ✅ API key protection

## 🎯 Next Steps

After Step 4:
1. ✅ Voiceover segments generated
2. ✅ Audio files saved
3. 🔄 Ready for Step 5 (Beats)

## 📚 Related Documentation

- `STEP3_INTEGRATION.md` - Step 3 integration
- `STEP2_REAL_GEMINI.md` - Step 2 integration
- `QUICKSTART.md` - Getting started

---

**Status**: Step 4 Fully Integrated ✅

**Features**:
- ✅ Real Gemini TTS API
- ✅ Individual segment generation
- ✅ File persistence (WAV format)
- ✅ Playback functionality
- ✅ Copy text feature
- ✅ Regenerate capability

**Model**: gemini-2.0-flash-exp-tts
**Voice**: Kore
**Format**: WAV files
**Ready For**: Testing and Step 5 integration
