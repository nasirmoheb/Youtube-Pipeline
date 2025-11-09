# Quick Reference: Step 5 - Beat Generation

## 🎯 What It Does
Analyzes your video script and breaks it down into key narrative "beats" - the important moments that will drive your visual storytelling.

## 🚀 Quick Start

### 1. Prerequisites
- Complete Steps 1-3 (need script.md)
- Backend running on port 3001
- Gemini API key in `.env`

### 2. Generate Beats
```
1. Navigate to Step 5
2. Click "Generate Beats"
3. Wait 5-10 seconds
4. Beats appear in table
```

### 3. Refine (Optional)
```
1. Scroll to chat section
2. Type instruction: "Make beat 2 more dramatic"
3. Click send
4. Beats update automatically
```

## 📁 Files Created

```
{projectPath}/
├── beats.json    ← Machine-readable format
└── beats.md      ← Human-readable format
```

## 🔧 API Endpoints

### Generate Beats
```bash
POST http://localhost:3001/api/beats
Content-Type: application/json

{
  "projectPath": "C:\\Projects\\YouTube\\My-Video"
}
```

### Save Beats
```bash
POST http://localhost:3001/api/save-beats
Content-Type: application/json

{
  "projectPath": "C:\\Projects\\YouTube\\My-Video",
  "beats": [
    {
      "beat_number": "Beat 1",
      "script_phrase": "..."
    }
  ]
}
```

## 📊 Beat Structure

```typescript
interface Beat {
  beat_number: string;   // "Beat 1", "Beat 2", etc.
  script_phrase: string; // The narrative content
}
```

## 💡 Example Output

```json
[
  {
    "beat_number": "Beat 1",
    "script_phrase": "In a world where AI has transformed everything..."
  },
  {
    "beat_number": "Beat 2",
    "script_phrase": "Our hero discovers a hidden truth..."
  }
]
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Failed to generate beats" | Check script.md exists, verify API key |
| Beats too granular | Refine: "Combine beats into larger segments" |
| Beats too broad | Refine: "Break down into more detailed beats" |
| No beats appear | Check console for errors, verify backend running |

## ⚡ Performance

- **Generation:** 5-10 seconds
- **Refinement:** 3-5 seconds
- **File Size:** < 10KB

## 🎨 UI Features

- Table display with beat number and phrase
- Generate/Regenerate button
- Chat-based refinement
- Loading indicators
- Error messages

## 🔗 Integration

**Input from Step 3:**
- `script.md` - Full video script

**Output to Step 6:**
- `beats.json` - Used for storyboard generation
- Each beat gets visual prompts

## ✅ Quick Test

```bash
# 1. Generate beats
curl -X POST http://localhost:3001/api/beats \
  -H "Content-Type: application/json" \
  -d '{"projectPath":"C:\\Projects\\YouTube\\My-Video"}'

# 2. Check files
dir C:\Projects\YouTube\My-Video\beats.*

# 3. View beats.json
type C:\Projects\YouTube\My-Video\beats.json
```

## 📚 Full Documentation

- **STEP5_INTEGRATION.md** - Complete integration guide
- **TEST_STEP5.md** - 12 test cases
- **STEP5_COMPLETE.md** - Implementation summary

## 🎯 Next Step

After Step 5 → **Step 6: Storyboard Generation**
- Creates 3 visual styles from beats
- Adds image prompts, transitions, SFX
