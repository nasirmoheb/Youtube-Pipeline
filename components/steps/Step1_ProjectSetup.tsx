import React, { useState } from 'react';
import type { ProjectMetadata } from '../../types';
import * as apiService from '../../services/apiService';
import { extractTextFromPDF } from '../../utils/pdfExtractor';

interface Step1_ProjectSetupProps {
    metadata: ProjectMetadata;
    setMetadata: React.Dispatch<React.SetStateAction<ProjectMetadata>>;
    setBookContent: React.Dispatch<React.SetStateAction<string>>;
    onCreateProject?: () => Promise<void>;
}

const Step1_ProjectSetup: React.FC<Step1_ProjectSetupProps> = ({ metadata, setMetadata, setBookContent, onCreateProject }) => {
    const [isCreating, setIsCreating] = useState(false);
    const [isExtracting, setIsExtracting] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [bookContentLocal, setBookContentLocal] = useState('');

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setMetadata(prev => ({ ...prev, bookName: file.name }));
            setStatusMessage(null);

            const fileExtension = file.name.split('.').pop()?.toLowerCase();

            if (fileExtension === 'pdf') {
                // Handle PDF file
                setIsExtracting(true);
                setStatusMessage({ type: 'success', text: 'Extracting text from PDF...' });

                try {
                    const extractedText = await extractTextFromPDF(file);
                    setBookContent(extractedText);
                    setBookContentLocal(extractedText);
                    setStatusMessage({ type: 'success', text: `Successfully extracted ${extractedText.length} characters from PDF` });
                } catch (error) {
                    setStatusMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to extract text from PDF' });
                } finally {
                    setIsExtracting(false);
                }
            } else {
                // Handle text file
                const reader = new FileReader();
                reader.onload = (event) => {
                    if (event.target && typeof event.target.result === 'string') {
                        const content = event.target.result;
                        setBookContent(content);
                        setBookContentLocal(content);
                        setStatusMessage({ type: 'success', text: `Successfully loaded ${content.length} characters` });
                    }
                };
                reader.onerror = () => {
                    setStatusMessage({ type: 'error', text: 'Failed to read file' });
                };
                reader.readAsText(file);
            }
        }
    };

    const handleCreateProject = async () => {
        if (!metadata.projectPath || !metadata.title) {
            setStatusMessage({ type: 'error', text: 'Please provide both title and project path' });
            return;
        }

        if (!bookContentLocal) {
            setStatusMessage({ type: 'error', text: 'Please upload a book file first' });
            return;
        }

        setIsCreating(true);
        setStatusMessage({ type: 'success', text: 'Creating project...' });

        try {
            const response = await apiService.createProject(metadata.projectPath, bookContentLocal, metadata.title);

            if (response.success) {
                const projectPath = response.data?.projectPath || `${metadata.projectPath}/${metadata.title}`;
                setStatusMessage({
                    type: 'success',
                    text: `Project created successfully at: ${projectPath}`
                });

                // Update metadata with the actual project path
                setMetadata(prev => ({ ...prev, projectPath }));

                if (onCreateProject) {
                    await onCreateProject();
                }
            } else {
                setStatusMessage({ type: 'error', text: response.error || 'Failed to create project' });
            }
        } catch (error) {
            setStatusMessage({ type: 'error', text: 'Failed to connect to backend. Is the server running?' });
        } finally {
            setIsCreating(false);
        }
    };
    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold">1. Project Setup</h2>

            {statusMessage && (
                <div className={`p-4 rounded-md ${statusMessage.type === 'success' ? 'bg-green-900/50 text-green-200' : 'bg-red-900/50 text-red-200'}`}>
                    {statusMessage.text}
                </div>
            )}

            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-300">Video Title</label>
                <input type="text" id="title" value={metadata.title} onChange={e => setMetadata(p => ({ ...p, title: e.target.value }))} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
                <label htmlFor="book" className="block text-sm font-medium text-gray-300">Upload Book (Text or PDF File)</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                        {isExtracting ? (
                            <div className="flex flex-col items-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                                <p className="mt-2 text-sm text-gray-400">Extracting text from PDF...</p>
                            </div>
                        ) : (
                            <>
                                <svg className="mx-auto h-12 w-12 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4 4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                <div className="flex text-sm text-gray-400"><label htmlFor="file-upload" className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-indigo-400 hover:text-indigo-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 focus-within:ring-indigo-500"><span>Upload a file</span><input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".txt,.pdf" /></label><p className="pl-1">or drag and drop</p></div>
                                <p className="text-xs text-gray-500">{metadata.bookName || 'TXT or PDF up to 10MB'}</p>
                            </>
                        )}
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
                    placeholder="e.g., C:\Projects\YouTube-Pipeline"
                    className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="mt-1 text-xs text-gray-400">
                    A folder named "{metadata.title || 'Video-Title'}" will be created inside this directory
                </p>
            </div>

            <button
                onClick={handleCreateProject}
                disabled={isCreating || isExtracting || !metadata.title || !metadata.projectPath || !bookContentLocal}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:bg-indigo-800 disabled:cursor-not-allowed"
            >
                {isCreating ? 'Creating Project...' : 'Create Project Directory'}
            </button>

            {bookContentLocal && (
                <div className="mt-4 p-3 bg-gray-700/50 rounded-md">
                    <p className="text-sm text-gray-300">
                        <span className="font-medium">Content loaded:</span> {bookContentLocal.length.toLocaleString()} characters
                    </p>
                </div>
            )}
        </div>
    );
};
export default Step1_ProjectSetup;