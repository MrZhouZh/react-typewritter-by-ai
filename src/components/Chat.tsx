'use client';

import React, { useState, useRef, useCallback, ReactNode } from 'react';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import TypeWriter from './TypeWriter';
import SettingsPanel from './SettingsPanel';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export const Chat: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Close any existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      // Create new EventSource connection
      const eventSource = new EventSource(`/api/chat?message=${encodeURIComponent(input.trim())}`);
      eventSourceRef.current = eventSource;

      let assistantMessage = '';
      const assistantId = (Date.now() + 1).toString();

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'token') {
            assistantMessage += data.content;
            setMessages(prev => {
              const newMessages = [...prev];
              const lastMessage = newMessages.find(m => m.id === assistantId);
              if (lastMessage) {
                lastMessage.content = assistantMessage;
              } else {
                newMessages.push({
                  id: assistantId,
                  role: 'assistant',
                  content: assistantMessage
                });
              }
              return newMessages;
            });
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        setIsLoading(false);
      };

      eventSource.addEventListener('done', () => {
        eventSource.close();
        setIsLoading(false);
      });
    } catch (error) {
      console.error('Error creating EventSource:', error);
      setIsLoading(false);
    }
  }, [input, isLoading]);

  return (
    <div className="flex flex-col h-screen" data-testid="chat-container">
      {/* Settings Button and Panel */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          onClick={() => setShowSettings(!showSettings)}
          variant="ghost"
          size="icon"
          className="bg-white/50 backdrop-blur-sm hover:bg-white/80"
          aria-label="Toggle settings"
        >
          <Cog6ToothIcon className="h-6 w-6" />
        </Button>

        {showSettings && (
          <div className="absolute top-12 right-0 w-80 p-6 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200">
            <SettingsPanel />
          </div>
        )}
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-8 py-6 pt-0 space-y-6 scrollbar-hide"
        data-testid="messages"
      >
        <h1 className="text-4xl font-bold sticky top-0 bg-white/80 backdrop-blur-sm py-4 z-10">Chat Interface</h1>

        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            data-testid={`message-${message.role}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg text-xl shadow-sm ${
                message.role === 'user'
                  ? 'bg-blue-50 border border-blue-100'
                  : 'bg-gray-50 border border-gray-100'
              }`}
            >
              {message.role === 'assistant' ? (
                <TypeWriter
                  text={message.content}
                  key={message.id}
                  speed={index === messages.length - 1 && isLoading ? undefined : 0}
                  renderComponent={({ displayText }) => (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => <>{children}</>,
                          code: ({ node, inline, className, children, ...props }: {
                            node?: any;
                            inline?: boolean;
                            className?: string;
                            children?: ReactNode;
                            [key: string]: any;
                          }) => {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline ? (
                              <pre className="relative rounded-lg">
                                <code
                                  className={`block overflow-x-auto p-4 ${match ? `language-${match[1]}` : ''}`}
                                  {...props}
                                >
                                  {children}
                                </code>
                              </pre>
                            ) : (
                              <code className="px-1 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800" {...props}>
                                {children}
                              </code>
                            );
                          },
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  )}
                />
              ) : (
                <div data-testid="message-content">{message.content}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input Form */}
      <div className="border-t border-gray-200 bg-white/80 backdrop-blur-sm p-6">
        <form onSubmit={handleSubmit} className="container mx-auto flex gap-4" data-testid="chat-form">
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            data-testid="chat-input"
            aria-label="Chat input"
            className="flex-1"
          />
          <Button
            type="submit"
            size="lg"
            disabled={isLoading || !input.trim()}
            data-testid="send-button"
            aria-label="Send message"
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
