import React from 'react';
import type { ExtractedPrompt } from '../../types';

interface Step8_ImagesProps {
    images: { [style: string]: { [beat: string]: string } };
    extractedPrompts: { [key: string]: ExtractedPrompt[] };
    handleGenerateImages: () => void;
    imageGenerationStatus: { [key: string]: 'pending' | 'generating' | 'complete' | 'error' };
}

const StatusIndicator: React.FC<{ status: 'pending' | 'generating' | 'complete' | 'error' | undefined }> = ({ status }) => {
    switch (status) {
        case 'generating':
            return (
                <span className="text-yellow-400 flex items-center">
                    <svg className="animate-spin h-4 w-4 mr-2 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                </span>
            );
        case 'complete':
            return <span className="text-green-400">✓ Complete</span>;
        case 'error':
            return <span className="text-red-400">✗ Error</span>;
        default:
            return <span className="text-gray-500">◦ Pending</span>;
    }
};

const Step8_Images: React.FC<Step8_ImagesProps> = ({ extractedPrompts, handleGenerateImages, imageGenerationStatus }) => {
    const styles = ['illustration', 'clear', 'consistent'];
    const beatsWithPrompts = extractedPrompts.illustration?.map(p => p.beat_number) || [];
    
    const hasPrompts = beatsWithPrompts.length > 0;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">8. Generating Images</h2>
                {hasPrompts && (
                     <button 
                        onClick={handleGenerateImages} 
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
                    >
                        Generate All Images
                    </button>
                )}
            </div>
             {!hasPrompts ? (
                <p className="text-center text-gray-400 py-16">Please generate a storyboard in Step 6 to create image prompts.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {styles.map(style => (
                        <div key={style}>
                            <h3 className="text-xl font-semibold capitalize mb-3 text-center text-indigo-400">{style}</h3>
                            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm space-y-2">
                                {beatsWithPrompts.map(beat => {
                                    const key = `${style}-${beat}`;
                                    const status = imageGenerationStatus[key];
                                    return (
                                        <div key={key} className="flex justify-between items-center">
                                            <span className="text-gray-300">{beat}:</span>
                                            <StatusIndicator status={status} />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Step8_Images;