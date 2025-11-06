import React from 'react';
import { Player } from '@remotion/player';
import { 
    AbsoluteFill, 
    Sequence, 
    Img, 
    Audio, 
    useCurrentFrame,
    useVideoConfig,
    interpolate,
    spring,
} from 'remotion';
import type { PreEditScanItem } from '../types';

const VIDEO_WIDTH = 1920;
const VIDEO_HEIGHT = 1080;
const FPS = 30;

interface VideoEditorProps {
  audioUrl: string | null;
  scanData: PreEditScanItem[];
}

const KineticText: React.FC<{text: string}> = ({ text }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const words = text.split(' ');

    return (
        <h1 style={{
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: 100,
            fontWeight: 'bold',
            textAlign: 'center',
            position: 'absolute',
            bottom: '100px',
            width: '100%',
            color: 'white',
            textShadow: '0 0 20px rgba(0,0,0,0.7)',
        }}>
            {words.map((word, i) => {
                const delay = i * 5;
                const scale = spring({
                    fps,
                    frame: frame - delay,
                    config: {
                        damping: 100,
                        stiffness: 200,
                        mass: 0.5,
                    },
                });

                return (
                    <span
                        key={word + i}
                        style={{
                            marginLeft: 10,
                            marginRight: 10,
                            display: 'inline-block',
                            transform: `scale(${scale})`,
                        }}
                    >
                        {word}
                    </span>
                );
            })}
        </h1>
    );
};


const MyVideoComposition: React.FC<{ scanData: PreEditScanItem[], voiceoverUrl: string | null }> = ({ scanData, voiceoverUrl }) => {
    return (
        <AbsoluteFill style={{ backgroundColor: '#111827' }}>
             {voiceoverUrl && <Audio src={voiceoverUrl} />}
             {scanData.map((item, index) => {
                const from = Math.round(item.start * FPS);
                const durationInFrames = Math.round((item.end - item.start) * FPS);

                if (durationInFrames <= 0) return null;

                return (
                    <Sequence key={item.beat_number} from={from} durationInFrames={durationInFrames}>
                        <AbsoluteFill>
                            <Img 
                                src={item.photo}
                                style={{ 
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }} 
                            />
                        </AbsoluteFill>
                        {item.text && (
                           <KineticText text={item.text} />
                        )}
                        {/* Placeholder for SFX audio. In a real app, you would load this from a file source. */}
                        {/* {item.sfx && <Audio src={staticFile(`sfx/${item.sfx}`)} />} */}
                    </Sequence>
                );
             })}
        </AbsoluteFill>
    );
};

const VideoEditor: React.FC<VideoEditorProps> = ({ audioUrl, scanData }) => {
  if (scanData.length === 0) {
    return (
      <div className="flex flex-col h-full bg-gray-900 rounded-lg overflow-hidden items-center justify-center">
        <h2 className="text-2xl font-bold p-4 text-gray-500">13. Video Edit</h2>
        <p className="text-gray-600">No data available to build video.</p>
      </div>
    );
  }

  const totalDuration = scanData.length > 0 ? scanData[scanData.length - 1].end : 1;
  const durationInFrames = Math.ceil(totalDuration * FPS);

  return (
    <div className="flex flex-col w-full h-full bg-gray-900 rounded-lg overflow-hidden">
        <h2 className="text-2xl font-bold p-4 border-b border-gray-700/50 flex-shrink-0">13. Video Edit</h2>
        <div className="flex-grow w-full min-h-0">
             <Player
                component={MyVideoComposition}
                inputProps={{ scanData, voiceoverUrl: audioUrl }}
                durationInFrames={durationInFrames}
                compositionWidth={VIDEO_WIDTH}
                compositionHeight={VIDEO_HEIGHT}
                fps={FPS}
                style={{
                    width: '100%',
                    height: '100%',
                }}
                controls
                loop
            />
        </div>
    </div>
  );
};

export default VideoEditor;