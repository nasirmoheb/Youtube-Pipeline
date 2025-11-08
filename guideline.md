# Backend API Guidelines for AI YouTube Video Pipeline

This document outlines the API endpoints and file system operations required to support the AI YouTube Video Pipeline frontend application. The backend's primary role is to manage the project's file system, interact with the Gemini API for content generation, and handle long-running tasks like generating images and converting them to SVG.

## General Principles

-   **Local & Single-User:** This guide assumes the backend is for local, single-user operation. No authentication or user management is required.
-   **API Structure:** All API endpoints should be prefixed with `/api`. Request and response bodies should be in JSON format unless otherwise specified (e.g., for file uploads).
-   **Project Path:** All operations are scoped to a `projectPath` provided by the client. The backend must use this path as the root for all file operations for a given project. It is crucial to sanitize this path to prevent security vulnerabilities like directory traversal.
-   **Error Handling:** API error responses should follow a consistent format: `{ "success": false, "error": "A descriptive error message." }`.

---

## Project File Structure

The backend will create and manage a directory for each project. The expected structure will look like this:

```
/path/to/your/projects/My-Video-Project/
├── book.txt
├── summary.txt
├── script.md
├── beats.md
├── storyboards/
│   ├── illustration.md
│   ├── clear.md
│   └── consistent.md
├── prompts/
│   ├── prompts-illustration.js
│   ├── prompts-clear.js
│   └── prompts-consistent.js
├── voiceover/
│   ├── 1.mp3
│   └── 2.mp3
│   └── ...
├── images/
│   ├── illustration/
│   │   ├── Beat 1.png
│   │   └── ...
│   ├── clear/
│   └── consistent/
├── finalImage/
│   ├── Beat 1.png
│   ├── Beat 2-flag.png
│   └── ...
├── finalImageSVG/
│   ├── Beat 1.svg
│   ├── Beat 2-flag.svg
│   └── ...
└── transcription.txt
```

---

## API Endpoint Guide

### 1. Project Setup

-   **Endpoint:** `POST /api/project`
-   **Description:** Creates the project folder and saves the initial book content.
-   **Request Body:**
    ```json
    {
      "projectPath": "/path/to/your/projects/My-Video-Project",
      "bookContent": "The full text content of the book..."
    }
    ```
-   **Action:**
    1.  Create the directory specified by `projectPath`.
    2.  Save the `bookContent` into a new file: `{projectPath}/book.txt`.
-   **Success Response (201):**
    ```json
    {
      "success": true,
      "message": "Project created successfully."
    }
    ```

### 2. Content Summarization

-   **Endpoint:** `POST /api/summarize`
-   **Description:** Reads the book content and uses Gemini to generate a summary.
-   **Request Body:**
    ```json
    {
      "projectPath": "/path/to/your/projects/My-Video-Project"
    }
    ```
-   **Action:**
    1.  Read the content of `{projectPath}/book.txt`.
    2.  Call the Gemini API to summarize the text.
    3.  Save the resulting summary to `{projectPath}/summary.txt`.
-   **Success Response (200):**
    ```json
    {
      "success": true,
      "summary": "The generated summary text..."
    }
    ```

### 3. Script Generation

-   **Endpoint:** `POST /api/script`
-   **Description:** Reads the summary and uses Gemini to generate a full video script.
-   **Request Body:**
    ```json
    {
      "projectPath": "/path/to/your/projects/My-Video-Project"
    }
    ```
-   **Action:**
    1.  Read the content of `{projectPath}/summary.txt`.
    2.  Call the Gemini API to generate the script.
    3.  Save the result to `{projectPath}/script.md`.
-   **Success Response (200):**
    ```json
    {
      "success": true,
      "script": "The full generated script in Markdown format..."
    }
    ```

### 4. Voiceover Generation

-   **Endpoint:** `POST /api/voiceover`
-   **Description:** Splits the script into segments and generates an audio file for each one.
-   **Request Body:**
    ```json
    {
      "projectPath": "/path/to/your/projects/My-Video-Project"
    }
    ```
-   **Action:**
    1.  Create a `voiceover` sub-directory: `{projectPath}/voiceover/`.
    2.  Read `{projectPath}/script.md`.
    3.  Split the script into logical segments (e.g., by paragraph).
    4.  For each segment, call the Gemini TTS API to generate audio.
    5.  Save each audio file sequentially (e.g., `1.mp3`, `2.mp3`) inside the `voiceover` folder.
-   **Success Response (200):**
    ```json
    {
      "success": true,
      "message": "Voiceover segments generated successfully."
    }
    ```

### 5. Beat Generation

-   **Endpoint:** `POST /api/beats`
-   **Description:** Generates narrative beats from the script.
-   **Request Body:**
    ```json
    {
      "projectPath": "/path/to/your/projects/My-Video-Project"
    }
    ```
-   **Action:**
    1.  Read `{projectPath}/script.md`.
    2.  Call the Gemini API to generate beats.
    3.  Save the result to `{projectPath}/beats.md`.
-   **Success Response (200):**
    ```json
    {
      "success": true,
      "beats": "The generated beats in Markdown format..."
    }
    ```

### 6. Storyboard Creation

-   **Endpoint:** `POST /api/storyboards`
-   **Description:** Generates three different styles of storyboards from the beats.
-   **Request Body:**
    ```json
    {
      "projectPath": "/path/to/your/projects/My-Video-Project"
    }
    ```
-   **Action:**
    1.  Create a `storyboards` sub-directory.
    2.  Read `{projectPath}/beats.md`.
    3.  Call the Gemini API three times, once for each style ('illustration', 'clear', 'consistent').
    4.  Save the results to `{projectPath}/storyboards/illustration.md`, `clear.md`, and `consistent.md`.
-   **Success Response (200):**
    ```json
    {
      "success": true,
      "message": "Storyboards created successfully."
    }
    ```

### 7. Prompt Extraction

-   **Endpoint:** `POST /api/prompts`
-   **Description:** Extracts image generation prompts from each storyboard.
-   **Request Body:**
    ```json
    {
      "projectPath": "/path/to/your/projects/My-Video-Project"
    }
    ```
-   **Action:**
    1.  Create a `prompts` sub-directory.
    2.  Read and parse each storyboard file from the `storyboards` folder.
    3.  Extract the `ai_prompt` column/field from each.
    4.  Save the extracted prompts into `{projectPath}/prompts/prompts-illustration.js`, `prompts-clear.js`, and `prompts-consistent.js`. The file format should be a JavaScript variable assignment as seen in the frontend.
-   **Success Response (200):**
    ```json
    {
      "success": true,
      "message": "Prompts extracted successfully."
    }
    ```

### 8. Image Generation

-   **Endpoint:** `POST /api/generate-images`
-   **Description:** A long-running task to generate all images. The frontend should poll for status.
-   **Request Body:**
    ```json
    {
      "projectPath": "/path/to/your/projects/My-Video-Project"
    }
    ```
-   **Action:**
    1.  Create the `images/illustration`, `images/clear`, and `images/consistent` sub-directories.
    2.  Read the prompt files from the `prompts` folder.
    3.  Iterate through each prompt, call the Gemini image generation API, and save the resulting image to the correct sub-directory, named after its corresponding beat (e.g., `Beat 1.png`).
    4.  This should be an asynchronous process.
-   **Success Response (202 Accepted):**
    ```json
    {
      "success": true,
      "taskId": "a1b2c3d4-e5f6-7890"
    }
    ```
-   **Status Endpoint:** `GET /api/status/images/{taskId}`
-   **Status Response (200):**
    ```json
    {
      "status": "processing",
      "progress": 50,
      "message": "Generated 15 of 30 images."
    }
    ```

### 9. Image Selection

-   **Endpoint:** `POST /api/select-image`
-   **Description:** Saves a user-selected image to the final output directory.
-   **Request Body:**
    ```json
    {
      "projectPath": "/path/to/your/projects/My-Video-Project",
      "beatNumber": "Beat 2",
      "sourceImagePath": "/path/to/your/projects/My-Video-Project/images/illustration/Beat 2.png",
      "isFlagged": true
    }
    ```
-   **Action:**
    1.  Create the `finalImage` sub-directory if it doesn't exist.
    2.  Copy the file from `sourceImagePath` to the `finalImage` folder.
    3.  The new filename should be `{beatNumber}.png`. If `isFlagged` is true, append "-flag" to the name (e.g., `Beat 2-flag.png`).
-   **Success Response (200):**
    ```json
    {
      "success": true,
      "message": "Image for Beat 2 selected and saved."
    }
    ```

### 10. SVG Conversion

-   **Endpoint:** `POST /api/convert-svg`
-   **Description:** Converts all selected final images to SVG format.
-   **Request Body:**
    ```json
    {
      "projectPath": "/path/to/your/projects/My-Video-Project"
    }
    ```
-   **Action:**
    1.  Create the `finalImageSVG` sub-directory.
    2.  List all image files in the `{projectPath}/finalImage` directory.
    3.  For each image, use a library or API call to convert it to SVG.
    4.  Save the new SVG file in the `finalImageSVG` directory with the same base name (e.g., `Beat 1.svg`).
-   **Success Response (200):**
    ```json
    {
      "success": true,
      "message": "All final images converted to SVG."
    }
    ```

### 11. Transcription Upload

-   **Endpoint:** `POST /api/upload-transcription`
-   **Description:** Handles the upload of a transcription file. This endpoint should accept `multipart/form-data`.
-   **Request Body:** A form data object containing the `projectPath` and the file itself.
-   **Action:**
    1.  Receive the uploaded file.
    2.  Save it to `{projectPath}/transcription.txt`, overwriting any existing file.
-   **Success Response (200):**
    ```json
    {
      "success": true,
      "message": "Transcription file uploaded successfully."
    }
    ```

### 12. Pre-Edit Scan

-   **Endpoint:** `POST /api/pre-edit-scan`
-   **Description:** Generates a pre-edit scan JSON file for the video editor.
-   **Request Body:**
    ```json
    {
      "projectPath": "/path/to/your/projects/My-Video-Project"
    }
    ```
-   **Action:**
    1.  Read `{projectPath}/transcription.txt`.
    2.  Read `{projectPath}/storyboards/illustration.md`.
    3.  Perform the alignment logic to match script phrases from the storyboard to word timings in the transcription.
    4.  Generate the final JSON structure for the pre-edit scan.
-   **Success Response (200):**
    ```json
    {
      "success": true,
      "scanData": [
        { "beat_number": "Beat 1", "start": 0.5, "end": 4.2, "...": "..." }
      ]
    }
    ```

---

## Steps Not Requiring Significant Backend Logic

While the backend is crucial for file management and AI calls, some steps are primarily handled by the frontend UI. The backend's role in these steps is minimal, often just saving the final result.

-   **Step 9: Image Selection:** The entire process of displaying the three image options, handling navigation between beats, and managing the selection state is a frontend task. The backend is only involved at the very end when the frontend sends a request to save the chosen image for a specific beat.

-   **Step 13 (Video Edit):** In the current application, video rendering is handled entirely on the **client-side** using Remotion Player. The frontend takes the pre-edit scan data (from Step 12), the final images, and the voiceover audio, and it composes them into a playable video preview in the browser. A backend would only be needed if you wanted to perform a final, high-quality, server-side render of the video into an MP4 file, which is outside the scope of the current application's interactive flow.
