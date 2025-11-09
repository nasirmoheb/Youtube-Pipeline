# Quick Reference - Step 2 (Summarize)

## 🎯 What It Does

Generates a concise summary of your book content using AI, which will be used as the foundation for your video script.

## ⚡ Quick Start

```bash
# 1. Complete Step 1 first
# 2. Navigate to Step 2
# 3. Click "Generate Summary"
# 4. Wait 5-10 seconds
# 5. Summary appears
# 6. Optionally refine with chat
```

## 📊 API Endpoints

### Generate Summary
```
POST /api/summarize
Body: { projectPath: "C:\\Projects\\YouTube\\My-Video" }
```

### Refine Content
```
POST /api/refine
Body: { content: "...", instruction: "Make it shorter" }
```

## 💻 Frontend Usage

```typescript
// Generate
const response = await apiService.summarize(projectPath);
if (response.success) {
  setSummary(response.data.summary);
}

// Refine
const response = await apiService.refineContent(content, instruction);
if (response.success) {
  setSummary(response.data.refined);
}
```

## 📁 Files Created

```
Project-Folder/
├── book.txt       (from Step 1)
└── summary.txt    (from Step 2) ← NEW
```

## 🎨 UI States

| State | Display |
|-------|---------|
| Empty | "Generate Summary" button |
| Loading | Spinner + "Generating..." |
| Complete | Summary + Chat interface |
| Refining | Loading indicator in chat |

## 🧪 Quick Test

```bash
# 1. Start servers
cd backend && npm run dev
npm run dev

# 2. Complete Step 1
# 3. Go to Step 2
# 4. Generate summary
# 5. Verify file exists:
dir C:\...\Project-Folder\summary.txt
```

## 💡 Refinement Examples

```
"Make it shorter"
"Add more details about the main character"
"Focus on the key themes"
"Make it more emotional"
"Emphasize the climax"
```

## ⏱️ Performance

- Generate: 5-10 seconds
- Refine: 3-5 seconds
- Regenerate: 5-10 seconds

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Not generating | Check backend is running |
| No summary appears | Check console for errors |
| File not created | Check path permissions |
| Refinement not working | Verify /refine endpoint |

## ✅ Success Criteria

- [x] Summary generates successfully
- [x] File saved to project folder
- [x] Refinement works
- [x] UI feedback is clear
- [x] No errors in console

## 🎯 Next Step

After Step 2 is complete:
- ✅ Summary saved
- 🔄 Ready for Step 3 (Scripting)
- 🔄 Script will use this summary

---

**Status**: Integrated ✅
**Time**: 5-10 seconds per generation
**File**: summary.txt
