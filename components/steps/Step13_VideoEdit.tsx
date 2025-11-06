import React from 'react';
import VideoEditor from '../VideoEditor';
import type { PreEditScanItem } from '../../types';

interface Step13_VideoEditProps {
    combinedVoiceoverUrl: string | null;
    scanData: PreEditScanItem[];
}

const Step13_VideoEdit: React.FC<Step13_VideoEditProps> = ({ combinedVoiceoverUrl, scanData }) => {
    return (
        <div className="h-[70vh]">
            <VideoEditor audioUrl={combinedVoiceoverUrl} scanData={scanData} />
        </div>
    );
};

export default Step13_VideoEdit;
