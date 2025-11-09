# Step 8 Image Generation - Complete Setup Guide

## 📋 Prerequisites

Before you begin, ensure you have:
- ✅ Node.js installed (v16 or higher)
- ✅ Backend dependencies installed (`npm install` in backend/)
- ✅ Google Gemini API keys (get from https://makersuite.google.com/app/apikey)
- ✅ Completed Steps 1-7 (have extracted prompts ready)

## 🚀 Setup Steps

### Step 1: Get API Keys

1. Go to https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Create at least 6 API keys (2 per style minimum)
5. Copy each key somewhere safe

**Recommended**: Create 6-9 keys for optimal performance

### Step 2: Configure API Keys

Open `backend/ImageGeneration/imageGenerationService.js` and replace the placeholder keys:

```javascript
const API_KEYS = {
  illustration: [
    "AIzaSy...",  // Your first key
    "AIzaSy...",  // Your second key
  ],
  clear: [
    "AIzaSy...",  // Your third key
    "AIzaSy...",  // Your fourth key
  ],
  consistent: [
    "AIzaSy...",  // Your fifth key
    "AIzaSy...",  // Your sixth key
  ]
};
```

**Important**: 
- Each style should have its own set of keys
- Don't reuse the same key across styles
- More keys = faster generation

### Step 3: Add Style Reference (Optional)

1. Choose a reference image that represents your desired visual style
2. Save it as PNG format (1024x1024 recommended)
3. Place it at: `backend/ImageGeneration/style_reference.png`

**What it does**:
- Applied to all hard cut transitions
- Maintains consistent visual style across scenes
- Optional but highly recommended

### Step 4: Verify Configuration

Run this quick check:

```bash
cd backend
node -e "import('./ImageGeneration/imageGenerationService.js').then(() => console.log('✓ Configuration valid')).catch(e => console.error('✗ Error:', e.message))"
```

Should output: `✓ Configuration valid`

### Step 5: Start Backend Server

```bash
cd backend
npm start
```

You should see:
```
Server running on port 3001
```

### Step 6: Test the System

#### Option A: Use the UI (Recommended)
1. Start frontend: `npm run dev`
2. Navigate to Step 8
3. Click "Generate All Images"
4. Watch the progress

#### Option B: Use Test Script
1. Edit `backend/test-image-generation.js`
2. Uncomment the `runTest()` line at the bottom
3. Run: `node backend/test-image-generation.js`

## 🎯 Configuration Options

### Basic Configuration (Minimum)
```javascript
const API_KEYS = {
  illustration: ["key1"],
  clear: ["key2"],
  consistent: ["key3"]
};
const REQUESTS_PER_MINUTE = 5;
```
- **Speed**: Slow (~15-20 min for 30 beats)
- **Cost**: Low
- **Use case**: Testing, development

### Recommended Configuration
```javascript
const API_KEYS = {
  illustration: ["key1", "key2"],
  clear: ["key3", "key4"],
  consistent: ["key5", "key6"]
};
const REQUESTS_PER_MINUTE = 9;
```
- **Speed**: Medium (~5-10 min for 30 beats)
- **Cost**: Medium
- **Use case**: Production, normal use

### High-Performance Configuration
```javascript
const API_KEYS = {
  illustration: ["key1", "key2", "key3"],
  clear: ["key4", "key5", "key6"],
  consistent: ["key7", "key8", "key9"]
};
const REQUESTS_PER_MINUTE = 12;
```
- **Speed**: Fast (~3-7 min for 30 beats)
- **Cost**: Higher
- **Use case**: High-volume production

## 🔧 Advanced Configuration

### Adjust Rate Limiting

If you have higher API quota:
```javascript
const REQUESTS_PER_MINUTE = 15; // Increase for faster generation
```

If you're hitting rate limits:
```javascript
const REQUESTS_PER_MINUTE = 5; // Decrease for safer operation
```

### Custom Model

To use a different model:
```javascript
const MODEL_NAME = "gemini-2.0-flash-preview-image-generation"; // Default
// Or try other models as they become available
```

### Custom Delays

Fine-tune the delay between requests:
```javascript
const DELAY_BETWEEN_REQUESTS_MS = 7000; // 7 seconds between requests
```

## 📊 Cost Estimation

### Current Pricing (as of 2025)
- Image generation: ~$0.01-0.05 per image
- Varies by model and region

### Example Costs
| Beats | Images | Estimated Cost |
|-------|--------|----------------|
| 10    | 30     | $0.30 - $1.50  |
| 20    | 60     | $0.60 - $3.00  |
| 30    | 90     | $0.90 - $4.50  |
| 50    | 150    | $1.50 - $7.50  |

**Note**: Check current pricing at https://ai.google.dev/pricing

### Cost Optimization Tips
1. Use fewer styles (e.g., only illustration)
2. Reduce number of beats
3. Use lower-cost models when available
4. Monitor usage in Google Cloud Console

## 🛡️ Security Best Practices

### API Key Security

**DO**:
- ✅ Keep API keys in backend only
- ✅ Use environment variables in production
- ✅ Rotate keys regularly
- ✅ Monitor usage for anomalies

**DON'T**:
- ❌ Commit API keys to git
- ❌ Share keys publicly
- ❌ Use same keys across projects
- ❌ Expose keys in frontend

### Using Environment Variables (Production)

1. Create `.env` file in backend/:
```env
GEMINI_API_KEY_1=AIzaSy...
GEMINI_API_KEY_2=AIzaSy...
GEMINI_API_KEY_3=AIzaSy...
GEMINI_API_KEY_4=AIzaSy...
GEMINI_API_KEY_5=AIzaSy...
GEMINI_API_KEY_6=AIzaSy...
```

2. Update `imageGenerationService.js`:
```javascript
import dotenv from 'dotenv';
dotenv.config();

const API_KEYS = {
  illustration: [
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
  ],
  clear: [
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4,
  ],
  consistent: [
    process.env.GEMINI_API_KEY_5,
    process.env.GEMINI_API_KEY_6,
  ]
};
```

3. Add `.env` to `.gitignore`:
```
.env
```

## 🧪 Testing Your Setup

### Test 1: Backend Startup
```bash
cd backend
npm start
```
Expected: Server starts without errors

### Test 2: API Endpoint
```bash
curl http://localhost:3001/api/generation-status/test
```
Expected: `{"success":true,"isGenerating":false}`

### Test 3: Configuration
```bash
node -e "import('./backend/ImageGeneration/imageGenerationService.js').then(() => console.log('OK'))"
```
Expected: `OK`

### Test 4: Small Generation Test
1. Use test script with 2-3 test prompts
2. Verify images are generated
3. Check progress files are created

## 🐛 Troubleshooting Setup

### Issue: "Cannot find module"
**Solution**: Install dependencies
```bash
cd backend
npm install
```

### Issue: "Invalid API key"
**Solution**: 
1. Verify keys are correct (no extra spaces)
2. Check keys are active in Google Cloud Console
3. Ensure billing is enabled

### Issue: "Rate limit exceeded"
**Solution**:
1. Add more API keys
2. Reduce REQUESTS_PER_MINUTE
3. Wait a few minutes before retrying

### Issue: "Style reference not found"
**Solution**:
1. Check file exists at correct path
2. Verify file is PNG format
3. Check file permissions
4. Or remove style reference (optional)

### Issue: "Port 3001 already in use"
**Solution**:
```bash
# Find process using port
lsof -i :3001  # Mac/Linux
netstat -ano | findstr :3001  # Windows

# Kill process or change port in backend/config.js
```

## 📝 Verification Checklist

Before first use, verify:

- [ ] API keys configured in `imageGenerationService.js`
- [ ] At least 2 keys per style
- [ ] Keys are valid and active
- [ ] Style reference image added (optional)
- [ ] Backend dependencies installed
- [ ] Backend server starts successfully
- [ ] API endpoints respond correctly
- [ ] Steps 1-7 completed
- [ ] Prompts extracted and ready

## 🎉 You're Ready!

If all checks pass, you're ready to generate images!

### Next Steps:
1. Navigate to Step 8 in the UI
2. Click "Generate All Images"
3. Watch the magic happen! ✨

### What to Expect:
- All 3 styles generate simultaneously
- Real-time progress updates
- ~5-10 minutes for 30 beats
- Automatic progress saving
- Can resume if interrupted

## 📚 Additional Resources

- [STEP8_README.md](STEP8_README.md) - Main documentation
- [STEP8_QUICK_START.md](STEP8_QUICK_START.md) - Quick start guide
- [STEP8_QUICK_REFERENCE.md](STEP8_QUICK_REFERENCE.md) - Quick reference
- [STEP8_ARCHITECTURE_DIAGRAM.md](STEP8_ARCHITECTURE_DIAGRAM.md) - System diagrams
- [STEP8_DEPLOYMENT_CHECKLIST.md](STEP8_DEPLOYMENT_CHECKLIST.md) - Deployment guide

## 💡 Pro Tips

1. **Start Small**: Test with 2-3 beats first
2. **Monitor Costs**: Check Google Cloud Console regularly
3. **Use Progress Files**: They're your safety net
4. **Don't Close Browser**: Keep it open during generation
5. **Check Logs**: Backend logs show detailed progress
6. **Save Keys Safely**: Use password manager or .env file

## 🆘 Getting Help

If you encounter issues:
1. Check this setup guide
2. Review troubleshooting section
3. Check backend logs
4. Verify configuration
5. Test with minimal setup first

---

**Setup Version**: 1.0.0  
**Last Updated**: 2025-11-09  
**Status**: ✅ Ready for Use

Good luck with your image generation! 🚀
