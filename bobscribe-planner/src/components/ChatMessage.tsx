import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';

interface ChatMessageProps {
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ content, role, timestamp }) => {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  // Parse message content to detect code blocks
  const parseContent = (text: string) => {
    // Match code blocks with optional language: ```language\ncode\n```
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts: Array<{ type: 'text' | 'code'; content: string; language?: string }> = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.substring(lastIndex, match.index),
        });
      }

      // Add code block
      parts.push({
        type: 'code',
        content: match[2].trim(),
        language: match[1] || 'typescript', // Default to typescript
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex),
      });
    }

    return parts.length > 0 ? parts : [{ type: 'text' as const, content: text }];
  };

  const handleCopyCode = async (code: string, index: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  const parts = parseContent(content);

  return (
    <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-[85%] rounded-lg ${
          role === 'user'
            ? 'bg-indigo-600 dark:bg-indigo-700 text-white'
            : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100'
        }`}
      >
        <div className="px-3 py-2">
          {parts.map((part, index) => {
            if (part.type === 'code') {
              return (
                <div key={index} className="my-2 -mx-3 first:mt-0 last:mb-0">
                  <div className="relative group">
                    {/* Language label and copy button */}
                    <div className="absolute top-0 right-0 flex items-center gap-1.5 p-1.5 z-10">
                      {part.language && (
                        <span className="text-xs text-slate-400 dark:text-slate-300 bg-slate-800 dark:bg-slate-900 px-2 py-0.5 rounded">
                          {part.language}
                        </span>
                      )}
                      <button
                        onClick={() => handleCopyCode(part.content, index)}
                        className="p-1.5 rounded bg-slate-800 dark:bg-slate-900 hover:bg-slate-700 dark:hover:bg-slate-800 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Copy code"
                      >
                        {copiedIndex === index ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Code block with horizontal scroll */}
                    <div className="overflow-x-auto">
                      <SyntaxHighlighter
                        language={part.language}
                        style={vscDarkPlus}
                        customStyle={{
                          margin: 0,
                          borderRadius: '0.5rem',
                          fontSize: '0.75rem',
                          padding: '0.75rem',
                          maxHeight: '300px',
                          overflowY: 'auto',
                        }}
                        showLineNumbers={part.content.split('\n').length > 5}
                        wrapLines={false}
                        wrapLongLines={false}
                      >
                        {part.content}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <p key={index} className="text-xs whitespace-pre-wrap break-words leading-relaxed">
                {part.content}
              </p>
            );
          })}
        </div>
        <p className={`px-3 pb-1.5 text-[10px] ${role === 'user' ? 'text-white/70' : 'text-slate-500 dark:text-slate-400'}`}>
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};

// Made with Bob