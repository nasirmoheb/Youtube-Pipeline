import React, { useState } from 'react';
import type { StoryboardRow } from '../../types';

interface Step6_StoryboardProps {
    storyboards: { [key: string]: StoryboardRow[] };
    isGenerating: boolean;
    handleGenerateStoryboard: (style: 'illustration' | 'clear' | 'consistent') => void;
}

type StoryboardStyle = 'illustration' | 'clear' | 'consistent';

const StoryboardTable: React.FC<{ rows: StoryboardRow[] }> = ({ rows }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800/80">
                <tr>
                    {['Shot', 'Beat', 'Script Phrase', 'Transition', 'AI Prompt', 'Text Overlay', 'Kinetic Text', 'SFX'].map(header => (
                        <th key={header} className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">{header}</th>
                    ))}
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
                {rows.map(row => (
                    <tr key={row.shot_number} className="bg-gray-800/50">
                        <td className="px-4 py-2 whitespace-nowrap text-sm">{row.shot_number}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">{row.beat_number}</td>
                        <td className="px-4 py-2 text-sm max-w-xs truncate">{row.script_phrase}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">{row.transition_type}</td>
                        <td className="px-4 py-2 text-sm max-w-xs truncate">{row.ai_prompt}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">{row.text_overlay}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">{row.kinetic_text}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">{row.sfx}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const Step6_Storyboard: React.FC<Step6_StoryboardProps> = ({ storyboards, isGenerating, handleGenerateStoryboard }) => {
    const [activeTab, setActiveTab] = useState<StoryboardStyle>('illustration');

    return (
        <div>
            <h2 className="text-2xl font-bold">6. Generate Storyboard</h2>
            <div className="mt-4">
                <div className="flex space-x-1 rounded-t-lg overflow-hidden bg-gray-700/50 p-1">
                    {(['illustration', 'clear', 'consistent'] as StoryboardStyle[]).map(style => (
                        <button
                            key={style}
                            onClick={() => setActiveTab(style)}
                            className={`capitalize px-4 py-2 text-sm font-medium rounded-md flex-1 transition-colors ${activeTab === style ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-600/50'
                                }`}
                        >
                            {style}
                        </button>
                    ))}
                </div>
                <div className="bg-gray-900/50 rounded-b-lg border border-t-0 border-gray-700 p-4">
                    {storyboards[activeTab]?.length > 0 ? (
                        <div>
                            <div className="mb-4 flex justify-end">
                                <button
                                    onClick={() => handleGenerateStoryboard(activeTab)}
                                    disabled={isGenerating}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:bg-indigo-800 disabled:cursor-not-allowed"
                                >
                                    {isGenerating ? `Regenerating ${activeTab}...` : `Regenerate ${activeTab} Storyboard`}
                                </button>
                            </div>
                            <StoryboardTable rows={storyboards[activeTab]} />
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-400 mb-4">No storyboard generated for the "{activeTab}" style yet.</p>
                            <button
                                onClick={() => handleGenerateStoryboard(activeTab)}
                                disabled={isGenerating}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:bg-indigo-800 disabled:cursor-not-allowed"
                            >
                                {isGenerating ? `Generating ${activeTab}...` : `Generate ${activeTab} Storyboard`}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Step6_Storyboard;
