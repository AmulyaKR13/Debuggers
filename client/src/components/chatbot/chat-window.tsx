import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Loader2, Send, X, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useIsAuthenticated } from '@/lib/auth';

// Define the shape of the API response from our chatbot service
interface ChatbotResponse {
  id: string;
  text: string;
  timestamp: string;
  actions?: Array<{
    type: string;
    text: string;
    url?: string;
  }>;
  suggestions?: string[];
  data?: any;
}

type Message = {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  actions?: Array<{
    type: string;
    text: string;
    url?: string;
  }>;
  suggestions?: string[];
  data?: any;
};

export default function ChatWindow() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const isAuthenticated = useIsAuthenticated();

  // Add welcome message when chat is opened for the first time
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          sender: 'bot',
          text: "Hello! I'm the NeurAllocate AI Assistant. I can help with task management, allocation, and team insights. How can I assist you today?",
          timestamp: new Date().toISOString(),
          suggestions: ['Show my tasks', 'Team availability', 'Create a task']
        }
      ]);
    }
  }, [isOpen, messages.length]);

  // Scroll to bottom of messages when a new message is added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input when chat is opened
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const toggleChat = () => {
    if (!isOpen) {
      setIsOpen(true);
      setIsMinimized(false);
    } else {
      setIsMinimized(!isMinimized);
    }
  };

  const closeChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !isAuthenticated) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: inputValue,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await apiRequest<ChatbotResponse>('/api/chatbot/message', {
        method: 'POST',
        body: JSON.stringify({ message: inputValue })
      });

      const botMessage: Message = {
        id: response.id || `bot_${Date.now()}`,
        sender: 'bot',
        text: response.text,
        timestamp: response.timestamp || new Date().toISOString(),
        actions: response.actions || [],
        suggestions: response.suggestions || [],
        data: response.data
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive'
      });

      // Add fallback message
      const fallbackMessage: Message = {
        id: `bot_fallback_${Date.now()}`,
        sender: 'bot',
        text: "I'm having trouble connecting to the server. Please try again in a moment.",
        timestamp: new Date().toISOString(),
        suggestions: ['Try again', 'Help', 'Dashboard']
      };

      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    // Small delay to show the suggestion in the input before sending
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  // Render message with formatting
  const renderMessageText = (text: string) => {
    // Simple formatting for now, could be extended with markdown, etc.
    return text.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  // If user is not authenticated, don't render the chat
  if (!isAuthenticated) return null;

  return (
    <>
      {/* Chat toggle button */}
      <div className="fixed bottom-4 right-4 z-50">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={toggleChat}
                className="h-12 w-12 rounded-full shadow-lg"
                size="icon"
              >
                <MessageSquare className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>AI Assistant</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-80 sm:w-96 shadow-xl rounded-lg overflow-hidden transition-all duration-300 ease-in-out">
          <Card className="border-0">
            {/* Chat header */}
            <div className="bg-primary text-primary-foreground p-3 flex justify-between items-center">
              <div className="font-medium flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                AI Assistant
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full hover:bg-primary-foreground/20"
                  onClick={toggleChat}
                >
                  {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full hover:bg-primary-foreground/20"
                  onClick={closeChat}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Chat content */}
            {!isMinimized && (
              <>
                <CardContent className="p-0">
                  {/* Messages container */}
                  <div className="h-80 overflow-y-auto p-3 space-y-4 bg-gray-50 dark:bg-gray-900">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-3 py-2 ${
                            message.sender === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-gray-200 dark:bg-gray-800 text-foreground'
                          }`}
                        >
                          <div className="text-sm">{renderMessageText(message.text)}</div>
                          
                          {/* Display task data if available */}
                          {message.data?.tasks && (
                            <div className="mt-2 space-y-1">
                              {message.data.tasks.map((task: any) => (
                                <div key={task.id} className="text-xs p-1 border-l-2 border-primary-foreground pl-2">
                                  <div className="font-medium">{task.title}</div>
                                  <div className="flex justify-between mt-1">
                                    <span className="opacity-80">Status: {task.status}</span>
                                    <span className="opacity-80">Priority: {task.priority}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Action buttons */}
                          {message.actions && message.actions.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {message.actions.map((action, index) => (
                                <a
                                  key={index}
                                  href={action.url}
                                  className="text-xs bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground rounded px-2 py-1 inline-block"
                                >
                                  {action.text}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {/* Suggestions */}
                    {messages.length > 0 && messages[messages.length - 1].sender === 'bot' && messages[messages.length - 1].suggestions && messages[messages.length - 1].suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {messages[messages.length - 1].suggestions?.map((suggestion, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="text-xs py-1 h-auto"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    )}
                    
                    {/* Loading indicator */}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-gray-200 dark:bg-gray-800 rounded-lg px-3 py-2">
                          <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input area */}
                  <div className="p-3 border-t">
                    <div className="flex">
                      <Input
                        ref={inputRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        className="rounded-r-none focus-visible:ring-0 focus-visible:ring-offset-0"
                        disabled={isLoading || !isAuthenticated}
                      />
                      <Button
                        className="rounded-l-none"
                        disabled={!inputValue.trim() || isLoading || !isAuthenticated}
                        onClick={handleSendMessage}
                      >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        </div>
      )}
    </>
  );
}