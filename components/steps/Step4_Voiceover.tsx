import React, { useState } from 'react';
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

const ClipboardIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5 .124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-4.125m11.25 0v4.125a1.125 1.125 0 01-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125h3.375" />
    </svg>
);
const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
);


const Step4_Voiceover: React.FC<Step4_VoiceoverProps> = ({ voiceoverSegments, handleGenerateVoiceoverForSegment, handlePlayAudio }) => {
    const [copiedId, setCopiedId] = useState<number | null>(null);

    const handleCopy = (id: number, text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        });
    };

    return (
        <div>
            <h2 className="text-2xl font-bold">4. Voiceover Generation</h2>
            <div className="mt-4 space-y-3">
                {voiceoverSegments.map(segment => (
                    <div key={segment.id} className="bg-gray-700 p-3 rounded-md flex items-center justify-between">
                        <p className="flex-grow mr-4">{segment.text}</p>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                            {segment.status === 'complete' && segment.audioUrl && (
                                <button onClick={() => handlePlayAudio(segment.audioUrl)} className="p-2 rounded-full bg-green-500 hover:bg-green-600 text-white" title="Play audio">
                                    <PlayIcon className="w-5 h-5" />
                                </button>
                            )}
                             <button
                                onClick={() => handleCopy(segment.id, segment.text)}
                                className="p-2 rounded-full bg-gray-600 hover:bg-gray-500 text-white transition-colors"
                                title="Copy text"
                            >
                                {copiedId === segment.id ? (
                                    <CheckIcon className="w-5 h-5 text-green-400" />
                                ) : (
                                    <ClipboardIcon className="w-5 h-5" />
                                )}
                            </button>
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
