'use client';
import { effectsList } from '@/types/effects';
import { EffectCard } from './EffectCard';
import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
          {/* Placeholder for the 'upload audio' card */}
          <div className="mb-4">
            {/* Your 'upload audio' card component would go here */}
            <Card>
 <CardContent className="p-4"><FileUploadArea onFileLoaded={props.onFileLoaded} isLoading={props.isLoading} /></CardContent>
            </Card>
          </div>

          {/* Anchor Navigation and Effects Cards */}
          {effectsList.map(effect => (
            <section id={effect.id} key={effect.id} className="mb-6">
              <h3 className="text-lg font-semibold mb-2">{effect.name}</h3>
              {/* Render the actual EffectCard for this effect */}
              <EffectCard
                effect={effect}
                currentSettings={props.effectSettings?.[effect.id] || {}}
                onApplyEffect={props.onApplyEffect}
                onParameterChange={props.onParameterChange}
                isLoading={props.isLoading}
                isAudioLoaded={props.isAudioLoaded}
                analysisResult={props.analysisResult}
                analysisSourceEffectId={props.analysisSourceEffectId}
              />
            </section>
          ))}

          {/* Chat Messages */}
          {messages.map((message) => (
            <div key={message.id} className={`mb-2 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
              <span className={`inline-block p-2 rounded-lg ${message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                {message.text}
              </span>
            </div>
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
