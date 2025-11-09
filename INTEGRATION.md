# Backend-Frontend Integration Guide

## Setup Instructions

### 1. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

Create a `.env` file from the example:

```bash
copy .env.example .env
```

Edit `.env` and add your Gemini API key:

```
GEMINI_API_KEY=your_actual_api_key_here
PORT=3001
```

Start the backend server:

```bash
npm run dev
```

The backend will run on `http://localhost:3001`

### 2. Frontend Setup

In the root directory, create a `.env` file:

```bash
copy .env.example .env
```

The default configuration should work:

```
VITE_API_URL=http://localhost:3001/api
```

Install frontend dependencies (if not already done):

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

## Step 1 Integration

The Step 1 (Project Setup) now integrates with the backend:

1. User fills in the video title
2. User uploads a book text file
3. User specifies the project directory path (e.g., `C:\Projects\YouTube-Pipeline\My-Project`)
4. User clicks "Create Project Directory"
5. The frontend sends a POST request to `/api/project` with:
   - `projectPath`: The directory path
   - `bookContent`: The full text content of the uploaded file
6. The backend:
   - Creates the project directory
   - Saves the book content to `book.txt`
   - Returns success/error response
7. The frontend displays a success or error message

## API Service

The `services/apiService.ts` file provides functions for all backend endpoints:

- `createProject()` - Create project and save book content
- `summarize()` - Generate summary
- `generateScript()` - Generate script
- `generateBeats()` - Generate beats
- `generateStoryboards()` - Create storyboards
- `extractPrompts()` - Extract prompts
- `generateImages()` - Start image generation (async)
- `checkImageGenerationStatus()` - Poll image generation status
- `selectImage()` - Save selected image
- `convertToSvg()` - Convert images to SVG
- `uploadTranscription()` - Upload transcription file
- `generatePreEditScan()` - Generate pre-edit scan data

## Next Steps

To integrate other steps:

1. Import `apiService` in the step component
2. Call the appropriate API function
3. Handle loading states and errors
4. Update the UI based on the response

Example for Step 2 (Summarize):

```typescript
import * as apiService from '../../services/apiService';

const handleGenerateSummary = async () => {
  setIsLoading(true);
  try {
    const response = await apiService.summarize(metadata.projectPath);
    if (response.success && response.data) {
      setSummary(response.data.summary);
    }
  } catch (error) {
    console.error('Failed to generate summary:', error);
  } finally {
    setIsLoading(false);
  }
};
```

## Testing

1. Start the backend: `cd backend && npm run dev`
2. Start the frontend: `npm run dev`
3. Open the app in your browser
4. Fill in the project setup form
5. Upload a text file
6. Click "Create Project Directory"
7. Check the specified directory - you should see a new folder with `book.txt` inside

## Troubleshooting

**"Failed to connect to backend"**
- Make sure the backend server is running on port 3001
- Check that `VITE_API_URL` in `.env` matches your backend URL
- Check browser console for CORS errors

**"Invalid path: directory traversal detected"**
- The backend sanitizes paths to prevent security issues
- Use absolute paths without `..` in them

**Backend errors**
- Check backend console for detailed error messages
- Verify your Gemini API key is correct
- Ensure you have write permissions for the project directory
