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
    scriptData,
    isGenerating,
    isChatLoading,
    handleGenerateHooks,
    handleRefineHooks,
    handleSelectHook,
    handleGenerateOutline,
    handleRefineOutline,
    handleGenerateFullScript,
    handleRefineFullScript,
}) => {
    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold">3. Scripting</h2>
            
            {/* --- Hooks Section --- */}
            <div>
                <h3 className="text-xl font-semibold mb-2">3.1 Generate Hooks</h3>
                {scriptData.hooks.length === 0 && !isGenerating && (
                    <p className="text-gray-400">Click "Generate Hooks" to start.</p>
                )}
                <div className="space-y-2">
                    {scriptData.hooks.map((hook, index) => (
                        <button
                            key={index}
                            onClick={() => handleSelectHook(hook)}
                            className={`w-full text-left p-3 rounded-md transition-colors ${
                                scriptData.selectedHook === hook ? 'bg-indigo-600 ring-2 ring-indigo-400' : 'bg-gray-700 hover:bg-gray-600'
                            }`}
                        >
                            {hook}
                        </button>
                    ))}
                </div>
                {scriptData.hooks.length > 0 && (
                    <GeminiInteraction
                        onRegenerate={handleGenerateHooks}
                        isGenerating={isGenerating}
                        onChatSubmit={handleRefineHooks}
                        isChatLoading={isChatLoading}
                    />
                )}
            </div>

            {/* --- Outline Section --- */}
            {scriptData.selectedHook && (
                <div className="pt-8 border-t border-gray-700/50">
                    <h3 className="text-xl font-semibold mb-2">3.2 Generate Outline</h3>
                    <p className="mb-4 text-sm text-gray-400">Based on hook: <span className="italic text-white">"{scriptData.selectedHook}"</span></p>
                    {scriptData.outline.length === 0 && !isGenerating && (
                         <p className="text-gray-400">Click "Generate Outline" to create the script structure.</p>
                    )}
                    {scriptData.outline.length > 0 && (
                       <>
                        <MarkdownViewer content={scriptData.outline} />
                        <GeminiInteraction
                            onRegenerate={handleGenerateOutline}
                            isGenerating={isGenerating}
                            onChatSubmit={handleRefineOutline}
                            isChatLoading={isChatLoading}
                        />
                       </>
                    )}
                </div>
            )}

            {/* --- Full Script Section --- */}
            {scriptData.outline && (
                <div className="pt-8 border-t border-gray-700/50">
                    <h3 className="text-xl font-semibold mb-2">3.3 Generate Full Script</h3>
                     {scriptData.fullScript.length === 0 && !isGenerating && (
                         <p className="text-gray-400">Click "Generate Full Script" to write the final narration.</p>
                    )}
                    {scriptData.fullScript.length > 0 && (
                        <>
                        <MarkdownViewer content={scriptData.fullScript} />
                        <GeminiInteraction
                            onRegenerate={handleGenerateFullScript}
                            isGenerating={isGenerating}
                            onChatSubmit={handleRefineFullScript}
                            isChatLoading={isChatLoading}
                        />
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default Step3_Scripting;