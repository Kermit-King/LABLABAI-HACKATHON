import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, RefreshCw, ThumbsUp, ThumbsDown, User, Bot } from 'lucide-react';

interface ChatMessageProps {
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ content, role, timestamp }) => {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);
  const [copiedMessage, setCopiedMessage] = React.useState(false);

  // Parse message content to detect code blocks and inline code
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

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2000);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  // Render text with inline code styling
  const renderTextWithInlineCode = (text: string) => {
    const inlineCodeRegex = /`([^`]+)`/g;
    const parts: Array<{ type: 'text' | 'inline-code'; content: string }> = [];
    let lastIndex = 0;
    let match;

    while ((match = inlineCodeRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.substring(lastIndex, match.index),
        });
      }
      parts.push({
        type: 'inline-code',
        content: match[1],
      });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex),
      });
    }

    if (parts.length === 0) {
      return text;
    }

    return parts.map((part, idx) => {
      if (part.type === 'inline-code') {
        return (
          <code
            key={idx}
            className="bg-zinc-200/60 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-sm font-mono text-zinc-900 dark:text-zinc-100"
          >
            {part.content}
          </code>
        );
      }
      return <span key={idx}>{part.content}</span>;
    });
  };

  const parts = parseContent(content);

  return (
    <div className="w-full group">
      {/* Full-width container with max-width wrapper */}
      <div className={`w-full ${role === 'assistant' ? 'bg-transparent' : ''}`}>
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex gap-4">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  role === 'user'
                    ? 'bg-indigo-600 dark:bg-indigo-500 text-white'
                    : 'bg-gradient-to-br from-orange-400 to-pink-400 text-white'
                }`}
              >
                {role === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>
            </div>

            {/* Message Content */}
            <div className="flex-1 min-w-0">
              {/* Header with role and timestamp */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {role === 'user' ? 'You' : 'Bob'}
                </span>
                <span className="text-xs text-zinc-400 dark:text-zinc-500">
                  {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Message body */}
              <div
                className={`${
                  role === 'user'
                    ? 'inline-block bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl px-4 py-2.5'
                    : ''
                }`}
              >
                <div
                  className={`${
                    role === 'user'
                      ? 'text-zinc-900 dark:text-zinc-100 text-[15px] leading-relaxed'
                      : 'text-zinc-800 dark:text-zinc-200 text-[15px] leading-relaxed'
                  }`}
                >
                  {parts.map((part, index) => {
                    if (part.type === 'code') {
                      return (
                        <div key={index} className="my-4 first:mt-2 last:mb-2 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700">
                          <div className="relative group/code">
                            {/* Code header with language and copy button */}
                            <div className="flex items-center justify-between bg-zinc-800 dark:bg-zinc-900 px-4 py-2 border-b border-zinc-700">
                              <span className="text-xs font-medium text-zinc-300">
                                {part.language || 'code'}
                              </span>
                              <button
                                onClick={() => handleCopyCode(part.content, index)}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors"
                                title="Copy code"
                              >
                                {copiedIndex === index ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copy code</span>
                                  </>
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
                                  borderRadius: 0,
                                  fontSize: '0.875rem',
                                  padding: '1rem',
                                  maxHeight: '400px',
                                  overflowY: 'auto',
                                  background: '#1e1e1e',
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
                      <div key={index} className="whitespace-pre-wrap break-words">
                        {renderTextWithInlineCode(part.content)}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action row for assistant messages */}
              {role === 'assistant' && (
                <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={handleCopyMessage}
                    className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                    title="Copy message"
                  >
                    {copiedMessage ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                    title="Regenerate response"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700 mx-1" />
                  <button
                    className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                    title="Good response"
                  >
                    <ThumbsUp className="w-4 h-4" />
                  </button>
                  <button
                    className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                    title="Bad response"
                  >
                    <ThumbsDown className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Made with Bob