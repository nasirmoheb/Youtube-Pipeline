import React from 'react';
import type { ScriptData, ScriptingSubStep } from '../../types';
import MarkdownViewer from '../MarkdownViewer';
import GeminiInteraction from '../GeminiInteraction';

interface Step3_ScriptingProps {
    scriptingSubStep: ScriptingSubStep;
    scriptData: ScriptData;
    isGenerating: boolean;
    isChatLoading: boolean;
    setScriptData: React.Dispatch<React.SetStateAction<ScriptData>>;
    handleGenerateHooks: () => void;
    handleRefineHooks: (message: string) => void;
    handleSelectHook: (hook: string) => void;
    handleGenerateOutline: () => void;
    handleRefineOutline: (message: string) => void;
    handleGenerateFullScript: () => void;
    handleRefineFullScript: (message: string) => void;
}

const Step3_Scripting: React.FC<Step3_ScriptingProps> = ({
    scriptingSubStep,
    scriptData,
    isGenerating,
    isChatLoading,
    setScriptData,
    handleGenerateHooks,
    handleRefineHooks,
    handleSelectHook,
    handleGenerateOutline,
    handleRefineOutline,
    handleGenerateFullScript,
    handleRefineFullScript,
}) => {
    // Manage current stage
    const [currentStage, setCurrentStage] = React.useState<'hooks' | 'outline' | 'script'>('hooks');
    
    // Determine completion status
    const hooksComplete = scriptData.hooks.length > 0 && scriptData.selectedHook;
    const outlineComplete = scriptData.outline.length > 0;
    const scriptComplete = scriptData.fullScript.length > 0;
    
    // Navigation functions
    const goToHooks = () => setCurrentStage('hooks');
    const goToOutline = () => {
        if (hooksComplete) setCurrentStage('outline');
    };
    const goToScript = () => {
        if (outlineComplete) setCurrentStage('script');
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">3. Scripting</h2>
                <p className="text-gray-400 text-sm">Three-stage process: Hooks → Outline → Full Script</p>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center justify-between bg-gray-800/50 rounded-lg p-4">
                <button
                    onClick={goToHooks}
                    disabled={!hooksComplete && currentStage !== 'hooks'}
                    className="flex items-center space-x-2 hover:opacity-80 transition-opacity disabled:cursor-not-allowed"
                >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        hooksComplete ? 'bg-green-600 text-white' : currentStage === 'hooks' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-400'
                    }`}>
                        {hooksComplete ? '✓' : '1'}
                    </div>
                    <span className={hooksComplete || currentStage === 'hooks' ? 'text-white' : 'text-gray-400'}>Hooks</span>
                </button>
                <div className={`flex-1 h-1 mx-2 ${hooksComplete ? 'bg-green-600' : 'bg-gray-700'}`}></div>
                <button
                    onClick={goToOutline}
                    disabled={!hooksComplete}
                    className="flex items-center space-x-2 hover:opacity-80 transition-opacity disabled:cursor-not-allowed"
                >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        outlineComplete ? 'bg-green-600 text-white' : currentStage === 'outline' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-400'
                    }`}>
                        {outlineComplete ? '✓' : '2'}
                    </div>
                    <span className={outlineComplete || currentStage === 'outline' ? 'text-white' : 'text-gray-400'}>Outline</span>
                </button>
                <div className={`flex-1 h-1 mx-2 ${outlineComplete ? 'bg-green-600' : 'bg-gray-700'}`}></div>
                <button
                    onClick={goToScript}
                    disabled={!outlineComplete}
                    className="flex items-center space-x-2 hover:opacity-80 transition-opacity disabled:cursor-not-allowed"
                >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        scriptComplete ? 'bg-green-600 text-white' : currentStage === 'script' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-400'
                    }`}>
                        {scriptComplete ? '✓' : '3'}
                    </div>
                    <span className={scriptComplete || currentStage === 'script' ? 'text-white' : 'text-gray-400'}>Script</span>
                </button>
            </div>
            
            {/* --- Stage 1: Hooks Section --- */}
            {currentStage === 'hooks' && (
            <div className="border rounded-lg p-6 border-indigo-500 bg-indigo-900/10">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-xl font-semibold flex items-center">
                            <span className="mr-2">Stage 1:</span>
                            <span className="text-indigo-400">Generate Hooks</span>
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">Create 3 compelling hook options for your video</p>
                    </div>
                    {hooksComplete && (
                        <span className="text-green-500 text-2xl">✓</span>
                    )}
                </div>

                {scriptData.hooks.length === 0 && !isGenerating && (
                    <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-6 text-center">
                        <p className="text-gray-300 mb-4">Generate engaging hooks to capture your audience's attention</p>
                        <button
                            onClick={handleGenerateHooks}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-md transition-colors"
                        >
                            Generate Hooks
                        </button>
                    </div>
                )}

                {isGenerating && scriptData.hooks.length === 0 && (
                    <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-6 text-center">
                        <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
                            <p className="text-gray-300">Generating hooks with AI...</p>
                            <p className="text-gray-400 text-sm mt-2">This will take 3-5 seconds</p>
                        </div>
                    </div>
                )}

                {scriptData.hooks.length > 0 && (
                    <>
                        <div className="space-y-2 mb-4">
                            {scriptData.hooks.map((hook: string, index: number) => (
                                <button
                                    key={index}
                                    onClick={() => handleSelectHook(hook)}
                                    className={`w-full text-left p-4 rounded-md transition-all ${
                                        scriptData.selectedHook === hook 
                                            ? 'bg-indigo-600 ring-2 ring-indigo-400 shadow-lg' 
                                            : 'bg-gray-700 hover:bg-gray-600 hover:ring-1 hover:ring-gray-500'
                                    }`}
                                >
                                    <div className="flex items-start">
                                        <span className="text-indigo-300 font-bold mr-3">#{index + 1}</span>
                                        <span className="flex-1">{hook}</span>
                                        {scriptData.selectedHook === hook && (
                                            <span className="text-green-400 ml-2">✓ Selected</span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                        {!scriptData.selectedHook && (
                            <div className="bg-yellow-900/20 border border-yellow-600/50 rounded-lg p-4 text-center">
                                <p className="text-yellow-200">👆 Select a hook to continue to the next stage</p>
                            </div>
                        )}
                        <GeminiInteraction
                            onRegenerate={handleGenerateHooks}
                            isGenerating={isGenerating}
                            onChatSubmit={handleRefineHooks}
                            isChatLoading={isChatLoading}
                        />
                        {scriptData.selectedHook && (
                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={goToOutline}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-md transition-colors"
                                >
                                    Continue to Outline →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
            )}

            {/* --- Stage 2: Outline Section --- */}
            {currentStage === 'outline' && scriptData.selectedHook && (
                <div className="border rounded-lg p-6 border-indigo-500 bg-indigo-900/10">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-xl font-semibold flex items-center">
                                <span className="mr-2">Stage 2:</span>
                                <span className="text-indigo-400">Generate Outline</span>
                            </h3>
                            <p className="text-sm text-gray-400 mt-1">Create a structured plan for your video</p>
                        </div>
                        {outlineComplete && (
                            <span className="text-green-500 text-2xl">✓</span>
                        )}
                    </div>

                    <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-3 mb-4">
                        <p className="text-sm text-gray-400">
                            <span className="font-semibold text-gray-300">Selected Hook:</span>
                            <span className="italic text-white ml-2">"{scriptData.selectedHook}"</span>
                        </p>
                    </div>

                    {scriptData.outline.length === 0 && !isGenerating && (
                        <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-6 text-center">
                            <p className="text-gray-300 mb-4">Generate a structured outline based on your selected hook</p>
                            <button
                                onClick={handleGenerateOutline}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-md transition-colors"
                            >
                                Generate Outline
                            </button>
                        </div>
                    )}

                    {isGenerating && scriptData.outline.length === 0 && scriptData.hooks.length > 0 && (
                        <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-6 text-center">
                            <div className="flex flex-col items-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
                                <p className="text-gray-300">Generating outline with AI...</p>
                                <p className="text-gray-400 text-sm mt-2">This will take 5-10 seconds</p>
                            </div>
                        </div>
                    )}

                    {scriptData.outline.length > 0 && (
                        <>
                            <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                                <MarkdownViewer content={scriptData.outline} />
                            </div>
                            <GeminiInteraction
                                onRegenerate={handleGenerateOutline}
                                isGenerating={isGenerating}
                                onChatSubmit={handleRefineOutline}
                                isChatLoading={isChatLoading}
                            />
                            <div className="mt-4 flex justify-between">
                                <button
                                    onClick={goToHooks}
                                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-md transition-colors"
                                >
                                    ← Back to Hooks
                                </button>
                                <button
                                    onClick={goToScript}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-md transition-colors"
                                >
                                    Continue to Script →
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* --- Stage 3: Full Script Section --- */}
            {currentStage === 'script' && scriptData.outline.length > 0 && (
                <div className="border rounded-lg p-6 border-indigo-500 bg-indigo-900/10">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-xl font-semibold flex items-center">
                                <span className="mr-2">Stage 3:</span>
                                <span className="text-indigo-400">Generate Full Script</span>
                            </h3>
                            <p className="text-sm text-gray-400 mt-1">Create complete narration ready for voiceover</p>
                        </div>
                        {scriptComplete && (
                            <span className="text-green-500 text-2xl">✓</span>
                        )}
                    </div>

                    {scriptData.fullScript.length === 0 && !isGenerating && (
                        <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-6 text-center">
                            <p className="text-gray-300 mb-4">Generate the complete video script with full narration</p>
                            <button
                                onClick={handleGenerateFullScript}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-md transition-colors"
                            >
                                Generate Full Script
                            </button>
                        </div>
                    )}

                    {isGenerating && scriptData.fullScript.length === 0 && scriptData.outline.length > 0 && (
                        <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-6 text-center">
                            <div className="flex flex-col items-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
                                <p className="text-gray-300">Generating full script with AI...</p>
                                <p className="text-gray-400 text-sm mt-2">This will take 10-15 seconds</p>
                            </div>
                        </div>
                    )}

                    {scriptData.fullScript.length > 0 && (
                        <>
                            <div className="bg-green-900/20 border border-green-600/50 rounded-lg p-4 mb-4">
                                <div className="flex items-center">
                                    <span className="text-green-400 text-2xl mr-3">✓</span>
                                    <div>
                                        <p className="text-green-200 font-semibold">Script Complete!</p>
                                        <p className="text-green-300 text-sm">Automatically saved to script.md</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                                <MarkdownViewer content={scriptData.fullScript} />
                            </div>
                            <GeminiInteraction
                                onRegenerate={handleGenerateFullScript}
                                isGenerating={isGenerating}
                                onChatSubmit={handleRefineFullScript}
                                isChatLoading={isChatLoading}
                            />
                            <div className="mt-4 flex justify-start">
                                <button
                                    onClick={goToOutline}
                                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-md transition-colors"
                                >
                                    ← Back to Outline
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default Step3_Scripting;