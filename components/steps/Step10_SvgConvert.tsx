import React from 'react';
import type { ImageSelection, SvgConversionStatus } from '../../types';

interface Step10_SvgConvertProps {
    imageSelection: ImageSelection;
    svgConversionStatus: { [beat_number: string]: SvgConversionStatus };
    handleConvertAllToSvg: () => void;
}

const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => {
    const filled = Math.round(progress / 10);
    const empty = 10 - filled;
    return `[${'#'.repeat(filled)}${'-'.repeat(empty)}] ${progress}%`;
};

const Step10_SvgConvert: React.FC<Step10_SvgConvertProps> = ({ imageSelection, svgConversionStatus, handleConvertAllToSvg }) => {
    const selectedBeats = Object.keys(imageSelection);
    const isConverting = Object.values(svgConversionStatus).some(s => s.status === 'converting');
    const allComplete = selectedBeats.length > 0 && selectedBeats.every(beat => svgConversionStatus[beat]?.status === 'complete');

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                 <h2 className="text-2xl font-bold">10. Convert to SVG for Animation</h2>
                 <button
                    onClick={handleConvertAllToSvg}
                    disabled={isConverting || allComplete}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:bg-indigo-900 disabled:cursor-not-allowed"
                >
                    {isConverting ? 'Converting...' : allComplete ? 'All Complete' : 'Convert All to SVG'}
                </button>
            </div>
           
            <div className="bg-gray-900 p-4 rounded-md h-[60vh] overflow-y-auto font-mono text-sm border border-gray-700">
                {selectedBeats.length === 0 ? (
                    <p className="text-gray-500">&gt; No images selected in the previous step.</p>
                ) : (
                    selectedBeats.map(beat_number => {
                        const status = svgConversionStatus[beat_number];
                        let statusText;
                        let textColor = 'text-gray-400';

                        if (!status || status.status === 'pending') {
                            statusText = 'PENDING...';
                        } else if (status.status === 'converting') {
                            statusText = `CONVERTING ${ProgressBar({ progress: status.progress })}`;
                            textColor = 'text-yellow-400';
                        } else if (status.status === 'complete') {
                            statusText = `COMPLETE ✓ - Output: ${beat_number}.svg`;
                            textColor = 'text-green-400';
                        } else if (status.status === 'error') {
                            statusText = `ERROR ✗`;
                            textColor = 'text-red-400';
                        }

                        return (
                            <div key={beat_number} className="flex">
                                <span className="text-gray-500 mr-2">&gt;</span>
                                <span className="text-indigo-400 mr-2">{beat_number}:</span>
                                <span className={textColor}>{statusText}</span>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default Step10_SvgConvert;