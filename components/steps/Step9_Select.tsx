import React from 'react';
import type { Beat, ImageSelection } from '../../types';

interface Step9_SelectProps {
    beats: Beat[];
    images: { [style: string]: { [beat: string]: string } };
    imageSelection: ImageSelection;
    handleImageSelection: (beat_number: string, style: 'illustration' | 'clear' | 'consistent', url: string) => void;
}

const Step9_Select: React.FC<Step9_SelectProps> = ({ beats, images, imageSelection, handleImageSelection }) => {
    const styles: ('illustration' | 'clear' | 'consistent')[] = ['illustration', 'clear', 'consistent'];
    
    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">9. Select Best Image per Beat</h2>
            <div className="space-y-6">
                {beats.map(beat => (
                    <div key={beat.beat_number} className="bg-gray-800/70 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-3">{beat.beat_number}: <span className="text-gray-300 font-normal italic">"{beat.script_phrase}"</span></h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {styles.map(style => {
                                const imageUrl = images[style]?.[beat.beat_number];
                                const isSelected = imageSelection[beat.beat_number]?.url === imageUrl;
                                return (
                                    <div key={style} className="flex flex-col">
                                        <h4 className="capitalize text-center mb-2 text-indigo-400">{style}</h4>
                                        <div 
                                            className={`relative aspect-square rounded-lg overflow-hidden border-4 transition-colors cursor-pointer ${isSelected ? 'border-indigo-500' : 'border-transparent hover:border-gray-500'}`}
                                            onClick={() => imageUrl && handleImageSelection(beat.beat_number, style, imageUrl)}
                                        >
                                            {imageUrl ? (
                                                <img src={imageUrl} alt={`${style} for ${beat.beat_number}`} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-gray-700/50 flex items-center justify-center text-gray-500">No Image</div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Step9_Select;
