# Testing Step 2 - Summarize Content

## Prerequisites

- ✅ Backend server running on port 3001
- ✅ Frontend server running on port 3000
- ✅ Step 1 completed (project created with book content)

## Quick Test

### 1. Complete Step 1 First

```
1. Open http://localhost:3000
2. Video Title: "Test Summary"
3. Project Path: C:\Temp\YouTube-Test
4. Upload a text or PDF file
5. Click "Create Project Directory"
6. Verify success message
```

### 2. Navigate to Step 2

```
1. Click "Next: Summarize →" button
2. You should see Step 2: Summarize Content
```

### 3. Generate Summary

```
1. Click "Generate Summary" button
2. See loading spinner
3. Wait 5-10 seconds
4. Summary appears in Markdown format
5. Verify file created: C:\Temp\YouTube-Test\Test-Summary\summary.txt
```

### 4. Test Refinement

```
1. Type in chat: "Make it shorter"
2. Click "Send" or press Enter
3. See loading indicator
4. Summary updates with shorter version
5. Verify changes are visible
```

### 5. Test Regeneration

```
1. Click "Regenerate" button
2. See loading spinner
3. New summary generates
4. Replaces previous summary
```

## Detailed Test Cases

### ✅ Test 1: Initial State

**Steps:**
1. Navigate to Step 2 (without generating summary)

**Expected:**
- Empty state message displayed
- "Generate Summary" button visible
- No summary content shown
- No chat interface visible

### ✅ Test 2: Generate Summary

**Steps:**
1. Click "Generate Summary"

**Expected:**
- Button becomes disabled
- Loading spinner appears
- Message: "Generating summary from your book content..."
- After 5-10 seconds, summary appears
- Summary is formatted in Markdown
- Chat interface appears below summary
- File `summary.txt` created in project folder

**Verify File:**
```bash
# Check file exists
dir C:\Temp\YouTube-Test\Test-Summary\summary.txt

# View content
type C:\Temp\YouTube-Test\Test-Summary\summary.txt
```

### ✅ Test 3: Refine Summary - Make Shorter

**Steps:**
1. After generating summary
2. Type: "Make it shorter"
3. Click "Send"

**Expected:**
- Chat input disabled during processing
- Loading indicator appears
- Summary updates with shorter version
- Chat input re-enabled
- Previous summary replaced

### ✅ Test 4: Refine Summary - Add Details

**Steps:**
1. Type: "Add more details about the main character"
2. Click "Send"

**Expected:**
- Summary updates with more character details
- Changes are visible in the display

### ✅ Test 5: Refine Summary - Change Focus

**Steps:**
1. Type: "Focus more on the key themes"
2. Click "Send"

**Expected:**
- Summary updates with theme focus
- Content shifts appropriately

### ✅ Test 6: Regenerate Summary

**Steps:**
1. Click "Regenerate" button

**Expected:**
- Loading spinner appears
- Completely new summary generated
- Different from previous version
- File `summary.txt` updated

### ✅ Test 7: Multiple Refinements

**Steps:**
1. Generate summary
2. Refine: "Make it shorter"
3. Refine: "Add more emotion"
4. Refine: "Focus on the climax"

**Expected:**
- Each refinement builds on previous
- Summary evolves with each instruction
- No errors or crashes

### ✅ Test 8: Long Book Content

**Steps:**
1. Use a large book file (> 50 pages PDF)
2. Generate summary

**Expected:**
- Takes longer (10-15 seconds)
- Summary still generates successfully
- Summary is appropriately concise

### ✅ Test 9: Backend Error Handling

**Steps:**
1. Stop backend server
2. Try to generate summary

**Expected:**
- Loading state eventually stops
- Error logged to console
- No crash or freeze
- User can try again after restarting backend

### ✅ Test 10: Navigation

**Steps:**
1. Generate summary
2. Click "Back" button
3. Click "Next" to return to Step 2

**Expected:**
- Summary is preserved
- No need to regenerate
- State maintained

### ✅ Test 11: Empty Chat Input

**Steps:**
1. Leave chat input empty
2. Try to click "Send"

**Expected:**
- Nothing happens (button should be disabled)
- No API call made

### ✅ Test 12: Very Long Instruction

**Steps:**
1. Type a very long instruction (> 500 characters)
2. Click "Send"

**Expected:**
- Instruction is processed
- Summary updates appropriately
- No errors

## Performance Benchmarks

| Book Size | Generation Time | Expected |
|-----------|----------------|----------|
| Small (< 5 pages) | 3-5 seconds | ✅ |
| Medium (5-20 pages) | 5-10 seconds | ✅ |
| Large (20-50 pages) | 10-15 seconds | ✅ |
| Very Large (> 50 pages) | 15-20 seconds | ⚠️ |

| Operation | Time | Expected |
|-----------|------|----------|
| Refine summary | 3-5 seconds | ✅ |
| Regenerate | 5-10 seconds | ✅ |
| Load existing | Instant | ✅ |

## Common Issues

### Issue 1: Summary Not Generating

**Symptoms:**
- Loading spinner appears but never completes
- No summary appears

**Causes:**
- Backend not running
- Gemini API key invalid
- book.txt file missing

**Solutions:**
1. Check backend console for errors
2. Verify backend is running: `cd backend && npm run dev`
3. Check .env file has valid GEMINI_API_KEY
4. Verify book.txt exists in project folder

### Issue 2: Refinement Not Working

**Symptoms:**
- Chat sends but summary doesn't update
- Loading indicator appears but nothing changes

**Causes:**
- Backend /refine endpoint error
- Network issue

**Solutions:**
1. Check backend console for errors
2. Check browser console for errors
3. Verify backend is responding: Test with curl or Postman

### Issue 3: Summary Too Short/Long

**Symptoms:**
- Summary is not the right length

**Solutions:**
1. Use refinement: "Make it longer" or "Make it shorter"
2. Regenerate for a different version
3. Provide more specific instructions

### Issue 4: File Not Saved

**Symptoms:**
- Summary displays but file not created

**Causes:**
- Path permissions
- Backend error

**Solutions:**
1. Check backend console for errors
2. Verify write permissions on project folder
3. Check disk space

## Success Criteria

All tests should pass with:
- ✅ Summary generates successfully
- ✅ Refinement works as expected
- ✅ File saved to correct location
- ✅ UI feedback is clear
- ✅ No console errors
- ✅ State persists across navigation
- ✅ Performance is acceptable

## Manual Verification

After testing, verify:

1. **File System:**
   ```
   C:\Temp\YouTube-Test\Test-Summary\
   ├── book.txt      ✅ From Step 1
   └── summary.txt   ✅ From Step 2
   ```

2. **File Content:**
   - Open `summary.txt`
   - Verify it contains the generated summary
   - Verify it's readable and makes sense

3. **UI State:**
   - Summary is displayed
   - Chat interface is available
   - Buttons are functional

## Next Steps After Testing

Once all tests pass:
1. ✅ Step 2 is fully functional
2. ✅ Summary is saved and ready
3. 🔄 Ready to integrate Step 3 (Scripting)

## Test Commands

### Start Servers
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev
```

### Check Files
```bash
# Windows
dir C:\Temp\YouTube-Test\Test-Summary\
type C:\Temp\YouTube-Test\Test-Summary\summary.txt

# Linux/Mac
ls -la /tmp/YouTube-Test/Test-Summary/
cat /tmp/YouTube-Test/Test-Summary/summary.txt
```

### Clean Test Data
```bash
# Windows
rmdir /s /q C:\Temp\YouTube-Test

# Linux/Mac
rm -rf /tmp/YouTube-Test
```

---

**Testing Status**: Ready for Testing ✅

**Test Coverage**: 12 test cases

**Expected Duration**: 15-20 minutes for full test suite
