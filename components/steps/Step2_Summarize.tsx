import React from 'react';
import MarkdownViewer from '../MarkdownViewer';
import GeminiInteraction from '../GeminiInteraction';

interface Step2_SummarizeProps {
    summary: string;
    isGenerating: boolean;
    isChatLoading: boolean;
    handleGenerateSummary: () => void;
    handleRefineSummary: (message: string) => void;
}

const Step2_Summarize: React.FC<Step2_SummarizeProps> = ({ summary, isGenerating, isChatLoading, handleGenerateSummary, handleRefineSummary }) => {
    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold">2. Summarize Content</h2>

            {!summary && !isGenerating && (
                <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-6 text-center">
                    <p className="text-gray-300 mb-4">
                        Generate a summary of your book content to use as the foundation for your video script.
                    </p>
                    <button
                        onClick={handleGenerateSummary}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-md transition-colors"
                    >
                        Generate Summary
                    </button>
                </div>
            )}

            {isGenerating && (
                <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-6 text-center">
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
                        <p className="text-gray-300">Generating summary from your book content...</p>
                        <p className="text-gray-400 text-sm mt-2">This may take a moment</p>
                    </div>
                </div>
            )}

            {summary && (
                <div className="mt-4">
                    <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-4 mb-4">
                        <h3 className="text-lg font-semibold text-gray-200 mb-2">Generated Summary</h3>
                        <p className="text-sm text-gray-400">
                            This summary will be used to generate your video script. You can refine it using the chat below.
                        </p>
                    </div>
                    <MarkdownViewer content={summary} />
                    <GeminiInteraction
                        onRegenerate={handleGenerateSummary}
                        isGenerating={isGenerating}
                        onChatSubmit={handleRefineSummary}
                        isChatLoading={isChatLoading}
                    />
                </div>
            )}
        </div>
    );
};

export default Step2_Summarize;
