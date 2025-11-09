# Quick Start Guide

## Prerequisites

- Node.js (v18 or higher)
- A Gemini API key from Google AI Studio

## Installation & Setup

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Configure Environment Variables

**Backend Configuration:**

```bash
cd backend
copy .env.example .env
```

Edit `backend/.env` and add your Gemini API key:

```
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3001
```

**Frontend Configuration:**

```bash
# In the root directory
copy .env.example .env
```

The default `.env` should work:

```
VITE_API_URL=http://localhost:3001/api
```

### 3. Start the Application

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

You should see: `Server running on port 3001`

**Terminal 2 - Frontend:**

```bash
npm run dev
```

You should see: `Local: http://localhost:3000/`

### 4. Use the Application

1. Open your browser to `http://localhost:3000`
2. Fill in the project setup form:
   - **Video Title**: Enter a title for your video
   - **Upload Book**: Click to upload a `.txt` file with your content
   - **Project Directory Path**: Enter a path like `C:\Projects\YouTube-Pipeline\My-Project`
3. Click **"Create Project Directory"**
4. You should see a success message
5. Check your file system - the directory should be created with a `book.txt` file inside

## What's Integrated

✅ **Step 1 - Project Setup**: Fully integrated with backend
- Creates project directory
- Saves book content to `book.txt`
- Validates inputs
- Shows success/error messages

🔄 **Steps 2-13**: Ready for integration
- API service functions are available in `services/apiService.ts`
- Backend endpoints are implemented
- Follow the pattern from Step 1 to integrate other steps

## Project Structure

```
.
├── backend/                 # Node.js backend
│   ├── routes/             # API route handlers
│   ├── services/           # Gemini API integration
│   ├── utils/              # File system utilities
│   └── server.js           # Express server
├── components/             # React components
│   └── steps/              # Step components
├── services/               # Frontend services
│   └── apiService.ts       # Backend API client
└── App.tsx                 # Main application
```

## Troubleshooting

**Backend won't start:**
- Check that port 3001 is not in use
- Verify your Gemini API key is correct
- Check `backend/.env` file exists

**Frontend can't connect to backend:**
- Ensure backend is running on port 3001
- Check browser console for errors
- Verify `VITE_API_URL` in `.env`

**"Invalid path" error:**
- Use absolute paths (e.g., `C:\Projects\...` on Windows)
- Don't use `..` in paths
- Ensure you have write permissions

## Next Steps

See `INTEGRATION.md` for detailed integration instructions for other steps.
