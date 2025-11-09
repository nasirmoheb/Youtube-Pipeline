# Testing Step 4 - Voiceover Generation

## Important Note

**TTS Model:** This implementation uses `gemini-2.5-flash-preview-tts` model with the "Kore" voice for natural-sounding audio generation.

## Prerequisites

- ✅ Valid Gemini API key in `.env`
- ✅ Backend server running
- ✅ Frontend server running
- ✅ Steps 1-3 completed

## Quick Test

```
1. Complete Steps 1-3 (generate script)
2. Navigate to Step 4
3. Segments appear automatically
4. Click "Generate" on first segment
5. Wait 3-5 seconds
6. Play button appears
7. Click play to hear voiceover
8. Verify file: {projectPath}/voiceover/0.wav
```

## Detailed Test Cases

### ✅ Test 1: Segment Generation

**Steps:**
1. Complete Step 3 (full script)
2. Navigate to Step 4

**Expected:**
- Script automatically split into segments
- Each segment displayed in a card
- "Generate" button for each segment
- Copy button for each segment

### ✅ Test 2: Generate First Voiceover

**Steps:**
1. Click "Generate" on segment 0
2. Wait 3-5 seconds

**Expected:**
- Button changes to "Generating..."
- Button is disabled during generation
- After 3-5 seconds, button changes to "Regenerate"
- Play button (green) appears
- File created: `{projectPath}/voiceover/0.wav`

**Verify File:**
```bash
# Windows
dir C:\Projects\YouTube\My-Video\voiceover\
dir C:\Projects\YouTube\My-Video\voiceover\0.wav

# Linux/Mac
ls /path/to/project/voiceover/
ls /path/to/project/voiceover/0.wav
```

### ✅ Test 3: Play Voiceover

**Steps:**
1. After generating voiceover
2. Click play button (green circle)

**Expected:**
- Audio plays through speakers
- Hear the text spoken
- Voice sounds natural (Kore voice)
- Audio quality is clear

### ✅ Test 4: Generate Multiple Voiceovers

**Steps:**
1. Generate voiceover for segment 0
2. Generate voiceover for segment 1
3. Generate voiceover for segment 2

**Expected:**
- Each generates independently
- Files created: `0.wav`, `1.wav`, `2.wav`
- Each can be played separately
- No interference between generations

### ✅ Test 5: Regenerate Voiceover

**Steps:**
1. Generate voiceover for segment 0
2. Click "Regenerate"
3. Wait 3-5 seconds

**Expected:**
- New voiceover generated
- File `0.wav` is replaced
- Can play new version
- Different from original (slight variations)

### ✅ Test 6: Copy Segment Text

**Steps:**
1. Click clipboard icon on a segment
2. Paste in notepad

**Expected:**
- Text copied to clipboard
- Checkmark appears briefly (2 seconds)
- Pasted text matches segment text exactly

### ✅ Test 7: Generate All Voiceovers

**Steps:**
1. Generate voiceover for all segments (one by one)

**Expected:**
- All segments have play buttons
- All files created in voiceover folder
- Can play each one
- Total files = number of segments

### ✅ Test 8: File Persistence

**Steps:**
1. Generate voiceovers
2. Navigate to project folder
3. Open voiceover directory

**Expected:**
- Directory exists: `voiceover/`
- Files exist: `0.wav`, `1.wav`, etc.
- Files are playable in media player
- Files have audio content

**Verify:**
```bash
# Windows
dir C:\Projects\YouTube\My-Video\voiceover\
# Play in Windows Media Player
start C:\Projects\YouTube\My-Video\voiceover\0.wav

# Linux/Mac
ls /path/to/project/voiceover/
# Play with default player
open /path/to/project/voiceover/0.wav
```

### ✅ Test 9: Error Handling

**Test A: Backend Down**
1. Stop backend server
2. Try to generate voiceover
3. **Expected:** Error logged, status returns to "pending"

**Test B: Invalid Text**
1. Manually edit segment text to be empty
2. Try to generate
3. **Expected:** Error handled gracefully

### ✅ Test 10: Long Segment

**Steps:**
1. Find a long segment (> 200 characters)
2. Generate voiceover

**Expected:**
- Takes longer (5-10 seconds)
- Still generates successfully
- Audio is complete
- No truncation

### ✅ Test 11: Special Characters

**Steps:**
1. Find segment with special characters (quotes, apostrophes)
2. Generate voiceover

**Expected:**
- Generates successfully
- Special characters handled correctly
- Pronunciation is natural

### ✅ Test 12: Multiple Simultaneous Generations

**Steps:**
1. Click "Generate" on segment 0
2. Immediately click "Generate" on segment 1
3. Immediately click "Generate" on segment 2

**Expected:**
- All three show "Generating..."
- All three complete successfully
- No conflicts or errors
- All files created correctly

## Performance Benchmarks

| Segment Length | Expected Time | Actual Time |
|----------------|---------------|-------------|
| Short (< 50 chars) | 2-3 seconds | _____ |
| Medium (50-150 chars) | 3-5 seconds | _____ |
| Long (> 150 chars) | 5-10 seconds | _____ |

## Quality Checklist

For each generated voiceover:
- [ ] Audio is clear
- [ ] Voice sounds natural
- [ ] Pronunciation is correct
- [ ] Pacing is appropriate
- [ ] No robotic sound
- [ ] No glitches or artifacts
- [ ] Volume is consistent

## Common Issues

### Issue 1: "No audio data returned"

**Cause:** Gemini TTS API error

**Solutions:**
1. Check API key is valid
2. Verify TTS model is available
3. Check API quota
4. Try again after a moment

### Issue 2: File Not Created

**Cause:** Path or permission error

**Solutions:**
1. Check backend console for errors
2. Verify project path is correct
3. Check write permissions
4. Ensure voiceover directory exists

### Issue 3: Can't Play Audio

**Cause:** File format or browser issue

**Solutions:**
1. Check file exists and has content
2. Try playing file directly in media player
3. Check browser audio permissions
4. Try different browser

### Issue 4: Poor Audio Quality

**Cause:** Voice or text formatting

**Solutions:**
1. Try different voice (Puck, Charon, Aoede)
2. Improve text punctuation
3. Break into smaller segments
4. Remove special characters

## Error Handling Tests

### ✅ Test 13: Invalid API Key Error

**Steps:**
1. Set invalid API key in `.env`
2. Restart backend server
3. Try to generate voiceover

**Expected Results:**
- ✅ Error message displayed below segment
- ✅ Red error box with clear message
- ✅ Button changes to red "Retry"
- ✅ Error message: "API key does not have access to TTS..."
- ✅ No crash or blank screen

### ✅ Test 14: Network Error Handling

**Steps:**
1. Disconnect internet
2. Try to generate voiceover
3. Wait for timeout

**Expected Results:**
- ✅ Error message displayed
- ✅ "Network error. Please check your connection..."
- ✅ Can retry after reconnecting
- ✅ UI remains responsive

### ✅ Test 15: Retry After Error

**Steps:**
1. Cause an error (invalid API key)
2. See error message
3. Fix the issue (correct API key)
4. Restart backend
5. Click "Retry" button

**Expected Results:**
- ✅ Generation starts again
- ✅ Error message clears
- ✅ Status changes to "generating"
- ✅ Success on retry
- ✅ Audio plays correctly

### ✅ Test 16: Multiple Segment Errors

**Steps:**
1. Set invalid API key
2. Try to generate multiple segments
3. All should fail with errors

**Expected Results:**
- ✅ Each segment shows its own error
- ✅ All have red "Retry" buttons
- ✅ Can retry each individually
- ✅ Errors don't affect other segments

### ✅ Test 17: Error Message Clarity

**Steps:**
1. Trigger different error types
2. Read error messages

**Expected Results:**
- ✅ Messages are user-friendly (not technical)
- ✅ Messages suggest solutions
- ✅ No stack traces shown to user
- ✅ Clear indication of what went wrong

## Success Criteria

All tests should pass with:
- ✅ Segments generated correctly
- ✅ Voiceovers generate successfully
- ✅ Files saved to correct location
- ✅ Audio is playable
- ✅ Quality is acceptable
- ✅ No errors in console
- ✅ Performance is good

## File Verification

After testing, verify:

```
C:\Projects\YouTube\My-Video\voiceover\
├── 0.wav  ✅ First segment
├── 1.wav  ✅ Second segment
├── 2.wav  ✅ Third segment
└── ...    ✅ Additional segments
```

Each file should:
- Be playable in media player
- Have audio content (not silent)
- Match the segment text
- Be clear and natural

## Next Steps

After Step 4:
1. ✅ Voiceovers generated
2. ✅ Files saved
3. 🔄 Ready for Step 5 (Beats)

---

**Testing Status**: Ready for Testing ✅

**Test Coverage**: 12 test cases

**Expected Duration**: 20-30 minutes

**Critical Tests**: 2, 3, 4, 8 (must pass)
