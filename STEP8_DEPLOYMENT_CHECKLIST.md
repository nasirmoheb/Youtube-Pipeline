# Step 8 Image Generation - Deployment Checklist

## Pre-Deployment

### 1. API Keys Configuration ⚠️ REQUIRED
- [ ] Open `backend/ImageGeneration/imageGenerationService.js`
- [ ] Replace placeholder API keys with your actual Google Gemini API keys
- [ ] Ensure each style has at least 2 API keys:
  ```javascript
  const API_KEYS = {
    illustration: ["YOUR_KEY_1", "YOUR_KEY_2"],
    clear: ["YOUR_KEY_3", "YOUR_KEY_4"],
    consistent: ["YOUR_KEY_5", "YOUR_KEY_6"]
  };
  ```
- [ ] Verify all API keys are valid and have quota

### 2. Style Reference Image (Optional)
- [ ] Place your style reference image at `backend/ImageGeneration/style_reference.png`
- [ ] Ensure it's a PNG format
- [ ] Recommended size: 1024x1024 or similar
- [ ] If not provided, hard cuts will generate without style reference

### 3. Dependencies
- [ ] Verify `@google/genai` is installed: `npm list @google/genai`
- [ ] If missing, run: `cd backend && npm install`

### 4. Backend Server
- [ ] Backend server configured to run on port 3001
- [ ] CORS enabled for frontend origin
- [ ] Express server includes imageGenerationRouter

## Testing

### 1. Backend Smoke Test
```bash
cd backend
npm start
```
- [ ] Server starts without errors
- [ ] No import/module errors
- [ ] Port 3001 is available

### 2. API Endpoint Test
```bash
# Check if endpoint is registered
curl http://localhost:3001/api/generation-status/test
```
- [ ] Returns JSON response
- [ ] No 404 error

### 3. Frontend Connection Test
- [ ] Start frontend: `npm run dev`
- [ ] Navigate to Step 8
- [ ] UI loads without errors
- [ ] "Generate All Images" button is visible

### 4. End-to-End Test
- [ ] Complete Steps 1-7 (have prompts ready)
- [ ] Click "Generate All Images"
- [ ] Progress updates appear in real-time
- [ ] All 3 style columns show progress
- [ ] Images are saved to disk
- [ ] Progress files are created

## File Verification

### Backend Files
- [ ] `backend/ImageGeneration/imageGenerationService.js` exists
- [ ] `backend/routes/imageGeneration.js` exists
- [ ] `backend/server.js` includes imageGenerationRouter
- [ ] `backend/ImageGeneration/style_reference.png` exists (optional)

### Frontend Files
- [ ] `components/steps/Step8_Images.tsx` updated
- [ ] `App.tsx` updated with new Step8 props

### Documentation
- [ ] `STEP8_IMAGE_GENERATION_INTEGRATION.md` exists
- [ ] `STEP8_QUICK_START.md` exists
- [ ] `STEP8_IMPLEMENTATION_SUMMARY.md` exists
- [ ] `STEP8_DEPLOYMENT_CHECKLIST.md` exists (this file)

## Runtime Verification

### During First Generation
- [ ] All 3 styles start generating simultaneously
- [ ] Progress bars update in real-time
- [ ] Status indicators change (pending → generating → complete)
- [ ] No rate limit errors (or automatic key rotation works)
- [ ] Images appear in file system

### Check Output
```bash
# Verify directory structure
ls {projectPath}/generated_images/
# Should show: illustration/, clear/, consistent/

# Check image files
ls {projectPath}/generated_images/illustration/Shot_1/
# Should show: Beat_X.X.png files

# Check progress files
cat {projectPath}/image_progress_illustration.json
# Should show: {"completedBeats":[...],"lastUpdated":"..."}
```

### Test Resumption
- [ ] Stop generation mid-way (close browser or Ctrl+C backend)
- [ ] Restart backend
- [ ] Click "Generate All Images" again
- [ ] Verify it resumes from last completed beat
- [ ] Already generated images show "✓ Exists"

## Performance Checks

### Expected Behavior
- [ ] ~9 requests per minute per API key
- [ ] Automatic delays between requests
- [ ] No 429 rate limit errors (or handled gracefully)
- [ ] All 3 styles progress at similar rates

### Timing Benchmarks
For 30 beats (90 total images):
- [ ] Completion time: 5-10 minutes
- [ ] No hanging or frozen progress
- [ ] Consistent generation speed

## Error Handling Verification

### Test Rate Limiting
- [ ] Use invalid/limited API key
- [ ] Verify automatic rotation to next key
- [ ] Check console logs for rotation messages

### Test Network Errors
- [ ] Disconnect network mid-generation
- [ ] Verify error is logged
- [ ] Verify other images continue
- [ ] Reconnect and resume

### Test Invalid Prompts
- [ ] Use malformed prompt (if possible)
- [ ] Verify error is caught
- [ ] Verify process continues

## Security Checks

### API Keys
- [ ] API keys not committed to git
- [ ] API keys not exposed in frontend
- [ ] API keys only in backend service file
- [ ] Consider using environment variables

### File System
- [ ] Generated images saved to project directory only
- [ ] No path traversal vulnerabilities
- [ ] Proper file permissions

## Monitoring

### Backend Logs
Monitor for:
- [ ] `[style] Starting image generation...`
- [ ] `[style] Image saved: Beat X.X`
- [ ] `[style] Completed X/Y images`
- [ ] No unexpected errors

### Frontend Console
Monitor for:
- [ ] SSE connection established
- [ ] Progress updates received
- [ ] No CORS errors
- [ ] No network errors

## Rollback Plan

If issues occur:

### Quick Rollback
1. [ ] Stop backend server
2. [ ] Revert `backend/server.js` changes
3. [ ] Revert `App.tsx` changes
4. [ ] Revert `components/steps/Step8_Images.tsx`
5. [ ] Restart backend

### Preserve Data
- [ ] Generated images are preserved
- [ ] Progress files are preserved
- [ ] Can resume after fix

## Production Readiness

### Before Going Live
- [ ] All tests passing
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Error handling verified
- [ ] Documentation complete
- [ ] Team trained on usage

### Monitoring Setup
- [ ] Backend logs configured
- [ ] Error tracking enabled
- [ ] Performance metrics tracked
- [ ] API usage monitored

### User Communication
- [ ] Users informed of new feature
- [ ] Quick start guide shared
- [ ] Support channel ready
- [ ] Known issues documented

## Post-Deployment

### First 24 Hours
- [ ] Monitor error rates
- [ ] Check API usage/costs
- [ ] Verify user feedback
- [ ] Address any issues quickly

### First Week
- [ ] Collect performance data
- [ ] Optimize if needed
- [ ] Update documentation based on feedback
- [ ] Plan enhancements

## Success Metrics

### Technical
- [ ] 95%+ successful generation rate
- [ ] <10 minute average completion time
- [ ] Zero data loss on interruption
- [ ] <1% rate limit errors

### User Experience
- [ ] Users can generate images without help
- [ ] Progress updates are clear
- [ ] Errors are understandable
- [ ] Resumption works seamlessly

## Sign-Off

- [ ] Developer tested: _______________
- [ ] QA approved: _______________
- [ ] Documentation reviewed: _______________
- [ ] Ready for deployment: _______________

---

## Quick Reference

### Start Backend
```bash
cd backend
npm start
```

### Check Status
```bash
curl http://localhost:3001/api/generation-status/YOUR_PROJECT_PATH
```

### View Logs
```bash
# Backend logs show generation progress
# Frontend console shows SSE updates
```

### Emergency Stop
```bash
# Ctrl+C in backend terminal
# Or kill process: pkill -f "node server.js"
```

### Resume Generation
Just click "Generate All Images" again - it will resume automatically.

---

**Last Updated**: 2025-11-09
**Version**: 1.0.0
**Status**: ✅ Ready for Deployment
