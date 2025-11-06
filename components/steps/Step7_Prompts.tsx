import React, { useState } from 'react';
import type { ExtractedPrompt } from '../../types';
import PromptCodeDisplay from '../PromptCodeDisplay';

interface Step7_PromptsProps {
    extractedPrompts: { [key: string]: ExtractedPrompt[] };
}

type StoryboardStyle = 'illustration' | 'clear' | 'consistent';

const Step7_Prompts: React.FC<Step7_PromptsProps> = ({ extractedPrompts }) => {
    const [activeTab, setActiveTab] = useState<StoryboardStyle>('illustration');

    return (
        <div>
            <h2 className="text-2xl font-bold">7. Extract Prompts</h2>
            <div className="mt-4">
                 <div className="flex space-x-1 rounded-t-lg overflow-hidden bg-gray-700/50 p-1">
                    {(['illustration', 'clear', 'consistent'] as StoryboardStyle[]).map(style => (
                        <button
                            key={style}
                            onClick={() => setActiveTab(style)}
                            className={`capitalize px-4 py-2 text-sm font-medium rounded-md flex-1 transition-colors ${
                                activeTab === style ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-600/50'
                            }`}
                        >
                            {style}
                        </button>
                    ))}
                </div>
                <div className="p-4 bg-gray-900/50 rounded-b-lg border border-t-0 border-gray-700">
                    {extractedPrompts[activeTab] && extractedPrompts[activeTab].length > 0 ? (
                        <PromptCodeDisplay style={activeTab} prompts={extractedPrompts[activeTab]} />
                    ) : (
                        <p className="text-center text-gray-400 py-8">No prompts extracted for this style.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Step7_Prompts;
