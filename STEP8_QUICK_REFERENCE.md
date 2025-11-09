# Step 8 Image Generation - Quick Reference Card

## 🚀 Quick Start (3 Steps)

### 1. Configure API Keys
```javascript
// Edit: backend/ImageGeneration/imageGenerationService.js
const API_KEYS = {
  illustration: ["YOUR_KEY_1", "YOUR_KEY_2"],
  clear: ["YOUR_KEY_3", "YOUR_KEY_4"],
  consistent: ["YOUR_KEY_5", "YOUR_KEY_6"]
};
```

### 2. Start Backend
```bash
cd backend && npm start
```

### 3. Generate Images
Navigate to Step 8 → Click "Generate All Images"

---

## 📊 Status Indicators

| Symbol | Meaning |
|--------|---------|
| ◦ | Pending - Not started yet |
| ⟳ | Generating - In progress |
| ✓ | Complete - Successfully generated |
| ✓ | Exists - Already existed, skipped |
| ✗ | Error - Generation failed |

---

## 📁 File Locations

### Configuration
```
backend/ImageGeneration/imageGenerationService.js  ← API keys here
backend/ImageGeneration/style_reference.png        ← Style reference
```

### Output
```
{projectPath}/generated_images/
  illustration/Shot_X/Beat_X.X.png
  clear/Shot_X/Beat_X.X.png
  consistent/Shot_X/Beat_X.X.png
```

### Progress
```
{projectPath}/image_progress_illustration.json
{projectPath}/image_progress_clear.json
{projectPath}/image_progress_consistent.json
```

---

## 🔧 Common Commands

### Start Backend
```bash
cd backend
npm start
```

### Check Status
```bash
curl http://localhost:3001/api/generation-status/YOUR_PROJECT_PATH
```

### View Progress
```bash
cat {projectPath}/image_progress_illustration.json
```

### Check Output
```bash
ls {projectPath}/generated_images/illustration/Shot_1/
```

---

## 🐛 Troubleshooting

### Generation Not Starting
```bash
# 1. Check backend is running
curl http://localhost:3001/api/generation-status/test

# 2. Check API keys are configured
# 3. Check browser console for errors
```

### Rate Limit Errors
- Add more API keys per style
- Reduce REQUESTS_PER_MINUTE in service file
- Wait a few minutes before retrying

### Missing Images
```bash
# Check output directory
ls {projectPath}/generated_images/

# Check progress files
cat {projectPath}/image_progress_*.json

# Check backend logs
```

---

## ⚙️ Configuration Options

### Rate Limiting
```javascript
// In imageGenerationService.js
const REQUESTS_PER_MINUTE = 9; // Adjust as needed
```

### API Keys
```javascript
// Add more keys for better throughput
const API_KEYS = {
  illustration: ["key1", "key2", "key3"], // More = faster
  clear: ["key4", "key5", "key6"],
  consistent: ["key7", "key8", "key9"]
};
```

---

## 📈 Performance

### Typical Times (30 beats)
- **Per style**: 5-10 minutes
- **All 3 styles**: 5-10 minutes (concurrent)
- **Total images**: 90 (30 beats × 3 styles)

### Throughput
- **Sequential (old)**: ~4 images/minute
- **Concurrent (new)**: ~12 images/minute
- **Improvement**: 3x faster

---

## 🔄 Resumption

### How It Works
1. Progress saved after each image
2. Click "Generate All Images" again
3. System detects completed images
4. Resumes from last completed beat

### No Manual Steps Required
Just click the button again!

---

## 🎯 API Endpoints

### Generate Images
```
POST http://localhost:3001/api/generate-images
Body: { projectPath, promptsByStyle }
Response: SSE stream with progress
```

### Check Status
```
GET http://localhost:3001/api/generation-status/:projectPath
Response: { success: true, isGenerating: false }
```

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| STEP8_README.md | Main overview |
| STEP8_QUICK_START.md | Setup guide |
| STEP8_QUICK_REFERENCE.md | This card |
| STEP8_DEPLOYMENT_CHECKLIST.md | Deployment |
| STEP8_ARCHITECTURE_DIAGRAM.md | Diagrams |

---

## 💡 Pro Tips

✅ Use different API keys for each style  
✅ Don't close browser during generation  
✅ Backend continues even if browser closes  
✅ Check progress files for status  
✅ Delete specific images to regenerate them  
✅ Monitor backend logs for issues  

---

## 🎨 Style Reference

### Location
```
backend/ImageGeneration/style_reference.png
```

### Usage
- Applied to hard cut transitions (transition_type: 'H')
- Maintains consistent visual style
- Optional but recommended

### Format
- PNG format
- Recommended size: 1024x1024

---

## 🔐 Security

✅ API keys stored in backend only  
✅ Not exposed to frontend  
✅ Consider using environment variables  
✅ Proper file system permissions  

---

## 📊 Monitoring

### Backend Logs
```
[illustration] Starting image generation...
[illustration] Image saved: Beat 1.1
[illustration] Completed 5/30 images
```

### Frontend Console
```
SSE connection established
Progress update received
```

---

## 🚦 Next Steps

After Step 8:
1. **Step 9**: Select best images
2. **Step 10**: Convert to SVG
3. **Step 11**: Generate transcription
4. Continue pipeline

---

## ⚡ Emergency Commands

### Stop Generation
```bash
# Ctrl+C in backend terminal
# Or: pkill -f "node server.js"
```

### Clear Progress (Start Fresh)
```bash
rm {projectPath}/image_progress_*.json
```

### Delete All Images
```bash
rm -rf {projectPath}/generated_images/
```

---

## 📞 Getting Help

1. Check documentation files
2. Review backend logs
3. Check browser console
4. Verify configuration

---

## ✅ Pre-Flight Checklist

Before generating:
- [ ] API keys configured
- [ ] Backend running
- [ ] Steps 1-7 completed
- [ ] Prompts extracted

---

**Version**: 1.0.0  
**Last Updated**: 2025-11-09  
**Status**: ✅ Production Ready

---

## 🎉 You're Ready!

Everything is set up and ready to generate amazing images!

**Just click "Generate All Images" and watch the magic happen!** ✨
