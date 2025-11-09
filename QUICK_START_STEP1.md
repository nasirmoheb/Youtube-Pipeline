# Quick Start - Step 1 Enhanced Features

## 🚀 What's New

✅ **Video Title Folders** - Each project gets its own folder
✅ **PDF Support** - Upload and extract text from PDFs automatically

## 📦 Installation

```bash
# Install dependencies
npm install
cd backend && npm install && cd ..
```

## ▶️ Run

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev
```

## 🎯 Usage

### Step-by-Step

1. **Open** http://localhost:3000

2. **Enter Video Title**
   ```
   Example: "Introduction to Machine Learning"
   ```

3. **Enter Project Path**
   ```
   Example: C:\Projects\YouTube-Pipeline
   ```
   
   💡 A folder named "Introduction-to-Machine-Learning" will be created here

4. **Upload File**
   - Click "Upload a file"
   - Choose `.txt` or `.pdf`
   - Wait for extraction (if PDF)
   - See character count

5. **Create Project**
   - Click "Create Project Directory"
   - See success message
   - Folder created! ✅

## 📁 Result

```
C:\Projects\YouTube-Pipeline\
└── Introduction-to-Machine-Learning\
    └── book.txt (your content)
```

## 🎨 Features

| Feature | Description |
|---------|-------------|
| 📝 Text Files | Instant loading |
| 📄 PDF Files | Auto text extraction |
| 📊 Character Count | Shows after upload |
| ⏳ Loading Spinner | During PDF extraction |
| ✅ Success Messages | Green feedback |
| ❌ Error Messages | Red feedback |
| 🔒 Path Sanitization | Safe folder names |

## 🧪 Quick Test

```bash
# 1. Start servers (see above)

# 2. Test with text file
- Title: "Test Text"
- Path: C:\Temp
- Upload: any .txt file
- Result: C:\Temp\Test-Text\book.txt

# 3. Test with PDF
- Title: "Test PDF"
- Path: C:\Temp
- Upload: any .pdf file
- Wait for extraction
- Result: C:\Temp\Test-PDF\book.txt
```

## ⚡ Tips

- **Special Characters**: Automatically replaced with `-`
  - `"My Video: Part 1"` → `"My-Video--Part-1"`

- **File Size**: Keep under 10MB for best performance

- **PDF Quality**: Works best with text-based PDFs (not scanned images)

- **Path Format**: Use absolute paths
  - ✅ `C:\Projects\YouTube`
  - ❌ `.\Projects\YouTube`

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| PDF extraction fails | Use text-based PDF, not scanned image |
| Folder not created | Check backend is running, verify path permissions |
| Button disabled | Fill in all fields (title, path, upload file) |
| Backend error | Check backend console, verify .env file |

## 📝 File Formats

### Supported
- ✅ `.txt` - Plain text
- ✅ `.pdf` - PDF documents

### Not Supported (Yet)
- ❌ `.docx` - Word documents
- ❌ `.epub` - E-books
- ❌ `.html` - Web pages

## 🎯 Next Steps

After Step 1:
1. ✅ Project folder created
2. ✅ Book content saved
3. 🔄 Ready for Step 2 (Summarize)
4. 🔄 All files will save to same folder

## 📚 More Info

- `STEP1_UPDATES.md` - Detailed features
- `TEST_STEP1.md` - Full testing guide
- `IMPLEMENTATION_COMPLETE.md` - Technical details

---

**Status**: Ready to Use ✅
**Version**: 1.1.0 with PDF support
