import React from 'react';
import type { PreEditScanItem } from '../../types';

interface Step12_PreEditScanProps {
    preEditScanData: PreEditScanItem[];
}

const Step12_PreEditScan: React.FC<Step12_PreEditScanProps> = ({ preEditScanData }) => {
    return (
        <div>
            <h2 className="text-2xl font-bold">12. Pre-Edit Scan</h2>
            <div className="mt-4 bg-gray-900 p-4 rounded-md max-h-[60vh] overflow-y-auto">
                <pre className="text-sm text-green-300 whitespace-pre-wrap">
                    {JSON.stringify(preEditScanData, null, 2)}
                </pre>
            </div>
        </div>
    );
};

export default Step12_PreEditScan;
