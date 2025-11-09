# Step 8 - Diagnostic Steps for "Stuck" Issue

## 🔍 When Generation Shows "Connected! Starting generation..." and Stops

Follow these steps in order:

### Step 1: Check Backend Console

**Look at your backend terminal** where you ran `npm start`.

You should see logs like:
```
[illustration] ========================================
[illustration] Starting image generation for 30 prompts...
[illustration] Project path: D:\Projects\...
[illustration] Loaded progress: 0 completed beats
[illustration] Remaining prompts to generate: 30
[illustration] First prompt to generate: Beat 1.1
[illustration] -------- Processing 1/30 --------
[illustration] Beat: 1.1
[illustration] Calling generateImageForBeat...
[illustration] Sending request to Gemini API...
```

### Step 2: Identify the Issue

#### Issue A: No Logs at All
**Symptom**: Backend console shows nothing after "Connected! Starting generation..."

**Cause**: Request not reaching backend

**Solution**:
```bash
# Test if backend is responding
curl http://localhost:3001/api/generation-status/test

# Should return: {"success":true,"isGenerating":false}
```

If no response:
- Backend not running
- Wrong port
- Firewall blocking

#### Issue B: Logs Stop at "Sending request to Gemini API..."
**Symptom**: 
```
[illustration] Sending request to Gemini API...
(then nothing for a long time)
```

**Cause**: Waiting for Gemini API response (this is NORMAL!)

**What's Happening**: 
- Gemini API takes 10-30 seconds per image
- This is expected behavior
- Just wait!

**Solution**: 
- **WAIT** - First image takes longest (30-60 seconds)
- After first image, you'll see progress
- Don't refresh or stop

#### Issue C: API Error
**Symptom**:
```
[illustration] Error generating Beat 1.1: API key not valid
```
or
```
[illustration] Error generating Beat 1.1: 400 Bad Request
```

**Cause**: API key issue

**Solution**: See Step 3 below

#### Issue D: Rate Limit Error
**Symptom**:
```
[illustration] Error 429: Rate limit exceeded
[illustration] Switched to API Key index 1
```

**Cause**: Hitting rate limits

**Solution**: 
- This is normal, system will rotate keys
- Wait for it to try next key
- If all keys exhausted, wait 1 minute

### Step 3: Test API Keys

Run this in your browser or terminal:
```bash
curl http://localhost:3001/api/test-api-keys
```

**Expected Response**:
```json
{
  "success": true,
  "message": "API key is working!",
  "hasImage": true,
  "response": "Image generated successfully"
}
```

**If you get an error**:
```json
{
  "success": false,
  "error": "API key not valid"
}
```

**Fix**:
1. Go to https://makersuite.google.com/app/apikey
2. Create new API keys
3. Update `backend/ImageGeneration/imageGenerationService.js`
4. Restart backend

### Step 4: Check Project Path

**In backend logs, look for**:
```
[illustration] Project path: D:\Projects\Youtube-Pipeline\projects\...
```

**Verify**:
1. Path exists
2. You have write permissions
3. Path is absolute (not relative)

**Test**:
```bash
# Windows
dir "D:\Projects\Youtube-Pipeline\projects\your-project"

# Mac/Linux
ls "/path/to/your/project"
```

### Step 5: Check Prompts

**In backend logs, look for**:
```
[illustration] Starting image generation for 30 prompts...
```

**If it says 0 prompts**:
- Go back to Step 6 (Storyboard)
- Generate storyboards
- Go to Step 7 (Prompts)
- Verify prompts are extracted

### Step 6: Monitor First Image Generation

**The first image takes the longest** (30-60 seconds)

**What you should see**:
```
[illustration] Sending request to Gemini API...
(wait 30-60 seconds)
[illustration] Received response from Gemini API
[illustration] Image saved: Beat 1.1
[illustration] Result: SUCCESS
```

**If you see this**: ✅ **IT'S WORKING!** Just be patient.

### Step 7: Check Frontend Console

Open browser DevTools (F12) → Console tab

**Look for**:
- SSE connection established
- Progress updates received
- Any errors

**Common errors**:
```
Failed to fetch
CORS error
Network error
```

**Solution**: Restart backend

### Step 8: Verify Files Are Being Created

While generation is running, check:
```bash
# Check if progress file is created
dir "D:\Projects\Youtube-Pipeline\projects\your-project\image_progress_illustration.json"

# Check if images are being created
dir "D:\Projects\Youtube-Pipeline\projects\your-project\generated_images\illustration\Shot_1\"
```

**If files are being created**: ✅ **IT'S WORKING!**

## 🎯 Quick Diagnostic Checklist

Run through this quickly:

1. [ ] Backend console shows logs
2. [ ] Logs show "Sending request to Gemini API..."
3. [ ] Waited at least 60 seconds
4. [ ] API key test passes
5. [ ] Project path exists
6. [ ] Prompts count > 0
7. [ ] No errors in backend console
8. [ ] No errors in browser console

**If all checked**: System is working, just be patient!

## ⏱️ Expected Timing

### First Image
- **Time**: 30-60 seconds
- **Why**: API initialization + generation
- **Normal**: Yes, this is expected

### Subsequent Images
- **Time**: 10-20 seconds each
- **Why**: Just generation time
- **Normal**: Yes

### Full Generation (30 beats, 3 styles = 90 images)
- **Time**: 15-30 minutes
- **Why**: API rate limits + generation time
- **Normal**: Yes

## 🚨 Real Issues vs. Normal Behavior

### Normal Behavior (NOT Issues)
- ✅ "Sending request to Gemini API..." for 30-60 seconds
- ✅ First image takes longer than others
- ✅ Occasional "Switched to API Key" messages
- ✅ Progress seems slow (10-20 sec per image)

### Real Issues (Need Fixing)
- ❌ No logs in backend console
- ❌ "API key not valid" error
- ❌ "400 Bad Request" error
- ❌ No files being created after 5 minutes
- ❌ Same error repeating continuously

## 🔧 Common Fixes

### Fix 1: Restart Backend
```bash
# Stop backend (Ctrl+C)
cd backend
npm start
```

### Fix 2: Clear Progress and Start Fresh
```bash
# Delete progress files
del "D:\Projects\Youtube-Pipeline\projects\your-project\image_progress_*.json"

# Try generation again
```

### Fix 3: Test with One Style Only
Temporarily modify `imageGenerationService.js`:
```javascript
export async function generateAllImages(projectPath, promptsByStyle, onProgress) {
  const styles = ['illustration']; // Only test one style
  // ... rest of code
}
```

### Fix 4: Reduce Prompts for Testing
Test with just 2-3 prompts first to verify it works.

## 📞 What to Report

If still stuck, provide:

1. **Backend console output** (copy all logs)
2. **Browser console errors** (F12 → Console)
3. **API key test result** (from `/test-api-keys`)
4. **How long you waited** (be honest!)
5. **Project path** (from backend logs)
6. **Number of prompts** (from backend logs)

## 💡 Pro Tip

**Most "stuck" issues are actually just waiting for the API!**

The first image generation can take 30-60 seconds. This is normal. Just wait and watch the backend console for progress.

If you see:
```
[illustration] Sending request to Gemini API...
```

And nothing else for 30-60 seconds, **this is NORMAL**. The API is working on generating your image. Be patient!

---

**Remember**: Image generation is slow by nature. The API needs time to create each image. This is not a bug, it's just how AI image generation works!
