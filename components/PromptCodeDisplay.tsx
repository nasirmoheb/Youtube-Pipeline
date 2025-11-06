import React, { useState } from 'react';
import type { ExtractedPrompt } from '../types';

interface PromptCodeDisplayProps {
    style: string;
    prompts: ExtractedPrompt[];
}

const ClipboardIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5 .124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-4.125m11.25 0v4.125a1.125 1.125 0 01-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125h3.375" /></svg>;
const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>;

const PromptCodeDisplay: React.FC<PromptCodeDisplayProps> = ({ style, prompts }) => {
    const [copied, setCopied] = useState(false);
    const codeString = `const prompts_${style} = ${JSON.stringify(prompts, null, 2)};`;

    const handleCopy = () => {
        navigator.clipboard.writeText(codeString).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="bg-gray-900 rounded-md overflow-hidden">
            <div className="bg-gray-800 px-4 py-2 flex justify-between items-center">
                <span className="text-sm font-mono text-gray-400">prompts-{style}.js</span>
                <button onClick={handleCopy} className="text-gray-400 hover:text-white transition-colors flex items-center text-sm">
                    {copied ? (
                        <>
                            <CheckIcon className="w-4 h-4 mr-1 text-green-400" />
                            Copied!
                        </>
                    ) : (
                        <>
                            <ClipboardIcon className="w-4 h-4 mr-1" />
                            Copy code
                        </>
                    )}
                </button>
            </div>
            <pre className="p-4 text-sm overflow-x-auto">
                <code>{codeString}</code>
            </pre>
        </div>
    );
};

export default PromptCodeDisplay;
