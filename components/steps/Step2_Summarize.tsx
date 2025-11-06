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
        <div>
            <h2 className="text-2xl font-bold">2. Summarize Content</h2>
            <div className="mt-4">
                <MarkdownViewer content={summary} />
                <GeminiInteraction
                    onRegenerate={handleGenerateSummary}
                    isGenerating={isGenerating}
                    onChatSubmit={handleRefineSummary}
                    isChatLoading={isChatLoading}
                />
            </div>
        </div>
    );
};

export default Step2_Summarize;
