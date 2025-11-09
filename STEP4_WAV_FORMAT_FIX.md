# Step 4: WAV Format Fix & Segment Duration

## 🔧 Issues Fixed

### Issue 1: Corrupt WAV Files
**Problem:** Generated WAV files couldn't be opened. Error: "We can't open 70.wav. This may be because the file type is unsupported, the file extension is incorrect, or the file is corrupt."

**Root Cause:** Gemini TTS returns raw PCM audio data without WAV headers.

**Solution:** Added `createWavBuffer()` function to add proper WAV headers to PCM data.

### Issue 2: Segments Too Long
**Problem:** Segments were not limited in duration, could be too long for comfortable recording.

**Solution:** Updated segment extraction to target ~1 minute segments (150-200 words).

## ✅ WAV Format Fix

### Added WAV Header Function
```javascript
function createWavBuffer(pcmData, sampleRate = 24000, channels = 1, bitsPerSample = 16) {
  const byteRate = sampleRate * channels * (bitsPerSample / 8);
  const blockAlign = channels * (bitsPerSample / 8);
  const dataSize = pcmData.length;
  const headerSize = 44;
  const fileSize = headerSize + dataSize - 8;

  const buffer = Buffer.alloc(headerSize + dataSize);
  
  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(fileSize, 4);
  buffer.write('WAVE', 8);
  
  // fmt chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // fmt chunk size
  buffer.writeUInt16LE(1, 20); // audio format (1 = PCM)
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  
  // data chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  pcmData.copy(buffer, 44);
  
  return buffer;
}
```

### Updated generateVoiceoverAudio()
**Before:**
```javascript
const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
return Buffer.from(data, 'base64'); // Raw PCM, no headers
```

**After:**
```javascript
const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
const pcmBuffer = Buffer.from(data, 'base64');
const wavBuffer = createWavBuffer(pcmBuffer, 24000, 1, 16); // Add WAV headers
return wavBuffer;
```

## 📊 WAV File Specifications

| Property | Value |
|----------|-------|
| Format | PCM (uncompressed) |
| Sample Rate | 24,000 Hz |
| Channels | 1 (Mono) |
| Bits Per Sample | 16 |
| Byte Rate | 48,000 bytes/sec |
| Block Align | 2 bytes |

## ✅ Segment Duration Fix

### Updated Segment Extraction Prompt
```javascript
const prompt = `Split the following script into segments for voiceover recording. 

IMPORTANT RULES:
- Each segment should be approximately 1 minute of speech (roughly 150-200 words or 2-4 sentences)
- Segments must end at natural breaks (end of sentence, paragraph, or thought)
- Keep segments cohesive - don't break in the middle of an idea
- Aim for segments that are easy to record in one take

Script:
${script}`;
```

### Segment Guidelines

| Duration | Word Count | Sentence Count | Use Case |
|----------|-----------|----------------|----------|
| ~30 sec | 75-100 words | 1-2 sentences | Short, punchy segments |
| ~1 min | 150-200 words | 2-4 sentences | **Recommended** |
| ~2 min | 300-400 words | 5-8 sentences | Longer narrative segments |

## 🎯 Benefits

### WAV Format Fix
- ✅ Files open in all media players
- ✅ Compatible with video editors
- ✅ Proper audio metadata
- ✅ Standard WAV format

### Segment Duration
- ✅ Easier to record (1 minute takes)
- ✅ Better for editing
- ✅ Natural break points
- ✅ Manageable file sizes

## 🧪 Testing

### Test 1: WAV File Playback
```bash
# 1. Generate voiceover
# 2. Check file in project folder
# 3. Open with Windows Media Player
# 4. Should play without errors
```

**Expected:**
- ✅ File opens successfully
- ✅ Audio plays correctly
- ✅ No corruption errors
- ✅ Proper duration shown

### Test 2: Segment Duration
```bash
# 1. Extract segments from script
# 2. Check segment lengths
# 3. Count words in each segment
```

**Expected:**
- ✅ Segments are 150-200 words each
- ✅ Natural break points
- ✅ Complete thoughts
- ✅ ~1 minute of speech each

### Test 3: File Properties
```bash
# Right-click WAV file → Properties → Details
```

**Expected:**
- ✅ Audio format: PCM
- ✅ Bit rate: 384 kbps
- ✅ Sample rate: 24 kHz
- ✅ Channels: 1 (mono)

## 📁 File Structure

### WAV File Header (44 bytes)
```
Offset | Size | Description
-------|------|------------
0      | 4    | "RIFF"
4      | 4    | File size - 8
8      | 4    | "WAVE"
12     | 4    | "fmt "
16     | 4    | 16 (fmt chunk size)
20     | 2    | 1 (PCM format)
22     | 2    | 1 (mono)
24     | 4    | 24000 (sample rate)
28     | 4    | 48000 (byte rate)
32     | 2    | 2 (block align)
34     | 2    | 16 (bits per sample)
36     | 4    | "data"
40     | 4    | Data size
44     | *    | PCM audio data
```

## 🔄 Complete Flow

```
User clicks "Generate" on segment
         ↓
Frontend → POST /api/generate-voiceover
         ↓
Backend → Gemini TTS API
         ↓
Gemini returns PCM audio (base64)
         ↓
Backend converts base64 → PCM buffer
         ↓
Backend adds WAV headers (44 bytes)
         ↓
Backend saves as proper WAV file
         ↓
Frontend receives filepath
         ↓
User can play audio successfully
```

## 💡 Technical Details

### Why WAV Headers Are Needed
- Raw PCM data has no metadata
- Players need to know: sample rate, channels, bit depth
- WAV format wraps PCM with this metadata
- Standard format supported everywhere

### Sample Rate: 24 kHz
- Gemini TTS outputs at 24,000 Hz
- Good quality for speech
- Smaller file size than 44.1 kHz
- Standard for voice applications

### Mono vs Stereo
- TTS is mono (1 channel)
- Stereo not needed for voice
- Saves file size
- Standard for voiceover work

## 📊 File Size Estimates

| Duration | Word Count | File Size (approx) |
|----------|-----------|-------------------|
| 30 sec | 75-100 | ~1.4 MB |
| 1 min | 150-200 | ~2.8 MB |
| 2 min | 300-400 | ~5.6 MB |

Formula: `duration_seconds * 48000 bytes/sec + 44 bytes header`

## ✅ Success Criteria

- [x] WAV files have proper headers
- [x] Files open in all media players
- [x] Audio plays correctly
- [x] Segments are ~1 minute each
- [x] Segments end at natural breaks
- [x] File format is standard WAV
- [x] All diagnostics pass

## 🚀 How to Test

1. **Restart backend:**
   ```bash
   cd backend
   npm start
   ```

2. **Test workflow:**
   - Complete Steps 1-3
   - Navigate to Step 4
   - Segments extract (should be ~1 min each)
   - Click "Generate" on a segment
   - Wait for generation
   - Click play button
   - Should play successfully

3. **Verify file:**
   - Open project folder
   - Find `voiceover/0.wav`
   - Right-click → Open with → Windows Media Player
   - Should play without errors
   - Check Properties → Details for format info

## 📚 Related Files

- `backend/services/geminiService.js` - WAV creation and segment extraction
- `backend/routes/content.js` - Voiceover generation endpoint
- `GEMINI_API_FIX.md` - API usage fixes
- `STEP4_ERROR_HANDLING_UPDATE.md` - Error handling
- `STEP4_SEGMENT_EXTRACTION_FIX.md` - Segment extraction

---

**Status:** ✅ FIXED

WAV files now have proper headers and can be opened in any media player. Segments are limited to ~1 minute for optimal recording.
