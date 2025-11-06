import React from 'react';
import type { ProjectMetadata } from '../../types';

interface Step1_ProjectSetupProps {
    metadata: ProjectMetadata;
    setMetadata: React.Dispatch<React.SetStateAction<ProjectMetadata>>;
    setBookContent: React.Dispatch<React.SetStateAction<string>>;
}

const Step1_ProjectSetup: React.FC<Step1_ProjectSetupProps> = ({ metadata, setMetadata, setBookContent }) => {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setMetadata(prev => ({ ...prev, bookName: file.name }));
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target && typeof event.target.result === 'string') {
                    setBookContent(event.target.result);
                }
            };
            reader.readAsText(file);
        }
    };
    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold">1. Project Setup</h2>
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-300">Video Title</label>
                <input type="text" id="title" value={metadata.title} onChange={e => setMetadata(p => ({ ...p, title: e.target.value }))} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
            </div>
            <div>
                <label htmlFor="book" className="block text-sm font-medium text-gray-300">Upload Book (Text File)</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4 4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        <div className="flex text-sm text-gray-400"><label htmlFor="file-upload" className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-indigo-400 hover:text-indigo-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 focus-within:ring-indigo-500"><span>Upload a file</span><input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".txt"/></label><p className="pl-1">or drag and drop</p></div>
                        <p className="text-xs text-gray-500">{metadata.bookName || 'TXT up to 10MB'}</p>
                    </div>
                </div>
            </div>
            <div>
                <label htmlFor="path" className="block text-sm font-medium text-gray-300">Project Directory Path</label>
                <input
                    type="text"
                    id="path"
                    value={metadata.projectPath}
                    onChange={e => setMetadata(p => ({ ...p, projectPath: e.target.value }))}
                    placeholder="e.g., /Users/Shared/YouTube-Pipeline/My-Awesome-Project"
                    className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>
        </div>
    );
};
export default Step1_ProjectSetup;