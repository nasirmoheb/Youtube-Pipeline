# Quick Reference - Step 3 (Scripting)

## 🎯 Three-Stage Process

```
1. Hooks → Select one
2. Outline → Review
3. Script → Auto-saved
```

## ⚡ Quick Start

```bash
# 1. Complete Steps 1 & 2
# 2. Navigate to Step 3
# 3. Generate Hooks (3-5s)
# 4. Select one hook
# 5. Generate Outline (5-10s)
# 6. Generate Script (10-15s)
# 7. Done! Script saved to script.md
```

## 📊 API Endpoint

```
POST /api/save-script
Body: { projectPath, script }
```

## 💻 Frontend Usage

```typescript
// Generate hooks
const hooks = await geminiService.generateHooks(summary, title);

// Generate outline
const outline = await geminiService.generateOutline(summary, title, hook);

// Generate script
const script = await geminiService.generateFullScript(outline, hook);

// Save script
await apiService.saveScript(projectPath, script);
```

## 📁 Files Created

```
Project-Folder/
├── book.txt       (Step 1)
├── summary.txt    (Step 2)
└── script.md      (Step 3) ← NEW
```

## ⏱️ Performance

- Hooks: 3-5 seconds
- Outline: 5-10 seconds
- Script: 10-15 seconds
- Refine: 5-10 seconds

## 🎨 Output Examples

**Hooks:**
```
1. "What if the American Dream was a nightmare?"
2. "One man's obsession changed everything."
3. "Behind every fortune lies a secret."
```

**Outline:**
```markdown
# Video Outline
## Introduction (0:00-0:30)
## Part 1: Setup (0:30-2:00)
## Part 2: Rising Action (2:00-4:00)
## Part 3: Climax (4:00-5:30)
## Conclusion (5:30-6:00)
```

**Script:**
```markdown
# Full Video Script

*[Music fades in]*

**NARRATOR:** What if the American Dream...

[Complete narration with stage directions]
```

## 💡 Refinement Tips

```
"Make the intro more dramatic"
"Add more emotion to the climax"
"Shorten the conclusion"
"Include more specific details"
```

## 🐛 Quick Fixes

**Hooks not generating:**
```
1. Check API key
2. Verify Step 2 complete
3. Check console
```

**Script not saved:**
```
1. Check backend running
2. Verify project path
3. Check permissions
```

## ✅ Quality Check

- [ ] Hooks are engaging
- [ ] Outline is structured
- [ ] Script is complete
- [ ] File saved: script.md

## 🎯 Next Step

After Step 3:
- ✅ Script saved
- 🔄 Ready for Step 4 (Voiceover)

---

**Status**: Integrated ✅
**Model**: gemini-2.0-flash-exp
**File**: script.md
