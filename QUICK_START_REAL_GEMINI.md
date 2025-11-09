# Quick Start - Real Gemini API

## 🚀 Setup (2 minutes)

### 1. Get API Key
```
Visit: https://aistudio.google.com/app/apikey
Create project → Generate API key → Copy
```

### 2. Configure
```bash
# Create .env in root directory
echo GEMINI_API_KEY=your_actual_key_here > .env
```

### 3. Start
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
npm run dev
```

## ⚡ Usage

### Generate Summary
```
1. Complete Step 1 (upload book)
2. Go to Step 2
3. Click "Generate Summary"
4. Wait 5-10 seconds
5. Real AI summary appears!
```

### Refine Summary
```
1. Type: "Make it shorter"
2. Click "Send"
3. Wait 3-5 seconds
4. Updated summary appears!
```

## 📁 Files

```
Project-Folder/
├── book.txt       (Step 1)
└── summary.txt    (Step 2) ← Real AI content
```

## 🎯 What's Different

| Before | After |
|--------|-------|
| Placeholder text | Real AI content |
| Static response | Contextual summary |
| Instant | 5-10 seconds |
| Generic | Book-specific |

## ✅ Verify It's Working

**Check 1: Real Content**
- Summary mentions actual characters
- Summary describes actual plot
- Summary captures actual themes

**Check 2: File Saved**
```bash
# Windows
type C:\...\Project-Folder\summary.txt

# Linux/Mac
cat /path/to/project/summary.txt
```

**Check 3: Quality**
- Well-written prose
- Relevant to book
- Appropriate length
- No placeholder text

## 🐛 Quick Fixes

**"API key not found"**
```bash
# Check .env exists
dir .env  # Windows
ls .env   # Linux/Mac

# Verify content
type .env  # Windows
cat .env   # Linux/Mac

# Should show:
GEMINI_API_KEY=AIzaSy...
```

**"Rate limit exceeded"**
```
Wait 5 minutes, then try again
Check quota: https://aistudio.google.com
```

**"Poor quality summary"**
```
1. Ensure book content is complete
2. Try regenerating
3. Use refinement to improve
```

## 📊 Performance

- Generate: 5-10 seconds
- Refine: 3-5 seconds
- Save: < 100ms

## 🔐 Security

```bash
# Add to .gitignore
echo .env >> .gitignore

# Never commit
git add .env  # ❌ DON'T DO THIS
```

## 🎯 Next

After Step 2:
- ✅ Real AI summary generated
- ✅ Saved to summary.txt
- 🔄 Ready for Step 3

---

**Status**: Real Gemini API ✅
**Model**: gemini-2.0-flash-exp
**Quality**: Real AI content
