# Step 9 - Save Image Debugging Guide

## Issue: Images Not Saving When Clicking Next

### Added Comprehensive Logging

Both frontend and backend now have detailed logging to help identify the issue.

## How to Debug

### 1. Open Browser Console
- Press `F12` in your browser
- Go to the "Console" tab
- Keep it open while using Step 9

### 2. Test the Save Flow

**Steps to test**:
1. Navigate to Step 9
2. Click on an image to select it
3. Click the "Next" button
4. Watch the console output

### 3. Expected Console Output

#### Frontend Console (Browser)

When you click an image:
```
🔵 handleImageSelection called: { beatNumber: "Beat 1", style: "clear", isFlagged: false, projectPath: "..." }
```

When you click Next:
```
⏭️ Next button clicked
Current beat: Beat 1
Current selection: { style: "clear", isFlagged: false }
💾 Auto-saving before navigation...
🔵 handleImageSelection called: { beatNumber: "Beat 1", style: "clear", isFlagged: false, projectPath: "..." }
📤 Sending save request: { projectPath: "...", beatNumber: "Beat 1", style: "clear", isFlagged: false }
📥 Response status: 200
✅ Save successful: { success: true, message: "Image selection saved" }
✅ Auto-save complete
📍 Navigating to next beat
```

#### Backend Console (Terminal)

When save request is received:
```
========================================
SAVE IMAGE SELECTION - Request received
Request body: { projectPath: '...', beatNumber: 'Beat 1', style: 'clear', isFlagged: false }
Selected images directory: C:\...\selected_images
Beat number: "Beat 1" → cleaned: "1"
Source directory: C:\...\generated_images\clear
Shot directories found: [ 'Shot_1' ]
Looking for: C:\...\generated_images\clear\Shot_1\Beat_1.png
✓ Source file found: C:\...\generated_images\clear\Shot_1\Beat_1.png
Copying to: C:\...\selected_images\Beat_1.png
✓ File copied successfully
✓ Metadata saved
========================================
```

## Common Issues and Solutions

### Issue 1: No Console Output When Clicking Next

**Symptom**: Nothing appears in console when clicking Next

**Possible Causes**:
- No image is selected
- Selection state not updated

**Solution**:
1. Make sure you click on an image first (blue border should appear)
2. Check console for: `Current selection: { style: "...", isFlagged: ... }`
3. If it shows `Current selection: undefined`, the selection didn't register

### Issue 2: "No selection to save" Message

**Symptom**: Console shows `⚠️ No selection to save`

**Cause**: You clicked Next without selecting an image

**Solution**:
1. Click on one of the three images first
2. Blue border should appear around selected image
3. Then click Next

### Issue 3: Request Sent But Backend Error

**Symptom**: Frontend shows request sent, but backend shows error

**Check Backend Console For**:
- `Source image not found!` → Image file doesn't exist
- `Missing required fields!` → Request data incomplete
- Other errors → Check error message

**Solutions**:

**If "Source image not found"**:
```
Backend will show:
Available files in shot directories:
  Shot_1: [ 'Beat_1.png', 'Beat_2.png', ... ]
```
- Check if the beat number matches the filename
- Verify images were generated in Step 8

**If "Missing required fields"**:
- Check that `projectPath` is set correctly
- Verify beat number is not empty

### Issue 4: Backend Not Receiving Request

**Symptom**: Frontend shows request sent, but backend shows nothing

**Possible Causes**:
1. Backend server not running
2. Wrong port (should be 3001)
3. CORS issues

**Solutions**:
1. Check backend is running: `http://localhost:3001`
2. Restart backend server
3. Check for CORS errors in browser console

### Issue 5: File Not Appearing in selected_images Folder

**Symptom**: Backend says success, but file not in folder

**Check**:
1. Backend console shows: `✓ File copied successfully`
2. Check the path shown in: `Copying to: ...`
3. Manually navigate to that folder

**Possible Issues**:
- Wrong project path
- Permission issues
- File system delay (refresh folder)

## Manual Testing

### Test 1: Check Backend Endpoint Directly

Open a new terminal and run:
```bash
curl -X POST http://localhost:3001/api/save-image-selection ^
  -H "Content-Type: application/json" ^
  -d "{\"projectPath\":\"YOUR_PROJECT_PATH\",\"beatNumber\":\"Beat 1\",\"style\":\"clear\",\"isFlagged\":false}"
```

Replace `YOUR_PROJECT_PATH` with your actual project path.

**Expected**: Backend should log the save process and create the file.

### Test 2: Check File Permissions

Make sure you have write permissions to the project directory:
```bash
# Windows
icacls "YOUR_PROJECT_PATH"
```

### Test 3: Check Generated Images Exist

Navigate to:
```
YOUR_PROJECT_PATH/generated_images/clear/Shot_1/
```

Verify files like `Beat_1.png`, `Beat_2.png` exist.

## Quick Checklist

Before reporting an issue, verify:

- [ ] Backend server is running on port 3001
- [ ] Browser console is open (F12)
- [ ] You clicked on an image (blue border visible)
- [ ] You clicked the Next button
- [ ] Check browser console for logs starting with 🔵, 📤, 📥
- [ ] Check backend terminal for logs starting with "SAVE IMAGE SELECTION"
- [ ] Generated images exist in `generated_images/` folder
- [ ] Project path is correct

## What to Report

If the issue persists, provide:

1. **Frontend Console Output**: Copy all logs from browser console
2. **Backend Console Output**: Copy all logs from terminal
3. **File Structure**: 
   - Does `generated_images/clear/Shot_1/Beat_1.png` exist?
   - Does `selected_images/` folder exist?
4. **Steps Taken**: Exactly what you clicked
5. **Beat Number**: What beat were you on?
6. **Selected Style**: Which image did you select?

## Expected File Structure After Save

```
YOUR_PROJECT_PATH/
├── generated_images/
│   ├── clear/
│   │   └── Shot_1/
│   │       ├── Beat_1.png      ← Source
│   │       └── Beat_2.png
│   ├── illustration/
│   └── consistent/
├── selected_images/              ← Created by save
│   ├── Beat_1.png               ← Copied here
│   └── Beat_2_flagged.png
└── image_selections.json         ← Metadata
```

## Next Steps

1. **Test Now**: 
   - Restart backend server
   - Refresh browser
   - Open console (F12)
   - Try selecting and clicking Next
   - Watch the logs

2. **Share Logs**: If it still doesn't work, copy the console output and share it

3. **Check Files**: After clicking Next, check if file appears in `selected_images/` folder

---

**Status**: Debugging tools added
**Date**: November 10, 2025
