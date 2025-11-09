# Testing Step 1 - Quick Guide

## Prerequisites

1. Backend server running on port 3001
2. Frontend server running on port 3000
3. A test PDF or text file ready

## Test Checklist

### ✅ Test 1: Text File Upload

1. Open http://localhost:3000
2. Enter Video Title: `Test Text Upload`
3. Enter Project Path: `C:\Temp\YouTube-Test`
4. Click "Upload a file"
5. Select a `.txt` file
6. **Expected**: Character count appears immediately
7. Click "Create Project Directory"
8. **Expected**: Success message with path
9. **Verify**: Folder exists at `C:\Temp\YouTube-Test\Test-Text-Upload\`
10. **Verify**: File `book.txt` contains the text content

### ✅ Test 2: PDF File Upload

1. Refresh the page
2. Enter Video Title: `Test PDF Upload`
3. Enter Project Path: `C:\Temp\YouTube-Test`
4. Click "Upload a file"
5. Select a `.pdf` file
6. **Expected**: Spinner appears with "Extracting text from PDF..."
7. **Expected**: After extraction, character count appears
8. Click "Create Project Directory"
9. **Expected**: Success message with path
10. **Verify**: Folder exists at `C:\Temp\YouTube-Test\Test-PDF-Upload\`
11. **Verify**: File `book.txt` contains extracted text

### ✅ Test 3: Special Characters in Title

1. Refresh the page
2. Enter Video Title: `My Video: Part 1/2 (Intro)`
3. Enter Project Path: `C:\Temp\YouTube-Test`
4. Upload any file
5. Click "Create Project Directory"
6. **Expected**: Success message
7. **Verify**: Folder name has sanitized characters: `My-Video--Part-1-2-(Intro)`

### ✅ Test 4: Error Handling - No File

1. Refresh the page
2. Enter Video Title: `Test No File`
3. Enter Project Path: `C:\Temp\YouTube-Test`
4. Click "Create Project Directory" (without uploading file)
5. **Expected**: Error message "Please upload a book file first"

### ✅ Test 5: Error Handling - No Title

1. Refresh the page
2. Leave Video Title empty
3. Enter Project Path: `C:\Temp\YouTube-Test`
4. Upload a file
5. **Expected**: Button is disabled

### ✅ Test 6: Error Handling - No Path

1. Refresh the page
2. Enter Video Title: `Test No Path`
3. Leave Project Path empty
4. Upload a file
5. **Expected**: Button is disabled

### ✅ Test 7: Backend Connection Error

1. Stop the backend server
2. Refresh the page
3. Enter all required fields
4. Upload a file
5. Click "Create Project Directory"
6. **Expected**: Error message "Failed to connect to backend. Is the server running?"

### ✅ Test 8: Large PDF

1. Find a large PDF (> 20 pages)
2. Enter Video Title: `Test Large PDF`
3. Enter Project Path: `C:\Temp\YouTube-Test`
4. Upload the large PDF
5. **Expected**: Extraction takes several seconds
6. **Expected**: Character count shows large number
7. Create project
8. **Verify**: All text was extracted

### ✅ Test 9: Invalid PDF

1. Rename a `.txt` file to `.pdf`
2. Try to upload it
3. **Expected**: Error message about invalid PDF

### ✅ Test 10: Path Display

1. Enter Video Title: `My Awesome Video`
2. Enter Project Path: `C:\Projects`
3. **Expected**: Helper text shows "A folder named 'My Awesome Video' will be created inside this directory"
4. Change title to `Another Video`
5. **Expected**: Helper text updates to show "Another Video"

## Quick Commands

### Start Backend
```bash
cd backend
npm install  # First time only
npm run dev
```

### Start Frontend
```bash
npm install  # First time only
npm run dev
```

### Clean Test Folders
```bash
# Windows
rmdir /s /q C:\Temp\YouTube-Test

# Linux/Mac
rm -rf /tmp/YouTube-Test
```

## Expected Results Summary

| Test | Expected Behavior |
|------|-------------------|
| Text upload | Instant load, character count shown |
| PDF upload | Spinner → extraction → character count |
| Special chars | Sanitized in folder name |
| No file | Error message, button disabled |
| No title | Button disabled |
| No path | Button disabled |
| Backend down | Connection error message |
| Large PDF | Takes time but works |
| Invalid PDF | Error message |
| Path display | Dynamic helper text |

## Common Issues

### PDF extraction fails
- **Cause**: PDF has no selectable text (scanned image)
- **Solution**: Use a PDF with actual text content

### Folder not created
- **Cause**: Backend not running or path permissions
- **Solution**: Check backend console, verify path permissions

### Character count shows 0
- **Cause**: Empty file or extraction failed
- **Solution**: Check file content, try different file

### Button stays disabled
- **Cause**: Missing required field
- **Solution**: Fill in all fields (title, path, file)

## Success Criteria

All tests should pass with:
- ✅ No console errors
- ✅ Folders created correctly
- ✅ Files saved with correct content
- ✅ Error messages displayed appropriately
- ✅ UI feedback is clear and helpful

## Performance Benchmarks

| File Type | Size | Expected Time |
|-----------|------|---------------|
| Text | < 1 MB | Instant |
| PDF | 5 pages | 1-2 seconds |
| PDF | 20 pages | 3-5 seconds |
| PDF | 50 pages | 5-10 seconds |

## Next Steps After Testing

Once all tests pass:
1. ✅ Step 1 is fully functional
2. 🔄 Ready to integrate Step 2 (Summarize)
3. 🔄 Use the same project folder for all subsequent steps

---

**Testing Status**: Ready for testing ✅

**Last Updated**: After PDF support and folder creation implementation
