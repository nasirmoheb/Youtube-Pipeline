import React from 'react';
import type { TranscriptionWord } from '../../types';

interface Step11_TranscriptionProps {
    transcriptionData: TranscriptionWord[];
    isGenerating: boolean;
    handleGenerateTranscription: () => void;
    setTranscriptionData: React.Dispatch<React.SetStateAction<TranscriptionWord[]>>;
}

const Step11_Transcription: React.FC<Step11_TranscriptionProps> = ({ transcriptionData, setTranscriptionData }) => {
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    if (event.target && typeof event.target.result === 'string') {
                        const parsedData = JSON.parse(event.target.result);
                        if (Array.isArray(parsedData) && (parsedData.length === 0 || ('word' in parsedData[0] && 'startTime' in parsedData[0] && 'endTime' in parsedData[0]))) {
                            setTranscriptionData(parsedData);
                        } else {
                            alert("Invalid transcription file format. Expected a JSON array of objects with 'word', 'startTime', and 'endTime' keys.");
                        }
                    }
                } catch (error) {
                    console.error("Error parsing transcription file:", error);
                    alert("Failed to parse the transcription file. Please ensure it's a valid JSON file.");
                }
            };
            reader.readAsText(file);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">11. Transcription</h2>
                <div>
                     <label htmlFor="transcription-upload" className="cursor-pointer bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md transition-colors">
                        Upload Transcription File
                    </label>
                    <input
                        id="transcription-upload"
                        type="file"
                        className="sr-only"
                        accept=".json"
                        onChange={handleFileChange}
                    />
                </div>
            </div>
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