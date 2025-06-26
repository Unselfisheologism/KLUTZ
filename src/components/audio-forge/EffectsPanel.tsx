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

      // Check if the response and response.text are valid before processing
      if (response && response.text !== null && response.text !== undefined) {
        // Add the AI's response to the chat
        const botResponse: Message = {
          id: messages.length + 2,
          text: response.text,
          sender: 'bot',
        };
        setMessages(prevMessages => [...prevMessages, botResponse]);

        // Attempt to parse the response text for effect commands
        try {
          // Define a pattern to look for a JSON object within the AI's response.
          // The AI should be instructed to wrap effect commands in a specific JSON structure,
          // e.g., {"command": "apply_effect", "effectId": "reverb", "parameters": {"decay": 0.5}}
          const commandMatch = response.text.match(/\{"command":\s*"apply_effect",\s*"effectId":\s*"(.*?)"(?:,\s*"parameters":\s*(\{.*\}))?\}/s);

          if (commandMatch && commandMatch[1]) {
            const effectId = commandMatch[1];
            let parameters = {};
            if (commandMatch[2]) {
              try {
                parameters = JSON.parse(commandMatch[2]);
              } catch (jsonError) {
                console.error("Failed to parse effect parameters JSON:", jsonError);
                // Optionally add a message to the chat indicating a parsing error
                const errorBotResponse: Message = {
                  id: messages.length + 3,
                  text: "Could not parse effect parameters from the AI's response. Please check the format.",
                  sender: 'bot',
                };
                setMessages(prevMessages => [...prevMessages, errorBotResponse]);
                return; // Stop here if parameters are unparsable
              }
            }

            console.log(`Detected AI command to apply effect: ${effectId} with parameters:`, parameters);

            const effect = effectsList.find(e => e.id === effectId);
            if (effect && props.onApplyEffect) {
              props.onApplyEffect(effect, parameters);
              // Optionally add a confirmation message to the chat
              const errorBotResponse: Message = {
                id: messages.length + 3,
                text: `Applying effect '${effect.name}'...`,
                sender: 'bot',
              };
              setMessages(prevMessages => [...prevMessages, errorBotResponse]);
            } else if (!effect) {
               const notFoundBotResponse: Message = {
                  id: messages.length + 3,
                  text: `AI requested an unknown effect with ID '${effectId}'.`,
                  sender: 'bot',
                };
               setMessages(prevMessages => [...prevMessages, notFoundBotResponse]);
            }
          }
        } catch (parseError) {
          console.error("Error parsing AI response for effect command:", parseError);
          // Optionally add a message to the chat indicating a general parsing error
          const errorBotResponse: Message = {
            id: messages.length + 3,
            text: "An error occurred while trying to understand the AI's response for commands.",
            sender: 'bot',
          };
          setMessages(prevMessages => [...prevMessages, errorBotResponse]);
        }
      } else {
        // Handle cases where response or response.text is null or undefined
        console.error("Received invalid response from AI:", response);
        const errorBotResponse: Message = {
          id: messages.length + 2,
          text: "Received an empty or invalid response from the AI.",
          sender: 'bot',
        }
        setMessages(prevMessages => [...prevMessages, errorBotResponse]);
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
