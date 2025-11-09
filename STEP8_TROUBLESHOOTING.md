# Step 8 Image Generation - Troubleshooting Guide

## 🔧 Common Issues and Solutions

---

## Issue 1: Generation Stuck on "Starting image generation..."

### Symptoms
- Button shows "Generating..."
- Message shows "Starting image generation..."
- No progress updates
- Nothing happens

### Possible Causes

#### 1. Backend Not Running
**Check**: Is the backend server running?
```bash
# Check if backend is running
curl http://localhost:3001/api/generation-status/test
```

**Solution**: Start the backend
```bash
cd backend
npm start
```

#### 2. API Keys Not Configured
**Check**: Open `backend/ImageGeneration/imageGenerationService.js`

Look for:
```javascript
const API_KEYS = {
  illustration: ["YOUR_GEMINI_API_KEY_1", ...],
  // ...
}
```

**Solution**: Replace with actual API keys
```javascript
const API_KEYS = {
  illustration: ["AIzaSy...", "AIzaSy..."],
  clear: ["AIzaSy...", "AIzaSy..."],
  consistent: ["AIzaSy...", "AIzaSy..."]
};
```

#### 3. Invalid API Keys
**Check**: Backend console for errors like:
```
Error: API key not valid
Error: 401 Unauthorized
```

**Solution**: 
- Verify keys are correct
- Check keys are active in Google Cloud Console
- Ensure billing is enabled

#### 4. Network/CORS Issues
**Check**: Browser console for errors like:
```
CORS policy blocked
Failed to fetch
Network error
```

**Solution**: 
- Verify backend is on port 3001
- Check CORS is enabled in backend
- Try restarting backend

#### 5. No Prompts Available
**Check**: Did you complete Step 7 (Extract Prompts)?

**Solution**: 
- Go back to Step 6
- Generate storyboards
- Go to Step 7
- Verify prompts are extracted

---

## Issue 2: Connection Timeout

### Symptoms
- "Connecting to server..." for a long time
- Eventually shows error
- No progress

### Solutions

#### Check Backend Logs
```bash
# In backend terminal, look for:
Server running on port 3001
POST /api/generate-images
```

#### Restart Backend
```bash
# Stop backend (Ctrl+C)
# Start again
cd backend
npm start
```

#### Check Port
```bash
# Make sure port 3001 is not in use
# Windows
netstat -ano | findstr :3001

# Mac/Linux
lsof -i :3001
```

---

## Issue 3: Generation Stops Unexpectedly

### Symptoms
- Generation starts
- Shows progress for a while
- Suddenly stops
- No error message

### Possible Causes

#### 1. Rate Limit Hit
**Check**: Backend console for:
```
Error 429: Rate limit exceeded
All API keys exhausted
```

**Solution**: 
- Add more API keys
- Wait a few minutes
- Reduce REQUESTS_PER_MINUTE in service file

#### 2. Network Interruption
**Check**: Browser console for network errors

**Solution**:
- Check internet connection
- Click "Start Generation" again (will resume)

#### 3. Backend Crashed
**Check**: Backend terminal for errors

**Solution**:
- Restart backend
- Check backend logs
- Fix any errors shown

---

## Issue 4: Can't Stop Generation

### Symptoms
- Click "Stop" button
- Nothing happens
- Generation continues

### Solutions

#### Wait for Current Image
The system completes the current image before stopping.
- Wait 10-30 seconds
- Check if it stops

#### Force Stop Backend
```bash
# In backend terminal
Ctrl+C

# Or kill process
# Windows
taskkill /F /IM node.exe

# Mac/Linux
pkill -f "node server.js"
```

#### Clear Session
```bash
# Restart backend
cd backend
npm start
```

---

## Issue 5: Progress Not Saving

### Symptoms
- Generation runs
- Stop and restart
- Starts from beginning again

### Solutions

#### Check Progress Files
```bash
# Look for these files in your project directory
ls {projectPath}/image_progress_*.json

# View content
cat {projectPath}/image_progress_illustration.json
```

#### Check File Permissions
```bash
# Ensure backend can write to project directory
# Check folder permissions
ls -la {projectPath}
```

#### Verify Project Path
- Make sure projectPath is correct
- Check it's an absolute path
- Verify folder exists

---

## Issue 6: Images Not Generating

### Symptoms
- Progress shows "complete"
- But no images in folder

### Solutions

#### Check Output Directory
```bash
# Look for generated images
ls {projectPath}/generated_images/illustration/Shot_1/
```

#### Check Disk Space
```bash
# Ensure enough disk space
df -h  # Mac/Linux
wmic logicaldisk get size,freespace,caption  # Windows
```

#### Check File Permissions
```bash
# Ensure backend can write files
# Check folder permissions
ls -la {projectPath}/generated_images/
```

---

## Issue 7: "Already in Progress" Error

### Symptoms
- Click "Start Generation"
- Error: "Image generation already in progress"
- But nothing is generating

### Solutions

#### Check Backend Status
```bash
curl http://localhost:3001/api/generation-status/{projectPath}
```

#### Restart Backend
```bash
# Stop backend
Ctrl+C

# Start again
cd backend
npm start
```

#### Clear Stuck Session
The backend tracks active sessions. Restarting clears them.

---

## Issue 8: Slow Generation

### Symptoms
- Generation is very slow
- Takes much longer than expected

### Solutions

#### Add More API Keys
```javascript
// In imageGenerationService.js
const API_KEYS = {
  illustration: ["key1", "key2", "key3"], // More keys = faster
  clear: ["key4", "key5", "key6"],
  consistent: ["key7", "key8", "key9"]
};
```

#### Increase Request Rate
```javascript
// In imageGenerationService.js
const REQUESTS_PER_MINUTE = 12; // Increase if quota allows
```

#### Check API Quota
- Go to Google Cloud Console
- Check API usage
- Verify you're not hitting quota limits

---

## Issue 9: Error Messages Not Clear

### Symptoms
- Generic error messages
- Hard to understand what went wrong

### Solutions

#### Check Backend Logs
Backend logs have detailed error information:
```bash
# In backend terminal, look for:
[illustration] Error generating Beat 1.1: <detailed error>
```

#### Check Browser Console
```bash
# Open browser DevTools (F12)
# Go to Console tab
# Look for errors
```

#### Enable Verbose Logging
```javascript
// In imageGenerationService.js
// Add console.log statements for debugging
console.log('Generating image for:', prompt);
```

---

## Issue 10: Can't Navigate to Other Steps

### Symptoms
- Stuck on Step 8 during generation
- Can't click other steps

### Solution

#### Use Disconnect Button
1. Click "Disconnect (Continue in Background)"
2. Generation continues on backend
3. You can now navigate to other steps

#### Or Stop Generation
1. Click "Stop"
2. Progress is saved
3. Navigate to other steps
4. Come back and resume later

---

## 🔍 Diagnostic Checklist

Run through this checklist to diagnose issues:

### Backend
- [ ] Backend server is running
- [ ] Port 3001 is accessible
- [ ] API keys are configured
- [ ] API keys are valid
- [ ] No errors in backend console

### Frontend
- [ ] Browser is connected to backend
- [ ] No CORS errors in console
- [ ] No network errors
- [ ] Prompts are available from Step 7

### Configuration
- [ ] API keys in imageGenerationService.js
- [ ] Style reference image exists (optional)
- [ ] Project path is correct
- [ ] Output directory is writable

### Generation
- [ ] Progress files are being created
- [ ] Images are being saved
- [ ] No rate limit errors
- [ ] Sufficient disk space

---

## 🆘 Emergency Procedures

### Complete Reset

If nothing works, try a complete reset:

```bash
# 1. Stop backend
Ctrl+C

# 2. Clear progress files (optional - you'll lose progress)
rm {projectPath}/image_progress_*.json

# 3. Clear generated images (optional - you'll lose images)
rm -rf {projectPath}/generated_images/

# 4. Restart backend
cd backend
npm start

# 5. Refresh frontend
# Press F5 in browser

# 6. Try generation again
```

### Check Everything

```bash
# Backend running?
curl http://localhost:3001/api/generation-status/test

# API keys configured?
grep "AIzaSy" backend/ImageGeneration/imageGenerationService.js

# Prompts available?
# Check in UI - Step 7 should show prompts

# Disk space?
df -h  # Mac/Linux
```

---

## 📞 Getting Help

### Information to Provide

When asking for help, provide:

1. **Error Message**: Exact error text
2. **Backend Logs**: Copy from terminal
3. **Browser Console**: Copy errors from DevTools
4. **Configuration**: 
   - Number of API keys
   - REQUESTS_PER_MINUTE value
   - Node.js version
5. **Steps to Reproduce**: What you did before error

### Where to Look

1. **Backend Console**: Most detailed errors
2. **Browser Console**: Network and frontend errors
3. **Progress Files**: Check if being created
4. **Generated Images**: Check if being saved

---

## 💡 Prevention Tips

### Before Starting Generation

1. ✅ Verify backend is running
2. ✅ Check API keys are configured
3. ✅ Test with small number of beats first
4. ✅ Ensure stable internet connection
5. ✅ Check disk space available

### During Generation

1. ✅ Keep backend terminal visible
2. ✅ Monitor progress in UI
3. ✅ Don't close backend terminal
4. ✅ Use "Disconnect" if need to navigate away

### After Issues

1. ✅ Check backend logs first
2. ✅ Verify progress files exist
3. ✅ Check generated images
4. ✅ Restart backend if needed
5. ✅ Resume generation (it will skip completed)

---

## 🎯 Quick Fixes

### Generation Stuck?
```bash
# Restart backend
Ctrl+C
cd backend && npm start
# Click "Start Generation" again
```

### Can't Stop?
```bash
# Force stop backend
Ctrl+C
# Restart
cd backend && npm start
```

### Progress Not Saving?
```bash
# Check progress files exist
ls {projectPath}/image_progress_*.json
# If not, check file permissions
```

### Slow Generation?
```javascript
// Add more API keys in imageGenerationService.js
const API_KEYS = {
  illustration: ["key1", "key2", "key3"],
  // ...
};
```

---

**Last Updated**: 2025-11-09  
**Version**: 1.1.0  

**Still having issues? Check backend logs first!** 🔍
