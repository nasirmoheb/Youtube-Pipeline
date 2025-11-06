import type { ScriptingSubStep, ProjectMetadata, ScriptData, VoiceoverSegment, Beat, StoryboardRow, ExtractedPrompt, ImageSelection, SvgConversionStatus, TranscriptionWord, PreEditScanItem } from './types';

export const DEFAULT_STATE = {
    currentStep: 1,
    highestCompletedStep: 1,
    scriptingSubStep: 'hooks' as ScriptingSubStep,
    metadata: { title: '', bookName: '', projectPath: '' },
    bookContent: '',
    summary: '',
    scriptData: { hooks: [], selectedHook: '', outline: '', fullScript: '' },
    voiceoverSegments: [],
    beats: [],
    storyboards: { illustration: [], clear: [], consistent: [] },
    extractedPrompts: { illustration: [], clear: [], consistent: [] },
    images: { illustration: {}, clear: {}, consistent: {} },
    imageSelection: {},
    flaggedImages: {},
    checkedImages: new Set<string>(),
    svgConversionStatus: {},
    transcriptionData: [],
    preEditScanData: [],
    videoUrl: null,
    combinedVoiceoverUrl: null,
};

export const loadInitialState = () => {
    try {
        const savedStateJSON = localStorage.getItem('aiVideoPipelineProject');
        if (savedStateJSON) {
            const savedState = JSON.parse(savedStateJSON);
            if (savedState.checkedImages && Array.isArray(savedState.checkedImages)) {
                savedState.checkedImages = new Set(savedState.checkedImages);
            } else {
                 savedState.checkedImages = new Set();
            }
             if (savedState.flaggedImages && typeof savedState.flaggedImages === 'object') {
                const loadedFlags: {[key: string]: Set<string>} = {};
                for (const beat in savedState.flaggedImages) {
                    if (Array.isArray(savedState.flaggedImages[beat])) {
                        loadedFlags[beat] = new Set(savedState.flaggedImages[beat]);
                    }
                }
                savedState.flaggedImages = loadedFlags;
            } else {
                 savedState.flaggedImages = {};
            }
            return { ...DEFAULT_STATE, ...savedState };
        }
    } catch (e) {
        console.error("Could not load or parse saved state, starting fresh.", e);
        localStorage.removeItem('aiVideoPipelineProject');
    }
    return { ...DEFAULT_STATE, checkedImages: new Set<string>(), flaggedImages: {} };
};