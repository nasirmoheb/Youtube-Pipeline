import React, { useState } from 'react';
import type { ExtractedPrompt } from '../../types';

interface Step8_ImagesProps {
    images: { [style: string]: { [beat: string]: string } };
    extractedPrompts: { [key: string]: ExtractedPrompt[] };
    handleGenerateImages: () => void;
    imageGenerationStatus: { [key: string]: 'pending' | 'generating' | 'complete' | 'error' };
}

const LoadingSpinner = () => (
    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
    </div>
);

const ErrorIcon = () => (
     <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
        <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
    </div>
);

const Step8_Images: React.FC<Step8_ImagesProps> = ({ images, extractedPrompts, handleGenerateImages, imageGenerationStatus }) => {
    const styles = ['illustration', 'clear', 'consistent'];
    const beatsWithPrompts = extractedPrompts.illustration?.map(p => p.beat_number) || [];
    
    const hasPrompts = beatsWithPrompts.length > 0;

    return (
        <div>
            <div className="flex justify-between items-center">
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
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {styles.map(style => (
                        <div key={style}>
                            <h3 className="text-xl font-semibold capitalize mb-4 text-center text-indigo-400">{style}</h3>
                            <div className="space-y-4">
                                {beatsWithPrompts.map(beat => {
                                    const key = `${style}-${beat}`;
                                    const status = imageGenerationStatus[key];
                                    const imageUrl = images[style]?.[beat];
                                    return (
                                        <div key={key} className="bg-gray-800 rounded-lg p-3">
                                            <h4 className="font-bold text-sm mb-2">{beat}</h4>
                                            <div className="aspect-square bg-gray-700/50 rounded-md relative overflow-hidden">
                                                {imageUrl ? (
                                                    <img src={imageUrl} alt={`${style} for ${beat}`} className="w-full h-full object-cover"/>
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-gray-500 text-xs">Awaiting Image</div>
                                                )}
                                                {status === 'generating' && <LoadingSpinner />}
                                                {status === 'error' && <ErrorIcon />}
                                            </div>
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
