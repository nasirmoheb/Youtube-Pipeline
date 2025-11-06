# Backend API Guidelines for AI YouTube Video Pipeline

This document outlines the API endpoints required to support the AI YouTube Video Pipeline frontend application. The backend is responsible for file system operations, interacting with AI services, and handling potentially long-running tasks.

## General Principles

-   All API endpoints should be prefixed with `/api`.
-   Request and response bodies should be in JSON format.
-   Authentication and authorization are not covered in this guideline but should be implemented in a production environment.
-   Error responses should follow a consistent format: `{ "success": false, "error": "Error message details" }`.
-   The `projectPath` is a key identifier for all project-related resources. The backend must ensure this path is sanitized and secure to prevent directory traversal attacks.

---

## 1. Project Management

### 1.1 Create Project Directory

Creates the necessary directory structure for a new video project on the server.

-   **Endpoint:** `POST /api/project`
-   **Description:** Called from "Step 1: Project Setup". Creates a root folder for the project.
-   **Request Body:**

    ```json
    {
      "projectPath": "/path/from/user/input/My-Video-Project"
    }
    ```

-   **Success Response (201):**

    ```json
    {
      "success": true,
      "message": "Project created successfully.",
      "projectPath": "/server/sanitized/path/My-Video-Project"
    }
    ```

-   **Error Response (400/500):**
    ```json
    {
      "success": false,
      "error": "Invalid project path provided."
    }
    ```
    ```json
    {
      "success": false,
      "error": "Failed to create project directory. It may already exist."
    }
    ```

---

## 2. File Operations

### 2.1 Save Text-Based File

A generic endpoint to save text content (like summaries, scripts, beats, storyboards, prompts, and JSON data) to a file within a project directory.

-   **Endpoint:** `POST /api/file`
-   **Description:** Used in multiple steps (2, 3, 5, 6, 7, 12) to save generated text content.
-   **Request Body:**
    ```json
    {
      "projectPath": "/server/sanitized/path/My-Video-Project",
      "fileName": "summary.md",
      "content": "This is the generated summary of the book..."
    }
    ```
-   **Example `fileName` values:**
    -   `summary.md`
    -   `script.md`
    -   `beats.md`
    -   `storyboard-illustration.md`
    -   `storyboard-clear.md`
    -   `storyboard-consistent.md`
    -   `prompts-illustration.js`
    -   `pre-edit-scan.json`

-   **Success Response (200):**
    ```json
    {
      "success": true,
      "message": "File 'summary.md' saved successfully.",
      "filePath": "/server/sanitized/path/My-Video-Project/summary.md"
    }
    ```
-   **Error Response (400/500):**
    ```json
    {
      "success": false,
      "error": "Project path does not exist."
    }
    ```

### 2.2 Save Audio File

Saves a generated voiceover file. The audio data is sent as a base64 encoded string.

-   **Endpoint:** `POST /api/audio`
-   **Description:** Used in "Step 4: Voiceover" to save the generated audio segments or the final combined voiceover. The backend should decode the base64 string and save it as an MP3 file.
-   **Request Body:**
    ```json
    {
      "projectPath": "/server/sanitized/path/My-Video-Project",
      "fileName": "voiceover.mp3",
      "audioData": "UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=..."
    }
    ```

-   **Success Response (200):**
    ```json
    {
      "success": true,
      "message": "File 'voiceover.mp3' saved successfully.",
      "filePath": "/server/sanitized/path/My-Video-Project/voiceover.mp3"
    }
    ```

### 2.3 Save Final Image

Saves an image selected by the user into a dedicated `final_images` folder within the project directory.

-   **Endpoint:** `POST /api/image/final`
-   **Description:** Called from "Step 9: Select Best Image per Beat". The server receives the image URL (which could be a data URL), fetches it if necessary, and saves it as a file.
-   **Request Body:**
    ```json
    {
      "projectPath": "/server/sanitized/path/My-Video-Project",
      "beatNumber": "Beat 1",
      "imageUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgA..."
    }
    ```
-   **Success Response (200):**
    ```json
    {
      "success": true,
      "message": "Image for 'Beat 1' saved successfully.",
      "filePath": "/server/sanitized/path/My-Video-Project/final_images/Beat 1.png"
    }
    ```
-   **Note:** The backend should handle decoding the data URL and determining the correct file extension.

---

## 3. AI Service Proxies

### 3.1 Generate Image

Proxies a request to an AI image generation service.

-   **Endpoint:** `POST /api/generate/image`
-   **Description:** Used in "Step 8: Generating Images...". The backend receives a text prompt, calls the AI service (e.g., Imagen), and returns the generated image, likely as a data URL.
-   **Request Body:**
    ```json
    {
      "prompt": "A majestic cinematic shot of a futuristic city at dusk, hyperrealistic."
    }
    ```
-   **Success Response (200):**
    ```json
    {
      "success": true,
      "imageUrl": "data:image/jpeg;base64,..."
    }
    ```
-   **Error Response (502):**
    ```json
    {
      "success": false,
      "error": "The image generation service failed."
    }
    ```

### 3.2 Convert Image to SVG (Async)

Initiates a long-running task to convert a raster image to an SVG and allows polling for progress.

-   **Endpoint (Initiate):** `POST /api/convert/svg`
-   **Description:** Starts the conversion process for an image in the `final_images` folder.
-   **Request Body:**
    ```json
    {
      "projectPath": "/server/sanitized/path/My-Video-Project",
      "imageFileName": "Beat 1.png"
    }
    ```
-   **Success Response (202 Accepted):**
    ```json
    {
      "success": true,
      "taskId": "a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890"
    }
    ```

-   **Endpoint (Check Status):** `GET /api/convert/svg/status/{taskId}`
-   **Description:** Polled by the frontend to get progress updates.
-   **Success Responses (200):**
    -   *In Progress:*
        ```json
        {
          "status": "converting",
          "progress": 50
        }
        ```
    -   *Complete:*
        ```json
        {
          "status": "complete",
          "progress": 100,
          "svgUrl": "/server/sanitized/path/My-Video-Project/final_images/Beat 1.svg"
        }
        ```
    -   *Error:*
        ```json
        {
          "status": "error",
          "error": "Conversion failed for an unknown reason."
        }
        ```

### 3.3 Transcribe Audio

Proxies a request to an AI speech-to-text service to generate word-level transcriptions.

-   **Endpoint:** `POST /api/transcribe`
-   **Description:** Used in "Step 11: Transcription". The backend takes an audio file from the project path, sends it to a transcription service, and returns the structured result.
-   **Request Body:**
    ```json
    {
      "projectPath": "/server/sanitized/path/My-Video-Project",
      "audioFileName": "voiceover.mp3"
    }
    ```
-   **Success Response (200):**
    ```json
    {
        "success": true,
        "transcription": [
            {
                "word": "This",
                "startTime": "00:00:00,123",
                "endTime": "00:00:00,456"
            },
            {
                "word": "is",
                "startTime": "00:00:00,480",
                "endTime": "00:00:00,600"
            }
        ]
    }
    ```
-   **Error Response (502):**
    ```json
    {
      "success": false,
      "error": "The transcription service failed."
    }
    ```
