# Fix Placeholder Text Issue

## Problem

Hooks generation works with real Gemini API, but outline and script still show placeholder text.

## Root Cause

The browser has cached the old JavaScript bundle that contains the placeholder code. The source files are correct, but the browser is using the old cached version.

## ✅ Solution

### Option 1: Hard Refresh (Quickest)

**Windows/Linux:**
```
Ctrl + Shift + R
or
Ctrl + F5
```

**Mac:**
```
Cmd + Shift + R
or
Cmd + Option + R
```

### Option 2: Clear Cache and Restart

1. **Stop the frontend server** (Ctrl+C)

2. **Clear Vite cache:**
```bash
# Windows
rmdir /s /q node_modules\.vite
rmdir /s /q .vite

# Linux/Mac
rm -rf node_modules/.vite
rm -rf .vite
```

3. **Restart frontend:**
```bash
npm run dev
```

4. **Hard refresh browser** (Ctrl+Shift+R)

### Option 3: Clear Browser Cache

1. Open browser DevTools (F12)
2. Right-click on refresh button
3. Select "Empty Cache and Hard Reload"

### Option 4: Incognito/Private Window

1. Open new incognito/private window
2. Navigate to http://localhost:3000
3. Test the application

## 🧪 Verify Fix

After clearing cache:

1. **Navigate to Step 3**
2. **Generate Hooks** → Should work (already working)
3. **Select a hook**
4. **Generate Outline** → Should show REAL AI content, not placeholder
5. **Generate Script** → Should show REAL AI content, not placeholder

### Expected Real Output

**Outline should look like:**
```markdown
# Video Outline: [Your Book Title]

## Introduction (0:00-0:30)
- Hook: [Your selected hook]
- Brief intro to the author
- Set the scene

## Part 1: The Setup (0:30-2:00)
- Introduce main characters
- Describe setting
- Initial conflict

[... continues with real content ...]
```

**NOT like:**
```markdown
# Video Outline for: ${title}

## Introduction
- **Hook:** ${hook}
- Briefly introduce the book and its author.
- State what the video will cover.

[... placeholder template ...]
```

## 🔍 Verify Code is Correct

The source code is already correct. You can verify:

**services/geminiService.ts:**
```typescript
export const generateOutline = async (summary: string, title: string, hook: string): Promise<string> => {
  const prompt = prompts.getOutlinePrompt(summary, title, hook);
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash-exp',
    contents: prompt,
  });
  return response.text;  // ✅ Returns real API response
};

export const generateFullScript = async (outline: string, hook: string): Promise<string> => {
    const prompt = prompts.getFullScriptPrompt(outline, hook);
    const response = await ai.models.generateContent({ 
      model: 'gemini-2.0-flash-exp', 
      contents: prompt 
    });
    return response.text;  // ✅ Returns real API response
};
```

## 🐛 If Still Not Working

### Check 1: API Key

Verify your `.env` file has a valid API key:
```bash
# Check if file exists
type .env

# Should show:
GEMINI_API_KEY=AIzaSy...
```

### Check 2: Console Errors

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for errors when generating outline/script
4. Common errors:
   - "API key not found"
   - "Rate limit exceeded"
   - Network errors

### Check 3: Network Tab

1. Open DevTools → Network tab
2. Generate outline
3. Look for API calls to Google
4. Check response contains real content

### Check 4: Restart Everything

```bash
# Stop both servers (Ctrl+C)

# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev

# Browser
# Hard refresh (Ctrl+Shift+R)
```

## 📊 Comparison

### Placeholder (OLD - Cached)
```
# Video Outline for: ${title}

## Introduction
- **Hook:** ${hook}
- Briefly introduce the book and its author.
```

### Real AI (NEW - After Cache Clear)
```
# Video Outline: The Great Gatsby

## Introduction (0:00-0:30)
- Hook: "What if the American Dream was actually a nightmare?"
- Brief introduction to F. Scott Fitzgerald and the Jazz Age
- Set the scene: Summer 1922, Long Island's North Shore
```

## ✅ Success Indicators

After fixing, you should see:

- ✅ Outline mentions specific book details
- ✅ Outline has realistic time markers
- ✅ Outline structure varies based on content
- ✅ Script has actual narration, not template
- ✅ Script includes stage directions
- ✅ Script is 500-1000 words
- ✅ Content is contextual to your book

## 🎯 Quick Test

```bash
# 1. Clear cache
Ctrl + Shift + R

# 2. Test outline
Generate Outline → Wait 5-10 seconds

# 3. Check output
If you see "${title}" or "${hook}" → Still cached
If you see actual book title and content → Fixed! ✅
```

---

**Most Common Fix**: Hard refresh browser (Ctrl+Shift+R)

**If that doesn't work**: Clear Vite cache and restart servers

**Status**: Code is correct, just needs cache clear ✅
