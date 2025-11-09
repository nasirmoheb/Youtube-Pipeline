# Testing Real Gemini API Integration

## Prerequisites

- ✅ Valid Gemini API key
- ✅ API key in `.env` file
- ✅ Backend server running
- ✅ Frontend server running

## Setup

### 1. Get Gemini API Key

1. Go to https://aistudio.google.com/app/apikey
2. Create or select a project
3. Generate API key
4. Copy the key

### 2. Configure Frontend

Create or update `.env` in root directory:

```bash
GEMINI_API_KEY=your_actual_api_key_here
```

**Important:** Replace `your_actual_api_key_here` with your real API key.

### 3. Restart Servers

```bash
# Stop both servers (Ctrl+C)

# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev
```

## Quick Test

### Test Real Summary Generation

```
1. Open http://localhost:3000
2. Complete Step 1:
   - Title: "The Great Gatsby"
   - Upload a text file with book content
   - Create project
3. Navigate to Step 2
4. Click "Generate Summary"
5. Wait 5-10 seconds
6. Verify:
   ✅ Real AI-generated summary appears
   ✅ Summary is relevant to book content
   ✅ Summary is well-written
   ✅ File created: summary.txt
```

## Detailed Tests

### ✅ Test 1: API Key Validation

**Steps:**
1. Check `.env` file exists
2. Verify `GEMINI_API_KEY` is set
3. Restart frontend server
4. Open browser console
5. Navigate to Step 2

**Expected:**
- No API key errors in console
- No "API key not found" messages

### ✅ Test 2: Real Summary Quality

**Steps:**
1. Use a well-known book (e.g., "The Great Gatsby")
2. Upload actual book content (at least a few chapters)
3. Generate summary

**Expected:**
- Summary mentions actual characters (Gatsby, Nick, Daisy)
- Summary describes actual plot points
- Summary captures themes (wealth, American Dream)
- Summary is coherent and well-structured
- Summary is 200-500 words

**Verify Quality:**
```
✅ Mentions specific characters
✅ Describes plot accurately
✅ Captures themes
✅ Well-written prose
✅ Appropriate length
```

### ✅ Test 3: Real Refinement

**Steps:**
1. Generate summary
2. Note the length (e.g., 400 words)
3. Type: "Make it exactly 200 words"
4. Click "Send"
5. Wait 3-5 seconds

**Expected:**
- Summary is actually shorter
- Word count is close to 200
- Key information retained
- Still well-written

**Verify:**
```
✅ Length changed significantly
✅ Content is more concise
✅ Key points preserved
✅ Quality maintained
```

### ✅ Test 4: Multiple Refinements

**Steps:**
1. Generate summary
2. Refine: "Make it shorter"
3. Refine: "Add more emotion"
4. Refine: "Focus on the main character"

**Expected:**
- Each refinement builds on previous
- Summary evolves appropriately
- Final summary reflects all instructions
- Quality improves with refinements

### ✅ Test 5: File Persistence

**Steps:**
1. Generate summary
2. Check file system
3. Open `summary.txt`
4. Refine summary
5. Check file again

**Expected:**
- File created after generation
- File contains exact summary text
- File updated after refinement
- No corruption or encoding issues

**Verify File:**
```bash
# Windows
type C:\Projects\YouTube\My-Video\summary.txt

# Linux/Mac
cat /path/to/project/summary.txt
```

### ✅ Test 6: Different Book Types

**Test with different content:**

**Fiction Book:**
- Upload novel content
- Generate summary
- Verify: Plot, characters, themes

**Non-Fiction Book:**
- Upload educational content
- Generate summary
- Verify: Key concepts, arguments, conclusions

**Short Story:**
- Upload short story
- Generate summary
- Verify: Concise, captures essence

### ✅ Test 7: Error Handling

**Test A: Invalid API Key**
1. Set invalid API key in `.env`
2. Restart frontend
3. Try to generate summary
4. **Expected:** Error in console, user-friendly message

**Test B: Network Error**
1. Disconnect internet
2. Try to generate summary
3. **Expected:** Error handling, no crash

**Test C: Empty Book Content**
1. Upload empty file
2. Try to generate summary
3. **Expected:** Error or minimal summary

### ✅ Test 8: Performance

**Measure Times:**

| Book Size | Expected Time | Actual Time |
|-----------|---------------|-------------|
| Small (< 5 pages) | 3-5 seconds | _____ |
| Medium (5-20 pages) | 5-10 seconds | _____ |
| Large (20-50 pages) | 10-15 seconds | _____ |

**Record Results:**
- Small book: _____ seconds
- Medium book: _____ seconds
- Large book: _____ seconds

### ✅ Test 9: API Usage

**Monitor API Calls:**
1. Go to https://aistudio.google.com/app/apikey
2. Check usage dashboard
3. Generate summary
4. Refresh dashboard
5. Verify call was logged

**Expected:**
- API call appears in dashboard
- Token usage recorded
- No errors in API console

### ✅ Test 10: Comparison Test

**Compare with Placeholder:**

**Placeholder (Old):**
```
"This is a placeholder summary for the book titled..."
```

**Real Gemini (New):**
```
"The Great Gatsby, set in the summer of 1922, follows 
Nick Carraway as he becomes entangled in the world of 
his mysterious neighbor, Jay Gatsby..."
```

**Verify:**
- ✅ Real content vs placeholder
- ✅ Contextual understanding
- ✅ Proper grammar and style
- ✅ Relevant details

## Quality Checklist

For each generated summary, verify:

- [ ] Mentions actual content from book
- [ ] Captures main themes
- [ ] Describes key characters
- [ ] Summarizes plot accurately
- [ ] Well-written and coherent
- [ ] Appropriate length (200-500 words)
- [ ] No hallucinations (made-up content)
- [ ] Grammatically correct
- [ ] Suitable for video script foundation

## Common Issues

### Issue 1: "API key not found"

**Symptoms:**
- Error in console
- Summary not generating

**Solutions:**
1. Check `.env` file exists in root directory
2. Verify `GEMINI_API_KEY=your_key`
3. No quotes around the key
4. Restart frontend server
5. Clear browser cache

### Issue 2: "Rate limit exceeded"

**Symptoms:**
- Error after multiple generations
- "429" error in console

**Solutions:**
1. Wait a few minutes
2. Check API quota in Google AI Studio
3. Upgrade API plan if needed
4. Reduce frequency of calls

### Issue 3: Poor Quality Summary

**Symptoms:**
- Summary is generic
- Missing key details
- Doesn't match book content

**Solutions:**
1. Ensure book content is complete
2. Try regenerating
3. Use refinement to improve
4. Check if book content was uploaded correctly

### Issue 4: Summary Not Saved

**Symptoms:**
- Summary displays but file not created
- Backend error in console

**Solutions:**
1. Check backend is running
2. Verify project path is correct
3. Check file permissions
4. Check backend console for errors

## Success Criteria

All tests should pass with:
- ✅ Real AI-generated summaries
- ✅ High-quality, relevant content
- ✅ Proper file persistence
- ✅ Refinement works correctly
- ✅ No API errors
- ✅ Acceptable performance
- ✅ Error handling works

## Performance Benchmarks

| Metric | Target | Actual |
|--------|--------|--------|
| Generate Time | 5-10s | _____ |
| Refine Time | 3-5s | _____ |
| Save Time | < 100ms | _____ |
| Summary Quality | High | _____ |
| Relevance | 100% | _____ |

## Next Steps

After successful testing:
1. ✅ Real Gemini API working
2. ✅ Quality summaries generated
3. ✅ Files saved correctly
4. 🔄 Ready to integrate Step 3 with real AI

## API Key Security

**Important Reminders:**

- ✅ Never commit `.env` to git
- ✅ Add `.env` to `.gitignore`
- ✅ Don't share API key publicly
- ✅ Rotate keys regularly
- ✅ Monitor usage for anomalies
- ✅ Set up usage alerts
- ✅ Use separate keys for dev/prod

## Troubleshooting Commands

### Check Environment
```bash
# Windows
echo %GEMINI_API_KEY%

# Linux/Mac
echo $GEMINI_API_KEY
```

### Check File
```bash
# Windows
type .env

# Linux/Mac
cat .env
```

### Check API Key Format
```
Correct: GEMINI_API_KEY=AIzaSyAbc123...
Wrong: GEMINI_API_KEY="AIzaSyAbc123..."
Wrong: GEMINI_API_KEY='AIzaSyAbc123...'
```

---

**Testing Status**: Ready for Real API Testing ✅

**Prerequisites**: Valid Gemini API key required

**Expected Duration**: 30-45 minutes for full test suite

**Critical Tests**: 1, 2, 3, 5, 9 (must pass)
