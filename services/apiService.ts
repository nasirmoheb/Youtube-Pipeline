// Use environment variable or default to localhost
const API_BASE_URL = typeof window !== 'undefined' && (window as any).__API_URL__ 
  ? (window as any).__API_URL__ 
  : 'http://localhost:3001/api';

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}

export async function createProject(projectPath: string, bookContent: string, videoTitle: string): Promise<ApiResponse> {
  const response = await fetch(`${API_BASE_URL}/project`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectPath, bookContent, videoTitle })
  });
  
  return response.json();
}

export async function summarize(projectPath: string): Promise<ApiResponse<{ summary: string }>> {
  const response = await fetch(`${API_BASE_URL}/summarize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectPath })
  });
  
  return response.json();
}

export async function saveSummary(projectPath: string, summary: string): Promise<ApiResponse> {
  const response = await fetch(`${API_BASE_URL}/save-summary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectPath, summary })
  });
  
  return response.json();
}

export async function saveScript(projectPath: string, script: string): Promise<ApiResponse> {
  const response = await fetch(`${API_BASE_URL}/save-script`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectPath, script })
  });
  
  return response.json();
}

export async function saveBeats(projectPath: string, beats: Array<{ beat_number: string; script_phrase: string }>): Promise<ApiResponse> {
  const response = await fetch(`${API_BASE_URL}/save-beats`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectPath, beats })
  });
  
  return response.json();
}

export async function generateVoiceover(projectPath: string, text: string, segmentId: number): Promise<{ success: boolean; filename?: string; filepath?: string; error?: string; message?: string }> {
  const response = await fetch(`${API_BASE_URL}/generate-voiceover`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectPath, text, segmentId })
  });
  
  return response.json();
}

export async function extractVoiceoverSegments(projectPath: string): Promise<{ success: boolean; segments?: string[]; error?: string }> {
  const response = await fetch(`${API_BASE_URL}/extract-voiceover-segments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectPath })
  });
  
  return response.json();
}

export async function refineContent(content: string, instruction: string): Promise<ApiResponse<{ refined: string }>> {
  const response = await fetch(`${API_BASE_URL}/refine`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, instruction })
  });
  
  return response.json();
}

export async function generateScript(projectPath: string): Promise<ApiResponse<{ script: string }>> {
  const response = await fetch(`${API_BASE_URL}/script`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectPath })
  });
  
  return response.json();
}

export async function generateBeats(projectPath: string): Promise<{ success: boolean; beats?: Array<{ beat_number: string; script_phrase: string }>; error?: string }> {
  const response = await fetch(`${API_BASE_URL}/beats`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectPath })
  });
  
  return response.json();
}

export async function generateStoryboard(projectPath: string, style: 'illustration' | 'clear' | 'consistent'): Promise<{ 
  success: boolean; 
  storyboard?: Array<{
    shot_number: number;
    beat_number: string;
    script_phrase: string;
    transition_type: string;
    ai_prompt: string;
    text_overlay: string;
    kinetic_text: string;
    sfx: string;
  }>; 
  error?: string 
}> {
  const response = await fetch(`${API_BASE_URL}/storyboard`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectPath, style })
  });
  
  return response.json();
}

export async function savePrompts(
  projectPath: string, 
  style: 'illustration' | 'clear' | 'consistent',
  prompts: Array<{
    shot_number: number;
    beat_number: string;
    script_phrase: string;
    transition_type: string;
    ai_prompt: string;
  }>
): Promise<{ success: boolean; message?: string; error?: string }> {
  const response = await fetch(`${API_BASE_URL}/save-prompts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectPath, style, prompts })
  });
  
  return response.json();
}

export async function generateImages(projectPath: string): Promise<ApiResponse<{ taskId: string }>> {
  const response = await fetch(`${API_BASE_URL}/generate-images`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectPath })
  });
  
  return response.json();
}

export async function checkImageGenerationStatus(taskId: string): Promise<{ status: string; progress: number; message: string }> {
  const response = await fetch(`${API_BASE_URL}/status/images/${taskId}`);
  return response.json();
}

export async function selectImage(
  projectPath: string,
  beatNumber: string,
  sourceImagePath: string,
  isFlagged: boolean
): Promise<ApiResponse> {
  const response = await fetch(`${API_BASE_URL}/select-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectPath, beatNumber, sourceImagePath, isFlagged })
  });
  
  return response.json();
}

export async function convertToSvg(projectPath: string): Promise<ApiResponse> {
  const response = await fetch(`${API_BASE_URL}/convert-svg`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectPath })
  });
  
  return response.json();
}

export async function uploadTranscription(projectPath: string, file: File): Promise<ApiResponse> {
  const formData = new FormData();
  formData.append('projectPath', projectPath);
  formData.append('file', file);
  
  const response = await fetch(`${API_BASE_URL}/upload-transcription`, {
    method: 'POST',
    body: formData
  });
  
  return response.json();
}

export async function generatePreEditScan(projectPath: string): Promise<ApiResponse<{ scanData: any[] }>> {
  const response = await fetch(`${API_BASE_URL}/pre-edit-scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectPath })
  });
  
  return response.json();
}
