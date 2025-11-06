export interface ProjectMetadata {
  title: string;
  bookName: string;
  projectPath: string;
}

export interface ScriptData {
  hooks: string[];
  selectedHook: string;
  outline: string;
  fullScript: string;
}

export interface VoiceoverSegment {
  id: number;
  text: string;
  status: 'pending' | 'generating' | 'complete';
  audioUrl?: string;
}

export interface Beat {
  beat_number: string;
  script_phrase: string;
}

export interface StoryboardRow {
  shot_number: number;
  beat_number: string;
  script_phrase: string;
  transition_type: string;
  ai_prompt: string;
  text_overlay: string;
  kinetic_text: string;
  sfx: string;
}

export interface ExtractedPrompt {
  shot_number: number;
  beat_number: string;
  script_phrase: string;
  transition_type: string;
  ai_prompt: string;
}

export interface ImageSelection {
  [beat_number: string]: {
    style: 'illustration' | 'clear' | 'consistent';
    url: string;
  } | null;
}

export interface SvgConversionStatus {
  status: 'pending' | 'converting' | 'complete' | 'error';
  progress: number;
  svgUrl?: string;
}

export interface TranscriptionWord {
  word: string;
  startTime: string;
  endTime: string;
}

export interface PreEditScanItem {
  beat_number: string;
  start: number;
  end: number;
  text: string | null; // From kinetic_text
  photo: string;
  sfx: string | null;
}

export type ScriptingSubStep = 'hooks' | 'outline' | 'script';
