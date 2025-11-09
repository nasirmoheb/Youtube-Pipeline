# Testing Step 3 - Scripting with Real Gemini API

## Prerequisites

- ✅ Valid Gemini API key in `.env`
- ✅ Backend server running
- ✅ Frontend server running
- ✅ Steps 1 and 2 completed

## Quick Test

### Complete Workflow Test

```
1. Complete Step 1 (upload book)
2. Complete Step 2 (generate summary)
3. Navigate to Step 3
4. Generate Hooks → Select one
5. Generate Outline → Review
6. Generate Full Script → Verify saved
7. Check file: script.md
```

## Detailed Test Cases

### ✅ Test 1: Generate Hooks

**Steps:**
1. Navigate to Step 3
2. Click "Generate Hooks" button

**Expected:**
- Loading indicator appears
- After 3-5 seconds, 3 hooks appear
- Each hook is displayed as a clickable button
- Hooks are relevant to book content
- Hooks are engaging and different from each other

**Verify Quality:**
```
Hook 1: ___________________________
Hook 2: ___________________________
Hook 3: ___________________________

Quality Check:
[ ] Mentions book themes
[ ] Attention-grabbing
[ ] Appropriate length (1-2 sentences)
[ ] Well-written
[ ] Different from each other
```

### ✅ Test 2: Select Hook

**Steps:**
1. After hooks generate
2. Click on the first hook

**Expected:**
- Selected hook highlights (blue background with ring)
- Other hooks remain gray
- Outline section appears below
- "Generate Outline" option becomes available

**Verify:**
```
[ ] Hook highlights correctly
[ ] Only one hook selected at a time
[ ] Outline section visible
[ ] Can change selection
```

### ✅ Test 3: Refine Hooks

**Steps:**
1. After hooks generate
2. Type in chat: "Make them more dramatic"
3. Click "Send"

**Expected:**
- Loading indicator appears
- After 3-5 seconds, hooks update
- New hooks are more dramatic
- Previous selection cleared
- Can select new hook

### ✅ Test 4: Generate Outline

**Steps:**
1. After selecting a hook
2. Click "Generate Outline"

**Expected:**
- Loading indicator appears
- After 5-10 seconds, outline appears
- Outline is in Markdown format
- Outline has clear structure:
  - Introduction
  - Body sections
  - Conclusion
- Outline references selected hook
- Outline is 200-400 words

**Verify Structure:**
```
[ ] Has introduction section
[ ] Has body sections (2-3)
[ ] Has conclusion section
[ ] Mentions selected hook
[ ] Logical flow
[ ] Appropriate length
```

### ✅ Test 5: Refine Outline

**Steps:**
1. After outline generates
2. Type: "Add more details about the climax"
3. Click "Send"

**Expected:**
- Loading indicator appears
- After 5-10 seconds, outline updates
- Climax section has more details
- Other sections preserved
- Still well-structured

### ✅ Test 6: Generate Full Script

**Steps:**
1. After outline is ready
2. Click "Generate Full Script"

**Expected:**
- Loading indicator appears
- After 10-15 seconds, script appears
- Script is complete narration
- Script follows outline structure
- Script includes hook in intro
- Script is 500-1000 words
- File `script.md` created in project folder

**Verify Quality:**
```
[ ] Complete narration (not outline)
[ ] Professional writing quality
[ ] Follows outline structure
[ ] Includes hook
[ ] Has intro, body, conclusion
[ ] Engaging content
[ ] Appropriate length
[ ] File created: script.md
```

### ✅ Test 7: Refine Full Script

**Steps:**
1. After script generates
2. Type: "Make the intro more engaging"
3. Click "Send"

**Expected:**
- Loading indicator appears
- After 5-10 seconds, script updates
- Intro is more engaging
- Rest of script preserved
- File `script.md` updated

### ✅ Test 8: File Persistence

**Steps:**
1. Generate full script
2. Navigate to project folder
3. Open `script.md`

**Expected:**
- File exists
- File contains complete script
- File is readable
- File is in Markdown format
- Content matches displayed script

**Verify File:**
```bash
# Windows
dir C:\Projects\YouTube\My-Video\
type C:\Projects\YouTube\My-Video\script.md

# Linux/Mac
ls /path/to/project/
cat /path/to/project/script.md
```

### ✅ Test 9: Multiple Refinements

**Steps:**
1. Generate script
2. Refine: "Make it shorter"
3. Refine: "Add more emotion"
4. Refine: "Improve the conclusion"

**Expected:**
- Each refinement builds on previous
- Script evolves appropriately
- Quality improves
- File updates each time

### ✅ Test 10: Regenerate at Each Stage

**Test A: Regenerate Hooks**
1. Generate hooks
2. Click "Regenerate"
3. **Expected:** New set of 3 hooks

**Test B: Regenerate Outline**
1. Generate outline
2. Click "Regenerate"
3. **Expected:** New outline structure

**Test C: Regenerate Script**
1. Generate script
2. Click "Regenerate"
3. **Expected:** New complete script

### ✅ Test 11: Navigation Persistence

**Steps:**
1. Generate hooks, outline, and script
2. Click "Back" to Step 2
3. Click "Next" to return to Step 3

**Expected:**
- All generated content preserved
- Selected hook still selected
- Outline still visible
- Script still visible
- No need to regenerate

### ✅ Test 12: Different Book Types

**Test with different content:**

**Fiction:**
- Generate hooks for novel
- Verify: Character-focused, plot-driven

**Non-Fiction:**
- Generate hooks for educational content
- Verify: Concept-focused, informative

**Biography:**
- Generate hooks for life story
- Verify: Person-focused, chronological

## Performance Benchmarks

| Operation | Target Time | Actual Time |
|-----------|-------------|-------------|
| Generate Hooks | 3-5s | _____ |
| Generate Outline | 5-10s | _____ |
| Generate Script | 10-15s | _____ |
| Refine Content | 5-10s | _____ |
| Save to File | < 100ms | _____ |

## Quality Checklist

### Hooks Quality
- [ ] Relevant to book content
- [ ] Attention-grabbing
- [ ] Appropriate length
- [ ] Well-written
- [ ] Different from each other

### Outline Quality
- [ ] Clear structure
- [ ] Logical flow
- [ ] Includes key points
- [ ] References hook
- [ ] Appropriate length

### Script Quality
- [ ] Complete narration
- [ ] Professional writing
- [ ] Follows outline
- [ ] Engaging content
- [ ] Appropriate length
- [ ] Has intro, body, conclusion
- [ ] Includes hook
- [ ] Ready for voiceover

## Common Issues

### Issue 1: Hooks Not Generating

**Symptoms:**
- Loading spinner never completes
- No hooks appear

**Solutions:**
1. Check Gemini API key
2. Check browser console for errors
3. Verify Step 2 summary exists
4. Try refreshing page

### Issue 2: Poor Quality Hooks

**Symptoms:**
- Hooks are generic
- Don't match book content

**Solutions:**
1. Check Step 2 summary quality
2. Try regenerating
3. Use refinement
4. Ensure book content was complete

### Issue 3: Outline Too Short/Long

**Symptoms:**
- Outline is too brief or too detailed

**Solutions:**
1. Use refinement: "Make it longer" or "Make it shorter"
2. Regenerate for different version
3. Provide specific instructions

### Issue 4: Script Not Saved

**Symptoms:**
- Script displays but file not created

**Solutions:**
1. Check backend is running
2. Check backend console for errors
3. Verify project path
4. Check file permissions

### Issue 5: Script Doesn't Follow Outline

**Symptoms:**
- Script structure differs from outline

**Solutions:**
1. Regenerate script
2. Use refinement: "Follow the outline more closely"
3. Check outline quality first

## Success Criteria

All tests should pass with:
- ✅ Hooks generate successfully
- ✅ Outline generates successfully
- ✅ Script generates successfully
- ✅ All content is high quality
- ✅ File saved correctly
- ✅ Refinement works
- ✅ Navigation preserves state
- ✅ Performance is acceptable

## Example Test Results

### Sample Hooks (The Great Gatsby)
```
1. "What if the American Dream was actually a nightmare? 
   Discover the dark truth behind Gatsby's glittering parties."

2. "One man's obsession. One woman's choice. One summer 
   that changed everything."

3. "Behind every fortune lies a secret. Behind every 
   secret lies a tragedy."
```

### Sample Outline Structure
```markdown
# Video Outline

## Introduction (0:00-0:30)
- Hook
- Brief intro
- Set the scene

## Part 1: Setup (0:30-2:00)
- Characters
- Setting
- Initial conflict

## Part 2: Rising Action (2:00-4:00)
- Key events
- Complications
- Building tension

## Part 3: Climax (4:00-5:30)
- Turning point
- Resolution
- Aftermath

## Conclusion (5:30-6:00)
- Themes
- Takeaways
- Call to action
```

### Sample Script Opening
```markdown
# The Great Gatsby - Full Video Script

*[Dramatic music fades in]*

**NARRATOR:** What if the American Dream was actually 
a nightmare? What if everything you thought you knew 
about success, wealth, and happiness was a lie?

*[Music swells]*

**NARRATOR:** Today, we're diving into one of the most 
iconic novels of the 20th century...
```

## Next Steps

After successful testing:
1. ✅ Step 3 is fully functional
2. ✅ Script is saved and ready
3. 🔄 Ready to integrate Step 4 (Voiceover)

## Test Commands

### Check Files
```bash
# Windows
dir C:\Projects\YouTube\My-Video\
type C:\Projects\YouTube\My-Video\script.md

# Linux/Mac
ls /path/to/project/
cat /path/to/project/script.md
```

### Verify File Structure
```bash
# Should see:
book.txt       (Step 1)
summary.txt    (Step 2)
script.md      (Step 3) ← NEW
```

---

**Testing Status**: Ready for Testing ✅

**Test Coverage**: 12 test cases

**Expected Duration**: 30-45 minutes for full test suite

**Critical Tests**: 1, 4, 6, 8 (must pass)
