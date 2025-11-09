# Step 6: Storyboard Generation - Testing Guide

## Prerequisites
- ✅ Steps 1-5 completed (need beats.json)
- ✅ Backend server running on port 3001
- ✅ Gemini API key configured in `.env`

## Quick Test

```
1. Complete Steps 1-5 (generate beats)
2. Navigate to Step 6
3. Click "Generate illustration Storyboard"
4. Wait 10-15 seconds
5. Review storyboard table
6. Switch to "clear" tab
7. Click "Generate clear Storyboard"
8. Switch to "consistent" tab
9. Click "Generate consistent Storyboard"
10. Verify files in storyboards/ folder
```

## Test Cases

### Test 1: Generate Illustration Storyboard
**Objective:** Verify illustration style storyboard generation

**Steps:**
1. Complete Steps 1-5
2. Navigate to Step 6
3. Ensure "illustration" tab is active
4. Click "Generate illustration Storyboard"
5. Wait for generation

**Expected Results:**
- ✅ Loading indicator appears
- ✅ Generation takes 10-15 seconds
- ✅ Storyboard table populates
- ✅ Each row has all 8 columns filled
- ✅ AI prompts mention "illustration" or "artistic" style
- ✅ Files created:
  - `storyboards/illustration.json`
  - `storyboards/illustration.md`

### Test 2: Generate Clear Storyboard
**Objective:** Verify clear style storyboard generation

**Steps:**
1. After Test 1, switch to "clear" tab
2. Click "Generate clear Storyboard"
3. Wait for generation

**Expected Results:**
- ✅ Clear style storyboard generated
- ✅ AI prompts mention "clean" or "minimalist"
- ✅ Different from illustration style
- ✅ Files created:
  - `storyboards/clear.json`
  - `storyboards/clear.md`

### Test 3: Generate Consistent Storyboard
**Objective:** Verify consistent style storyboard generation

**Steps:**
1. After Test 2, switch to "consistent" tab
2. Click "Generate consistent Storyboard"
3. Wait for generation

**Expected Results:**
- ✅ Consistent style storyboard generated
- ✅ AI prompts mention "consistent" or "uniform"
- ✅ Different from other styles
- ✅ Files created:
  - `storyboards/consistent.json`
  - `storyboards/consistent.md`

### Test 4: Verify Storyboard Structure
**Objective:** Ensure storyboard follows correct format

**Steps:**
1. After generating all styles
2. Inspect table data
3. Check JSON files

**Expected Results:**
- ✅ shot_number is sequential (1, 2, 3...)
- ✅ beat_number matches beats from Step 5
- ✅ script_phrase matches beat text
- ✅ transition_type is valid (Cut, Fade, Dissolve, etc.)
- ✅ ai_prompt is detailed and style-specific
- ✅ text_overlay is present or "None"
- ✅ kinetic_text is present or "None"
- ✅ sfx is present or "None"

### Test 5: Verify File Contents
**Objective:** Check saved files are correct

**Steps:**
1. Navigate to project folder
2. Open `storyboards/` directory
3. Check JSON files
4. Check Markdown files

**Expected Results:**
- ✅ 6 files total (3 JSON + 3 Markdown)
- ✅ JSON files are valid JSON
- ✅ JSON structure matches schema
- ✅ Markdown files are readable
- ✅ Content matches UI display

### Test 6: Tab Switching
**Objective:** Test UI tab functionality

**Steps:**
1. Generate all three styles
2. Click between tabs
3. Verify content switches

**Expected Results:**
- ✅ Tabs switch smoothly
- ✅ Correct storyboard displayed for each tab
- ✅ Active tab highlighted
- ✅ No data loss when switching

### Test 7: Regenerate Storyboard
**Objective:** Test regeneration capability

**Steps:**
1. Generate illustration storyboard
2. Note the AI prompts
3. Click "Generate illustration Storyboard" again
4. Compare new prompts

**Expected Results:**
- ✅ New storyboard generated
- ✅ May have different prompts (AI variation)
- ✅ Files overwritten
- ✅ UI updates with new data

### Test 8: Error Handling - No Beats
**Objective:** Test error when beats missing

**Steps:**
1. Create new project
2. Skip to Step 6 without generating beats
3. Try to generate storyboard

**Expected Results:**
- ✅ Error message displayed
- ✅ User-friendly error (not technical)
- ✅ Suggests completing Step 5 first
- ✅ No crash

### Test 9: Error Handling - API Failure
**Objective:** Test handling of Gemini API errors

**Steps:**
1. Temporarily set invalid API key
2. Restart backend
3. Try to generate storyboard

**Expected Results:**
- ✅ Error message displayed
- ✅ Indicates API issue
- ✅ Loading state clears
- ✅ Can retry after fixing

### Test 10: Style Differences
**Objective:** Verify styles are actually different

**Steps:**
1. Generate all three styles
2. Compare AI prompts across styles
3. Look for style-specific keywords

**Expected Results:**
- ✅ Illustration: "artistic", "vibrant", "hand-drawn"
- ✅ Clear: "clean", "minimalist", "simple"
- ✅ Consistent: "consistent", "uniform", "professional"
- ✅ Prompts are meaningfully different

### Test 11: Shot Count Validation
**Objective:** Ensure shot count matches beats

**Steps:**
1. Count beats in Step 5
2. Generate storyboard
3. Count shots in storyboard

**Expected Results:**
- ✅ Shot count ≥ beat count
- ✅ Each beat has at least one shot
- ✅ Some beats may have multiple shots
- ✅ Sequential shot numbering

### Test 12: Transition Types
**Objective:** Verify transition variety

**Steps:**
1. Generate storyboard
2. Review transition_type column
3. Check for variety

**Expected Results:**
- ✅ Multiple transition types used
- ✅ Common types: Cut, Fade, Dissolve
- ✅ Transitions make sense for content
- ✅ Not all the same transition

### Test 13: Text Overlays
**Objective:** Check text overlay usage

**Steps:**
1. Generate storyboard
2. Review text_overlay column
3. Check for appropriate usage

**Expected Results:**
- ✅ Some shots have text overlays
- ✅ Some shots have "None"
- ✅ Text is relevant to content
- ✅ Not overused

### Test 14: Sound Effects
**Objective:** Verify SFX suggestions

**Steps:**
1. Generate storyboard
2. Review sfx column
3. Check for variety

**Expected Results:**
- ✅ Appropriate SFX suggested
- ✅ Some shots have "None"
- ✅ SFX match scene content
- ✅ File names with extensions (.mp3, .wav)

### Test 15: State Persistence
**Objective:** Verify storyboards persist

**Steps:**
1. Generate all three storyboards
2. Navigate to Step 5
3. Navigate back to Step 6

**Expected Results:**
- ✅ All storyboards still displayed
- ✅ No need to regenerate
- ✅ Can switch between tabs
- ✅ State persisted in localStorage

## Performance Benchmarks

- **Generation Time:** 10-15 seconds per style
- **File Size:** 5-10KB per storyboard
- **Shot Count:** Typically 5-15 shots per storyboard

## Common Issues & Solutions

### Issue: "Failed to generate storyboard"
**Solution:** 
- Check beats.json exists
- Verify Gemini API key is valid
- Check backend logs for detailed error

### Issue: AI prompts too generic
**Solution:**
- Regenerate storyboard
- Gemini may produce better prompts on retry
- Consider refining beats in Step 5

### Issue: Missing style characteristics
**Solution:**
- Check style descriptions in backend
- Regenerate to get style-specific prompts
- Verify correct style parameter sent

## Success Criteria

✅ All 15 test cases pass
✅ Three distinct styles generated
✅ Files saved correctly
✅ UI displays all data
✅ Error handling works
✅ State persists
✅ Performance acceptable

## Next Steps After Testing

Once Step 6 is verified:
1. Proceed to Step 7 (Prompt Extraction)
2. Prompts will be extracted from storyboards
3. Used for image generation in Step 8

---

**Test Status:** Ready for manual testing
**Prerequisites:** Steps 1-5 complete
**Estimated Test Time:** 15-20 minutes
