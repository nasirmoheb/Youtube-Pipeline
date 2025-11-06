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
    handleGenerateHooks,
    handleRefineHooks,
    handleSelectHook,
    handleGenerateOutline,
    handleRefineOutline,
    handleGenerateFullScript,
    handleRefineFullScript,
}) => {
    return (
        <div>
            <h2 className="text-2xl font-bold">3. Scripting</h2>
            {scriptingSubStep === 'hooks' && (
                <div className="mt-4">
                    <h3 className="text-xl font-semibold mb-2">3.1 Generate Hooks</h3>
                    <div className="space-y-2">
                        {scriptData.hooks.map((hook, index) => (
                            <button
                                key={index}
                                onClick={() => handleSelectHook(hook)}
                                className={`w-full text-left p-3 rounded-md transition-colors ${
                                    scriptData.selectedHook === hook ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'
                                }`}
                            >
                                {hook}
                            </button>
                        ))}
                    </div>
                    <GeminiInteraction
                        onRegenerate={handleGenerateHooks}
                        isGenerating={isGenerating}
                        onChatSubmit={handleRefineHooks}
                        isChatLoading={isChatLoading}
                    />
                </div>
            )}
            {scriptingSubStep === 'outline' && (
                <div className="mt-4">
                    <h3 className="text-xl font-semibold mb-2">3.2 Generate Outline</h3>
                    <MarkdownViewer content={scriptData.outline} />
                    <GeminiInteraction
                        onRegenerate={handleGenerateOutline}
                        isGenerating={isGenerating}
                        onChatSubmit={handleRefineOutline}
                        isChatLoading={isChatLoading}
                    />
                </div>
            )}
            {scriptingSubStep === 'script' && (
                <div className="mt-4">
                    <h3 className="text-xl font-semibold mb-2">3.3 Generate Full Script</h3>
                    <MarkdownViewer content={scriptData.fullScript} />
                    <GeminiInteraction
                        onRegenerate={handleGenerateFullScript}
                        isGenerating={isGenerating}
                        onChatSubmit={handleRefineFullScript}
                        isChatLoading={isChatLoading}
                    />
                </div>
            )}
        </div>
    );
};

export default Step3_Scripting;
