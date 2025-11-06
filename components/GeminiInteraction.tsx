import React, { useState } from 'react';

interface GeminiInteractionProps {
  onRegenerate: () => void;
  isGenerating: boolean;
  onChatSubmit: (message: string) => void;
  isChatLoading: boolean;
}

const PaperAirplaneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
);

const ArrowPathIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.18-3.185m-3.181 0l-3.182-3.182m0 0a8.25 8.25 0 00-11.664 0l-3.18 3.185" />
    </svg>
);

const GeminiInteraction: React.FC<GeminiInteractionProps> = ({ onRegenerate, isGenerating, onChatSubmit, isChatLoading }) => {
  const [chatMessage, setChatMessage] = useState('');

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatMessage.trim() && !isGenerating && !isChatLoading) {
      onChatSubmit(chatMessage);
      setChatMessage('');
    }
  };

  return (
    <div className="mt-8 pt-4 border-t border-gray-700">
      <form onSubmit={handleChatSubmit} className="flex items-center space-x-4">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Chat with Gemini to refine the result..."
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            disabled={isGenerating || isChatLoading}
            className="w-full bg-gray-800 border border-gray-600 rounded-full py-2 pl-4 pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
             {isChatLoading ? (
                <ArrowPathIcon className="w-5 h-5 text-gray-400 animate-spin" />
             ) : (
                <button
                    type="submit"
                    disabled={isGenerating || isChatLoading || !chatMessage.trim()}
                    className="p-1.5 text-gray-400 hover:text-white disabled:text-gray-600 disabled:cursor-not-allowed"
                    aria-label="Send message"
                >
                    <PaperAirplaneIcon className="w-5 h-5" />
                </button>
             )}
          </div>
        </div>
        <button
          type="button"
          onClick={onRegenerate}
          disabled={isGenerating || isChatLoading}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-full transition-colors"
        >
          <ArrowPathIcon className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>Regenerate</span>
        </button>
      </form>
    </div>
  );
};

export default GeminiInteraction;