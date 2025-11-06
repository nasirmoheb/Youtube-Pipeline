import React from 'react';
import type { ImageSelection, SvgConversionStatus } from '../../types';

interface Step10_SvgConvertProps {
    imageSelection: ImageSelection;
    svgConversionStatus: { [beat_number: string]: SvgConversionStatus };
    handleConvertImageToSvg: (beat_number: string, imageUrl: string) => void;
}

const Step10_SvgConvert: React.FC<Step10_SvgConvertProps> = ({ imageSelection, svgConversionStatus, handleConvertImageToSvg }) => {
    const selectedBeats = Object.keys(imageSelection);

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">10. Convert to SVG for Animation</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {selectedBeats.map(beat_number => {
                    const selection = imageSelection[beat_number];
                    if (!selection) return null;
                    
                    const status = svgConversionStatus[beat_number];

                    return (
                        <div key={beat_number} className="bg-gray-800 p-3 rounded-lg flex flex-col items-center">
                            <h3 className="font-semibold text-sm mb-2">{beat_number}</h3>
                            <div className="aspect-square w-full relative mb-3">
                                <img src={selection.url} alt={`Selected for ${beat_number}`} className="w-full h-full object-cover rounded-md" />
                                {status?.svgUrl && (
                                     <img src={status.svgUrl} alt={`SVG for ${beat_number}`} className="w-full h-full object-cover rounded-md absolute inset-0" />
                                )}
                            </div>
                            {status?.status === 'converting' && (
                                <div className="w-full bg-gray-700 rounded-full h-2.5 mb-2">
                                    <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${status.progress}%` }}></div>
                                </div>
                            )}
                            <button
                                onClick={() => handleConvertImageToSvg(beat_number, selection.url)}
                                disabled={status?.status === 'converting' || status?.status === 'complete'}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded-md text-sm transition-colors disabled:bg-indigo-900 disabled:cursor-not-allowed"
                            >
                                {status?.status === 'complete' ? 'Converted' : status?.status === 'converting' ? `Converting... ${status.progress}%` : 'Convert'}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Step10_SvgConvert;
