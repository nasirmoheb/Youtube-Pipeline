
import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { ProjectMetadata, ScriptData, VoiceoverSegment, Beat, StoryboardRow, ExtractedPrompt, ImageSelection, SvgConversionStatus, TranscriptionWord, PreEditScanItem } from './types';
import * as geminiService from './services/geminiService';
import Stepper from './components/Stepper';
import GeminiInteraction from './components/GeminiInteraction';
import MarkdownViewer from './components/MarkdownViewer';
import VideoEditor from './components/VideoEditor';
import { decode, decodeAudioData } from './utils/audio';

const STEPS = [
    "Project Setup",
    "Summarize",
    "Scripting",
    "Voiceover",
    "Beats",
    "Storyboard",
    "Prompts",
    "Images",
    "Select",
    "SVG Convert",
    "Transcription",
    "Pre-Edit Scan",
    "Video Edit",
];

type ScriptingSubStep = 'hooks' | 'outline' | 'script';

// --- State Persistence ---

const DEFAULT_STATE = {
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
    checkedImages: [],
    svgConversionStatus: {},
    transcriptionData: [],
    preEditScanData: [],
    videoUrl: null,
    combinedVoiceoverUrl: null,
};

const loadInitialState = () => {
    try {
        const savedStateJSON = localStorage.getItem('aiVideoPipelineProject');
        if (savedStateJSON) {
            const savedState = JSON.parse(savedStateJSON);
            // Ensure checkedImages is loaded as a Set
            if (savedState.checkedImages && Array.isArray(savedState.checkedImages)) {
                savedState.checkedImages = new Set(savedState.checkedImages);
            } else {
                 savedState.checkedImages = new Set();
            }
            return { ...DEFAULT_STATE, ...savedState };
        }
    } catch (e) {
        console.error("Could not load or parse saved state, starting fresh.", e);
        localStorage.removeItem('aiVideoPipelineProject');
    }
    // Initialize checkedImages as a Set
    const defaultState = { ...DEFAULT_STATE, checkedImages: new Set() };
    return defaultState;
};

// Helper components for each step, defined outside App to prevent re-renders
const Step1_ProjectSetup: React.FC<{
    metadata: ProjectMetadata;
    setMetadata: React.Dispatch<React.SetStateAction<ProjectMetadata>>;
    setBookContent: React.Dispatch<React.SetStateAction<string>>;
}> = ({ metadata, setMetadata, setBookContent }) => {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setMetadata(prev => ({ ...prev, bookName: file.name }));
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target && typeof event.target.result === 'string') {
                    setBookContent(event.target.result);
                }
            };
            reader.readAsText(file);
        }
    };
    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold">1. Project Setup</h2>
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-300">Video Title</label>
                <input type="text" id="title" value={metadata.title} onChange={e => setMetadata(p => ({ ...p, title: e.target.value }))} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
            </div>
            <div>
                <label htmlFor="book" className="block text-sm font-medium text-gray-300">Upload Book (Text File)</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4 4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        <div className="flex text-sm text-gray-400"><label htmlFor="file-upload" className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-indigo-400 hover:text-indigo-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 focus-within:ring-indigo-500"><span>Upload a file</span><input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".txt"/></label><p className="pl-1">or drag and drop</p></div>
                        <p className="text-xs text-gray-500">{metadata.bookName || 'TXT up to 10MB'}</p>
                    </div>
                </div>
            </div>
            <div>
                <label htmlFor="path" className="block text-sm font-medium text-gray-300">Project Directory Path</label>
                <input type="text" id="path" value={metadata.projectPath} onChange={e => setMetadata(p => ({ ...p, projectPath: e.target.value }))} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
            </div>
        </div>
    );
};

const PromptCodeDisplay: React.FC<{ style: string; prompts: ExtractedPrompt[] }> = ({ style, prompts }) => {
    const [copied, setCopied] = useState(false);
    const codeString = `const prompts_${style} = ${JSON.stringify(prompts, null, 2)};`;

    const handleCopy = () => {
        navigator.clipboard.writeText(codeString).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };
    
    const ClipboardIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5 .124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" /></svg>;
    const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>;

    return (
        <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="capitalize font-bold text-lg mb-2 border-b border-gray-700 pb-2">{style}</h3>
            <div className="relative bg-gray-900 rounded-md p-4">
                <button onClick={handleCopy} title="Copy code" className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-md transition-colors">
                    {copied ? <CheckIcon className="w-5 h-5 text-green-400"/> : <ClipboardIcon className="w-5 h-5"/>}
                </button>
                <pre className="text-sm overflow-x-auto text-gray-300"><code>{codeString}</code></pre>
            </div>
        </div>
    );
};

const Step9_SelectImages: React.FC<{
    beats: Beat[];
    storyboards: { [key: string]: StoryboardRow[] };
    images: { [key:string]: { [beat_number: string]: string } };
    imageSelection: ImageSelection;
    checkedImages: Set<string>;
    handleImageSelect: (beat_number: string, style: 'illustration' | 'clear' | 'consistent', url: string) => void;
    handleImageCheck: (url: string) => void;
}> = ({ beats, images, imageSelection, checkedImages, handleImageSelect, handleImageCheck }) => {
    const [selectedBeat, setSelectedBeat] = useState<string | undefined>(beats[0]?.beat_number);

    useEffect(() => {
        if (beats.length > 0 && !beats.find(b => b.beat_number === selectedBeat)) {
            setSelectedBeat(beats[0].beat_number);
        }
    }, [beats, selectedBeat]);

    const currentBeatIndex = selectedBeat ? beats.findIndex(b => b.beat_number === selectedBeat) : -1;

    const handlePrevious = () => {
        if (currentBeatIndex > 0) {
            setSelectedBeat(beats[currentBeatIndex - 1].beat_number);
        }
    };

    const handleNext = () => {
        if (currentBeatIndex !== -1 && currentBeatIndex < beats.length - 1) {
            setSelectedBeat(beats[currentBeatIndex + 1].beat_number);
        }
    };
    
    const ChevronLeftIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>;
    const ChevronRightIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>;

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-2xl font-bold mb-4">9. Select Best Image per Beat</h2>
            
            <div className="mb-4 bg-gray-800 p-4 rounded-lg flex items-center justify-between">
                <div>
                    <label htmlFor="beat-select" className="text-lg font-semibold">Beat:</label>
                    <select id="beat-select" value={selectedBeat || ''} onChange={e => setSelectedBeat(e.target.value)} className="ml-2 bg-gray-700 border border-gray-600 rounded-md p-2">
                       {beats.map(b => <option key={b.beat_number} value={b.beat_number}>{b.beat_number}: {b.script_phrase}</option>)}
                    </select>
                </div>
                {currentBeatIndex !== -1 && (
                    <span className="text-gray-400 font-medium">Beat {currentBeatIndex + 1} of {beats.length}</span>
                )}
            </div>

            <div className="flex-grow flex items-center gap-2">
                <button 
                    onClick={handlePrevious} 
                    disabled={currentBeatIndex <= 0}
                    className="self-stretch px-2 bg-gray-800/50 hover:bg-gray-700/80 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Previous beat"
                >
                    <ChevronLeftIcon className="w-8 h-8 text-white"/>
                </button>

                <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(['illustration', 'clear', 'consistent'] as const).map(style => {
                        const imageUrl = selectedBeat ? images[style]?.[selectedBeat] : undefined;
                        const isSelected = selectedBeat && imageSelection[selectedBeat]?.url === imageUrl;
                        const isChecked = imageUrl ? checkedImages.has(imageUrl) : false;
                        
                        return (
                            <div key={style} className="flex flex-col bg-gray-800 p-2 rounded-lg">
                                <h3 className="capitalize font-bold text-center text-lg mb-2">{style}</h3>
                                {imageUrl ? (
                                     <div 
                                        className={`relative rounded-md aspect-square cursor-pointer transition-all ${isSelected ? 'ring-4 ring-indigo-500' : 'ring-2 ring-transparent hover:ring-indigo-700'}`}
                                        onClick={() => {
                                            if (selectedBeat) {
                                                handleImageSelect(selectedBeat, style, imageUrl)
                                            }
                                        }}
                                    >
                                        <div 
                                            className="absolute top-2 left-2 z-10" 
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <label htmlFor={`check-further-${selectedBeat}-${style}`} className="flex items-center space-x-2 bg-gray-900/80 p-1.5 rounded-full cursor-pointer hover:bg-gray-900 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    id={`check-further-${selectedBeat}-${style}`}
                                                    checked={isChecked}
                                                    onChange={() => handleImageCheck(imageUrl)}
                                                    className="h-4 w-4 rounded-sm border-gray-500 bg-gray-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                                />
                                                <span className="text-xs font-semibold text-white pr-2">Check</span>
                                            </label>
                                        </div>
                                        <img 
                                            src={imageUrl}
                                            alt={`${style} for beat ${selectedBeat}`}
                                            className="w-full h-full object-cover rounded-md"
                                        />
                                    </div>
                                ) : <div className="flex-grow flex items-center justify-center text-gray-500 rounded-md bg-gray-900/50 aspect-square">No image</div>}
                            </div>
                        );
                    })}
                </div>

                 <button 
                    onClick={handleNext} 
                    disabled={currentBeatIndex === -1 || currentBeatIndex >= beats.length - 1}
                    className="self-stretch px-2 bg-gray-800/50 hover:bg-gray-700/80 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Next beat"
                >
                    <ChevronRightIcon className="w-8 h-8 text-white"/>
                </button>
            </div>
        </div>
    );
};

const Step10_SvgConvert: React.FC<{
    selectedImages: { url: string; beat: string }[];
    conversionStatus: { [key: string]: SvgConversionStatus };
    onStartConversion: () => void;
    isConverting: boolean;
}> = ({ selectedImages, conversionStatus, onStartConversion, isConverting }) => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">10. Convert to SVG</h2>
                <button
                    onClick={onStartConversion}
                    disabled={isConverting || selectedImages.length === 0}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-green-900 disabled:cursor-not-allowed text-white font-semibold py-2 px-6 rounded-full transition-colors"
                >
                    {isConverting ? 'Converting...' : 'Start Conversion'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedImages.map(({ url, beat }) => {
                    const status = conversionStatus[url] || { status: 'pending', progress: 0 };
                    return (
                        <div key={url} className="bg-gray-800 p-4 rounded-lg space-y-3">
                            <h3 className="font-bold text-center text-indigo-400">Beat: {beat}</h3>
                            <div className="grid grid-cols-2 gap-4 items-center">
                                <img src={url} alt={`Selected for beat ${beat}`} className="w-full h-auto object-cover rounded-md aspect-square" />
                                <div className="w-full h-full flex items-center justify-center">
                                    {status.status === 'complete' && status.svgUrl ? (
                                        <img src={status.svgUrl} alt={`SVG for beat ${beat}`} className="w-full h-auto object-cover rounded-md aspect-square" />
                                    ) : (
                                        <div className="w-full aspect-square bg-gray-700 rounded-md flex items-center justify-center text-gray-500">
                                            SVG Preview
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="w-full bg-gray-700 rounded-full h-2.5">
                                <div 
                                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" 
                                    style={{ width: `${status.progress}%` }}
                                ></div>
                            </div>
                            <p className="text-center text-sm text-gray-400 capitalize">{status.status}...</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const Step11_Transcription: React.FC<{
    transcription: TranscriptionWord[];
    onStartTranscription: () => void;
    isGenerating: boolean;
}> = ({ transcription, onStartTranscription, isGenerating }) => {
    if (transcription.length === 0) {
        return (
            <div className="space-y-6 text-center py-12">
                <h2 className="text-2xl font-bold">11. Transcription</h2>
                <p className="text-gray-400">Generate a word-by-word transcription file with timestamps from your script.</p>
                <button
                    onClick={onStartTranscription}
                    disabled={isGenerating}
                    className="mt-4 bg-green-600 hover:bg-green-700 disabled:bg-green-900 disabled:cursor-not-allowed text-white font-semibold py-2 px-6 rounded-full transition-colors"
                >
                    {isGenerating ? 'Generating...' : 'Start Transcription'}
                </button>
            </div>
        );
    }

    const transcriptionFileContent = transcription.map((item, index) => {
        return `${index + 1}\n${item.startTime} --> ${item.endTime}\n${item.word}\n`;
    }).join('\n');

    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(transcriptionFileContent).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const ClipboardIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5 .124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" /></svg>;
    const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">11. Transcription</h2>
            <div className="relative bg-gray-900 rounded-lg p-4">
                <button onClick={handleCopy} title="Copy transcription" className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-md transition-colors z-10">
                     {copied ? <CheckIcon className="w-5 h-5 text-green-400"/> : <ClipboardIcon className="w-5 h-5"/>}
                </button>
                <pre className="text-sm overflow-auto text-gray-300 bg-gray-900 rounded-md max-h-96">
                    <code>{transcriptionFileContent}</code>
                </pre>
            </div>
        </div>
    );
};

const Step12_PreEditScan: React.FC<{
    scanData: PreEditScanItem[];
    setScanData: React.Dispatch<React.SetStateAction<PreEditScanItem[]>>;
}> = ({ scanData, setScanData }) => {
    const [copied, setCopied] = useState(false);

    const handleEdit = (index: number, field: keyof Omit<PreEditScanItem, 'beat_number' | 'photo'>, value: string) => {
        setScanData(prev => {
            const newData = [...prev];
            const item = { ...newData[index] };
            if (field === 'start' || field === 'end') {
                item[field] = parseFloat(value) || 0;
            } else {
                (item[field] as any) = value;
            }
            newData[index] = item;
            return newData;
        });
    };
    
    const handleCopyJson = () => {
        const jsonToCopy = scanData.map(({ beat_number, ...rest }) => rest);
        const jsonString = JSON.stringify(jsonToCopy, null, 2);
        navigator.clipboard.writeText(jsonString).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const ClipboardIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5 .124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" /></svg>;
    const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">12. Pre-Edit Scan</h2>
                <button
                    onClick={handleCopyJson}
                    className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-full transition-colors"
                >
                    {copied ? <CheckIcon className="w-5 h-5 text-green-400"/> : <ClipboardIcon className="w-5 h-5"/>}
                    <span>Copy JSON</span>
                </button>
            </div>

            <div className="overflow-x-auto bg-gray-900 rounded-lg">
                <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                        <tr>
                            <th scope="col" className="px-4 py-3">Beat</th>
                            <th scope="col" className="px-4 py-3">Image</th>
                            <th scope="col" className="px-4 py-3 w-24">Start (s)</th>
                            <th scope="col" className="px-4 py-3 w-24">End (s)</th>
                            <th scope="col" className="px-4 py-3">Kinetic Text</th>
                            <th scope="col" className="px-4 py-3">SFX</th>
                        </tr>
                    </thead>
                    <tbody>
                        {scanData.map((row, index) => (
                            <tr key={row.beat_number} className="border-b border-gray-700 hover:bg-gray-700/50">
                                <td className="px-4 py-2 font-medium">{row.beat_number}</td>
                                <td className="px-4 py-2">
                                    {row.photo ? <img src={row.photo} alt={`For ${row.beat_number}`} className="w-16 h-16 object-cover rounded-md" /> : <div className="w-16 h-16 bg-gray-700 rounded-md"/>}
                                </td>
                                <td className="px-4 py-2">
                                    <input type="number" step="0.1" value={row.start} onChange={e => handleEdit(index, 'start', e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md py-1 px-2 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                                </td>
                                <td className="px-4 py-2">
                                    <input type="number" step="0.1" value={row.end} onChange={e => handleEdit(index, 'end', e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md py-1 px-2 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                                </td>
                                <td className="px-4 py-2">
                                    <input type="text" value={row.text || ''} onChange={e => handleEdit(index, 'text', e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md py-1 px-2 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                                </td>
                                <td className="px-4 py-2">
                                     <input type="text" value={row.sfx || ''} onChange={e => handleEdit(index, 'sfx', e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md py-1 px-2 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const App: React.FC = () => {
    const [state, setState] = useState(loadInitialState);
    const [isLoading, setIsLoading] = useState(false);
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [isConverting, setIsConverting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Destructure state for easier access
    const {
        currentStep, highestCompletedStep, scriptingSubStep, metadata, bookContent, summary, scriptData,
        voiceoverSegments, beats, storyboards, extractedPrompts, images, imageSelection,
        checkedImages, svgConversionStatus, transcriptionData, preEditScanData, videoUrl, combinedVoiceoverUrl
    } = state;

    // Use a single state setter function to ensure localStorage is always updated
    const updateState = (updater: (prevState: typeof state) => typeof state) => {
        setState(prevState => {
            const newState = updater(prevState);
            // Convert Set to Array for JSON serialization
            const serializableState = { ...newState, checkedImages: Array.from(newState.checkedImages) };
            localStorage.setItem('aiVideoPipelineProject', JSON.stringify(serializableState));
            return newState;
        });
    };

    // Refactored state setters to use updateState
    const setCurrentStep = (step: number) => updateState(s => ({ ...s, currentStep: step }));
    const setHighestCompletedStep = (step: number) => updateState(s => ({ ...s, highestCompletedStep: Math.max(s.highestCompletedStep, step) }));
    const setScriptingSubStep = (subStep: ScriptingSubStep) => updateState(s => ({ ...s, scriptingSubStep: subStep }));
    const setMetadata = (updater: React.SetStateAction<ProjectMetadata>) => updateState(s => ({ ...s, metadata: typeof updater === 'function' ? updater(s.metadata) : updater }));
    const setBookContent = (content: string) => updateState(s => ({ ...s, bookContent: content }));
    const setSummary = (summary: string) => updateState(s => ({ ...s, summary: summary }));
    const setScriptData = (updater: React.SetStateAction<ScriptData>) => updateState(s => ({ ...s, scriptData: typeof updater === 'function' ? updater(s.scriptData) : updater }));
    const setVoiceoverSegments = (segments: VoiceoverSegment[]) => updateState(s => ({ ...s, voiceoverSegments: segments }));
    const setBeats = (beats: Beat[]) => updateState(s => ({ ...s, beats: beats }));
    const setStoryboards = (storyboards: any) => updateState(s => ({ ...s, storyboards: storyboards }));
    const setExtractedPrompts = (prompts: any) => updateState(s => ({ ...s, extractedPrompts: prompts }));
    const setImages = (images: any) => updateState(s => ({ ...s, images: images }));
    const setImageSelection = (selection: ImageSelection) => updateState(s => ({ ...s, imageSelection: selection }));
    const setCheckedImages = (updater: React.SetStateAction<Set<string>>) => updateState(s => ({ ...s, checkedImages: typeof updater === 'function' ? updater(s.checkedImages) : updater }));
    const setSvgConversionStatus = (status: any) => updateState(s => ({ ...s, svgConversionStatus: status }));
    const setTranscriptionData = (data: TranscriptionWord[]) => updateState(s => ({ ...s, transcriptionData: data }));
    const setPreEditScanData = (updater: React.SetStateAction<PreEditScanItem[]>) => updateState(s => ({ ...s, preEditScanData: typeof updater === 'function' ? updater(s.preEditScanData) : updater }));
    const setVideoUrl = (url: string | null) => updateState(s => ({ ...s, videoUrl: url }));
    const setCombinedVoiceoverUrl = (url: string | null) => updateState(s => ({ ...s, combinedVoiceoverUrl: url }));

    const audioContextRef = useRef<AudioContext | null>(null);
    useEffect(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
    }, []);

    const handleGenerateSummary = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await geminiService.generateSummary(metadata.title, bookContent);
            setSummary(result);
            return result;
        } catch (e: any) {
            setError(`Failed to generate summary: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [metadata.title, bookContent]);

    const handleGenerateHooks = useCallback(async (currentSummary: string) => {
        if (!currentSummary) return;
        setIsLoading(true);
        setError(null);
        try {
            const hooks = await geminiService.generateHooks(currentSummary, metadata.title);
            setScriptData(prev => ({ ...prev, hooks }));
        } catch (e: any) {
            setError(`Failed to generate hooks: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [metadata.title]);

    const handleGenerateOutline = useCallback(async () => {
        if (!scriptData.selectedHook) return;
        setIsLoading(true);
        setError(null);
        try {
            const outline = await geminiService.generateOutline(summary, metadata.title, scriptData.selectedHook);
            setScriptData(prev => ({ ...prev, outline }));
        } catch (e: any) {
            setError(`Failed to generate outline: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [summary, metadata.title, scriptData.selectedHook]);

    const handleGenerateFullScript = useCallback(async () => {
        if (!scriptData.outline) return;
        setIsLoading(true);
        setError(null);
        try {
            const fullScript = await geminiService.generateFullScript(scriptData.outline, scriptData.selectedHook);
            setScriptData(prev => ({ ...prev, fullScript }));
        } catch (e: any) {
            setError(`Failed to generate full script: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [scriptData.outline, scriptData.selectedHook]);

    const handleGenerateVoiceoverSegments = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const segments = await geminiService.generateVoiceoverSegments(scriptData.fullScript);
            setVoiceoverSegments(segments.map((text, i) => ({ id: i, text, status: 'pending' })));
        } catch (e: any) {
            setError(`Failed to generate voiceover segments: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [scriptData.fullScript]);

    const handleGenerateVoiceover = useCallback(async (id: number) => {
        const segment = voiceoverSegments.find(s => s.id === id);
        if (!segment) return;

        updateState(s => ({
            ...s,
            voiceoverSegments: s.voiceoverSegments.map(seg => seg.id === id ? { ...seg, status: 'generating' } : seg)
        }));
        setError(null);

        try {
            const base64Audio = await geminiService.generateVoiceover(segment.text);
            const audioUrl = `data:audio/wav;base64,${base64Audio}`;
            updateState(s => ({
                ...s,
                voiceoverSegments: s.voiceoverSegments.map(seg => seg.id === id ? { ...seg, status: 'complete', audioUrl } : seg)
            }));
        } catch (e: any) {
            updateState(s => ({
                ...s,
                voiceoverSegments: s.voiceoverSegments.map(seg => seg.id === id ? { ...seg, status: 'pending' } : seg)
            }));
            setError(`Failed to generate voiceover for segment ${id + 1}: ${e.message}`);
        }
    }, [voiceoverSegments]);

    const handlePlayVoiceover = useCallback(async (base64Audio: string) => {
        if (!audioContextRef.current || !base64Audio) return;
        try {
            const decodedData = decode(base64Audio);
            const audioBuffer = await decodeAudioData(decodedData, audioContextRef.current, 24000, 1);
            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current.destination);
            source.start(0);
        } catch (e: any) {
            setError(`Could not play audio: ${e.message}`);
        }
    }, []);

    const handleGenerateBeats = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await geminiService.generateBeats(scriptData.fullScript);
            setBeats(result);
        } catch (e: any) {
            setError(`Failed to generate beats: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [scriptData.fullScript]);

    const handleGenerateStoryboards = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const styles = ['illustration', 'clear', 'consistent'];
            const results = await Promise.all(styles.map(style => geminiService.generateStoryboard(beats, style)));
            setStoryboards({
                illustration: results[0],
                clear: results[1],
                consistent: results[2]
            });
        } catch (e: any) {
            setError(`Failed to generate storyboards: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [beats]);

    const handleExtractPrompts = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const styles = ['illustration', 'clear', 'consistent'];
            const results = await Promise.all(
                styles.map(style => geminiService.extractPrompts(storyboards[style as keyof typeof storyboards]))
            );
            setExtractedPrompts({
                illustration: results[0],
                clear: results[1],
                consistent: results[2]
            });
        } catch (e: any) {
            setError(`Failed to extract prompts: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [storyboards]);
    
    const handleGenerateImages = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const allStyles: ('illustration' | 'clear' | 'consistent')[] = ['illustration', 'clear', 'consistent'];
            for (const style of allStyles) {
                // FIX: Add a type assertion to ensure promptsForStyle is treated as an array of ExtractedPrompt.
                // The type of `extractedPrompts` from state can be vague due to loading from localStorage.
                const promptsForStyle = (extractedPrompts as Record<string, ExtractedPrompt[]>)[style];
                if (!promptsForStyle || promptsForStyle.length === 0) continue;

                // Generate images for all prompts in parallel for a given style
                const imagePromises = promptsForStyle.map(prompt => 
                    geminiService.generateImage(prompt.ai_prompt).then(imageUrl => ({
                        beat_number: prompt.beat_number,
                        url: imageUrl
                    }))
                );

                const generatedImages = await Promise.all(imagePromises);

                // Update state for the current style
                updateState(s => {
                    const newImagesForStyle = { ...s.images[style] };
                    generatedImages.forEach(img => {
                        newImagesForStyle[img.beat_number] = img.url;
                    });
                    return {
                        ...s,
                        images: {
                            ...s.images,
                            [style]: newImagesForStyle
                        }
                    };
                });
            }
        } catch (e: any) {
            setError(`Failed to generate images: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [extractedPrompts]);

    const handleStartSvgConversion = useCallback(async () => {
        const selectedImages = beats
            .map(beat => imageSelection[beat.beat_number])
            .filter(Boolean)
            .map(selection => ({ url: selection!.url, beat: Object.keys(imageSelection).find(key => imageSelection[key] === selection)! }));

        if (selectedImages.length === 0) return;

        setIsConverting(true);
        setError(null);

        try {
            await Promise.all(selectedImages.map(async ({ url }) => {
                updateState(s => ({
                    ...s,
                    svgConversionStatus: { ...s.svgConversionStatus, [url]: { status: 'converting', progress: 0 } }
                }));

                const svgUrl = await geminiService.convertToSvg(url, (progress) => {
                    updateState(s => ({
                        ...s,
                        svgConversionStatus: { ...s.svgConversionStatus, [url]: { status: 'converting', progress } }
                    }));
                });

                updateState(s => ({
                    ...s,
                    svgConversionStatus: { ...s.svgConversionStatus, [url]: { status: 'complete', progress: 100, svgUrl } }
                }));
            }));
        } catch (e: any) {
             setError(`SVG conversion failed: ${e.message}`);
        } finally {
            setIsConverting(false);
        }
    }, [beats, imageSelection]);

    const handleStartTranscription = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await geminiService.generateTranscription(scriptData.fullScript);
            setTranscriptionData(result);
        } catch (e: any) {
            setError(`Failed to generate transcription: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [scriptData.fullScript]);

    const handleGeneratePreEditScan = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const illustrationStoryboard = storyboards.illustration;
            const result = await geminiService.generatePreEditScan(illustrationStoryboard, transcriptionData, imageSelection);
            setPreEditScanData(result);
        } catch (e: any) {
            setError(`Failed to generate pre-edit scan: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [storyboards.illustration, transcriptionData, imageSelection]);

    const handleGenerateVideo = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const audioUrl = await geminiService.combineVoiceovers(voiceoverSegments);
            setCombinedVoiceoverUrl(audioUrl);
            // Client-side rendering is now used, this call is a placeholder
            const result = await geminiService.generateVideo(preEditScanData, audioUrl);
            setVideoUrl(result); 
        } catch (e: any) {
            setError(`Failed to generate video: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [voiceoverSegments, preEditScanData]);

    const handleChatSubmit = useCallback(async (message: string) => {
        let textToRefine = '';
        switch(currentStep) {
            case 2: textToRefine = summary; break;
            case 3: 
                if (scriptingSubStep === 'hooks') textToRefine = scriptData.hooks.join('\n');
                else if (scriptingSubStep === 'outline') textToRefine = scriptData.outline;
                else textToRefine = scriptData.fullScript;
                break;
            case 5: textToRefine = JSON.stringify(beats); break;
            // Add other cases as needed
        }

        if (!textToRefine) return;
        
        setIsChatLoading(true);
        setError(null);
        try {
            const refinedText = await geminiService.refineText(textToRefine, message);
            // Update the correct state based on current step
            switch(currentStep) {
                case 2: setSummary(refinedText); break;
                case 3: 
                    if (scriptingSubStep === 'script') setScriptData(p => ({...p, fullScript: refinedText}));
                    else if (scriptingSubStep === 'outline') setScriptData(p => ({...p, outline: refinedText}));
                    // Cannot refine hooks this way
                    break;
                case 5: setBeats(JSON.parse(refinedText)); break;
            }
        } catch (e: any) {
             setError(`Refinement failed: ${e.message}`);
        } finally {
            setIsChatLoading(false);
        }
    }, [currentStep, scriptingSubStep, summary, scriptData, beats]);

    const handleRegenerate = useCallback(() => {
        setError(null);
        switch (currentStep) {
            case 2: handleGenerateSummary(); break;
            case 3:
                if (scriptingSubStep === 'hooks') handleGenerateHooks(summary);
                else if (scriptingSubStep === 'outline') handleGenerateOutline();
                else if (scriptingSubStep === 'script') handleGenerateFullScript();
                break;
            case 4: handleGenerateVoiceoverSegments(); break;
            case 5: handleGenerateBeats(); break;
            case 6: handleGenerateStoryboards(); break;
            case 7: handleExtractPrompts(); break;
            case 8: handleGenerateImages(); break;
            // No regenerate for 9, 10, 11, 12, 13
        }
    }, [currentStep, scriptingSubStep, summary, handleGenerateSummary, handleGenerateHooks, handleGenerateOutline, handleGenerateFullScript, handleGenerateVoiceoverSegments, handleGenerateBeats, handleGenerateStoryboards, handleExtractPrompts, handleGenerateImages]);

    const handleNext = useCallback(async () => {
        setError(null);
        let nextStep = currentStep + 1;
        if (currentStep === 1) {
            if (!metadata.title) {
                setError("Please provide a video title.");
                return;
            }
            if (summary.length === 0) await handleGenerateSummary();
        }
        if (currentStep === 2) {
            if (scriptData.hooks.length === 0) await handleGenerateHooks(summary);
        }
        if (currentStep === 3) {
            if (scriptingSubStep === 'hooks') {
                if (!scriptData.selectedHook) {
                    setError("Please select a hook to continue.");
                    return;
                }
                if (!scriptData.outline) await handleGenerateOutline();
                setScriptingSubStep('outline');
                // Don't advance to next main step yet
                return; 
            }
            if (scriptingSubStep === 'outline') {
                 if (!scriptData.fullScript) await handleGenerateFullScript();
                 setScriptingSubStep('script');
                 // Don't advance to next main step yet
                 return;
            }
            if (scriptingSubStep === 'script' && voiceoverSegments.length === 0) {
                 await handleGenerateVoiceoverSegments();
            }
        }
        if (currentStep === 4) {
            if (beats.length === 0) await handleGenerateBeats();
        }
        if (currentStep === 5) {
            if (storyboards.illustration.length === 0) await handleGenerateStoryboards();
        }
        if (currentStep === 6) {
             if (extractedPrompts.illustration.length === 0) await handleExtractPrompts();
        }
        if (currentStep === 7) {
             const hasImages = Object.values(images.illustration).length > 0;
             if (!hasImages) await handleGenerateImages();
        }
        if (currentStep === 8) {
             // Step 9 is selection, no generation on next
        }
        if (currentStep === 9) {
            // This step is now optional, no validation needed.
        }
        if (currentStep === 10) {
             // Step 11 is transcription, started manually
        }
        if (currentStep === 11) {
            if (transcriptionData.length === 0) {
                setError("Please generate the transcription before proceeding.");
                return;
            }
            if (preEditScanData.length === 0) await handleGeneratePreEditScan();
        }
        if (currentStep === 12) {
             if (!videoUrl && !combinedVoiceoverUrl) await handleGenerateVideo();
        }

        if (nextStep > highestCompletedStep) {
            setHighestCompletedStep(nextStep);
        }
        setCurrentStep(nextStep);
    }, [currentStep, highestCompletedStep, metadata.title, summary, scriptData, scriptingSubStep, voiceoverSegments, beats, storyboards, extractedPrompts, images, transcriptionData, preEditScanData, videoUrl, combinedVoiceoverUrl]);
    
    const handleBack = () => {
        setError(null);
        if (currentStep > 1) {
            if (currentStep === 3 && scriptingSubStep !== 'hooks') {
                 setScriptingSubStep(scriptingSubStep === 'script' ? 'outline' : 'hooks');
            } else {
                 setCurrentStep(currentStep - 1);
            }
        }
    };

    const handleStepClick = (step: number) => {
        setError(null);
        if (step <= highestCompletedStep) {
            if (step === 3) {
                setScriptingSubStep('script');
            }
            setCurrentStep(step);
        }
    };
    
    const handleStartOver = () => {
        localStorage.removeItem('aiVideoPipelineProject');
        setState({ ...DEFAULT_STATE, checkedImages: new Set() });
    };

    const handleImageSelect = (beat_number: string, style: 'illustration' | 'clear' | 'consistent', url: string) => {
        const currentSelection = imageSelection[beat_number];
        if (currentSelection?.url === url) {
            // Deselect if clicking the same image
             const newSelection = { ...imageSelection };
             delete newSelection[beat_number];
             setImageSelection(newSelection);
        } else {
            // Select the new image
            setImageSelection({ ...imageSelection, [beat_number]: { style, url } });
        }
    };

    const handleImageCheck = (url: string) => {
        setCheckedImages(prev => {
            const newSet = new Set(prev);
            if (newSet.has(url)) {
                newSet.delete(url);
            } else {
                newSet.add(url);
            }
            return newSet;
        });
    };

    const isGeminiStep = (step: number) => {
      return ![1, 8, 9, 10, 11, 12, 13].includes(step);
    };

    const selectedImagesForSvgStep = beats
        .map(beat => ({ beat: beat.beat_number, selection: imageSelection[beat.beat_number] }))
        .filter(item => item.selection)
        .map(item => ({ url: item.selection!.url, beat: item.beat }));

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-bold">AI YouTube Video Pipeline</h1>
                    {currentStep === 1 && (
                        <button
                            onClick={handleStartOver}
                            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-full transition-colors"
                        >
                            Start Over
                        </button>
                    )}
                </div>
                <p className="text-gray-400 mb-8">Automate your creation process from script to final assets.</p>
                
                <div className="mb-12">
                    <div className="relative mb-4">
                        <div className="absolute top-0 left-0 bg-indigo-600 h-1 rounded-full transition-all duration-500" style={{ width: `${((highestCompletedStep-1)/(STEPS.length-1))*100}%`}}></div>
                        <div className="bg-gray-700 h-1 rounded-full"></div>
                    </div>
                    <Stepper
                        currentStep={currentStep}
                        steps={STEPS}
                        onStepClick={handleStepClick}
                        highestCompletedStep={highestCompletedStep}
                    />
                </div>

                <div className="bg-gray-800 p-6 sm:p-8 rounded-lg shadow-2xl min-h-[60vh] flex flex-col">
                    <div className="flex-grow">
                         {error && (
                            <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-md relative mb-6" role="alert">
                                <strong className="font-bold">Error: </strong>
                                <span className="block sm:inline">{error}</span>
                                <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3" aria-label="Close">
                                    <svg className="fill-current h-6 w-6 text-red-400" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                                </button>
                            </div>
                        )}
                        
                        {isLoading && currentStep !== 8 ? (
                             <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div></div>
                        ) : (
                           <>
                           {currentStep === 1 && <Step1_ProjectSetup metadata={metadata} setMetadata={setMetadata} setBookContent={setBookContent} />}
                            {currentStep === 2 && <div className="space-y-4"><h2 className="text-2xl font-bold">2. Summary</h2><MarkdownViewer content={summary} /></div>}
                            {currentStep === 3 && (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-bold">3. Script Generation</h2>
                                    <div className={`p-4 rounded-lg transition-all ${scriptingSubStep === 'hooks' ? 'ring-2 ring-indigo-500' : 'opacity-60'}`}>
                                        <h3 className="text-lg font-semibold mb-2">1. Select a Hook:</h3>
                                        <div className="space-y-2">{scriptData.hooks.map((hook, i) => <button key={i} onClick={() => setScriptData(p => ({...p, selectedHook: hook}))} className={`w-full text-left p-3 rounded-md transition-colors ${scriptData.selectedHook === hook ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'}`}>{hook}</button>)}</div>
                                    </div>
                                    {scriptData.outline && <div className={`p-4 rounded-lg transition-all ${scriptingSubStep === 'outline' ? 'ring-2 ring-indigo-500' : 'opacity-60'}`}><h3 className="text-lg font-semibold mb-2">2. Outline:</h3><MarkdownViewer content={scriptData.outline} /></div>}
                                    {scriptData.fullScript && <div className={`p-4 rounded-lg transition-all ${scriptingSubStep === 'script' ? 'ring-2 ring-indigo-500' : 'opacity-60'}`}><h3 className="text-lg font-semibold mb-2">3. Full Script:</h3><MarkdownViewer content={scriptData.fullScript} /></div>}
                                </div>
                            )}
                            {currentStep === 4 && (
                                <div className="space-y-4">
                                    <h2 className="text-2xl font-bold">4. Voiceover Segments</h2>
                                    <div className="space-y-3">{voiceoverSegments.map(segment => (
                                        <div key={segment.id} className="bg-gray-700/50 p-3 rounded-lg flex items-center justify-between">
                                            <p className="flex-grow">{segment.text}</p>
                                            <div className="flex items-center space-x-3 ml-4">
                                                {segment.status === 'complete' && segment.audioUrl && (
                                                    <button onClick={() => handlePlayVoiceover(segment.audioUrl.split(',')[1])} className="p-2 text-green-400 hover:text-green-300"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.647c1.295.742 1.295 2.545 0 3.286L7.279 20.99c-1.25.717-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" /></svg></button>
                                                )}
                                                {segment.status === 'generating' && <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-400"></div>}
                                                {segment.status === 'pending' && <button onClick={() => handleGenerateVoiceover(segment.id)} className="text-indigo-400 hover:text-indigo-300 font-semibold text-sm">Generate</button>}
                                                {segment.status === 'complete' && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-green-500"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" /></svg>}
                                            </div>
                                        </div>
                                    ))}</div>
                                </div>
                            )}
                            {currentStep === 5 && <div className="space-y-4"><h2 className="text-2xl font-bold">5. Script Beats</h2><ul className="list-none space-y-2">{beats.map(beat => <li key={beat.beat_number} className="bg-gray-700/50 p-3 rounded-lg"><strong className="text-indigo-400">{beat.beat_number}:</strong> {beat.script_phrase}</li>)}</ul></div>}
                            {currentStep === 6 && <div className="space-y-6"><h2 className="text-2xl font-bold">6. Storyboards</h2>{Object.entries(storyboards).map(([style, rows]) => (rows.length > 0 && <div key={style} className="bg-gray-900 p-4 rounded-lg"><h3 className="capitalize text-xl font-bold mb-2 text-indigo-400">{style}</h3><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-gray-400">{Object.keys(rows[0]).map(key => <th key={key} className="p-2 font-semibold capitalize">{key.replace(/_/g, ' ')}</th>)}</tr></thead><tbody>{rows.map((row, i) => <tr key={i} className="border-t border-gray-700 hover:bg-gray-800/50">{Object.values(row).map((val, j) => <td key={j} className="p-2">{String(val)}</td>)}</tr>)}</tbody></table></div></div>)) }</div>}
                            {/* FIX: Add defensive checks for extractedPrompts to prevent crashes from potentially malformed state loaded from localStorage. */}
                            {currentStep === 7 && <div className="space-y-6"><h2 className="text-2xl font-bold">7. AI Image Prompts</h2>{Object.entries(extractedPrompts || {}).map(([style, prompts]) => (Array.isArray(prompts) && prompts.length > 0 && <PromptCodeDisplay key={style} style={style} prompts={prompts} />))}</div>}
                            {currentStep === 8 && (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-bold">8. Generating Images...</h2>
                                    <p className="text-gray-400">Images are being generated for all prompts. This may take a few moments.</p>
                                    {Object.entries(images).map(([style, beatImages]) => (
                                        <div key={style} className="bg-gray-900 p-4 rounded-lg">
                                            <h3 className="capitalize font-bold text-lg mb-4 border-b border-gray-700 pb-2">{style}</h3>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                                {beats.map(beat => {
                                                    const imageUrl = beatImages[beat.beat_number];
                                                    return (
                                                        <div key={`${style}-${beat.beat_number}`} className="bg-gray-800 p-2 rounded-lg flex flex-col">
                                                            <div className="aspect-square w-full rounded-md mb-2 overflow-hidden">
                                                                {imageUrl ? <img src={imageUrl} alt={`${style} for ${beat.beat_number}`} className="w-full h-full object-cover"/> : <div className="w-full h-full bg-gray-700 animate-pulse"></div>}
                                                            </div>
                                                            <p className="text-xs text-center text-gray-400 truncate">{beat.beat_number}</p>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {currentStep === 9 && <Step9_SelectImages beats={beats} storyboards={storyboards} images={images} imageSelection={imageSelection} checkedImages={checkedImages} handleImageSelect={handleImageSelect} handleImageCheck={handleImageCheck}/>}
                            {currentStep === 10 && <Step10_SvgConvert selectedImages={selectedImagesForSvgStep} conversionStatus={svgConversionStatus} onStartConversion={handleStartSvgConversion} isConverting={isConverting}/>}
                            {currentStep === 11 && <Step11_Transcription transcription={transcriptionData} onStartTranscription={handleStartTranscription} isGenerating={isLoading} />}
                            {currentStep === 12 && <Step12_PreEditScan scanData={preEditScanData} setScanData={setPreEditScanData} />}
                            {currentStep === 13 && <VideoEditor audioUrl={combinedVoiceoverUrl} scanData={preEditScanData} />}
                           </>
                        )}
                    </div>

                    {isGeminiStep(currentStep) && (
                        <GeminiInteraction
                            onRegenerate={handleRegenerate}
                            isGenerating={isLoading}
                            onChatSubmit={handleChatSubmit}
                            isChatLoading={isChatLoading}
                        />
                    )}
                </div>

                <div className="mt-8 flex justify-between">
                    <button
                        onClick={handleBack}
                        disabled={currentStep === 1}
                        className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-semibold py-2 px-6 rounded-full transition-colors"
                    >
                        Back
                    </button>
                    {currentStep < STEPS.length && (
                         <button
                            onClick={handleNext}
                            disabled={isLoading}
                            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900 disabled:cursor-not-allowed text-white font-semibold py-2 px-6 rounded-full transition-colors"
                        >
                            {currentStep === 3 && scriptingSubStep !== 'script' ? 'Continue' : 'Next'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default App;
