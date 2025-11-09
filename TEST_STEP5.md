# Step 5: Beat Generation - Testing Guide

## Prerequisites
- ✅ Step 1 completed (Project created with book.txt)
- ✅ Step 2 completed (Summary generated)
- ✅ Step 3 completed (Script generated with full script)
- ✅ Backend server running on port 3001
- ✅ Gemini API key configured in `.env`

## Test Cases

### Test 1: Generate Beats from Script
**Objective:** Verify beats are generated from the script

**Steps:**
1. Complete Steps 1-3 to have a script ready
2. Navigate to Step 5 (Beats)
3. Click "Generate Beats" button
4. Wait for generation (5-10 seconds)

**Expected Results:**
- ✅ Loading indicator appears
- ✅ Beats table populates with data
- ✅ Each beat has a beat_number (e.g., "Beat 1")
- ✅ Each beat has a script_phrase
- ✅ Beats are logically segmented from the script
- ✅ Files created:
  - `{projectPath}/beats.json`
  - `{projectPath}/beats.md`

### Test 2: Verify Beat Structure
**Objective:** Ensure beats follow correct format

**Steps:**
1. After generating beats, inspect the table
2. Check the beats.json file in project folder

**Expected Results:**
- ✅ Beat numbers are sequential (Beat 1, Beat 2, etc.)
- ✅ Script phrases are complete sentences/paragraphs
- ✅ No empty or null values
- ✅ JSON structure matches schema:
```json
[
  {
    "beat_number": "Beat 1",
    "script_phrase": "..."
  }
]
```

### Test 3: Refine Beats via Chat
**Objective:** Test beat refinement functionality

**Steps:**
1. After generating beats, scroll to chat section
2. Enter instruction: "Make beat 2 more dramatic"
3. Click send
4. Wait for refinement

**Expected Results:**
- ✅ Chat loading indicator appears
- ✅ Beats table updates with refined content
- ✅ Beat 2 has more dramatic language
- ✅ Other beats remain unchanged (or appropriately adjusted)
- ✅ Updated beats saved to files

### Test 4: Multiple Refinements
**Objective:** Test iterative refinement

**Steps:**
1. Generate beats
2. Refine with: "Make all beats shorter"
3. Wait for update
4. Refine again with: "Add more emotion to beat 1"
5. Wait for update

**Expected Results:**
- ✅ Each refinement updates the beats
- ✅ Changes are cumulative
- ✅ Files are updated after each refinement
- ✅ No data loss between refinements

### Test 5: File Persistence
**Objective:** Verify beats are saved correctly

**Steps:**
1. Generate beats
2. Navigate to project folder
3. Open `beats.json` and `beats.md`

**Expected Results:**
- ✅ `beats.json` contains valid JSON array
- ✅ `beats.md` has markdown headers for each beat
- ✅ Content matches what's displayed in UI
- ✅ Files are properly formatted

**beats.md format:**
```markdown
## Beat 1
Script phrase for beat 1...

## Beat 2
Script phrase for beat 2...
```

### Test 6: Error Handling - No Script
**Objective:** Test error handling when script is missing

**Steps:**
1. Create a new project
2. Skip to Step 5 without generating script
3. Try to generate beats

**Expected Results:**
- ✅ Error message displayed
- ✅ User-friendly error (not technical stack trace)
- ✅ Suggests completing Step 3 first
- ✅ No crash or blank screen

### Test 7: Error Handling - API Failure
**Objective:** Test handling of Gemini API errors

**Steps:**
1. Temporarily set invalid API key in `.env`
2. Restart backend
3. Try to generate beats

**Expected Results:**
- ✅ Error message displayed
- ✅ Indicates API issue
- ✅ Loading state clears
- ✅ Can retry after fixing API key

### Test 8: Navigation After Generation
**Objective:** Verify state persistence

**Steps:**
1. Generate beats in Step 5
2. Navigate to Step 4 (Voiceover)
3. Navigate back to Step 5

**Expected Results:**
- ✅ Beats are still displayed
- ✅ No need to regenerate
- ✅ Can still refine beats
- ✅ State persisted in localStorage

### Test 9: Regenerate Beats
**Objective:** Test regeneration functionality

**Steps:**
1. Generate beats
2. Note the current beats
3. Click "Regenerate" button
4. Wait for new generation

**Expected Results:**
- ✅ New beats generated
- ✅ May be different from first generation
- ✅ Files overwritten with new content
- ✅ UI updates with new beats

### Test 10: Beat Count Validation
**Objective:** Ensure appropriate number of beats

**Steps:**
1. Generate beats from a short script (2-3 paragraphs)
2. Generate beats from a long script (10+ paragraphs)

**Expected Results:**
- ✅ Short script: 2-5 beats
- ✅ Long script: 8-15 beats
- ✅ Beats are meaningful segments
- ✅ Not too granular or too broad

### Test 11: Special Characters in Beats
**Objective:** Test handling of special characters

**Steps:**
1. Generate beats from script with quotes, apostrophes, etc.
2. Check JSON and markdown files

**Expected Results:**
- ✅ Special characters properly escaped in JSON
- ✅ Markdown renders correctly
- ✅ No parsing errors
- ✅ UI displays characters correctly

### Test 12: Long Script Phrases
**Objective:** Test handling of lengthy beat phrases

**Steps:**
1. Generate beats from script with long paragraphs
2. Check UI display

**Expected Results:**
- ✅ Long phrases wrap properly in table
- ✅ No horizontal scrolling
- ✅ Readable formatting
- ✅ Complete content visible

## Performance Benchmarks

- **Generation Time:** 5-10 seconds for typical script
- **Refinement Time:** 3-5 seconds
- **File Size:** beats.json typically < 10KB

## Common Issues & Solutions

### Issue: "Failed to generate beats"
**Solution:** 
- Check script.md exists in project folder
- Verify Gemini API key is valid
- Check backend logs for detailed error

### Issue: Beats are too granular
**Solution:**
- Use chat refinement: "Combine beats into larger segments"
- Regenerate with different script structure

### Issue: Beats are too broad
**Solution:**
- Use chat refinement: "Break down beats into more detailed segments"
- Ensure script has clear paragraph breaks

## Success Criteria

✅ All 12 test cases pass
✅ Beats are logically segmented
✅ Files are created and properly formatted
✅ Refinement works smoothly
✅ Error handling is user-friendly
✅ State persists across navigation

## Next Steps After Testing

Once Step 5 is verified:
1. Proceed to Step 6 (Storyboard Generation)
2. Beats will be used as input for visual planning
3. Each beat will get corresponding visual prompts
