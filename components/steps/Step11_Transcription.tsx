import React from 'react';
import type { TranscriptionWord } from '../../types';

interface Step11_TranscriptionProps {
    transcriptionData: TranscriptionWord[];
    isGenerating: boolean;
    handleGenerateTranscription: () => void;
}

const Step11_Transcription: React.FC<Step11_TranscriptionProps> = ({ transcriptionData, isGenerating, handleGenerateTranscription }) => {
    return (
        <div>
            <h2 className="text-2xl font-bold">11. Transcription</h2>
             <div className="mt-4">
                <div className="bg-gray-900/50 rounded-lg overflow-hidden border border-gray-700 max-h-96 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-800 sticky top-0">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Word</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Start Time</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">End Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {transcriptionData.map((word, index) => (
                                <tr key={index} className="bg-gray-800/50">
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-white">{word.word}</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-300 font-mono">{word.startTime}</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-300 font-mono">{word.endTime}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Step11_Transcription;
