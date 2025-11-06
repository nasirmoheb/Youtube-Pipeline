import React, { useState } from 'react';
import type { Beat, ImageSelection } from '../../types';

interface Step9_SelectProps {
    beats: Beat[];
    images: { [style: string]: { [beat: string]: string } };
    imageSelection: ImageSelection;
    handleImageSelection: (beat_number: string, style: 'illustration' | 'clear' | 'consistent', url: string) => void;
    flaggedImages: { [beat: string]: Set<string> };
    handleImageFlagToggle: (beat_number: string, imageUrl: string) => void;
}

const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.06-1.06l-3.25 3.25-1.5-1.5a.75.75 0 00-1.06 1.06l2 2a.75.75 0 001.06 0l3.75-3.75z" clipRule="evenodd" />
    </svg>
);


const Step9_Select: React.FC<Step9_SelectProps> = ({ beats, images, imageSelection, handleImageSelection, flaggedImages, handleImageFlagToggle }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (beats.length === 0) {
        return (
            <div>
                <h2 className="text-2xl font-bold mb-4">9. Select Best Image per Beat</h2>
                <p className="text-gray-400 text-center py-8">No beats available to select images for.</p>
            </div>
        );
    }
    
    const currentBeat = beats[currentIndex];
    const styles: ('illustration' | 'clear' | 'consistent')[] = ['illustration', 'clear', 'consistent'];
    const currentSelectionUrl = imageSelection[currentBeat.beat_number]?.url;
    const currentFlags = flaggedImages[currentBeat.beat_number] || new Set();

    const handlePrevious = () => {
        setCurrentIndex(prev => Math.max(0, prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex(prev => Math.min(beats.length - 1, prev + 1));
    };

    return (
        <div>
            <div className="text-center mb-4">
                <h2 className="text-2xl font-bold">9. Select Best Image per Beat</h2>
                <span className="text-lg font-mono text-gray-400">{currentIndex + 1} / {beats.length}</span>
            </div>

            <div className="flex items-stretch justify-center gap-4 h-[60vh]">
                {/* Previous Button */}
                <button
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className="flex-shrink-0 bg-gray-700 hover:bg-gray-600 text-white font-bold p-4 rounded-lg transition-colors disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                </button>

                {/* Main Content */}
                <div className="flex-grow bg-gray-800/70 p-4 rounded-lg flex flex-col">
                    <h3 className="text-lg font-semibold mb-3 text-center flex-shrink-0">{currentBeat.beat_number}: <span className="text-gray-300 font-normal italic">"{currentBeat.script_phrase}"</span></h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-grow min-h-0">
                        {styles.map(style => {
                            const imageUrl = images[style]?.[currentBeat.beat_number];
                            const isSelected = currentSelectionUrl === imageUrl;
                            const isFlagged = imageUrl ? currentFlags.has(imageUrl) : false;

                            return (
                                <div key={style} className="flex flex-col">
                                    <h4 className="capitalize text-center mb-2 text-indigo-400">{style}</h4>
                                    <div 
                                        className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group flex-grow"
                                        onClick={() => imageUrl && handleImageSelection(currentBeat.beat_number, style, imageUrl)}
                                    >
                                        {imageUrl ? (
                                            <img src={imageUrl} alt={`${style} for ${currentBeat.beat_number}`} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-700/50 flex items-center justify-center text-gray-500">No Image</div>
                                        )}
                                        
                                        {/* Selection Outline & Icon */}
                                        <div className={`absolute inset-0 transition-all rounded-lg pointer-events-none border-4 ${isSelected ? 'border-indigo-500' : 'border-transparent group-hover:border-gray-500'}`} />
                                        {isSelected && (
                                            <div className="absolute top-2 left-2">
                                                <CheckCircleIcon className="w-8 h-8 text-indigo-500 bg-white/90 rounded-full" />
                                            </div>
                                        )}

                                        {/* Flag Checkbox */}
                                        {imageUrl && (
                                            <div className="absolute top-2 right-2 z-10 p-1 bg-black/30 rounded-full" onClick={e => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    id={`flag-${style}-${currentBeat.beat_number}`}
                                                    className="h-6 w-6 rounded-full bg-gray-700/80 border-gray-500 text-indigo-500 focus:ring-indigo-600 focus:ring-2 focus:ring-offset-0 cursor-pointer"
                                                    checked={isFlagged}
                                                    onChange={() => handleImageFlagToggle(currentBeat.beat_number, imageUrl)}
                                                    title="Flag for review"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Next Button */}
                 <button
                    onClick={handleNext}
                    disabled={currentIndex === beats.length - 1}
                    className="flex-shrink-0 bg-gray-700 hover:bg-gray-600 text-white font-bold p-4 rounded-lg transition-colors disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                </button>
            </div>
        </div>
    );
};

export default Step9_Select;