import React, { useState, useEffect, useRef } from 'react';
import type { ExtractedPrompt } from '../../types';

interface Step8_ImagesProps {
    extractedPrompts: { [key: string]: ExtractedPrompt[] };
    projectPath: string;
}

interface ProgressState {
    [style: string]: {
        [beat: string]: 'pending' | 'generating' | 'complete' | 'error' | 'skipped';
    };
}

interface StyleProgress {
    completed: number;
    total: number;
}

const StatusIndicator: React.FC<{ status: 'pending' | 'generating' | 'complete' | 'error' | 'skipped' | undefined }> = ({ status }) => {
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
        case 'skipped':
            return <span className="text-blue-400">✓ Exists</span>;
        case 'error':
            return <span className="text-red-400">✗ Error</span>;
        default:
            return <span className="text-gray-500">◦ Pending</span>;
    }
};

const Step8_Images: React.FC<Step8_ImagesProps> = ({ extractedPrompts, projectPath }) => {
    const styles = ['illustration', 'clear', 'consistent'];
    const [isGenerating, setIsGenerating] = useState(false);
    const [progressState, setProgressState] = useState<ProgressState>({});
    const [styleProgress, setStyleProgress] = useState<{ [style: string]: StyleProgress }>({});
    const [overallMessage, setOverallMessage] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const beatsWithPrompts = extractedPrompts.illustration?.map(p => p.beat_number) || [];
    const hasPrompts = beatsWithPrompts.length > 0;

    // Check if generation is already running and load progress on mount
    useEffect(() => {
        if (projectPath && hasPrompts) {
            checkGenerationStatus();
            loadProgressFromBackend();
        }
    }, [projectPath, hasPrompts]);

    // Initialize progress state
    useEffect(() => {
        if (hasPrompts) {
            const initialState: ProgressState = {};
            styles.forEach(style => {
                initialState[style] = {};
                beatsWithPrompts.forEach(beat => {
                    initialState[style][beat] = 'pending';
                });
            });
            setProgressState(initialState);

            const initialProgress: { [style: string]: StyleProgress } = {};
            styles.forEach(style => {
                initialProgress[style] = { completed: 0, total: beatsWithPrompts.length };
            });
            setStyleProgress(initialProgress);
        }
    }, [hasPrompts]);

    const loadProgressFromBackend = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/get-generation-progress', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ projectPath })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.progress) {
                    // Update progress state from backend
                    const newProgressState: ProgressState = {};
                    const newStyleProgress: { [style: string]: StyleProgress } = {};

                    styles.forEach(style => {
                        const styleData = data.progress[style];
                        if (styleData) {
                            newProgressState[style] = {};
                            beatsWithPrompts.forEach(beat => {
                                if (styleData.completedBeats.includes(beat)) {
                                    newProgressState[style][beat] = 'complete';
                                } else {
                                    newProgressState[style][beat] = 'pending';
                                }
                            });

                            newStyleProgress[style] = {
                                completed: styleData.completedBeats.length,
                                total: beatsWithPrompts.length
                            };
                        }
                    });

                    setProgressState(newProgressState);
                    setStyleProgress(newStyleProgress);

                    // Update message
                    const totalCompleted = Object.values(newStyleProgress).reduce((sum, p) => sum + p.completed, 0);
                    const totalImages = Object.values(newStyleProgress).reduce((sum, p) => sum + p.total, 0);
                    if (totalCompleted > 0) {
                        setOverallMessage(`Progress loaded: ${totalCompleted}/${totalImages} images completed`);
                    }
                }
            }
        } catch (error) {
            console.error('Failed to load progress:', error);
        }
    };

    const checkGenerationStatus = async () => {
        try {
            const response = await fetch(`http://localhost:3001/api/generation-status/${encodeURIComponent(projectPath)}`);
            const data = await response.json();
            if (data.isGenerating) {
                setIsGenerating(true);
                setOverallMessage('⚠ Generation is running in background. Progress shown below.');
            }
        } catch (error) {
            console.error('Failed to check generation status:', error);
        }
    };

    const handleGenerateImages = async () => {
        if (!projectPath || !hasPrompts || isGenerating) return;

        setIsGenerating(true);
        setIsConnected(false);
        setOverallMessage('Connecting to server...');

        abortControllerRef.current = new AbortController();

        try {
            // Backend will load prompts from project directory
            const response = await fetch('http://localhost:3001/api/generate-images', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ projectPath }),
                signal: abortControllerRef.current.signal
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to start image generation');
            }

            setIsConnected(true);
            setOverallMessage('Connected! Starting generation...');

            const reader = response.body?.getReader();
            readerRef.current = reader || null;
            const decoder = new TextDecoder();

            if (!reader) {
                throw new Error('No response body');
            }

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));

                            if (data.type === 'start') {
                                setOverallMessage(data.message);
                            } else if (data.type === 'progress') {
                                const { style, beat_number, completed, total, status } = data;

                                setProgressState(prev => ({
                                    ...prev,
                                    [style]: {
                                        ...prev[style],
                                        [beat_number]: status
                                    }
                                }));

                                setStyleProgress(prev => ({
                                    ...prev,
                                    [style]: { completed, total }
                                }));

                                setOverallMessage(`[${style}] Processing Beat ${beat_number}... (${completed}/${total})`);
                            } else if (data.type === 'complete') {
                                setOverallMessage('✓ All images generated successfully!');
                                setIsGenerating(false);
                                setIsConnected(false);
                            } else if (data.type === 'error') {
                                setOverallMessage(`✗ Error: ${data.error}`);
                                setIsGenerating(false);
                                setIsConnected(false);
                            }
                        } catch (e) {
                            console.error('Failed to parse SSE data:', e);
                        }
                    }
                }
            }
        } catch (error: any) {
            if (error.name === 'AbortError') {
                setOverallMessage('⚠ Generation continues in background. You can navigate to other steps.');
                setIsGenerating(false);
                setIsConnected(false);
            } else {
                console.error('Image generation error:', error);
                setOverallMessage(`✗ Error: ${error.message}`);
                setIsGenerating(false);
                setIsConnected(false);
            }
        }
    };

    const handleStopGeneration = async () => {
        try {
            // Cancel the SSE connection
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            if (readerRef.current) {
                await readerRef.current.cancel();
            }

            // Send stop signal to backend
            await fetch('http://localhost:3001/api/stop-generation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ projectPath })
            });

            setIsGenerating(false);
            setIsConnected(false);
            setOverallMessage('⚠ Generation stopped. Progress has been saved. Click Start to resume.');
        } catch (error) {
            console.error('Failed to stop generation:', error);
            setOverallMessage('⚠ Disconnected from generation. It may still be running in background.');
            setIsGenerating(false);
            setIsConnected(false);
        }
    };

    const handleDisconnect = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        if (readerRef.current) {
            readerRef.current.cancel();
        }
        setIsConnected(false);
        setOverallMessage('⚠ Disconnected. Generation continues in background. You can navigate to other steps.');
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">8. Generating Images</h2>
                {hasPrompts && (
                    <div className="flex gap-2">
                        {!isGenerating ? (
                            <button
                                onClick={handleGenerateImages}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
                            >
                                Start Generation
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={handleStopGeneration}
                                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
                                >
                                    Stop
                                </button>
                                <button
                                    onClick={handleDisconnect}
                                    className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
                                >
                                    Disconnect (Continue in Background)
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>

            {overallMessage && (
                <div className={`mb-4 p-3 rounded-md border ${overallMessage.includes('✓') ? 'bg-green-900/20 border-green-700' :
                    overallMessage.includes('✗') ? 'bg-red-900/20 border-red-700' :
                        overallMessage.includes('⚠') ? 'bg-yellow-900/20 border-yellow-700' :
                            'bg-gray-800 border-gray-700'
                    }`}>
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-300">{overallMessage}</p>
                        {isConnected && (
                            <span className="flex items-center text-xs text-green-400">
                                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                                Connected
                            </span>
                        )}
                    </div>
                </div>
            )}

            {!hasPrompts ? (
                <p className="text-center text-gray-400 py-16">Please generate a storyboard in Step 6 to create image prompts.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {styles.map(style => {
                        const progress = styleProgress[style];
                        const percentage = progress ? Math.round((progress.completed / progress.total) * 100) : 0;

                        return (
                            <div key={style}>
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-xl font-semibold capitalize text-indigo-400">{style}</h3>
                                    {progress && (
                                        <span className="text-sm text-gray-400">
                                            {progress.completed}/{progress.total} ({percentage}%)
                                        </span>
                                    )}
                                </div>

                                {progress && progress.total > 0 && (
                                    <div className="mb-3 bg-gray-800 rounded-full h-2">
                                        <div
                                            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                )}

                                <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm space-y-2">
                                    {beatsWithPrompts.map(beat => {
                                        const status = progressState[style]?.[beat];
                                        return (
                                            <div key={beat} className="flex justify-between items-center">
                                                <span className="text-gray-300">{beat}:</span>
                                                <StatusIndicator status={status} />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Step8_Images;