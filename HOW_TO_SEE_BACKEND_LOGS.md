# How to See Backend Logs

## 🖥️ Backend Console Logs

The backend logs show **everything** that's happening during image generation. This is the most important tool for debugging!

---

## 📍 Where to Find Backend Logs

### Step 1: Find Your Backend Terminal

The backend logs appear in the **terminal/command prompt where you started the backend server**.

**Look for the window where you ran**:
```bash
cd backend
npm start
```

### Step 2: What You Should See

When the backend starts, you'll see:
```
> ai-video-pipeline-backend@1.0.0 start
> node server.js

Server running on port 3001
```

---

## 🔍 What Logs to Look For

### When You Click "Start Generation"

You should immediately see:
```
========================================
POST /api/generate-images - Request received
========================================
Project Path: D:\Projects\Youtube-Pipeline\projects\your-project
Prompts by style: { illustration: 30, clear: 30, consistent: 30 }
Setting up SSE connection...
SSE headers sent, connection established
Session created: 1699999999999
Sending start message...
Calling generateAllImages...
```

### During Generation

You'll see detailed logs for each style:
```
[illustration] ========================================
[illustration] Starting image generation for 30 prompts...
[illustration] Project path: D:\Projects\...
[illustration] Loaded progress: 0 completed beats
[illustration] Remaining prompts to generate: 30
[illustration] First prompt to generate: Beat 1.1
[illustration] -------- Processing 1/30 --------
[illustration] Beat: 1.1
[illustration] Prompt: A beautiful sunset over mountains...
[illustration] Calling generateImageForBeat...
[illustration] generateImageForBeat called for Beat 1.1
[illustration] Target image path: D:\Projects\...\Beat_1.1.png
[illustration] Initializing AI instance...
[illustration] Attempt 1/2 - Calling Gemini API...
[illustration] Sending request to Gemini API...
```

**IMPORTANT**: At this point, it will wait 30-60 seconds for the API response. This is NORMAL!

```
(wait 30-60 seconds...)

[illustration] Received response from Gemini API
[illustration] Image saved: Beat 1.1
[illustration] Result: SUCCESS
Sending progress update: progress illustration 1.1
```

---

## 🚨 Common Log Patterns

### ✅ Normal (Working)
```
[illustration] Sending request to Gemini API...
(30-60 second wait)
[illustration] Received response from Gemini API
[illustration] Image saved: Beat 1.1
```
**Status**: Working perfectly! Just slow.

### ❌ API Key Error
```
[illustration] Error generating Beat 1.1: API key not valid
```
**Problem**: Invalid API key
**Fix**: Update API keys in `imageGenerationService.js`

### ❌ Rate Limit
```
[illustration] Error generating Beat 1.1: 429 Rate limit exceeded
[illustration] Switched to API Key index 1
[illustration] Attempt 2/2 - Calling Gemini API...
```
**Status**: Normal, system is handling it
**Action**: Wait for it to try next key

### ❌ No Logs at All
```
(nothing appears after clicking Start Generation)
```
**Problem**: Request not reaching backend
**Fix**: 
- Check backend is running
- Check port 3001
- Check browser console for errors

---

## 🎯 Step-by-Step: How to Monitor Logs

### 1. Open Backend Terminal

Find the terminal where you ran `npm start`

### 2. Clear the Screen (Optional)

To see fresh logs:
```bash
# Windows CMD
cls

# Windows PowerShell or Mac/Linux
clear
```

### 3. Start Generation

In your browser, click "Start Generation"

### 4. Watch the Logs

You should immediately see logs appearing in the backend terminal.

### 5. Be Patient

The first image takes 30-60 seconds. Watch for:
```
[illustration] Sending request to Gemini API...
```

Then wait. Don't refresh or stop!

### 6. Verify Success

After 30-60 seconds, you should see:
```
[illustration] Received response from Gemini API
[illustration] Image saved: Beat 1.1
```

---

## 📸 Screenshot Guide

### What Your Backend Terminal Should Look Like

```
┌─────────────────────────────────────────────────────────┐
│ D:\Projects\Youtube-Pipeline\backend> npm start         │
│                                                          │
│ > ai-video-pipeline-backend@1.0.0 start                 │
│ > node server.js                                         │
│                                                          │
│ Server running on port 3001                             │
│                                                          │
│ ========================================                 │
│ POST /api/generate-images - Request received            │
│ ========================================                 │
│ Project Path: D:\Projects\...                           │
│ Prompts by style: { illustration: 30, ... }             │
│ Setting up SSE connection...                            │
│ SSE headers sent, connection established                │
│ Calling generateAllImages...                            │
│                                                          │
│ [illustration] ========================================  │
│ [illustration] Starting image generation for 30 prompts │
│ [illustration] Sending request to Gemini API...         │
│ (cursor blinking here - waiting for API response)       │
└─────────────────────────────────────────────────────────┘
```

---

## 🧪 Test Backend Logging

### Quick Test

1. **Start backend**:
   ```bash
   cd backend
   npm start
   ```

2. **In another terminal, test the endpoint**:
   ```bash
   curl http://localhost:3001/api/generation-status/test
   ```

3. **Check backend terminal** - you should see:
   ```
   (no logs for this endpoint, but it proves backend is responding)
   ```

4. **Test API keys**:
   ```bash
   curl http://localhost:3001/api/test-api-keys
   ```

5. **Check backend terminal** - you should see:
   ```
   Testing API key...
   ```

---

## 🔧 Troubleshooting Backend Logs

### Problem: No Terminal Window

**You closed the backend terminal!**

**Solution**:
1. Open new terminal
2. Navigate to backend folder
3. Run `npm start` again

### Problem: Terminal Shows Errors

**Common errors**:

```
Error: Cannot find module '@google/genai'
```
**Fix**: `npm install` in backend folder

```
Error: listen EADDRINUSE: address already in use :::3001
```
**Fix**: Port 3001 is in use. Kill the process or change port.

```
SyntaxError: Unexpected token
```
**Fix**: Node.js version too old. Update to v16+

### Problem: Logs Stop Scrolling

**Terminal buffer is full**

**Solution**:
- Scroll up to see earlier logs
- Or clear and restart: `cls` (Windows) or `clear` (Mac/Linux)

---

## 💡 Pro Tips

### Tip 1: Keep Backend Terminal Visible

Arrange your windows so you can see:
- Browser (frontend) on one side
- Backend terminal on the other side

This way you can watch logs in real-time!

### Tip 2: Copy Logs for Debugging

To copy logs:
1. Select text in terminal
2. Right-click → Copy
3. Paste into text file or support request

### Tip 3: Save Logs to File

Redirect logs to a file:
```bash
# Windows
npm start > logs.txt 2>&1

# Mac/Linux
npm start 2>&1 | tee logs.txt
```

### Tip 4: Use Multiple Terminals

- Terminal 1: Backend server
- Terminal 2: Test commands
- Terminal 3: File operations

### Tip 5: Increase Terminal Buffer

If logs scroll too fast:
- Right-click terminal title bar
- Properties → Layout
- Increase "Screen Buffer Size" height to 9999

---

## 📊 Log Levels

### INFO (Normal)
```
[illustration] Starting image generation...
[illustration] Image saved: Beat 1.1
```
**Meaning**: Normal operation

### WARN (Warning)
```
Could not read progress file for illustration: ENOENT
```
**Meaning**: Minor issue, but continuing

### ERROR (Error)
```
Error generating Beat 1.1: API key not valid
```
**Meaning**: Something failed, needs attention

---

## 🎓 Understanding the Logs

### Log Format
```
[style] Message
```
- `[illustration]` = Which style is generating
- `[clear]` = Clear style
- `[consistent]` = Consistent style

### Progress Indicators
```
[illustration] -------- Processing 5/30 --------
```
- Currently processing image 5 out of 30

### Timing
```
[illustration] Sending request to Gemini API...
(30-60 seconds wait)
[illustration] Received response from Gemini API
```
- Shows how long API calls take

---

## ✅ Checklist

Before reporting issues, verify:

- [ ] Backend terminal is open and visible
- [ ] Backend shows "Server running on port 3001"
- [ ] Logs appear when you click "Start Generation"
- [ ] You waited at least 60 seconds
- [ ] You checked for error messages in logs
- [ ] You copied the relevant logs

---

## 📞 What to Share

If you need help, share:

1. **Full backend logs** (from "Server running" to current point)
2. **Browser console errors** (F12 → Console)
3. **What you clicked** (Start Generation, Stop, etc.)
4. **How long you waited**
5. **Expected vs actual behavior**

---

**Remember**: The backend logs are your best friend for debugging! They show exactly what's happening at every step.

If you see logs appearing and "Sending request to Gemini API...", the system is working - just be patient! 🎯
