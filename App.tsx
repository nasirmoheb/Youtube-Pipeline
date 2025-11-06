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
        const stateToSave = {
            currentStep, highestCompletedStep, metadata, bookContent, summary,
            scriptData, scriptingSubStep, voiceoverSegments, beats, storyboards,
            extractedPrompts, images, imageSelection, svgConversionStatus,
            transcriptionData, preEditScanData, combinedVoiceoverUrl,
            checkedImages: Array.from(checkedImages),
        };
        localStorage.setItem('aiVideoPipelineProject', JSON.stringify(stateToSave));
    }, [
        currentStep, highestCompletedStep, metadata, bookContent, summary,
        scriptData, scriptingSubStep, voiceoverSegments, beats, storyboards,
        extractedPrompts, images, imageSelection, svgConversionStatus,
        transcriptionData, preEditScanData, combinedVoiceoverUrl, checkedImages
    ]);

    const handleNext = () => {
        const nextStep = currentStep + 1;
        if (nextStep <= STEPS.length) {
            setCurrentStep(nextStep);
            if (nextStep > highestCompletedStep) {
                setHighestCompletedStep(nextStep);
            }
        }
    };
    
    const handleStepClick = (step: number) => {
      if (step <= highestCompletedStep) {
        setCurrentStep(step);
      }
    };

    // --- Handlers for each step ---

    const handleGenerateSummary = useCallback(async () => {
        setIsLoading(true);
        const result = await geminiService.generateSummary(metadata.title, bookContent);
        setSummary(result);
        setIsLoading(false);
    }, [metadata.title, bookContent]);

    const handleRefineSummary = useCallback(async (instruction: string) => {
        setIsChatLoading(true);
        const result = await geminiService.refineText(summary, instruction);
        setSummary(result);
        setIsChatLoading(false);
    }, [summary]);
    
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
        setScriptingSubStep('outline');
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
        setIsLoading(true);
        const fullScript = await geminiService.generateFullScript(scriptData.outline, scriptData.selectedHook);
        setScriptData(prev => ({ ...prev, fullScript }));
        setIsLoading(false);
    }, [scriptData.outline, scriptData.selectedHook]);

    const handleRefineFullScript = useCallback(async (instruction: string) => {
        setIsChatLoading(true);
        const refined = await geminiService.refineText(scriptData.fullScript, instruction);
        setScriptData(prev => ({ ...prev, fullScript: refined }));
        setIsChatLoading(false);
    }, [scriptData.fullScript]);

    // Voiceover Handlers
    const handleGenerateVoiceoverSegments = useCallback(async () => {
        setIsLoading(true);
        const segments = await geminiService.generateVoiceoverSegments(scriptData.fullScript);
        setVoiceoverSegments(segments.map((s, i) => ({ id: i, text: s, status: 'pending' })));
        setIsLoading(false);
    }, [scriptData.fullScript]);
    
    const handleGenerateVoiceoverForSegment = useCallback(async (segmentId: number) => {
        setVoiceoverSegments(prev => prev.map(s => s.id === segmentId ? { ...s, status: 'generating' } : s));
        const segment = voiceoverSegments.find(s => s.id === segmentId);
        if (segment) {
            const audioBase64 = await geminiService.generateVoiceover(segment.text);
            const audioUrl = `data:audio/wav;base64,${audioBase64}`;
            setVoiceoverSegments(prev => prev.map(s => s.id === segmentId ? { ...s, status: 'complete', audioUrl } : s));
        }
    }, [voiceoverSegments]);

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
        const result = await geminiService.generateBeats(scriptData.fullScript);
        setBeats(result);
        setIsLoading(false);
    }, [scriptData.fullScript]);

    const handleRefineBeats = useCallback(async (instruction: string) => {
        setIsChatLoading(true);
        const beatsAsText = beats.map(b => `${b.beat_number}: ${b.script_phrase}`).join('\n');
        const refined = await geminiService.refineText(beatsAsText, instruction);
        // Simple parsing, might need more robust logic
        const newBeats: Beat[] = refined.split('\n').map(line => {
            const parts = line.split(':');
            return { beat_number: parts[0]?.trim(), script_phrase: parts.slice(1).join(':').trim() };
        }).filter(b => b.beat_number && b.script_phrase);
        setBeats(newBeats);
        setIsChatLoading(false);
    }, [beats]);

    // Storyboard
    const handleGenerateStoryboard = useCallback(async (style: 'illustration' | 'clear' | 'consistent') => {
        setIsLoading(true);
        const result = await geminiService.generateStoryboard(beats, style);
        setStoryboards(prev => ({ ...prev, [style]: result }));
        const prompts = await geminiService.extractPrompts(result);
        setExtractedPrompts(prev => ({ ...prev, [style]: prompts }));
        setIsLoading(false);
    }, [beats]);
    
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

    // --- RENDER ---
    const renderStepContent = () => {
        switch (currentStep) {
            case 1: return <Step1_ProjectSetup metadata={metadata} setMetadata={setMetadata} setBookContent={setBookContent} />;
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
            case 9: return <Step9_Select beats={beats} images={images} imageSelection={imageSelection} handleImageSelection={handleImageSelection} />;
            case 10: return <Step10_SvgConvert imageSelection={imageSelection} svgConversionStatus={svgConversionStatus} handleConvertImageToSvg={handleConvertImageToSvg} />;
            case 11: return <Step11_Transcription transcriptionData={transcriptionData} isGenerating={isLoading} handleGenerateTranscription={handleGenerateTranscription} />;
            case 12: return <Step12_PreEditScan preEditScanData={preEditScanData} />;
            case 13: return <Step13_VideoEdit combinedVoiceoverUrl={combinedVoiceoverUrl} scanData={preEditScanData} />;
            default: return <div>Step not found.</div>;
        }
    };
    
    const isStepComplete = () => {
        switch (currentStep) {
            case 1: return metadata.title && metadata.projectPath;
            case 2: return summary.length > 0;
            case 3: return scriptData.fullScript.length > 0;
            case 4: return voiceoverSegments.length > 0 && voiceoverSegments.every(s => s.status === 'complete');
            case 5: return beats.length > 0;
            case 6: return Object.values(storyboards).some(s => s.length > 0);
            case 7: return Object.values(extractedPrompts).some(p => p.length > 0);
            case 8: return Object.values(images).some(s => Object.keys(s).length > 0);
            case 9: return Object.keys(imageSelection).length > 0;
            case 10: return Object.keys(svgConversionStatus).length > 0 && Object.values(svgConversionStatus).every(s => s.status === 'complete');
            case 11: return transcriptionData.length > 0;
            case 12: return preEditScanData.length > 0;
            case 13: return true;
            default: return false;
        }
    };
    
    const showNextButton = currentStep < STEPS.length;
    const isNextDisabled = isLoading || isChatLoading || !isStepComplete();

    const getButtonAction = () => {
        switch (currentStep) {
            case 2: return handleGenerateSummary;
            case 3: 
                if (scriptingSubStep === 'hooks' && scriptData.hooks.length === 0) return handleGenerateHooks;
                if (scriptingSubStep === 'outline' && scriptData.outline.length === 0) return handleGenerateOutline;
                if (scriptingSubStep === 'script' && scriptData.fullScript.length === 0) return handleGenerateFullScript;
                return undefined;
            case 4: 
                if (voiceoverSegments.length === 0) return handleGenerateVoiceoverSegments;
                if (!combinedVoiceoverUrl) return handleCombineVoiceovers;
                return undefined;
            case 5: return beats.length === 0 ? handleGenerateBeats : undefined;
            case 11: return transcriptionData.length === 0 ? handleGenerateTranscription : undefined;
            case 12: return preEditScanData.length === 0 ? handleGeneratePreEditScan : undefined;
            default: return undefined;
        }
    };
    
    const buttonAction = getButtonAction();

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
                <div className="flex justify-end items-center gap-4">
                    {buttonAction && (
                        <button
                            onClick={buttonAction}
                            disabled={isLoading}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:bg-green-800 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Generating...' : 'Generate'}
                        </button>
                    )}
                    {showNextButton && (
                        <button
                            onClick={handleNext}
                            disabled={isNextDisabled}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:bg-indigo-800 disabled:cursor-not-allowed"
                        >
                            Next: {STEPS[currentStep]} &rarr;
                        </button>
                    )}
                </div>
            </footer>
        </div>
    );
};

export default App;
