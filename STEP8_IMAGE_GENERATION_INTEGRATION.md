# Step 8: Image Generation Integration

## Overview
Integrated the backend image generation logic with the frontend, supporting concurrent generation across 3 styles (illustration, clear, consistent) with progress tracking and resumption capability.

## Key Features

### 1. **Concurrent Generation Across 3 Styles**
- All three styles generate simultaneously
- Each style has its own set of API keys to avoid rate limits
- Independent progress tracking per style

### 2. **API Key Management**
- Each style uses a dedicated pool of API keys
- Automatic rotation when rate limit (429) is hit
- Configurable in `backend/ImageGeneration/imageGenerationService.js`:
  ```javascript
  const API_KEYS = {
    illustration: ["key1", "key2"],
    clear: ["key3", "key4"],
    consistent: ["key5", "key6"]
  };
  ```

### 3. **Progress Tracking & Resumption**
- Progress saved per style in `{projectPath}/image_progress_{style}.json`
- Automatically resumes from last completed beat
- Skips already generated images
- Real-time progress updates via Server-Sent Events (SSE)

### 4. **Style Reference Image**
- Uses `backend/ImageGeneration/style_reference.png` for hard cuts (transition_type: 'H')
- Maintains consistent visual style across scenes
- Automatically applied when available

### 5. **Rate Limiting**
- 9 requests per minute per API key (configurable)
- Automatic delays between requests
- Switches to next API key on rate limit errors

## Architecture

### Backend Components

#### 1. `backend/ImageGeneration/imageGenerationService.js`
Main service handling image generation:
- `generateImagesForStyle()` - Generates all images for one style
- `generateAllImages()` - Orchestrates concurrent generation across all styles
- Progress tracking and API key rotation
- File system management

#### 2. `backend/routes/imageGeneration.js`
Express router with SSE endpoint:
- `POST /api/generate-images` - Starts generation with real-time progress
- `GET /api/generation-status/:projectPath` - Check if generation is active

#### 3. `backend/server.js`
Updated to include the new router

### Frontend Components

#### `components/steps/Step8_Images.tsx`
Completely rewritten to:
- Connect to backend SSE endpoint
- Display real-time progress for all 3 styles
- Show progress bars and status indicators
- Handle generation state management

### Data Flow

```
User clicks "Generate All Images"
    ↓
Frontend sends POST to /api/generate-images
    ↓
Backend starts 3 concurrent style generations
    ↓
Progress updates sent via SSE
    ↓
Frontend updates UI in real-time
    ↓
Generation completes, progress saved
```

## File Structure

```
backend/
  ImageGeneration/
    imageGenerationService.js    # Core generation logic
    style_reference.png           # Master style reference
  routes/
    imageGeneration.js            # API endpoint

components/
  steps/
    Step8_Images.tsx              # Frontend UI

{projectPath}/
  generated_images/
    illustration/
      Shot_1/
        Beat_1.1.png
        Beat_1.2.png
    clear/
      Shot_1/
        ...
    consistent/
      Shot_1/
        ...
  image_progress_illustration.json
  image_progress_clear.json
  image_progress_consistent.json
```

## Usage

### Starting Generation
1. Navigate to Step 8
2. Click "Generate All Images"
3. Watch real-time progress for all 3 styles
4. Generation continues even if you navigate away (backend handles it)

### Resuming After Interruption
- Simply click "Generate All Images" again
- System automatically detects completed images
- Resumes from where it left off
- Shows "✓ Exists" for already generated images

### Monitoring Progress
- Each style shows:
  - Progress bar (0-100%)
  - Completed/Total count
  - Per-beat status indicators
  - Overall status message

## Configuration

### Adjusting Rate Limits
In `imageGenerationService.js`:
```javascript
const REQUESTS_PER_MINUTE = 9; // Adjust as needed
```

### Adding More API Keys
In `imageGenerationService.js`:
```javascript
const API_KEYS = {
  illustration: ["key1", "key2", "key3"], // Add more keys
  clear: ["key4", "key5", "key6"],
  consistent: ["key7", "key8", "key9"]
};
```

### Changing Style Reference
Replace `backend/ImageGeneration/style_reference.png` with your desired reference image.

## Status Indicators

- **◦ Pending** - Not started yet
- **⟳ Generating...** - Currently generating
- **✓ Complete** - Successfully generated
- **✓ Exists** - Already existed, skipped
- **✗ Error** - Generation failed

## Error Handling

- Rate limit errors trigger automatic API key rotation
- Failed generations are marked as errors but don't stop the process
- Progress is saved after each successful generation
- Can retry failed images by running generation again

## Performance

- **Concurrent Styles**: All 3 styles generate simultaneously
- **Rate Limit Compliance**: Automatic delays prevent API throttling
- **Resumable**: No wasted work on interruptions
- **Efficient**: Skips already generated images

## Next Steps

After Step 8 completes:
- Step 9: Select best images from each style
- Step 10: Convert selected images to SVG
- Continue through the pipeline

## Troubleshooting

### Generation Stuck
- Check backend console for errors
- Verify API keys are valid
- Check network connectivity

### Rate Limit Errors
- Add more API keys to the pool
- Reduce REQUESTS_PER_MINUTE value
- Wait a few minutes before retrying

### Missing Images
- Check `{projectPath}/generated_images/` directory
- Review progress files for completion status
- Check backend logs for generation errors
