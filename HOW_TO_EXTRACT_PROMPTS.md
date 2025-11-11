# How to Extract and Format Prompts

## 📋 Overview

This guide shows you how to extract prompts from your project directory and format them as a clean JavaScript array.

---

## 🚀 Quick Usage

### Extract Prompts from Project

```bash
node backend/utils/extractPrompts.js "YOUR_PROJECT_PATH" illustration
```

**Example**:
```bash
node backend/utils/extractPrompts.js "D:\Projects\Youtube-Pipeline\projects\my-project" illustration
```

### Available Styles

- `illustration`
- `clear`
- `consistent`

---

## 📊 What It Does

### Input File

Your prompts file at:
```
{projectPath}/prompts/prompts-illustration.js
```

### Output

1. **Console Output** - Formatted JavaScript array
2. **File Output** - Saved to `prompts-illustration-formatted.js`

### Format

```javascript
const prompts = [
  {
    "shot_number": 1,
    "beat_number": "1.1",
    "script_phrase": "Do you ever feel like you have to choose between making money and being a good person?",
    "transition_type": "H",
    "ai_prompt": "Minimalist black stick figure with a circle head, on a clean white background, standing centered, looking confused with a question mark above its head, simple clean line art style"
  },
  {
    "shot_number": 1,
    "beat_number": "1.2",
    "script_phrase": "Next phrase...",
    "transition_type": "C",
    "ai_prompt": "..."
  }
  // ... more prompts
];

export default prompts;
```

---

## 🎯 Use Cases

### 1. View Prompts in Clean Format

```bash
node backend/utils/extractPrompts.js "YOUR_PROJECT_PATH" illustration
```

### 2. Copy Prompts to Another File

The formatted output is saved to:
```
{projectPath}/prompts/prompts-illustration-formatted.js
```

You can copy this file or its contents anywhere.

### 3. Verify Prompts Are Correct

The script shows:
- Number of prompts loaded
- Sample of first prompt
- Any errors in parsing

---

## 📝 Example Output

```
Reading prompts from: D:\Projects\Youtube-Pipeline\projects\my-project\prompts\prompts-illustration.js

✓ Successfully extracted 30 prompts for illustration

================================================================================
FORMATTED PROMPTS:
================================================================================
const prompts = [
  {
    "shot_number": 1,
    "beat_number": "1.1",
    "script_phrase": "Do you ever feel like...",
    "transition_type": "H",
    "ai_prompt": "Minimalist black stick figure..."
  },
  // ... 29 more prompts
];

export default prompts;
================================================================================

✓ Saved formatted prompts to: D:\Projects\...\prompts\prompts-illustration-formatted.js
```

---

## 🔧 Troubleshooting

### Error: Prompts file not found

**Cause**: Project path is incorrect or prompts haven't been generated

**Solution**:
1. Check project path is correct
2. Go to Step 7 in UI and generate prompts
3. Verify files exist:
   ```bash
   dir "{projectPath}\prompts\prompts-illustration.js"
   ```

### Error: Could not find prompts array

**Cause**: File format is not recognized

**Solution**: The file should contain one of these patterns:
- `export default [...]`
- `const prompts = [...]; export default prompts;`
- `export const prompts = [...]`

### Error: Syntax error in prompts

**Cause**: Prompts file has invalid JavaScript

**Solution**: Check the prompts file for syntax errors

---

## 🎨 Prompt Format

Each prompt object should have:

```javascript
{
  "shot_number": 1,           // Number: Which shot this belongs to
  "beat_number": "1.1",       // String: Beat identifier (can be "1.1", "1.2", etc.)
  "script_phrase": "...",     // String: The script text for this beat
  "transition_type": "H",     // String: "H" for Hard Cut, "C" for Continuous
  "ai_prompt": "..."          // String: The prompt for image generation
}
```

### Transition Types

- **"H" (Hard Cut)**: New scene, uses style reference image
- **"C" (Continuous)**: Continues from previous image

---

## 💡 Pro Tips

### Tip 1: Extract All Styles at Once

```bash
node backend/utils/extractPrompts.js "YOUR_PROJECT_PATH" illustration
node backend/utils/extractPrompts.js "YOUR_PROJECT_PATH" clear
node backend/utils/extractPrompts.js "YOUR_PROJECT_PATH" consistent
```

### Tip 2: Redirect Output to File

```bash
node backend/utils/extractPrompts.js "YOUR_PROJECT_PATH" illustration > my-prompts.txt
```

### Tip 3: Count Prompts

```bash
node backend/utils/extractPrompts.js "YOUR_PROJECT_PATH" illustration | grep "Successfully extracted"
```

---

## 🔍 Verify Prompts Are Loaded Correctly

When you run image generation, the backend will now show:

```
Loading prompts from project directory...
Looking for prompts file: D:\Projects\...\prompts\prompts-illustration.js
File content length: 15234 characters
Matched pattern: export default [...]
✓ Loaded 30 prompts for illustration
Sample prompt: {
  "shot_number": 1,
  "beat_number": "1.1",
  "script_phrase": "...",
  "transition_type": "H",
  "ai_prompt": "..."
}
```

This confirms:
- ✅ File was found
- ✅ Pattern was matched
- ✅ Prompts were parsed
- ✅ Format is correct

---

## 📚 Related Files

- **Extract Script**: `backend/utils/extractPrompts.js`
- **Route Handler**: `backend/routes/imageGeneration.js`
- **Service**: `backend/ImageGeneration/imageGenerationService.js`

---

## ✅ Summary

**To extract prompts**:
```bash
node backend/utils/extractPrompts.js "YOUR_PROJECT_PATH" illustration
```

**Output**:
- Console: Formatted JavaScript array
- File: `{projectPath}/prompts/prompts-illustration-formatted.js`

**Use for**:
- Viewing prompts in clean format
- Copying prompts to other files
- Verifying prompts are correct
- Debugging prompt issues

---

**Happy prompt extracting!** 📝✨
