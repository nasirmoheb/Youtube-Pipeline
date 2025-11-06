import React from 'react';
import type { VoiceoverSegment } from '../../types';

interface Step4_VoiceoverProps {
    voiceoverSegments: VoiceoverSegment[];
    setVoiceoverSegments: React.Dispatch<React.SetStateAction<VoiceoverSegment[]>>;
    handleGenerateVoiceoverForSegment: (segmentId: number) => void;
    handlePlayAudio: (audioUrl: string) => void;
    handleGenerateVoiceoverSegments: () => void;
}

const PlayIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
    </svg>
);

const Step4_Voiceover: React.FC<Step4_VoiceoverProps> = ({ voiceoverSegments, handleGenerateVoiceoverForSegment, handlePlayAudio }) => {
    return (
        <div>
            <h2 className="text-2xl font-bold">4. Voiceover Generation</h2>
            <div className="mt-4 space-y-3">
                {voiceoverSegments.map(segment => (
                    <div key={segment.id} className="bg-gray-700 p-3 rounded-md flex items-center justify-between">
                        <p className="flex-grow mr-4">{segment.text}</p>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                            {segment.status === 'complete' && segment.audioUrl && (
                                <button onClick={() => handlePlayAudio(segment.audioUrl)} className="p-2 rounded-full bg-green-500 hover:bg-green-600 text-white">
                                    <PlayIcon className="w-5 h-5" />
                                </button>
                            )}
                            <button
                                onClick={() => handleGenerateVoiceoverForSegment(segment.id)}
                                disabled={segment.status === 'generating'}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md text-sm disabled:bg-indigo-900 disabled:cursor-wait"
                            >
                                {segment.status === 'pending' && 'Generate'}
                                {segment.status === 'generating' && 'Generating...'}
                                {segment.status === 'complete' && 'Regenerate'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Step4_Voiceover;
