# Step 8 Image Generation - Quick Start

## Prerequisites
1. Complete Steps 1-7 (have extracted prompts ready)
2. Backend server running on port 3001
3. Valid Google Gemini API keys configured

## Setup

### 1. Configure API Keys
Edit `backend/ImageGeneration/imageGenerationService.js`:

```javascript
const API_KEYS = {
  illustration: [
    "YOUR_API_KEY_1",
    "YOUR_API_KEY_2",
  ],
  clear: [
    "YOUR_API_KEY_3",
    "YOUR_API_KEY_4",
  ],
  consistent: [
    "YOUR_API_KEY_5",
    "YOUR_API_KEY_6",
  ]
};
```

**Important**: Each style should have its own set of API keys to avoid rate limits.

### 2. Add Style Reference (Optional)
Place your style reference image at:
```
backend/ImageGeneration/style_reference.png
```

This image will be used for all hard cut transitions to maintain visual consistency.

### 3. Start Backend Server
```bash
cd backend
npm start
```

## Usage

### Generate Images
1. Navigate to **Step 8: Generating Images**
2. Click **"Generate All Images"** button
3. Watch real-time progress for all 3 styles

### What Happens
- All 3 styles (illustration, clear, consistent) generate **concurrently**
- Each style uses its own API key pool
- Progress is saved automatically
- Already generated images are skipped

### Progress Display
Each style column shows:
- **Progress bar** with percentage
- **Completed/Total** count
- **Per-beat status**:
  - ◦ Pending
  - ⟳ Generating...
  - ✓ Complete
  - ✓ Exists (already generated)
  - ✗ Error

### Resume After Interruption
If generation is interrupted:
1. Simply click **"Generate All Images"** again
2. System automatically resumes from last completed beat
3. No duplicate work is done

## Output Location

Generated images are saved to:
```
{projectPath}/generated_images/
  illustration/
    Shot_1/
      Beat_1.1.png
      Beat_1.2.png
    Shot_2/
      ...
  clear/
    Shot_1/
      ...
  consistent/
    Shot_1/
      ...
```

## Progress Files

Progress is tracked in:
```
{projectPath}/image_progress_illustration.json
{projectPath}/image_progress_clear.json
{projectPath}/image_progress_consistent.json
```

These files allow resumption after interruptions.

## Rate Limiting

- **Default**: 9 requests per minute per API key
- **Automatic rotation**: Switches to next API key on rate limit
- **Delays**: Automatic delays between requests

### If You Hit Rate Limits
1. Add more API keys to each style's pool
2. Reduce `REQUESTS_PER_MINUTE` in `imageGenerationService.js`
3. Wait a few minutes before retrying

## Typical Generation Time

For a project with 30 beats:
- **Per style**: ~5-10 minutes (depending on API response time)
- **All 3 styles**: ~5-10 minutes (concurrent execution)
- **Total images**: 90 images (30 beats × 3 styles)

## Troubleshooting

### "Failed to start image generation"
- Check backend server is running
- Verify API keys are configured
- Check browser console for errors

### Images Not Generating
- Check backend console logs
- Verify API keys are valid
- Check network connectivity
- Ensure prompts were extracted in Step 7

### Rate Limit Errors
- Add more API keys
- Reduce generation speed
- Wait before retrying

### Missing Style Reference Warning
```
WARNING: Style reference image not found at "style_reference.png"
```
This is optional. Hard cuts will generate without style reference if not provided.

## Next Steps

After all images are generated:
1. Navigate to **Step 9: Select Images**
2. Review and select the best image from each style for each beat
3. Continue through the pipeline

## Tips

- **Don't close the browser** during generation (progress updates stop)
- **Backend continues** even if you close the browser
- **Check progress files** to see completion status
- **Regenerate specific beats** by deleting their images and running again
- **Use different API keys** for each style to maximize throughput
