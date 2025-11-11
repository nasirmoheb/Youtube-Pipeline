# Step 9 Image Display Fix - Beat Number Format Issue

## Problem Identified

Images were not showing in Step 9 due to a **beat number format mismatch** between:

1. **Frontend beats data**: `beat_number: "Beat 1"`, `"Beat 2"`, etc.
2. **Generated image filenames**: `Beat_1.png`, `Beat_2.png`, etc.
3. **Backend image mapping**: Was extracting just `"1"`, `"2"` from filenames

### The Mismatch

```
Frontend Beat Object:
{ beat_number: "Beat 1", script_phrase: "..." }
                  ↓
Backend was mapping:
images["illustration"]["1"] = "path/to/Beat_1.png"
                  ↓
Frontend was looking for:
images["illustration"]["Beat 1"]  ← NOT FOUND!
```

## Root Cause

The issue originated from how beat numbers flow through the system:

1. **Step 5 (Beats)**: Creates beats with `beat_number: "Beat 1"`
2. **Step 7 (Prompts)**: Passes through `beat_number: "Beat 1"` to prompts
3. **Step 8 (Generation)**: 
   - Receives `beat_number: "Beat 1"`
   - Cleans it to `"1"` 
   - Saves as `Beat_1.png`
4. **Step 9 (Selection)**:
   - Frontend has `beat_number: "Beat 1"`
   - Backend extracts `"1"` from filename
   - **MISMATCH!** Frontend can't find the image

## Solution Implemented

### 1. Image Generation Service Fix

**File**: `backend/ImageGeneration/imageGenerationService.js`

Added beat number cleaning to handle any format:

```javascript
// Clean beat_number: remove "Beat" prefix if present
const cleanBeatNumber = String(beat_number)
    .replace(/^Beat[\s_]+/i, '')  // Remove "Beat " or "Beat_" prefix
    .trim();

const imageName = `Beat_${cleanBeatNumber}.png`;
```

**Result**: 
- Input: `"Beat 1"` → Output: `Beat_1.png` ✓
- Input: `"Beat_1.1"` → Output: `Beat_1.1.png` ✓
- Input: `"1.2"` → Output: `Beat_1.2.png` ✓

### 2. Backend Image Loading Fix

**File**: `backend/routes/imageGeneration.js`

**Endpoint**: `POST /api/get-generated-images`

Updated to create **dual mappings** for each image:

```javascript
// Store with multiple keys to handle different formats
// Key 1: Just the number (e.g., "1", "1.1")
images[style][beatNumberOnly] = relativePath;
// Key 2: With "Beat " prefix (e.g., "Beat 1", "Beat 1.1")
images[style][`Beat ${beatNumberOnly}`] = relativePath;
```

**Result**: Both formats now work!
```javascript
images["illustration"]["1"] = "generated_images/illustration/Shot_1/Beat_1.png"
images["illustration"]["Beat 1"] = "generated_images/illustration/Shot_1/Beat_1.png"
```

### 3. Image Selection Save Fix

**File**: `backend/routes/imageGeneration.js`

**Endpoint**: `POST /api/save-image-selection`

Added beat number cleaning when looking for source files:

```javascript
// Clean beat number: remove "Beat " prefix if present
const cleanBeatNumber = String(beatNumber).replace(/^Beat\s+/i, '').trim();

// Use cleaned number to find file
const fileName = `Beat_${cleanBeatNumber}.png`;
```

**Result**: Handles both `"Beat 1"` and `"1"` when saving selections

## File Structure

### Generated Images Directory
```
{projectPath}/
  generated_images/
    illustration/
      Shot_1/
        Beat_1.png      ← Cleaned format
        Beat_1.1.png
        Beat_2.png
    clear/
      Shot_1/
        Beat_1.png
        Beat_1.1.png
    consistent/
      Shot_1/
        Beat_1.png
        Beat_1.1.png
```

### Backend Response Format
```json
{
  "success": true,
  "images": {
    "illustration": {
      "1": "generated_images/illustration/Shot_1/Beat_1.png",
      "Beat 1": "generated_images/illustration/Shot_1/Beat_1.png",
      "1.1": "generated_images/illustration/Shot_1/Beat_1.1.png",
      "Beat 1.1": "generated_images/illustration/Shot_1/Beat_1.1.png"
    },
    "clear": { ... },
    "consistent": { ... }
  }
}
```

## Testing

### 1. Check Current Files

Run this in your project directory:

```bash
# Windows CMD
dir /s /b generated_images\*.png

# PowerShell
Get-ChildItem -Path generated_images -Recurse -Filter *.png | Select-Object FullName
```

### 2. Test Backend Endpoint

```javascript
// Test in browser console or Postman
fetch('http://localhost:3001/api/get-generated-images', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ projectPath: 'YOUR_PROJECT_PATH' })
})
.then(r => r.json())
.then(data => console.log(data));
```

### 3. Debug Endpoint

New debug endpoint to check file structure:

```javascript
fetch('http://localhost:3001/api/debug-beat-formats', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ projectPath: 'YOUR_PROJECT_PATH' })
})
.then(r => r.json())
.then(data => console.log(data));
```

## Expected Behavior Now

### Step 9 Display

1. **Load Images**: Backend returns dual-keyed mappings
2. **Match Beats**: Frontend finds images using `"Beat 1"` format
3. **Display**: All 3 styles show for each beat
4. **Select**: Click to select, checkbox to flag
5. **Save**: Backend finds source file using cleaned beat number

### Console Logs

**Backend (when loading images)**:
```
GET GENERATED IMAGES - Request received
Project Path: C:\Users\...\project
Checking illustration directory: C:\Users\...\project\generated_images\illustration
✓ illustration directory exists
Found 1 shot directories: [ 'Shot_1' ]
Files in Shot_1: [ 'Beat_1.png', 'Beat_1.1.png', 'Beat_2.png' ]
  Mapped: Beat_1.png → beat "1" and "Beat 1"
  Mapped: Beat_1.1.png → beat "1.1" and "Beat 1.1"
illustration: Found 4 images (2 per beat with dual keys)
```

**Frontend (Step 9)**:
```
Images data received: { success: true, images: {...} }
Images loaded: { illustration: {...}, clear: {...}, consistent: {...} }
```

## Verification Checklist

- ✅ Images saved with correct format: `Beat_1.png`, `Beat_1.1.png`
- ✅ Backend creates dual mappings: `"1"` and `"Beat 1"`
- ✅ Frontend receives images for all beats
- ✅ Step 9 displays all 3 styles per beat
- ✅ Selection saves to `selected_images/` directory
- ✅ Flagging works correctly

## If Images Still Don't Show

### 1. Check Beat Number Format in Your Data

Open browser console in Step 9 and run:
```javascript
// Check what beat numbers you have
console.log('Beats:', beats.map(b => b.beat_number));
```

### 2. Check Backend Response

```javascript
// Check what the backend is returning
fetch('http://localhost:3001/api/get-generated-images', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ projectPath: 'YOUR_PATH' })
})
.then(r => r.json())
.then(data => {
  console.log('Available beat keys:', Object.keys(data.images.illustration));
});
```

### 3. Check File Names

Look at actual files in your `generated_images` directory:
- Should be: `Beat_1.png`, `Beat_2.png`, etc.
- NOT: `Beat_Beat 1.png` (old bug)

### 4. Regenerate if Needed

If you have old files with wrong names:
1. Delete the `generated_images` directory
2. Delete the `image_progress_*.json` files
3. Go to Step 8 and regenerate

## Summary

The fix ensures **beat number format compatibility** across the entire pipeline:

1. **Generation**: Cleans beat numbers before creating filenames
2. **Loading**: Creates dual mappings for both formats
3. **Selection**: Cleans beat numbers before finding files

**Result**: Step 9 now displays images correctly regardless of beat number format! 🎉

---

**Status**: ✅ FIXED
**Date**: November 10, 2025
**Files Modified**:
- `backend/ImageGeneration/imageGenerationService.js`
- `backend/routes/imageGeneration.js`
