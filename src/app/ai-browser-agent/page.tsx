'use client';

import React, { useState, useRef, useEffect } from 'react';
interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

const AiBrowserAgentPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '') return;

    const newUserMessage: Message = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
    };

    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-browser-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: newUserMessage.text }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response from AI agent');
      }

      const data = await response.json();
      const botResponseText = data.response || 'No response from AI.';

      const newBotMessage: Message = {
        id: messages.length + 2,
        text: botResponseText,
        sender: 'bot',
      };

      setMessages((prevMessages) => [...prevMessages, newBotMessage]);

    } catch (error: any) {
      console.error('Error sending message to AI agent:', error);
      const errorMessage: Message = {
        id: messages.length + 2,
        text: `Error: ${error.message}`,
        sender: 'bot',
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex h-screen">
      {/* Left side: Chat section */}
      <div className="w-1/2 border-r border-gray-200 p-4 flex flex-col">
        <h2 className="text-xl font-semibold mb-4">AI Browser Agent Chat</h2>
        <div className="flex-grow overflow-y-auto mb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-2 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}
            >
              <span
                className={`inline-block p-2 rounded-lg ${message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
              >
                {message.text}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="flex">
          <input
            type="text"
            placeholder={isLoading ? 'Sending...' : 'Type your message...'}
            className="flex-grow border rounded-l p-2"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <button
            className={`bg-blue-500 text-white rounded-r px-4 py-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleSendMessage}
            disabled={isLoading}
          >
            Send
          </button>
        </div>
      </div>

      {/* Right side: Playwright browser preview (empty for now) */}
      <div className="w-1/2 p-4">
        <h2 className="text-xl font-semibold mb-4">Browser Preview</h2>
        {/* Playwright browser preview will go here */}
      </div>
    </div>
  );
};

export default AiBrowserAgentPage;
