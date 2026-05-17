import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Trash2, Loader2, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from './ui/Button';
import { useProjectPlanner } from '../context/ProjectPlannerContext';
import { ChatMessage } from './ChatMessage';

interface ChatMessageType {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const Chatbot: React.FC = () => {
  const {
    transcript,
    technicalTask,
    githubIssues,
    bobPrompt,
    sendChatMessage,
    chatMessages,
    clearChatHistory,
    isChatLoading,
    isChatPanelOpen,
    setIsChatPanelOpen,
    isChatPopout,
    setIsChatPopout,
  } = useProjectPlanner();

  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isChatPanelOpen || isChatPopout) {
      inputRef.current?.focus();
    }
  }, [isChatPanelOpen, isChatPopout]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isChatLoading) return;

    const message = inputMessage.trim();
    setInputMessage('');

    try {
      await sendChatMessage(message);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const togglePopout = () => {
    setIsChatPopout(!isChatPopout);
    if (!isChatPopout) {
      // When popping out, close the panel
      setIsChatPanelOpen(false);
    }
  };

  const hasContext = transcript || technicalTask || githubIssues.length > 0 || bobPrompt;

  // Popout floating window mode
  if (isChatPopout) {
    return (
      <div className="fixed bottom-6 right-6 w-[500px] h-[700px] flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-2xl z-50 border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            <h3 className="font-semibold">Ask BobScribe</h3>
          </div>
          <div className="flex items-center gap-2">
            {chatMessages.length > 0 && (
              <button
                onClick={clearChatHistory}
                className="p-1 hover:bg-blue-700 rounded transition-colors"
                aria-label="Clear chat"
                title="Clear chat history"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={togglePopout}
              className="p-1 hover:bg-blue-700 rounded transition-colors"
              aria-label="Dock to panel"
              title="Dock to side panel"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsChatPopout(false)}
              className="p-1 hover:bg-blue-700 rounded transition-colors"
              aria-label="Close chatbot"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!hasContext ? (
            <div className="flex items-center justify-center h-full text-center text-gray-500 dark:text-gray-400 px-4">
              <div>
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">
                  Analyze a meeting transcript first to start asking questions about your project.
                </p>
              </div>
            </div>
          ) : chatMessages.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 px-4">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm mb-4">
                Ask me anything about your analyzed transcript, system blueprint, GitHub issues, or implementation steps!
              </p>
              <div className="text-xs text-left space-y-2 bg-gray-50 dark:bg-gray-900 p-3 rounded">
                <p className="font-semibold">Example questions:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>What files need to be modified?</li>
                  <li>How do I implement step 2?</li>
                  <li>What are the acceptance criteria for issue #1?</li>
                  <li>What's the estimated effort?</li>
                </ul>
              </div>
            </div>
          ) : (
            <>
              {chatMessages.map((message) => (
                <ChatMessage
                  key={message.id}
                  content={message.content}
                  role={message.role}
                  timestamp={message.timestamp}
                />
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef as any}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={hasContext ? "Ask a question..." : "Analyze transcript first..."}
              disabled={!hasContext || isChatLoading}
              rows={1}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm resize-none max-h-32 overflow-y-auto"
              style={{ minHeight: '40px' }}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || !hasContext || isChatLoading}
              className="px-4 py-2"
              aria-label="Send message"
            >
              {isChatLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    );
  }

  // Side panel mode (when isChatPanelOpen is true, rendered by App.tsx)
  // This component returns null when in panel mode, as it's rendered in App.tsx
  if (isChatPanelOpen) {
    return null;
  }

  // Floating button to open chat (when both panel and popout are closed)
  return (
    <button
      onClick={() => setIsChatPanelOpen(true)}
      className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all hover:scale-110 z-50"
      aria-label="Open chatbot"
    >
      <MessageCircle className="w-6 h-6" />
    </button>
  );
};

// Chat Panel Component (for side panel mode)
export const ChatPanel: React.FC = () => {
  const {
    transcript,
    technicalTask,
    githubIssues,
    bobPrompt,
    sendChatMessage,
    chatMessages,
    clearChatHistory,
    isChatLoading,
    setIsChatPanelOpen,
    setIsChatPopout,
  } = useProjectPlanner();

  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isChatLoading) return;

    const message = inputMessage.trim();
    setInputMessage('');

    try {
      await sendChatMessage(message);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handlePopout = () => {
    setIsChatPanelOpen(false);
    setIsChatPopout(true);
  };

  const hasContext = transcript || technicalTask || githubIssues.length > 0 || bobPrompt;

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          <h3 className="font-semibold">Ask BobScribe</h3>
        </div>
        <div className="flex items-center gap-2">
          {chatMessages.length > 0 && (
            <button
              onClick={clearChatHistory}
              className="p-1 hover:bg-blue-700 rounded transition-colors"
              aria-label="Clear chat"
              title="Clear chat history"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handlePopout}
            className="p-1 hover:bg-blue-700 rounded transition-colors"
            aria-label="Pop out"
            title="Pop out to floating window"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsChatPanelOpen(false)}
            className="p-1 hover:bg-blue-700 rounded transition-colors"
            aria-label="Close panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!hasContext ? (
          <div className="flex items-center justify-center h-full text-center text-gray-500 dark:text-gray-400 px-4">
            <div>
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">
                Analyze a meeting transcript first to start asking questions about your project.
              </p>
            </div>
          </div>
        ) : chatMessages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 px-4">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm mb-4">
              Ask me anything about your analyzed transcript, system blueprint, GitHub issues, or implementation steps!
            </p>
            <div className="text-xs text-left space-y-2 bg-gray-50 dark:bg-gray-900 p-3 rounded">
              <p className="font-semibold">Example questions:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>What files need to be modified?</li>
                <li>How do I implement step 2?</li>
                <li>What are the acceptance criteria for issue #1?</li>
                <li>What's the estimated effort?</li>
              </ul>
            </div>
          </div>
        ) : (
          <>
            {chatMessages.map((message) => (
              <ChatMessage
                key={message.id}
                content={message.content}
                role={message.role}
                timestamp={message.timestamp}
              />
            ))}
            {isChatLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef as any}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={hasContext ? "Ask a question..." : "Analyze transcript first..."}
            disabled={!hasContext || isChatLoading}
            rows={1}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm resize-none max-h-32 overflow-y-auto"
            style={{ minHeight: '40px' }}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || !hasContext || isChatLoading}
            className="px-4 py-2"
            aria-label="Send message"
          >
            {isChatLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

// Made with Bob