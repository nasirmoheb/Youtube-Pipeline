import React from 'react';
import { marked } from 'marked';

interface MarkdownViewerProps {
  content: string;
}

const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content }) => {
  const getMarkdownText = () => {
    const rawMarkup = marked.parse(content || '', {
        gfm: true,
        breaks: true,
    });
    return { __html: rawMarkup as string };
  };

  return (
    <div
      className="bg-gray-800 p-4 rounded-md prose prose-invert max-w-none 
                 prose-headings:text-indigo-400 prose-strong:text-white
                 prose-a:text-blue-400 hover:prose-a:text-blue-300
                 prose-ul:list-disc prose-ol:list-decimal prose-li:my-1
                 prose-blockquote:border-l-4 prose-blockquote:border-gray-500 prose-blockquote:pl-4 prose-blockquote:italic"
      dangerouslySetInnerHTML={getMarkdownText()}
    />
  );
};

export default MarkdownViewer;
