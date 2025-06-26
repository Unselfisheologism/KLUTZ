'use client';
import { effectsList } from '@/types/effects';
import { EffectCard } from './EffectCard';
import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileUploadArea } from './FileUploadArea';

declare global {
  interface Window {
    puter: any; // Replace 'any' with a more specific type if available
  }
}

// Type for a single message
interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

// You may need to adjust these props to match your actual handlers and state
export function EffectsPanel(props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to the bottom of the chat when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '') return;

    const newUserMessage: Message = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
    };

    setMessages([...messages, newUserMessage]);
    setInputMessage('');

    // Process the user message with puter.js
    if (window.puter) {
      const response = await window.puter.ai.chat.send(inputMessage, {
        tools: [
          // Define tools for audio editing commands
          // Example: A tool to apply a specific effect
          {
            name: 'apply_effect',
            description: 'Applies an audio effect to the current audio.',
            parameters: {
              type: 'object',
              properties: {
                effectId: {
                  type: 'string',
                  description: 'The ID of the effect to apply (e.g., "eq", "reverb").',
                },
                parameters: {
                  type: 'object',
                  description: 'Optional parameters for the effect (e.g., { gain: 10, frequency: 200 }).',
                },
              },
              required: ['effectId'],
            },
            handler: async ({ effectId, parameters }) => {
              console.log(`Applying effect: ${effectId} with parameters:`, parameters);
              // Trigger the actual audio processing logic
              // This would involve calling props.onApplyEffect with the correct parameters
              // For now, just return a success message
              if (props.onApplyEffect) {
                const effect = effectsList.find(e => e.id === effectId);
                if (effect) {
                  props.onApplyEffect(effect, parameters || {});
                  return `Effect '${effect.name}' applied.`;
                } else {
                  return `Effect with ID '${effectId}' not found.`;
                }
              }
              return 'Audio processing not available.';
            },
          },
          // Add more tools for other audio editing actions (e.g., analyze, export)
        ],
      });

      const botResponse: Message = {
        id: messages.length + 2,
        text: response.text,
        sender: 'bot',
      };
      setMessages(prevMessages => [...prevMessages, botResponse]);
    } else {
      const botResponse: Message = {
        id: messages.length + 2,
        text: 'puter.js not loaded. Cannot process command.',
        sender: 'bot',
      };
      setMessages(prevMessages => [...prevMessages, botResponse]);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="flex-grow overflow-hidden p-4">
        <ScrollArea ref={scrollAreaRef} className="h-full pr-4">
          {/* Anchor Navigation and Effects Cards */}
          {/* Content above the chat input */}
          <div>
            {/* File Upload */}
            <div className="mb-4">
              <FileUploadArea
                onFileSelect={props.onFileSelect}
                isLoading={props.isLoading}
              />
            </div>

            {/* Anchor Navigation */}
            <nav className="mb-6">
              <ul className="flex flex-wrap gap-2">
                {effectsList.map(effect => (
                  <li key={effect.id}>
                    <a href={`#${effect.id}`} className="underline text-blue-600">{effect.name}</a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Scrollable container for effects with glow */}
            <div className="relative overflow-hidden">
              <ScrollArea className="h-[300px] pb-4" /* Adjust height as needed */>
                <div className="grid gap-6 pr-4"> {/* Added padding to avoid scrollbar overlapping content */}
                  {effectsList.map(effect => (
                    <section id={effect.id} key={effect.id}>
                      <EffectCard
                        effect={effect}
                        currentSettings={props.effectSettings?.[effect.id] || {}} // Defensive fallback
                        onApplyEffect={props.onApplyEffect}
                        onParameterChange={props.onParameterChange}
                        isLoading={props.isLoading}
                        isAudioLoaded={props.isAudioLoaded}
                        analysisResult={props.analysisResult}
                        analysisSourceEffectId={props.analysisSourceEffectId}
                      />
                    </section>
                  ))}
                </div>
              </ScrollArea>
              {/* Glow effects - adjust styling as needed */}
              <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-background to-transparent pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent pointer-events-none"></div>
            </div>
          </div>

          {/* Chat messages */}
          {messages.map(message => (
            <div key={message.id} className={`mb-2 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
              <span className={`inline-block p-2 rounded-lg ${message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                {message.text}
              </span>
          ))}
        </ScrollArea>
      </CardContent>
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="Type your command..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
            className="flex-grow"
          />
          <Button onClick={handleSendMessage}>Send</Button>
        </div>
      </div>
    </Card>
  );
}
