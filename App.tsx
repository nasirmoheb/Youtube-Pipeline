import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { ProjectMetadata, ScriptData, VoiceoverSegment, Beat, StoryboardRow, ExtractedPrompt, ImageSelection, SvgConversionStatus, TranscriptionWord, PreEditScanItem, ScriptingSubStep } from './types';
import * as geminiService from './services/geminiService';
import { DEFAULT_STATE, loadInitialState } from './state';
import Stepper from './components/Stepper';

// Import step components
import Step1_ProjectSetup from './components/steps/Step1_ProjectSetup';
import Step2_Summarize from './components/steps/Step2_Summarize';
import Step3_Scripting from './components/steps/Step3_Scripting';
import Step4_Voiceover from './components/steps/Step4_Voiceover';
import Step5_Beats from './components/steps/Step5_Beats';
import Step6_Storyboard from './components/steps/Step6_Storyboard';
import Step7_Prompts from './components/steps/Step7_Prompts';
import Step8_Images from './components/steps/Step8_Images';
import Step9_Select from './components/steps/Step9_Select';
import Step10_SvgConvert from './components/steps/Step10_SvgConvert';
import Step11_Transcription from './components/steps/Step11_Transcription';
import Step12_PreEditScan from './components/steps/Step12_PreEditScan';
import Step13_VideoEdit from './components/steps/Step13_VideoEdit';

import { decode, decodeAudioData } from './utils/audio';

const STEPS = [
    "Project Setup", "Summarize", "Scripting", "Voiceover", "Beats",
    "Storyboard", "Prompts", "Images", "Select", "SVG Convert",
    "Transcription", "Pre-Edit Scan", "Video Edit",
];

const App: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(loadInitialState().currentStep);
    const [highestCompletedStep, setHighestCompletedStep] = useState(loadInitialState().highestCompletedStep);
    const [metadata, setMetadata] = useState<ProjectMetadata>(loadInitialState().metadata);
    const [bookContent, setBookContent] = useState(loadInitialState().bookContent);
    const [summary, setSummary] = useState(loadInitialState().summary);
    const [scriptData, setScriptData] = useState<ScriptData>(loadInitialState().scriptData);
    const [scriptingSubStep, setScriptingSubStep] = useState<ScriptingSubStep>(loadInitialState().scriptingSubStep);
    const [voiceoverSegments, setVoiceoverSegments] = useState<VoiceoverSegment[]>(loadInitialState().voiceoverSegments);
    const [beats, setBeats] = useState<Beat[]>(loadInitialState().beats);
    const [storyboards, setStoryboards] = useState<{ [key: string]: StoryboardRow[] }>(loadInitialState().storyboards);
    const [extractedPrompts, setExtractedPrompts] = useState<{ [key: string]: ExtractedPrompt[] }>(loadInitialState().extractedPrompts);
    const [images, setImages] = useState<{ [style: string]: { [beat: string]: string } }>(loadInitialState().images);
    const [imageSelection, setImageSelection] = useState<ImageSelection>(loadInitialState().imageSelection);
    const [flaggedImages, setFlaggedImages] = useState<{ [beat: string]: Set<string> }>(loadInitialState().flaggedImages || {});
    const [checkedImages, setCheckedImages] = useState<Set<string>>(loadInitialState().checkedImages);
    const [svgConversionStatus, setSvgConversionStatus] = useState<{ [beat_number: string]: SvgConversionStatus }>(loadInitialState().svgConversionStatus);
    const [transcriptionData, setTranscriptionData] = useState<TranscriptionWord[]>(loadInitialState().transcriptionData);
    const [preEditScanData, setPreEditScanData] = useState<PreEditScanItem[]>(loadInitialState().preEditScanData);
    const [combinedVoiceoverUrl, setCombinedVoiceoverUrl] = useState<string | null>(loadInitialState().combinedVoiceoverUrl);

    const [isLoading, setIsLoading] = useState(false);
    const [isChatLoading, setIsChatLoading] = useState(false);
    
    const audioContextRef = useRef<AudioContext | null>(null);
    const generatingImagesRef = useRef<Set<string>>(new Set());
    const [imageGenerationStatus, setImageGenerationStatus] = useState<{ [key: string]: 'pending' | 'generating' | 'complete' | 'error' }>({});

    // --- State Persistence Effect ---
    useEffect(() => {
        const flaggedImagesToSave: {[key: string]: string[]} = {};
        for (const beat in flaggedImages) {
            flaggedImagesToSave[beat] = Array.from(flaggedImages[beat]);
        }
        
        const stateToSave = {
            currentStep, highestCompletedStep, metadata, bookContent, summary,
            scriptData, scriptingSubStep, voiceoverSegments, beats, storyboards,
            extractedPrompts, images, imageSelection, svgConversionStatus,
            transcriptionData, preEditScanData, combinedVoiceoverUrl,
            checkedImages: Array.from(checkedImages),
            flaggedImages: flaggedImagesToSave,
        };
        localStorage.setItem('aiVideoPipelineProject', JSON.stringify(stateToSave));
    }, [
        currentStep, highestCompletedStep, metadata, bookContent, summary,
        scriptData, scriptingSubStep, voiceoverSegments, beats, storyboards,
        extractedPrompts, images, imageSelection, svgConversionStatus,
        transcriptionData, preEditScanData, combinedVoiceoverUrl, checkedImages, flaggedImages
    ]);

    const advanceStep = () => {
        const nextStep = currentStep + 1;
        if (nextStep <= STEPS.length) {
            setCurrentStep(nextStep);
            if (nextStep > highestCompletedStep) {
                setHighestCompletedStep(nextStep);
            }
        }
    };
    
    const goBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleStepClick = (step: number) => {
      if (step <= highestCompletedStep) {
        setCurrentStep(step);
      }
    };

    // --- Handlers for each step ---
    
    const handleCreateProject = useCallback(async () => {
        if (!metadata.projectPath || !bookContent || !metadata.title) return;
        
        setIsLoading(true);
        try {
            const apiService = await import('./services/apiService');
            await apiService.createProject(metadata.projectPath, bookContent, metadata.title);
        } catch (error) {
            console.error('Failed to create project:', error);
        } finally {
            setIsLoading(false);
        }
    }, [metadata.projectPath, bookContent, metadata.title]);

    const handleGenerateSummary = useCallback(async () => {
        if (!metadata.projectPath || !metadata.title || !bookContent) {
            console.error('Missing required data for summary generation');
            return;
        }
        
        setIsLoading(true);
        try {
            // Generate summary using frontend Gemini API
            const generatedSummary = await geminiService.generateSummary(metadata.title, bookContent);
            setSummary(generatedSummary);
            
            // Save summary to backend
            const apiService = await import('./services/apiService');
            const response = await apiService.saveSummary(metadata.projectPath, generatedSummary);
            
            if (!response.success) {
                console.error('Failed to save summary:', response.error);
            }
        } catch (error) {
            console.error('Failed to generate summary:', error);
        } finally {
            setIsLoading(false);
        }
    }, [metadata.projectPath, metadata.title, bookContent]);

    const handleRefineSummary = useCallback(async (instruction: string) => {
        if (!metadata.projectPath) {
            console.error('No project path available');
            return;
        }
        
        setIsChatLoading(true);
        try {
            // Refine summary using frontend Gemini API
            const refinedSummary = await geminiService.refineText(summary, instruction);
            setSummary(refinedSummary);
            
            // Save refined summary to backend
            const apiService = await import('./services/apiService');
            const response = await apiService.saveSummary(metadata.projectPath, refinedSummary);
            
            if (!response.success) {
                console.error('Failed to save refined summary:', response.error);
            }
        } catch (error) {
            console.error('Failed to refine summary:', error);
        } finally {
            setIsChatLoading(false);
        }
    }, [summary, metadata.projectPath]);
    
    // Scripting Handlers
    const handleGenerateHooks = useCallback(async () => {
        setIsLoading(true);
        const hooks = await geminiService.generateHooks(summary, metadata.title);
        setScriptData(prev => ({...prev, hooks, selectedHook: ''}));
        setIsLoading(false);
    }, [summary, metadata.title]);

    const handleRefineHooks = useCallback(async (instruction: string) => {
        setIsChatLoading(true);
        const currentHooksText = scriptData.hooks.join('\n');
        const refinedText = await geminiService.refineText(currentHooksText, instruction);
        setScriptData(prev => ({...prev, hooks: refinedText.split('\n').filter(h => h.trim() !== ''), selectedHook: ''}));
        setIsChatLoading(false);
    }, [scriptData.hooks]);
    
    const handleSelectHook = (hook: string) => {
        setScriptData(prev => ({ ...prev, selectedHook: hook }));
    };

    const handleGenerateOutline = useCallback(async () => {
        if (!scriptData.selectedHook) return;
        setIsLoading(true);
        const outline = await geminiService.generateOutline(summary, metadata.title, scriptData.selectedHook);
        setScriptData(prev => ({ ...prev, outline }));
        setIsLoading(false);
    }, [summary, metadata.title, scriptData.selectedHook]);

    const handleRefineOutline = useCallback(async (instruction: string) => {
        setIsChatLoading(true);
        const refined = await geminiService.refineText(scriptData.outline, instruction);
        setScriptData(prev => ({...prev, outline: refined}));
        setIsChatLoading(false);
    }, [scriptData.outline]);
    
    const handleGenerateFullScript = useCallback(async () => {
        if (!metadata.projectPath) {
            console.error('No project path available');
            return;
        }
        
        setIsLoading(true);
        try {
            // Generate script using frontend Gemini API
            const fullScript = await geminiService.generateFullScript(scriptData.outline, scriptData.selectedHook);
            setScriptData(prev => ({ ...prev, fullScript }));
            
            // Save script to backend
            const apiService = await import('./services/apiService');
            const response = await apiService.saveScript(metadata.projectPath, fullScript);
            
            if (!response.success) {
                console.error('Failed to save script:', response.error);
            }
        } catch (error) {
            console.error('Failed to generate script:', error);
        } finally {
            setIsLoading(false);
        }
    }, [scriptData.outline, scriptData.selectedHook, metadata.projectPath]);

    const handleRefineFullScript = useCallback(async (instruction: string) => {
        if (!metadata.projectPath) {
            console.error('No project path available');
            return;
        }
        
        setIsChatLoading(true);
        try {
            // Refine script using frontend Gemini API
            const refined = await geminiService.refineText(scriptData.fullScript, instruction);
            setScriptData(prev => ({ ...prev, fullScript: refined }));
            
            // Save refined script to backend
            const apiService = await import('./services/apiService');
            const response = await apiService.saveScript(metadata.projectPath, refined);
            
            if (!response.success) {
                console.error('Failed to save refined script:', response.error);
            }
        } catch (error) {
            console.error('Failed to refine script:', error);
        } finally {
            setIsChatLoading(false);
        }
    }, [scriptData.fullScript, metadata.projectPath]);

    // Voiceover Handlers
    const handleGenerateVoiceoverSegments = useCallback(async () => {
        setIsLoading(true);
        try {
            const apiService = await import('./services/apiService');
            const response = await apiService.extractVoiceoverSegments(metadata.projectPath);
            
            if (response.success && response.segments) {
                setVoiceoverSegments(response.segments.map((s, i) => ({ id: i, text: s, status: 'pending' })));
            } else {
                console.error('Failed to extract segments:', response.error);
                alert('Failed to extract voiceover segments: ' + (response.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error extracting segments:', error);
            alert('Error extracting voiceover segments: ' + (error as Error).message);
        } finally {
            setIsLoading(false);
        }
    }, [metadata.projectPath]);
    
    const handleGenerateVoiceoverForSegment = useCallback(async (segmentId: number) => {
        if (!metadata.projectPath) {
            console.error('No project path available');
            return;
        }
        
        setVoiceoverSegments(prev => prev.map(s => s.id === segmentId ? { ...s, status: 'generating', error: undefined } : s));
        const segment = voiceoverSegments.find(s => s.id === segmentId);
        
        if (segment) {
            try {
                // Generate voiceover using backend API
                const apiService = await import('./services/apiService');
                const response = await apiService.generateVoiceover(metadata.projectPath, segment.text, segmentId);
                
                if (response.success && response.filepath) {
                    // Create audio URL from the saved file path
                    const audioUrl = `file://${response.filepath}`;
                    setVoiceoverSegments(prev => prev.map(s => 
                        s.id === segmentId ? { ...s, status: 'complete', audioUrl, error: undefined } : s
                    ));
                } else {
                    const errorMessage = response.error || 'Failed to generate voiceover. Please try again.';
                    console.error('Failed to generate voiceover:', errorMessage);
                    setVoiceoverSegments(prev => prev.map(s => 
                        s.id === segmentId ? { ...s, status: 'error', error: errorMessage } : s
                    ));
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Network error. Please check your connection and try again.';
                console.error('Failed to generate voiceover:', error);
                setVoiceoverSegments(prev => prev.map(s => 
                    s.id === segmentId ? { ...s, status: 'error', error: errorMessage } : s
                ));
            }
        }
    }, [voiceoverSegments, metadata.projectPath]);

    const handlePlayAudio = useCallback(async (audioUrl: string) => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const audioContext = audioContextRef.current;
        const response = await fetch(audioUrl);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start();
    }, []);

    const handleCombineVoiceovers = useCallback(async () => {
        setIsLoading(true);
        const url = await geminiService.combineVoiceovers(voiceoverSegments);
        setCombinedVoiceoverUrl(url);
        setIsLoading(false);
    }, [voiceoverSegments]);
    
    // Beats
    const handleGenerateBeats = useCallback(async () => {
        setIsLoading(true);
        try {
            const apiService = await import('./services/apiService');
            const response = await apiService.generateBeats(metadata.projectPath);
            
            if (response.success && response.beats) {
                setBeats(response.beats);
            } else {
                console.error('Failed to generate beats:', response.error);
                alert('Failed to generate beats: ' + (response.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error generating beats:', error);
            alert('Error generating beats: ' + (error as Error).message);
        } finally {
            setIsLoading(false);
        }
    }, [metadata.projectPath]);

    const handleRefineBeats = useCallback(async (instruction: string) => {
        setIsChatLoading(true);
        try {
            const beatsAsText = beats.map(b => `${b.beat_number}: ${b.script_phrase}`).join('\n');
            const refined = await geminiService.refineText(beatsAsText, instruction);
            
            // Simple parsing, might need more robust logic
            const newBeats: Beat[] = refined.split('\n').map(line => {
                const parts = line.split(':');
                return { beat_number: parts[0]?.trim(), script_phrase: parts.slice(1).join(':').trim() };
            }).filter(b => b.beat_number && b.script_phrase);
            
            setBeats(newBeats);
            
            // Save refined beats to backend
            const apiService = await import('./services/apiService');
            await apiService.saveBeats(metadata.projectPath, newBeats);
        } catch (error) {
            console.error('Error refining beats:', error);
            alert('Error refining beats: ' + (error as Error).message);
        } finally {
            setIsChatLoading(false);
        }
    }, [beats, metadata.projectPath]);

    // Storyboard
    const handleGenerateStoryboard = useCallback(async (style: 'illustration' | 'clear' | 'consistent') => {
        setIsLoading(true);
        try {
            const apiService = await import('./services/apiService');
            const response = await apiService.generateStoryboard(metadata.projectPath, style);
            
            if (response.success && response.storyboard) {
                setStoryboards(prev => ({ ...prev, [style]: response.storyboard! }));
                
                // Extract prompts from storyboard
                const prompts = response.storyboard.map(row => ({
                    shot_number: row.shot_number,
                    beat_number: row.beat_number,
                    script_phrase: row.script_phrase,
                    transition_type: row.transition_type,
                    ai_prompt: row.ai_prompt
                }));
                setExtractedPrompts(prev => ({ ...prev, [style]: prompts }));
            } else {
                console.error('Failed to generate storyboard:', response.error);
                alert('Failed to generate storyboard: ' + (response.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error generating storyboard:', error);
            alert('Error generating storyboard: ' + (error as Error).message);
        } finally {
            setIsLoading(false);
        }
    }, [metadata.projectPath]);
    
    // Images
    const handleGenerateImages = useCallback(async () => {
        const allPrompts: { style: string; beat_number: string; ai_prompt: string }[] = [];
        for (const style in extractedPrompts) {
            extractedPrompts[style].forEach(p => {
                allPrompts.push({ style, beat_number: p.beat_number, ai_prompt: p.ai_prompt });
            });
        }

        const initialStatus = allPrompts.reduce((acc, p) => {
            acc[`${p.style}-${p.beat_number}`] = 'pending';
            return acc;
        }, {} as { [key: string]: 'pending' | 'generating' | 'complete' | 'error' });
        setImageGenerationStatus(initialStatus);

        const promises = allPrompts.map(p => async () => {
            const key = `${p.style}-${p.beat_number}`;
            if (generatingImagesRef.current.has(key)) return;
            
            generatingImagesRef.current.add(key);
            setImageGenerationStatus(prev => ({...prev, [key]: 'generating'}));
            try {
                const imageUrl = await geminiService.generateImage(p.ai_prompt);
                setImages(prev => ({
                    ...prev,
                    [p.style]: {
                        ...prev[p.style],
                        [p.beat_number]: imageUrl,
                    }
                }));
                setImageGenerationStatus(prev => ({...prev, [key]: 'complete'}));
            } catch (e) {
                console.error(`Failed to generate image for ${key}`, e);
                setImageGenerationStatus(prev => ({...prev, [key]: 'error'}));
            } finally {
                generatingImagesRef.current.delete(key);
            }
        });

        // Run promises concurrently with a limit
        const concurrencyLimit = 4;
        let executing: Promise<void>[] = [];
        for (const promiseFn of promises) {
            const p = promiseFn().catch(e => console.error(e));
            executing.push(p);
            if (executing.length >= concurrencyLimit) {
                await Promise.race(executing);
                executing = executing.filter(executedP => !executedP.then);
            }
        }
        await Promise.all(executing);
        
    }, [extractedPrompts]);

    const handleImageSelection = (beat_number: string, style: 'illustration' | 'clear' | 'consistent', url: string) => {
        setImageSelection(prev => ({
            ...prev,
            [beat_number]: { style, url }
        }));
    };

    const handleImageFlagToggle = (beat_number: string, imageUrl: string) => {
        setFlaggedImages(prev => {
            const newFlags = { ...prev };
            const beatFlags = new Set(newFlags[beat_number]);
    
            if (beatFlags.has(imageUrl)) {
                beatFlags.delete(imageUrl);
            } else {
                beatFlags.add(imageUrl);
            }
    
            if (beatFlags.size === 0) {
                delete newFlags[beat_number];
            } else {
                newFlags[beat_number] = beatFlags;
            }
    
            return newFlags;
        });
    };

    // SVG Conversion
    const handleConvertImageToSvg = useCallback(async (beat_number: string, imageUrl: string) => {
        setSvgConversionStatus(prev => ({
            ...prev,
            [beat_number]: { status: 'converting', progress: 0 }
        }));
        try {
            const svgUrl = await geminiService.convertToSvg(imageUrl, (progress) => {
                 setSvgConversionStatus(prev => ({
                    ...prev,
                    [beat_number]: { ...prev[beat_number], progress, status: 'converting' }
                }));
            });
            setSvgConversionStatus(prev => ({
                ...prev,
                [beat_number]: { status: 'complete', progress: 100, svgUrl }
            }));
        } catch (e) {
            console.error(e);
            setSvgConversionStatus(prev => ({
                ...prev,
                [beat_number]: { status: 'error', progress: 0 }
            }));
        }
    }, []);

    const handleConvertAllToSvg = useCallback(async () => {
        const conversionPromises = Object.entries(imageSelection)
            .filter(([beat_number]) => {
                const currentStatus = svgConversionStatus[beat_number]?.status;
                return currentStatus !== 'complete' && currentStatus !== 'converting';
            })
            .map(([beat_number, selection]) => {
                if (selection) {
                    return handleConvertImageToSvg(beat_number, selection.url);
                }
                return Promise.resolve();
            });
    
        await Promise.all(conversionPromises);
    }, [imageSelection, svgConversionStatus, handleConvertImageToSvg]);

    // Transcription
    const handleGenerateTranscription = useCallback(async () => {
        setIsLoading(true);
        const result = await geminiService.generateTranscription(scriptData.fullScript);
        setTranscriptionData(result);
        setIsLoading(false);
    }, [scriptData.fullScript]);

    // Pre-Edit Scan
    const handleGeneratePreEditScan = useCallback(async () => {
        setIsLoading(true);
        const result = await geminiService.generatePreEditScan(storyboards.illustration, transcriptionData, imageSelection);
        setPreEditScanData(result);
        setIsLoading(false);
    }, [storyboards, transcriptionData, imageSelection]);
    
    // --- Step Completion Logic ---
    const isStepComplete = () => {
        switch (currentStep) {
            case 1: return !!(metadata.title && metadata.projectPath);
            case 2: return summary.length > 0;
            case 3: return scriptData.fullScript.length > 0;
            case 4: return voiceoverSegments.length > 0;
            case 5: return beats.length > 0;
            case 6: return Object.values(storyboards).some(s => s.length > 0);
            case 7: return Object.values(extractedPrompts).some(p => p.length > 0);
            case 8: return Object.values(images).some(s => Object.keys(s).length > 0);
            case 9: return Object.keys(imageSelection).length > 0;
            case 10: {
                const selectedBeats = Object.keys(imageSelection);
                if (selectedBeats.length === 0) return false;
                return selectedBeats.every(beat => svgConversionStatus[beat]?.status === 'complete');
            }
            case 11: return transcriptionData.length > 0;
            case 12: return preEditScanData.length > 0;
            case 13: return true;
            default: return false;
        }
    };
    
    const advanceStepAndTriggerNext = useCallback(() => {
        const nextStep = currentStep + 1;

        // Trigger generation for the *upcoming* step.
        // These are fire-and-forget; the user will see the loading state on the next screen.
        switch (nextStep) {
            case 2:
                handleGenerateSummary();
                break;
            case 3:
                handleGenerateHooks();
                break;
            case 4:
                handleGenerateVoiceoverSegments();
                break;
            case 5:
                handleGenerateBeats();
                break;
        }

        advanceStep();
    }, [currentStep, handleGenerateSummary, handleGenerateHooks, handleGenerateVoiceoverSegments, handleGenerateBeats]);


    // --- Primary Button Logic ---
   const getButtonState = () => {
        if (currentStep >= STEPS.length) {
            return { text: null, disabled: true, action: () => {} };
        }
       
        let text = `Next: ${STEPS[currentStep]} \u2192`;
        let action: () => void = advanceStepAndTriggerNext;
        let disabled = isLoading || isChatLoading || !isStepComplete();

        switch (currentStep) {
            case 1:
                disabled = isLoading || isChatLoading || !isStepComplete();
                break;
            case 2:
                if (summary.length === 0) {
                    text = "Generate Summary";
                    action = handleGenerateSummary;
                    disabled = isLoading || isChatLoading;
                }
                break;
            case 3:
                if (scriptingSubStep === 'hooks') {
                    if (scriptData.hooks.length === 0) {
                        text = "Generate Hooks";
                        action = handleGenerateHooks;
                        disabled = isLoading || isChatLoading;
                    } else if (!scriptData.selectedHook) {
                        text = "Select a Hook to Continue";
                        disabled = true;
                    } else {
                        text = "Proceed to Outline";
                        action = () => setScriptingSubStep('outline');
                        disabled = isLoading || isChatLoading;
                    }
                } else if (scriptingSubStep === 'outline') {
                    if (scriptData.outline.length === 0) {
                        text = "Generate Outline";
                        action = handleGenerateOutline;
                        disabled = isLoading || isChatLoading;
                    } else {
                        text = "Proceed to Full Script";
                        action = () => setScriptingSubStep('script');
                        disabled = isLoading || isChatLoading;
                    }
                } else if (scriptingSubStep === 'script') {
                     if (scriptData.fullScript.length === 0) {
                        text = "Generate Full Script";
                        action = handleGenerateFullScript;
                        disabled = isLoading || isChatLoading;
                    }
                }
                break;
            case 4:
                if (voiceoverSegments.length === 0) {
                    text = "Generate Segments";
                    action = handleGenerateVoiceoverSegments;
                    disabled = isLoading || isChatLoading;
                }
                break;
            case 5:
                if (beats.length === 0) {
                    text = "Generate Beats";
                    action = handleGenerateBeats;
                    disabled = isLoading || isChatLoading;
                }
                break;
            case 11:
                if (transcriptionData.length === 0) {
                    text = "Generate Transcription";
                    action = handleGenerateTranscription;
                    disabled = isLoading || isChatLoading;
                }
                break;
            case 12:
                 if (!combinedVoiceoverUrl && voiceoverSegments.some(s => s.status === 'complete')) {
                    text = "Combine Audio";
                    action = handleCombineVoiceovers;
                    disabled = isLoading || isChatLoading || !voiceoverSegments.every(s => s.status === 'complete');
                } else if (preEditScanData.length === 0) {
                    text = "Generate Pre-Edit Scan";
                    action = handleGeneratePreEditScan;
                    disabled = isLoading || isChatLoading;
                } else {
                    action = advanceStep; // Final step doesn't trigger anything
                }
                break;
            default:
                action = advanceStep; // Default next action
                break;
        }

        return { text, disabled, action };
   };
   
   const buttonState = getButtonState();

    // --- RENDER ---
    const renderStepContent = () => {
        switch (currentStep) {
            case 1: return <Step1_ProjectSetup metadata={metadata} setMetadata={setMetadata} setBookContent={setBookContent} onCreateProject={handleCreateProject} />;
            case 2: return <Step2_Summarize summary={summary} isGenerating={isLoading} isChatLoading={isChatLoading} handleGenerateSummary={handleGenerateSummary} handleRefineSummary={handleRefineSummary} />;
            case 3: return <Step3_Scripting 
                            scriptingSubStep={scriptingSubStep}
                            scriptData={scriptData}
                            isGenerating={isLoading}
                            isChatLoading={isChatLoading}
                            setScriptData={setScriptData}
                            handleGenerateHooks={handleGenerateHooks}
                            handleRefineHooks={handleRefineHooks}
                            handleSelectHook={handleSelectHook}
                            handleGenerateOutline={handleGenerateOutline}
                            handleRefineOutline={handleRefineOutline}
                            handleGenerateFullScript={handleGenerateFullScript}
                            handleRefineFullScript={handleRefineFullScript}
                         />;
            case 4: return <Step4_Voiceover voiceoverSegments={voiceoverSegments} handleGenerateVoiceoverForSegment={handleGenerateVoiceoverForSegment} handlePlayAudio={handlePlayAudio} setVoiceoverSegments={setVoiceoverSegments} handleGenerateVoiceoverSegments={handleGenerateVoiceoverSegments} />;
            case 5: return <Step5_Beats beats={beats} isGenerating={isLoading} isChatLoading={isChatLoading} handleGenerateBeats={handleGenerateBeats} handleRefineBeats={handleRefineBeats} />;
            case 6: return <Step6_Storyboard storyboards={storyboards} isGenerating={isLoading} handleGenerateStoryboard={handleGenerateStoryboard} />;
            case 7: return <Step7_Prompts extractedPrompts={extractedPrompts} />;
            case 8: return <Step8_Images images={images} extractedPrompts={extractedPrompts} handleGenerateImages={handleGenerateImages} imageGenerationStatus={imageGenerationStatus} />;
            case 9: return <Step9_Select beats={beats} images={images} imageSelection={imageSelection} handleImageSelection={handleImageSelection} flaggedImages={flaggedImages} handleImageFlagToggle={handleImageFlagToggle} />;
            case 10: return <Step10_SvgConvert imageSelection={imageSelection} svgConversionStatus={svgConversionStatus} handleConvertAllToSvg={handleConvertAllToSvg} />;
            case 11: return <Step11_Transcription transcriptionData={transcriptionData} isGenerating={isLoading} handleGenerateTranscription={handleGenerateTranscription} setTranscriptionData={setTranscriptionData} />;
            case 12: return <Step12_PreEditScan preEditScanData={preEditScanData} />;
            case 13: return <Step13_VideoEdit combinedVoiceoverUrl={combinedVoiceoverUrl} scanData={preEditScanData} />;
            default: return <div>Step not found.</div>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-8">
            <header className="w-full max-w-7xl mb-8">
                <h1 className="text-4xl font-bold text-center mb-2">AI YouTube Video Pipeline</h1>
                <p className="text-center text-gray-400">Step-by-step automation for video creation</p>
            </header>
            <div className="w-full max-w-7xl bg-gray-800/50 rounded-lg shadow-2xl p-4 sm:p-8 border border-gray-700/50 mb-8">
                <Stepper currentStep={currentStep} steps={STEPS} onStepClick={handleStepClick} highestCompletedStep={highestCompletedStep} />
            </div>
            <main className="w-full max-w-7xl bg-gray-800/50 rounded-lg shadow-2xl p-4 sm:p-8 border border-gray-700/50 flex-grow">
                {renderStepContent()}
            </main>
             <footer className="w-full max-w-7xl mt-8">
                <div className="flex justify-between items-center gap-4">
                     {currentStep > 1 ? (
                         <button
                            onClick={goBack}
                            disabled={isLoading || isChatLoading}
                            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-50"
                        >
                            &larr; Back
                        </button>
                    ) : (
                        <div /> // Placeholder to keep the next button on the right
                    )}
                    {buttonState.text && (
                        <button
                            onClick={buttonState.action}
                            disabled={buttonState.disabled}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:bg-indigo-800 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Generating...' : buttonState.text}
                        </button>
                    )}
                </div>
            </footer>
        </div>
    );
};

export default App;