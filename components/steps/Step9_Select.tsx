import React, { useState, useEffect } from 'react';
import type { Beat } from '../../types';

interface Step9_SelectProps {
    beats: Beat[];
    projectPath: string;
}

const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.06-1.06l-3.25 3.25-1.5-1.5a.75.75 0 00-1.06 1.06l2 2a.75.75 0 001.06 0l3.75-3.75z" clipRule="evenodd" />
    </svg>
);

const FlagIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M3 2.25a.75.75 0 01.75.75v.54l1.838-.46a9.75 9.75 0 016.725.738l.108.054a8.25 8.25 0 005.58.652l3.109-.732a.75.75 0 01.917.81 47.784 47.784 0 00.005 10.337.75.75 0 01-.574.812l-3.114.733a9.75 9.75 0 01-6.594-.77l-.108-.054a8.25 8.25 0 00-5.69-.625l-2.202.55V21a.75.75 0 01-1.5 0V3A.75.75 0 013 2.25z" clipRule="evenodd" />
    </svg>
);

const Step9_Select: React.FC<Step9_SelectProps> = ({ beats, projectPath }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [images, setImages] = useState<{ [style: string]: { [beat: string]: string } }>({});
    const [selections, setSelections] = useState<{ [beat: string]: { style: string; isFlagged: boolean } }>({});
    const [flags, setFlags] = useState<{ [beat: string]: { [style: string]: boolean } }>({});
    const [loading, setLoading] = useState(true);

    // Load images and selections on mount
    useEffect(() => {
        if (projectPath) {
            loadImagesAndSelections();
        }
    }, [projectPath]);

    const loadImagesAndSelections = async () => {
        setLoading(true);
        try {
            // Load generated images
            const imagesResponse = await fetch('http://localhost:3001/api/get-generated-images', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectPath })
            });

            if (imagesResponse.ok) {
                const imagesData = await imagesResponse.json();
                console.log('Images data received:', imagesData);
                if (imagesData.success) {
                    console.log('Images loaded:', imagesData.images);
                    setImages(imagesData.images);
                } else {
                    console.error('Failed to load images:', imagesData.error);
                }
            } else {
                console.error('Images response not OK:', imagesResponse.status);
            }

            // Load selections
            const selectionsResponse = await fetch('http://localhost:3001/api/get-image-selections', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectPath })
            });

            if (selectionsResponse.ok) {
                const selectionsData = await selectionsResponse.json();
                if (selectionsData.success) {
                    setSelections(selectionsData.selections);
                }
            }
        } catch (error) {
            console.error('Error loading images and selections:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageSelection = async (beatNumber: string, style: 'illustration' | 'clear' | 'consistent') => {
        const isFlagged = flags[beatNumber]?.[style] || false;

        console.log('🔵 handleImageSelection called:', { beatNumber, style, isFlagged, projectPath });

        try {
            const requestBody = { projectPath, beatNumber, style, isFlagged };
            console.log('📤 Sending save request:', requestBody);

            const response = await fetch('http://localhost:3001/api/save-image-selection', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            console.log('📥 Response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Save successful:', data);
                // Update local state
                setSelections(prev => ({
                    ...prev,
                    [beatNumber]: { style, isFlagged }
                }));
            } else {
                const errorData = await response.json();
                console.error('❌ Save failed:', errorData);
            }
        } catch (error) {
            console.error('❌ Error saving image selection:', error);
        }
    };

    const handleFlagToggle = (beatNumber: string, style: 'illustration' | 'clear' | 'consistent', e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent image selection when clicking flag

        setFlags(prev => {
            const newFlags = {
                ...prev,
                [beatNumber]: {
                    ...prev[beatNumber],
                    [style]: !prev[beatNumber]?.[style]
                }
            };

            // If this image is currently selected, update the selection with new flag status
            const currentSelection = selections[beatNumber];
            if (currentSelection?.style === style) {
                handleImageSelection(beatNumber, style);
            }

            return newFlags;
        });
    };

    if (beats.length === 0) {
        return (
            <div>
                <h2 className="text-2xl font-bold mb-4">9. Select Best Image per Beat</h2>
                <p className="text-gray-400 text-center py-8">No beats available. Please complete Step 5 (Beats) first.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div>
                <h2 className="text-2xl font-bold mb-4">9. Select Best Image per Beat</h2>
                <p className="text-gray-400 text-center py-8">Loading images...</p>
            </div>
        );
    }

    const currentBeat = beats[currentIndex];
    const styles: ('illustration' | 'clear' | 'consistent')[] = ['illustration', 'clear', 'consistent'];
    const currentSelection = selections[currentBeat.beat_number];
    const selectedStyle = currentSelection?.style;

    const handlePrevious = async () => {
        // Auto-save current selection before navigating
        const currentBeat = beats[currentIndex];
        const currentSelection = selections[currentBeat.beat_number];
        if (currentSelection) {
            await handleImageSelection(currentBeat.beat_number, currentSelection.style as any);
        }
        setCurrentIndex(prev => Math.max(0, prev - 1));
    };

    const handleNext = async () => {
        console.log('⏭️ Next button clicked');
        // Auto-save current selection before navigating
        const currentBeat = beats[currentIndex];
        const currentSelection = selections[currentBeat.beat_number];
        console.log('Current beat:', currentBeat.beat_number);
        console.log('Current selection:', currentSelection);

        if (currentSelection) {
            console.log('💾 Auto-saving before navigation...');
            await handleImageSelection(currentBeat.beat_number, currentSelection.style as any);
            console.log('✅ Auto-save complete');
        } else {
            console.log('⚠️ No selection to save');
        }

        setCurrentIndex(prev => Math.min(beats.length - 1, prev + 1));
        console.log('📍 Navigating to next beat');
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
                            const imageRelativePath = images[style]?.[currentBeat.beat_number];
                            // Fix: Use proper path separator and ensure correct protocol
                            const imageUrl = imageRelativePath
                                ? `http://localhost:3001/api/serve-image?path=${encodeURIComponent(projectPath + '/' + imageRelativePath.replace(/\\/g, '/'))}`
                                : null;
                            const isSelected = selectedStyle === style;
                            const isFlagged = flags[currentBeat.beat_number]?.[style] || false;

                            // Debug logging
                            if (!imageUrl) {
                                console.log(`No image for ${style} beat ${currentBeat.beat_number}`);
                                console.log(`Available beats for ${style}:`, Object.keys(images[style] || {}));
                            } else {
                                console.log(`Image URL for ${style}:`, imageUrl);
                            }

                            return (
                                <div key={style} className="flex flex-col">
                                    <h4 className="capitalize text-center mb-2 text-indigo-400">{style}</h4>
                                    <div
                                        className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group flex-grow bg-gray-900"
                                        onClick={() => {
                                            if (imageUrl) {
                                                setSelections(prev => ({
                                                    ...prev,
                                                    [currentBeat.beat_number]: {
                                                        style,
                                                        isFlagged: flags[currentBeat.beat_number]?.[style] || false
                                                    }
                                                }));
                                            }
                                        }}
                                    >
                                        {imageUrl ? (
                                            <img
                                                src={imageUrl}
                                                alt={`${style} for ${currentBeat.beat_number}`}
                                                className="w-full h-full object-contain"
                                                onError={(e) => {
                                                    console.error(`Failed to load image: ${imageUrl}`);
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-700/50 flex items-center justify-center text-gray-500">
                                                <div className="text-center">
                                                    <div>No Image</div>
                                                    <div className="text-xs mt-1">Beat: {currentBeat.beat_number}</div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Flag Checkbox - Top Left */}
                                        {imageUrl && (
                                            <div
                                                className="absolute top-2 left-2 z-10"
                                                onClick={(e) => handleFlagToggle(currentBeat.beat_number, style, e)}
                                            >
                                                <div className={`flex items-center gap-1 px-2 py-1 rounded cursor-pointer transition-all ${isFlagged
                                                    ? 'bg-red-500 text-white'
                                                    : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700'
                                                    }`}>
                                                    <input
                                                        type="checkbox"
                                                        checked={isFlagged}
                                                        onChange={() => { }}
                                                        className="w-4 h-4 cursor-pointer"
                                                    />
                                                    <FlagIcon className="w-4 h-4" />
                                                </div>
                                            </div>
                                        )}

                                        {/* Selection Outline & Icon */}
                                        <div className={`absolute inset-0 transition-all rounded-lg pointer-events-none border-4 ${isSelected ? 'border-indigo-500' : 'border-transparent group-hover:border-gray-500'}`} />
                                        {isSelected && (
                                            <div className="absolute bottom-2 right-2">
                                                <CheckCircleIcon className="w-10 h-10 text-indigo-500 bg-white/90 rounded-full" />
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