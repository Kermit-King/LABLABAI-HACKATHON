import React, { useRef, useEffect } from 'react';
import { MessageSquare, SendHorizontal, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Textarea } from './ui/textarea';
import { useProjectPlanner } from '../context/ProjectPlannerContext';
import { ChatMessage as ChatMessageComponent } from './ChatMessage';

export const ChatTab: React.FC = () => {
  const {
    transcript,
    technicalTask,
    githubIssues,
    chatMessages,
    sendChatMessage,
    isChatLoading,
    chatInputMessage,
    setChatInputMessage,
  } = useProjectPlanner();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [chatInputMessage]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const hasContext = transcript || technicalTask || githubIssues.length > 0;

  const handleSend = async () => {
    if (!chatInputMessage.trim() || isChatLoading || !hasContext) return;

    const message = chatInputMessage.trim();
    setChatInputMessage('');

    try {
      await sendChatMessage(message);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setChatInputMessage(e.target.value);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
        {!hasContext ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-12 text-center px-6">
            <MessageSquare className="h-10 w-10 text-muted-foreground" />
            <h3 className="text-sm font-medium text-foreground">Ask N.A.T.S. anything</h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              Extract engineering intent first to start asking questions about your project.
            </p>
          </div>
        ) : chatMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-12 text-center px-6">
            <MessageSquare className="h-10 w-10 text-muted-foreground" />
            <h3 className="text-sm font-medium text-foreground">Ask N.A.T.S. anything</h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              Ask questions about the transcript, request changes to the blueprint, or refine generated issues.
            </p>
          </div>
        ) : (
          <>
            {chatMessages.map((message) => (
              <ChatMessageComponent
                key={message.id}
                content={message.content}
                role={message.role}
                timestamp={message.timestamp}
              />
            ))}
            {isChatLoading && (
              <div className="flex justify-start">
                <Card className="bg-muted rounded-2xl rounded-bl-sm px-4 py-2 max-w-[80%]">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </Card>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="flex items-end gap-2 px-4 pt-3 pb-4 border-t">
        <Textarea
          ref={textareaRef}
          rows={1}
          placeholder={hasContext ? "Ask about the blueprint..." : "Extract intent first..."}
          className="flex-1 resize-none overflow-hidden min-h-[40px]"
          onKeyDown={handleKeyDown}
          onChange={handleChange}
          value={chatInputMessage}
          disabled={!hasContext || isChatLoading}
          style={{ maxHeight: '120px' }}
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!chatInputMessage.trim() || !hasContext || isChatLoading}
        >
          {isChatLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <SendHorizontal className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};

// Made with Bob