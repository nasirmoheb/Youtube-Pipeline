import React from 'react';
import type { Beat } from '../../types';
import GeminiInteraction from '../GeminiInteraction';

interface Step5_BeatsProps {
    beats: Beat[];
    isGenerating: boolean;
    isChatLoading: boolean;
    handleGenerateBeats: () => void;
    handleRefineBeats: (message: string) => void;
}

const Step5_Beats: React.FC<Step5_BeatsProps> = ({ beats, isGenerating, isChatLoading, handleGenerateBeats, handleRefineBeats }) => {
    return (
        <div>
            <h2 className="text-2xl font-bold">5. Generate Beats</h2>
            <div className="mt-4">
                <div className="bg-gray-900/50 rounded-lg overflow-hidden border border-gray-700">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-800">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-1/4">Beat Number</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Script Phrase</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {beats.map((beat, index) => (
                                <tr key={index} className="bg-gray-800/50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{beat.beat_number}</td>
                                    <td className="px-6 py-4 whitespace-pre-wrap text-sm text-gray-300">{beat.script_phrase}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <GeminiInteraction
                    onRegenerate={handleGenerateBeats}
                    isGenerating={isGenerating}
                    onChatSubmit={handleRefineBeats}
                    isChatLoading={isChatLoading}
                />
            </div>
        </div>
    );
};

export default Step5_Beats;
