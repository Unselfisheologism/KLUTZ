'use client';
import { effectsList } from '@/types/effects';
import { EffectCard } from './EffectCard';
import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from "@/hooks/use-toast";
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
  const [isAiChatReady, setIsAiChatReady] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Scroll to the bottom of the chat when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    const maxAttempts = 100; // Try for about 20 seconds (100 * 200ms) -> Increased to 500ms interval, so 50 seconds total
    let attempts = 0;
    const intervalDuration = 500; // Increased interval duration

    const checkPuterReadiness = () => {
      attempts++;
      if (typeof window.puter?.ai?.chat === 'function') {
        setIsAiChatReady(true);
        // Add a message to the chat when the AI is ready
        setMessages(prevMessages => {
          // Avoid adding the "ready" message multiple times
          if (!prevMessages.some(msg => msg.text.includes("AI audio assistant is ready"))) {
            return [
              ...prevMessages,
              {
                id: prevMessages.length + 1,
                text: "AI audio assistant is ready. How can I help you edit your audio?",
                sender: 'bot',
              },
            ];
          }
          return prevMessages;
        });
        if (intervalId) clearInterval(intervalId);
      } else {
        console.warn('Puter.js SDK or AI chat functionality not yet loaded.');
        console.log(`Attempt ${attempts}:`);
        console.log('window.puter:', window.puter);
        console.log('window.puter.ai:', window.puter?.ai);
        console.log('window.puter.ai.chat:', window.puter?.ai?.chat);

        if (attempts >= maxAttempts && intervalId) {
          clearInterval(intervalId);
          console.error('Max attempts reached. Puter.js AI chat functionality not loaded.');
          toast({
            variant: "destructive",
            title: "AI Chat Error",
            description: "AI chat functionality could not be loaded. Please try refreshing.",
          });
        }
      }
    };

    // Start polling
    intervalId = setInterval(checkPuterReadiness, intervalDuration); // Check every 500ms

    // Clear interval on component unmount
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
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


    if (!isAiChatReady) {
       console.error('AI chat is not ready.');
       return; // Do not attempt to send if not ready
    }
    if (window.puter) {
      // Ensure user is signed in before making the AI chat call
      let isSignedIn = await window.puter.auth.isSignedIn();
      if (!isSignedIn) {
        await window.puter.auth.signIn();
        isSignedIn = await window.puter.auth.isSignedIn();
        if (!isSignedIn) {
          const botResponse: Message = {
            id: messages.length + 2,
            text: 'Authentication failed or was cancelled. Cannot process command.',
            sender: 'bot',
          };
          setMessages(prevMessages => [...prevMessages, botResponse]);
          return;
        }
      }

      // Call the AI chat without the tools array
      const response = await window.puter.ai.chat(inputMessage, {
        // You can add other options here if needed, like 'model'
      });

      // Get AI response text, prioritizing response.message.content
      const aiResponseText = response?.message?.content || response?.text;

      // Check if the response and response.text are valid before processing
      if (!aiResponseText) {
        console.error('Received empty or invalid text response from AI:', response);
        // Add the AI's response to the chat
        const botResponse: Message = {
          id: messages.length + 2,
          text: response.text,
          sender: 'bot',
        };
        setMessages(prevMessages => [...prevMessages, botResponse]);
        return;
      }
        // Attempt to parse the response text for effect commands
        let effectCommand = null;
        try {
          effectCommand = JSON.parse(aiResponseText);
          // Check if the parsed object has the expected properties for an effect command
          if (effectCommand && typeof effectCommand === 'object' && effectCommand.effectId && effectCommand.parameters) {
            console.log('Detected effect command:', effectCommand);
            // Call the onApplyEffect prop
            if (props.onApplyEffect) {
              const effect = effectsList.find(e => e.id === effectCommand.effectId);
              if (effect) {
                props.onApplyEffect(effect, effectCommand.parameters);
                // Optionally add a confirmation message to the chat
                const confirmationMessage: Message = {
                  id: messages.length + 2,
                  text: `Applied effect: ${effect.name}`,
                  sender: 'bot',
                };
                setMessages(prevMessages => [...prevMessages, confirmationMessage]);
              } else {
                console.error(`Effect with ID '${effectCommand.effectId}' not found.`);
                const errorMessage: Message = {
                  id: messages.length + 2,
                  text: `Could not apply effect: Effect with ID '${effectCommand.effectId}' not found.`,
                  sender: 'bot',
                };
                setMessages(prevMessages => [...prevMessages, errorMessage]);
              }
            } else {
              console.warn('onApplyEffect prop is not available to apply effect.');
              // Add a message indicating inability to apply effect
               const errorMessage: Message = {
                  id: messages.length + 2,
                  text: 'AI suggested an effect, but audio processing is not available.',
                  sender: 'bot',
                };
                setMessages(prevMessages => [...prevMessages, errorMessage]);
            }
             // If an effect command was processed, we might not want to add the raw JSON to chat
             // return; // Uncomment this line if you don't want the raw JSON in the chat
          } else {
               // If it's not a valid effect command JSON, treat it as a regular text response
                const botResponse: Message = {
                  id: messages.length + 2,
                  text: aiResponseText,
                  sender: 'bot',
                };
                setMessages(prevMessages => [...prevMessages, botResponse]);
          }
        } catch (error) {
          console.error('Error parsing AI response for effect command:', error);
          // If JSON parsing fails, treat the response as a regular text response
          const botResponse: Message = {
            id: messages.length + 2,
            text: aiResponseText,
            sender: 'bot',
          };
          setMessages(prevMessages => [...prevMessages, botResponse]);
        }

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
    <>
      <Card className="h-full flex flex-col">
        <CardContent className="flex-grow overflow-hidden p-4">
          <ScrollArea ref={scrollAreaRef} className="h-full pr-4">
            {/* Anchor Navigation and Effects Cards */}
            {/* Content above the chat input */}
            <div>
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
                  if (isAiChatReady) {
                    handleSendMessage();
                  }
                }
              }
              }
              className="flex-grow"
              disabled={!isAiChatReady} // Disable input if AI is not ready
            />
            <Button onClick={handleSendMessage} disabled={!isAiChatReady || inputMessage.trim() === ''}>Send</Button> {/* Disable button if AI is not ready or input is empty */}
          </div>
        </div>
      </Card>
    </>
  );
}
