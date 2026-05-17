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
    chatInputMessage,
    setChatInputMessage,
  } = useProjectPlanner();

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
    if (!chatInputMessage.trim() || isChatLoading) return;

    const message = chatInputMessage.trim();
    setChatInputMessage('');

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

  const handleMinimize = () => {
    // Minimize: close popout and open panel
    setIsChatPopout(false);
    setIsChatPanelOpen(true);
  };

  const handleClose = () => {
    // Close: close both popout and panel
    setIsChatPopout(false);
    setIsChatPanelOpen(false);
  };

  const hasContext = transcript || technicalTask || githubIssues.length > 0 || bobPrompt;

  // Popout floating window mode
  if (isChatPopout) {
    return (
      <div className="fixed bottom-6 right-6 w-full max-w-md h-[85vh] max-h-[700px] flex flex-col bg-white dark:bg-slate-800 rounded-lg shadow-2xl z-50 border border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-t-lg">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">Ask BobScribe</h3>
          </div>
          <div className="flex items-center gap-2">
            {chatMessages.length > 0 && (
              <button
                onClick={clearChatHistory}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                aria-label="Clear chat"
                title="Clear chat history"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleMinimize}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              aria-label="Minimize to panel"
              title="Minimize to side panel"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleClose}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              aria-label="Close chatbot"
              title="Close chatbot"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
          {!hasContext ? (
            <div className="flex items-center justify-center h-full text-center text-slate-500 dark:text-slate-400 px-3">
              <div>
                <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  Analyze a meeting transcript first to start asking questions about your project.
                </p>
              </div>
            </div>
          ) : chatMessages.length === 0 ? (
            <div className="text-center text-slate-500 dark:text-slate-400 px-3">
              <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm mb-3">
                Ask me anything about your analyzed transcript, system blueprint, GitHub issues, or implementation steps!
              </p>
              <div className="text-xs text-left space-y-2 bg-slate-50 dark:bg-slate-900/50 p-3 rounded border border-slate-200 dark:border-slate-700">
                <p className="font-semibold text-slate-700 dark:text-slate-300">Example questions:</p>
                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
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
                  <div className="bg-slate-100 dark:bg-slate-700 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
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
        <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef as any}
              value={chatInputMessage}
              onChange={(e) => setChatInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={hasContext ? "Ask a question..." : "Analyze transcript first..."}
              disabled={!hasContext || isChatLoading}
              rows={1}
              className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm resize-none max-h-24 overflow-y-auto"
              style={{ minHeight: '40px' }}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!chatInputMessage.trim() || !hasContext || isChatLoading}
              className="px-3 py-2 shrink-0"
              aria-label="Send message"
            >
              {isChatLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
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
    chatInputMessage,
    setChatInputMessage,
  } = useProjectPlanner();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async () => {
    if (!chatInputMessage.trim() || isChatLoading) return;

    const message = chatInputMessage.trim();
    setChatInputMessage('');

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
    // Pop out: close panel and open popout
    setIsChatPanelOpen(false);
    setIsChatPopout(true);
  };

  const handleClose = () => {
    // Close: close panel only
    setIsChatPanelOpen(false);
  };

  const hasContext = transcript || technicalTask || githubIssues.length > 0 || bobPrompt;

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-t-lg shrink-0">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100">Ask BobScribe</h3>
        </div>
        <div className="flex items-center gap-1">
          {chatMessages.length > 0 && (
            <button
              onClick={clearChatHistory}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              aria-label="Clear chat"
              title="Clear chat history"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={handlePopout}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            aria-label="Pop out"
            title="Pop out to floating window"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleClose}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            aria-label="Close panel"
            title="Close panel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
        {!hasContext ? (
          <div className="flex items-center justify-center h-full text-center text-slate-500 dark:text-slate-400 px-3">
            <div>
              <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-xs">
                Analyze a meeting transcript first to start asking questions about your project.
              </p>
            </div>
          </div>
        ) : chatMessages.length === 0 ? (
          <div className="text-center text-slate-500 dark:text-slate-400 px-3">
            <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-xs mb-3">
              Ask me anything about your analyzed transcript, system blueprint, GitHub issues, or implementation steps!
            </p>
            <div className="text-xs text-left space-y-2 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded border border-slate-200 dark:border-slate-700">
              <p className="font-semibold text-slate-700 dark:text-slate-300">Example questions:</p>
              <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-400">
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
                <div className="bg-slate-100 dark:bg-slate-700 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-xs">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 shrink-0">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef as any}
            value={chatInputMessage}
            onChange={(e) => setChatInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={hasContext ? "Ask a question..." : "Analyze transcript first..."}
            disabled={!hasContext || isChatLoading}
            rows={1}
            className="flex-1 px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed text-xs resize-none max-h-20 overflow-y-auto"
            style={{ minHeight: '36px' }}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!chatInputMessage.trim() || !hasContext || isChatLoading}
            className="px-3 py-2 shrink-0"
            aria-label="Send message"
          >
            {isChatLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

// Made with Bob