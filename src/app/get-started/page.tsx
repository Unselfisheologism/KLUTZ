"use client";

import Head from 'next/head';
import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import Image from 'next/image';
import { ThemeToggle } from '@/components/theme-toggle'; // Import ThemeToggle
import LoginButton from '@/components/auth/login-button'; // Import LoginButton
import Sidebar from "@/components/layout/Sidebar";
import { preprocessImage } from '@/lib/image-utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Footer from '@/components/layout/footer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScanLine, Layers, ShieldCheck, Brain, ThermometerIcon, ArrowRight, Zap, Car, Ruler, Sparkles, Utensils, XIcon, FileText, Languages, Calculator, Calendar, Mail, Shield, Eye, Package, HelpCircle, Cookie, Github, FileSpreadsheet, BarChart, Speech, AudioWaveform, Wand, GlobeIcon, CheckIcon, MenuIcon, Trash2Icon, Edit2Icon, User, PanelLeft } from 'lucide-react'; // Import Edit2Icon
import { FaRegEnvelope, FaYoutube, FaXTwitter, FaLinkedin, FaMedium, FaDiscord } from 'react-icons/fa6';

declare global {
  interface Window {
    puter: any; // Replace 'any' with a more specific type if available
  }
}

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
  isImplemented: boolean;
}

const cleanJsonString = (rawString: string): string => {
  let cleanedString = rawString.trim();
  if (cleanedString.startsWith("```json") && cleanedString.endsWith("```")) {
    cleanedString = cleanedString.substring(7, cleanedString.length - 3).trim();
  } else if (cleanedString.startsWith("```") && cleanedString.endsWith("```")) {
    cleanedString = cleanedString.substring(3, cleanedString.length - 3).trim();
  }
  return cleanedString;
};

const features: Feature[] = [
  {
    icon: FileText,
    title: 'OPenatore',
    description: 'Extract and analyze all text content from images using AI-powered text recognition.',
    href: '',
    isImplemented: true,
  },
  {
    icon: FileText,
    title: 'Image to Text Converter',
    description: 'Extract and analyze all text content from images using AI-powered text recognition.',
    href: '/image-to-text',
    isImplemented: true,
  },
  {
    icon: Languages,
    title: 'AI Translator',
    description: 'Translate text from images or typed input with support for 60+ languages and cultural context.',
    href: '/ai-translator',
    isImplemented: true,
  },
  {
    icon: Calculator,
    title: 'AI Problem Solver',
    description: 'Get step-by-step solutions for math, science, and academic problems with detailed explanations.',
    href: '/ai-problem-solver',
    isImplemented: true,
  },
  {
    icon: Calendar,
    title: 'AI Date & Time Checker',
    description: 'Explore dates from any century or millennium and discover detailed historical and astronomical information.',
    href: '/ai-date-time-checker',
    isImplemented: true,
  },
  {
    icon: ScanLine,
    title: 'MediScan AI',
    description: 'Analyze medical images (X-rays, MRI, CT scans) using AI for insights.',
    href: '/mediscan',
    isImplemented: true,
  },
  {
    icon: Layers,
    title: 'Thumbnail Title Consistency Checker',
    description: 'Ensure your video thumbnails and titles are aligned for better engagement.',
    href: '/thumbnail-checker',
    isImplemented: true,
  },
  {
    icon: ShieldCheck,
    title: 'Content Ethnicity Certifier',
    description: 'Analyze content for ethical portrayal and representation related to ethnicity.',
    href: '/ethnicity-certifier',
    isImplemented: true,
  },
  {
    icon: Brain,
    title: 'Content Neurodiversity-Friendliness Checker',
    description: 'Assess content for neurodiversity inclusiveness and friendliness.',
    href: '/neurodiversity-checker',
    isImplemented: true,
  },
  {
    icon: ThermometerIcon,
    title: 'Content Heatmap Generator',
    description: 'Generate heatmaps to visualize user engagement on your content.',
    href: '/heatmap-generator',
    isImplemented: true,
  },
  {
    icon: Zap,
    title: 'Electronic Appliance Troubleshooter',
    description: 'AI-powered analysis of malfunctioning electronic devices for troubleshooting assistance.',
    href: '/appliance-troubleshooter',
    isImplemented: true,
  },
  {
    icon: Car,
    title: 'Vehicle Troubleshooter',
    description: 'AI-powered analysis of vehicle issues and malfunctions for diagnostic assistance.',
    href: '/vehicle-troubleshooter',
    isImplemented: true,
  },
  {
    icon: Ruler,
    title: 'AI Measuring Tool',
    description: 'Upload images of physical objects and get AI-powered measurements in your preferred metric system.',
    href: '/measuring-tool',
    isImplemented: true,
  },
  {
    icon: Sparkles,
    title: 'AI Text-to-Image Generator',
    description: 'Generate high-quality images from text descriptions using advanced AI technology.',
    href: '/text-to-image-generator',
    isImplemented: true,
  },
  {
    icon: Wand,
    title: 'AI Prompt Generator',
    description: 'Generate creative text prompts from images using AI analysis.',
    href: '/prompt-generator',
    isImplemented: true,
  },
  {
    icon: FileSpreadsheet,
    title: 'AI-Native Spreadsheets',
    description: 'Create and modify spreadsheets through natural language with an AI assistant that understands your data.',
    href: '/ai-spreadsheets',
    isImplemented: true,
  },
  {
    icon: BarChart,
    title: 'AI Native Infographics',
    description: 'Create data-driven infographics powered by AI for impactful visual storytelling.',
    href: '/ai-infographics',
    isImplemented: true,
  },
  {
    icon: AudioWaveform,
    title: 'AI Native Audio Editor',
    description: 'Edit and enhance audio files using AI-powered tools and natural language commands.',
    href: '/ai-audio-editor',
    isImplemented: true,
  },
  {
    icon: Speech,
    title: 'AI Text-to-Speech Generator',
    description: 'Convert text into natural-sounding speech using AI.',
    href: '/ai-text-to-speech',
    isImplemented: true,
  },
];


function ChatComponent({ messages, setMessages, currentChatId, setCurrentChatId, setChatSessions }: {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  currentChatId: string | null;
  setCurrentChatId: React.Dispatch<React.SetStateAction<string | null>>;
  setChatSessions: React.Dispatch<React.SetStateAction<ChatSession[]>>; // Added setChatSessions
}) {
  const [inputMessage, setInputMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isAiChatReady, setIsAiChatReady] = useState(false);
  const { toast } = useToast();
  const [selectedModel, setSelectedModel] = useState<string>('gpt-4o-mini'); // State for selected model
  const [showUrlInput, setShowUrlInput] = useState(false); // State to control visibility of URL input
  const [urlInput, setUrlInput] = useState('');
  const [fetchedUrlContent, setFetchedUrlContent] = useState<string | null>(null); // State to store fetched URL content
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);

  const availableModels: string[] = [ // Updated based on puter.com/docs
    'gpt-4o-mini',
    'gpt-4o',
    'o1',
    'o1-mini',
    'o1-pro',
    'o3',
    'o3-mini',
    'o4-mini',
    'gpt-4.1',
    'gpt-4.1-mini',
    'gpt-4.1-nano',
    'gpt-4.5-preview',
    'claude-sonnet-4',
    'claude-opus-4',
    'claude-3-7-sonnet',
    'claude-3-5-sonnet',
    'deepseek-chat', // Kept as is from your list
    'deepseek-reasoner', // Kept as is from your list
    // Updated Gemini model IDs based on your research
    'google/gemini-2.5-flash-preview',
    'google/gemini-2.5-flash-preview:thinking',
    'google/gemini-2.0-flash-lite-001',
    'google/gemini-2.0-flash-001',
    'google/gemini-pro-1.5', // This is likely what 'gemini-1.5-flash' mapped to
    'meta-llama/llama-4-maverick',
    'meta-llama/llama-4-scout',
    'meta-llama/llama-3.3-70b-instruct',
    'meta-llama/llama-3.2-3b-instruct',
    'meta-llama/llama-3.2-1b-instruct',
    'meta-llama/llama-3.1-8b-instruct',
    'meta-llama/llama-3.1-405b-instruct',
    'meta-llama/llama-3.1-70b-instruct',
    'meta-llama/llama-3-70b-instruct',
    'mistral-large-latest',
    'codestral-latest',
    // Adding other models from your research list if not already present or to use explicit names
    'google/gemma-2-27b-it',
    'grok-beta',
  ];

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
        // Add a message to the chat when the AI is ready ONLY if it's a new chat
         if (currentChatId === null) {
          setMessages(prevMessages => {
            // Avoid adding the "ready" message multiple times
            if (!prevMessages.some(msg => msg.text.includes("Your mind’s a powerful tool—what’s it working on?"))) {
              return [
                ...prevMessages,
                {
                  id: prevMessages.length + 1,
                  text: "Your mind’s a powerful tool—what’s it working on?",
                  sender: 'bot',
                },
              ];
            }
            return prevMessages;
          });
         }
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
  }, [messages, currentChatId]); // Added currentChatId to dependencies

  const handleImageFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      try {
        const previewDataUrl = URL.createObjectURL(file);
        setImageDataUrl(previewDataUrl);
      } catch (error) {
        toast({ variant: "destructive", title: "Preview Error", description: "Could not generate image preview." });
        setImageDataUrl(null);
      }
    } else {
      setImageFile(null);
      setImageDataUrl(null);
    }
  };

  const handleSendMessage = async (messageText: string) => {
    if (messageText.trim() === '' && !fetchedUrlContent && !imageFile) return;

    const newUserMessage: Message = {
      id: messages.length + 1,
      text: messageText,
      sender: 'user',
    };

    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setInputMessage('');
    // Clear the image states after sending
    setImageFile(null);
    setImageDataUrl(null);

    let chatSessionId = currentChatId;

    if (chatSessionId === null) {
      chatSessionId = `chat-${Date.now()}`; // Simple timestamp-based ID
      setCurrentChatId(chatSessionId);

      // Generate title for the new chat based on the first user message
      try {
        const titlePrompt = `Generate a concise title (4-6 words) for a chat session based on this user message: "${messageText}"`;
        const titleResponse = await window.puter.ai.chat(titlePrompt, { model: 'gpt-4o-mini' }); // Using a fast model for title generation
        const generatedTitle = titleResponse?.message?.content || titleResponse?.text || 'New Chat';
        // Save the initial session with the generated title
        await puter.kv.set(chatSessionId, JSON.stringify({ title: generatedTitle, messages: updatedMessages }));
        // No need to call fetchChatSessions here, it will be called by the effect in HomePage
      } catch (error) {
        console.error('Error generating chat title:', error);
        // Save with a default title if AI title generation fails
         await puter.kv.set(chatSessionId, JSON.stringify({ title: 'New Chat', messages: updatedMessages }));
      }

    }

    if (!isAiChatReady) {
      console.error('AI chat is not ready.');
      return; // Do not attempt to send if not ready
    }

    if (window.puter) {
      let isSignedIn = await window.puter.auth.isSignedIn();
      if (!isSignedIn) {
        await window.puter.auth.signIn();
        isSignedIn = await window.puter.auth.isSignedIn();
        if (!isSignedIn) {
          const botResponse: Message = {
            id: updatedMessages.length + 1,
            text: 'Authentication failed or was cancelled. Cannot process command.',
            sender: 'bot',
          };
          setMessages(prevMessages => [...prevMessages, botResponse]);
          return;
        }
      }

      // Add a temporary bot message to show streaming is in progress
      const streamingBotMessage: Message = {
        id: updatedMessages.length + 1,
        text: 'Recalling What Is Logic...', // Start with empty text
        sender: 'bot',
      };
      setMessages(prevMessages => [...prevMessages, streamingBotMessage]);

      let accumulatedText = '';
      const messageIdToUpdate = updatedMessages.length + 1; // The ID of the streaming bot message

      let finalMessage = messageText;
      // Include fetched URL content as context if available
      if (fetchedUrlContent) {
        finalMessage = `Context from URL: ${fetchedUrlContent}\n\nUser Query: ${messageText}`;
      }

      try {
        // Preprocess the image just before sending to the AI
        let imageToSend = null;
        if (imageFile) {
             imageToSend = await preprocessImage(imageFile, 1024); // Get the data URL
        }


        // Pass the image data as the second argument if available
        const streamResponse = await window.puter.ai.chat(finalMessage, imageToSend ? imageToSend : null, { model: selectedModel, stream: true });


        for await (const part of streamResponse) {
          let partText = '';
          if (part?.message?.content) {
            partText = part.message.content;
          } else if (part?.text) {
            partText = part.text;
          } else {
            console.warn('Unexpected streamed part structure:', part);
          }
          if (partText) {
            accumulatedText += partText;
            setMessages(prevMessages =>
              prevMessages.map(msg =>
                msg.id === messageIdToUpdate ? { ...msg, text: accumulatedText } : msg
              )
            );
          }
        }

         // After the first bot message is streamed and we are in a new chat, generate and save the title
         if (currentChatId === null && updatedMessages.length === 1 && updatedMessages[0].sender === 'user') {
             try {
               const titlePrompt = `Generate a concise title (4-6 words) for a chat session based on this user message: "${messageText}"`;
               const titleResponse = await window.puter.ai.chat(titlePrompt, { model: 'gpt-4o-mini' }); // Using a fast model for title generation
               const generatedTitle = titleResponse?.message?.content || titleResponse?.text || 'New Chat';

               // Fetch the latest messages including the AI's first response
               const latestMessages = messages.map(msg =>
                msg.id === messageIdToUpdate ? { ...msg, text: accumulatedText } : msg // Use accumulatedText for the bot message
               );
               const sessionToSave = { id: chatSessionId, title: generatedTitle, messages: [...updatedMessages, ...latestMessages.filter(msg => msg.sender === 'bot')] };

                // Update the session in KV with the new title
                await puter.kv.set(chatSessionId, JSON.stringify(sessionToSave));

                // Update the chatSessions state in HomePage to reflect the new title
                setChatSessions(prevSessions =>
                    prevSessions.map(session =>
                        session.id === chatSessionId ? { ...session, title: generatedTitle } : session
                    )
                );

             } catch (error) {
               console.error('Error generating and saving chat title:', error);
               // Even if title generation fails, save with a default title
                const latestMessages = messages.map(msg =>
                    msg.id === messageIdToUpdate ? { ...msg, text: accumulatedText } : msg // Use accumulatedText for the bot message
                );
                const sessionToSave = { id: chatSessionId, title: 'New Chat', messages: [...updatedMessages, ...latestMessages.filter(msg => msg.sender === 'bot')] };
               await puter.kv.set(chatSessionId, JSON.stringify(sessionToSave));
             }
         }

      } catch (error) {
        console.error(`Error during AI chat request for model "${selectedModel}":`, error);
        const botErrorResponse: Message = { id: messageIdToUpdate, text: `Error interacting with the AI model "${selectedModel}". Please try another model or try again later. Error details: ${error.message}`, sender: 'bot' };
        setMessages(prevMessages => [...prevMessages, botErrorResponse]);
        return;
      }
    }
  };


  // Function to handle sending the URL for fetching
  const handleSendUrl = async () => {
    if (urlInput.trim() === '') return;

    const userUrlMessage: Message = {
      id: messages.length + 1,
      text: `Visited URL: ${urlInput}`,
      sender: 'user',
    };
    // Add the URL message to the chat. We'll update its appearance later.
    setMessages(prevMessages => [...prevMessages, userUrlMessage]);
    setShowUrlInput(false); // Hide URL input after sending

    if (!isAiChatReady) {
      setUrlInput('');
      console.error('AI chat is not ready.');
      return;
    }

    if (window.puter) {
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

      // Add a temporary bot message to show processing
      const processingMessageId = messages.length + 2;
      const processingMessage: Message = {
        id: processingMessageId,
        text: `Fetching content from ${urlInput}...`,
        sender: 'bot',
      };
      setMessages(prevMessages => [...prevMessages, processingMessage]);

      try {
        const fetchedContent = await fetchUrlContent(urlInput);
        setFetchedUrlContent(fetchedContent); // Store fetched content
        setUrlInput(''); // Clear URL input after successful fetch

        // Update the processing message to indicate success (or remove it)
        setMessages(prevMessages => prevMessages.filter(msg => msg.id !== processingMessageId));


      } catch (error) {
        console.error(`Error fetching URL content: ${error}`);
        // Handle errors, e.g., display an error message to the user
        // Update the processing message to an error message
        const botErrorResponse: Message = {
          id: processingMessageId,
          text: `Error fetching content from ${urlInput}. Details: ${error.message}`,
          sender: 'bot',
        };
        setMessages(prevMessages => messages.map(msg =>
          msg.id === processingMessageId ? botErrorResponse : msg
        ));
      }
    }
  };

  // Function to fetch URL content using the API route
  const fetchUrlContent = async (url: string): Promise<string> => {
    try {
      const response = await fetch('/api/fetch-url-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();
       if (response.ok) {
            return data.content || `Could not fetch content from ${url}.`;
       } else {
            // Handle API errors (e.g., website not found, server error)
           throw new Error(data.error || `API error fetching content from ${url}`);
       }

    } catch (error: any) {
      // Handle network errors or other exceptions
      throw new Error(`Error fetching content from ${url}. Details: ${error.message}`);
    }
  };


  // Function to clear fetched URL content
  const clearUrlContext = () => {
    setFetchedUrlContent(null);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="flex-grow overflow-hidden p-4">
        <ScrollArea ref={scrollAreaRef} className="h-full pr-4">
          {messages.map(message => (
            <div key={message.id} className={`mb-2 ${message.sender === 'user' ? 'text-right' : 'text-left'} ${message.text.startsWith('Visited URL:') ? 'flex justify-center' : ''}`}>
              {message.text.startsWith('Visited URL:') ? (
                // Display URL in a green box for user messages
                <span className="inline-block p-2 rounded-lg bg-green-500 text-white">
                  {message.text}
                </span>
              ) : (
                <span className={`inline-block p-2 rounded-lg ${message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                  {message.text}
                </span>
              )}
            </div>
          ))}
           {/* Display "Thinking..." indicator */}
           {/* You would add logic here to show a typing indicator when the bot is generating a response */}
        </ScrollArea>
      </CardContent>
      <div className="p-4 border-t flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Don't Think—Ask!"
            value={inputMessage}
 onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && inputMessage.trim() !== '') {
                if (isAiChatReady && !showUrlInput) {
                  handleSendMessage(inputMessage);
                }
              }
            }}
 className="flex-grow border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0 shadow-none"
            disabled={!isAiChatReady}
          />
          {/* File input for image upload */}
          {/* Removed Button wrapper */}
          <label htmlFor="image-upload" className="cursor-pointer">
            {/* Added mr-2 for right margin to create spacing */}
            <div className="flex items-center justify-center mr-2"> {/* Added a wrapper div for centering and margin */}
              <input id="image-upload" type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" disabled={!isAiChatReady || showUrlInput} />
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-image h-5 w-5"> {/* Modified size classes to h-5 w-5 */}
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                <circle cx="9" cy="9" r="2"/>
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
              </svg> {/* Icon for image upload */}
            </div>
          </label>

          {/* Display image preview if available */}
          {imageDataUrl && (
              <div className="relative">
                <Image
                  src={imageDataUrl}
                  alt="Image preview"
                  width={100} // Adjust size as needed
                  height={100} // Adjust size as needed
                  objectFit="cover"
                  className="rounded"
                />
                
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-0 right-0 h-5 w-5 p-0 rounded-full"
                  onClick={() => {
                      setImageFile(null);
                      setImageDataUrl(null);
                  }}
                  aria-label="Remove image"
                >
                  <XIcon className="h-3 w-3" />
                </Button>
              </div>
            )}

            {/* URL Visit Icon - Removed Button wrapper */}
            {/* Added mr-2 for right margin to create spacing */}
            <GlobeIcon
 className={`h-5 w-5 cursor-pointer mr-2 ${!isAiChatReady || showUrlInput ? 'text-gray-500' : 'text-current'}`}
 onClick={() => setShowUrlInput(!showUrlInput)}
 />
            {/* Model Select */}
            {/* Added mr-2 for right margin to create spacing */}
            <Select onValueChange={setSelectedModel} defaultValue={selectedModel} disabled={!isAiChatReady}>
              <SelectTrigger className="w-[180px] border-none focus:ring-0 focus:ring-offset-0 shadow-none bg-transparent px-0 mr-2"> {/* Added mr-2 */}
                <SelectValue placeholder="Select Model" />
              </SelectTrigger>
              <SelectContent>
                {availableModels.map(model => (
                  <SelectItem key={model} value={model}>{model}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Send Icon - Removed Button wrapper */}
            {/* Added mr-2 for right margin to create spacing */}
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-send h-5 w-5 cursor-pointer mr-2 ${!isAiChatReady || inputMessage.trim() === '' || showUrlInput ? 'text-gray-500' : 'text-current'}`} onClick={() => handleSendMessage(inputMessage)}>
              <path d="m22 2-7 20-4-9-9-4 20-7Z"/><path d="M15 7l4 4"/>
            </svg>
             {/* Optional: Add a button to clear URL context */}
             {fetchedUrlContent &&
             <Button variant="destructive" onClick={clearUrlContext}>
              <XIcon className="h-5 w-5">Remove URL</XIcon>
            </Button>
          }
        </div>
        {/* Conditional URL Input */}
        {showUrlInput && (
          <div className="flex gap-2">
            <Input
              placeholder="https://example.com"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && urlInput.trim() !== '') {
                  if (isAiChatReady) {
                    handleSendUrl();
                  }
                }
              }}
              className="flex-grow"
              disabled={!isAiChatReady}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleSendUrl}
              disabled={!isAiChatReady || urlInput.trim() === ''}
            >
              <CheckIcon className="h-5 w-5" /> {/* Using CheckIcon for confirmation */}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}


export default function HomePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null); // State to track which session is being edited
  const [newSessionTitle, setNewSessionTitle] = useState(''); // State to hold the new title during editing
  const [openMobile, setOpenMobile] = useState(false); // State to manage mobile sidebar visibility

  // Function to toggle mobile sidebar
  const toggleMobileSidebar = () => {
    setOpenMobile(!openMobile);
  };


  // Function to fetch chat sessions from KV store
  const fetchChatSessions = async () => {
    try {
      const sessions = await puter.kv.list(true); // list all keys with returnValues = true
      const formattedSessions: ChatSession[] = sessions
        .filter((session: any) => session.key.startsWith('chat-')) // Filter for chat session keys
        .map((session: any) => {
          let parsedValue;
          try {
            parsedValue = JSON.parse(session.value);
          } catch (e) {
            console.error(`Error parsing session data for key ${session.key}:`, e);
            parsedValue = { title: 'Invalid Session Data', messages: [] }; // Provide a default
          }
          return {
            id: session.key,
            title: parsedValue.title || `Session ${session.key}`, // Use saved title or default
            messages: parsedValue.messages || [], // Use saved messages or empty array
          };
        });
      setChatSessions(formattedSessions);
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
    }
  };

  const handleImageFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      try {
        const previewDataUrl = URL.createObjectURL(file);
        setImageDataUrl(previewDataUrl);
      } catch (error) {
        toast({ variant: "destructive", title: "Preview Error", description: "Could not generate image preview." });
        setImageDataUrl(null);
      }
    } else {
      setImageFile(null);
      setImageDataUrl(null);
    }
  };

  // Function to save a chat session to KV store
  const saveChatSession = async (session: ChatSession) => {
    try {
      await puter.kv.set(session.id, JSON.stringify({ title: session.title, messages: session.messages }));
      fetchChatSessions(); // Refresh the sidebar after saving
    } catch (error) {
      console.error('Error saving chat session:', error);
    }
  };

  // Function to load a specific chat session
  const loadChatSession = async (sessionId: string) => {
    try {
      const sessionData = await puter.kv.get(sessionId);
      if (sessionData) {
        const session: ChatSession = JSON.parse(sessionData as string); // Assuming sessionData is a JSON string
        setCurrentChatId(sessionId);
        setMessages(session.messages);
      }
    } catch (error) {
      console.error('Error loading chat session:', error);
    }
  };

  // Function to delete a specific chat session
  const deleteChatSession = async (sessionId: string) => {
    try {
      await puter.kv.del(sessionId);
      fetchChatSessions(); // Refresh the sidebar after deleting
      // If the deleted session was the currently active one, start a new chat
      if (currentChatId === sessionId) {
        startNewChat();
      }
    } catch (error) {
      console.error('Error deleting chat session:', error);
    }
  };

  // Function to handle renaming a chat session
  const renameChatSession = async (sessionId: string, newTitle: string) => {
    if (newTitle.trim() === '') {
      // Optionally handle empty titles, maybe revert to a default or show an error
      console.warn('Attempted to rename with an empty title.');
      return;
    }
    try {
      // Fetch the existing session data to preserve messages
      const sessionData = await puter.kv.get(sessionId);
      if (sessionData) {
        const session: ChatSession = JSON.parse(sessionData as string);
        session.title = newTitle; // Update the title
        await puter.kv.set(sessionId, JSON.stringify(session)); // Save the updated session
        fetchChatSessions(); // Refresh the sidebar
        setEditingSessionId(null); // Exit editing mode
        setNewSessionTitle(''); // Clear the input field
      }
    } catch (error) {
      console.error('Error renaming chat session:', error);
    }
  };

  // Check if the title is still the default AI greeting
  const currentSessionTitle = chatSessions.find(session => session.id === currentChatId)?.title;
  if (currentSessionTitle === "Your mind’s a powerful tool—what’s it working on?") {
    // Don't update the title here if it's the default
    const currentSession: ChatSession = {
       id: currentChatId,
       title: currentSessionTitle, // Keep the existing title
       messages: messages,
     };
    saveChatSession(currentSession);
  } else {
    // If a custom title exists (generated by AI or manually), save with that title
    const currentSession: ChatSession = {
       id: currentChatId,
       title: currentSessionTitle || 'New Chat', // Use existing title or default
       messages: messages,
     };
    saveChatSession(currentSession);
  }


  // Function to start a new chat session
  const startNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
  };

  // Handle starting edit mode
  const startEditing = (session: ChatSession) => {
    setEditingSessionId(session.id);
    setNewSessionTitle(session.title);
  };

  // Handle cancelling edit mode
  const cancelEditing = () => {
    setEditingSessionId(null);
    setNewSessionTitle('');
  };

  // Function to close mobile sidebar
  const closeMobileSidebar = () => {
    setOpenMobile(false);
  };

  // Handle saving the new title
  const handleTitleSave = (sessionId: string) => {
    renameChatSession(sessionId, newSessionTitle);
  };


  useEffect(() => {
    // Fetch chat sessions when the component mounts
    fetchChatSessions();

  }, []); // Empty dependency array ensures this runs only once

  // Effect to save the current chat session whenever messages change, but only if currentChatId is set
  useEffect(() => {
    if (currentChatId && messages.length > 0) {
       // Find the current session to get its latest title from the state
       const currentSessionInState = chatSessions.find(session => session.id === currentChatId);

       // Only save if the session is found and has a title that is not the default "New Chat"
       // OR if it's a brand new chat with the first message already sent (title is being generated)
       if (currentSessionInState && (currentSessionInState.title !== 'New Chat' || messages.length > 1 || (messages.length === 1 && messages[0].sender === 'bot' && !messages[0].text.includes("Your mind’s a powerful tool—what’s it working on?")))) {
           const currentSession: ChatSession = {
             id: currentChatId,
             title: currentSessionInState.title, // Use the title from the current state
             messages: messages,
           };
           saveChatSession(currentSession);
       } else if (currentChatId && messages.length > 0 && messages[0].sender === 'user' && messages.length === 1) {
           // This case handles the initial save for a new chat while the title is being generated in ChatComponent
           // We don't need to save the title here, ChatComponent handles the initial save with the generated title.
           // We just need to ensure subsequent messages in this new chat are saved.
           const currentSession: ChatSession = {
             id: currentChatId,
             title: 'New Chat', // Use default title for the initial save
             messages: messages,
           };
           saveChatSession(currentSession);
       }
    }
  }, [messages, currentChatId, chatSessions]); // Added chatSessions to dependencies


  return (
    <>
      <Head>
        <link rel="canonical" href="https://klutz.netlify.app/" />
        <meta name="google-site-verification" content="FVYY2_q5JUQa1Oqg8XGj4v2wqB4F1BcREDn_ZVlwNCA" />
      </Head>
      <div className="min-h-screen flex flex-col">
        {/* Scrim for mobile */}
        {openMobile && <div className="md:hidden fixed inset-0 bg-black opacity-50 z-30" onClick={closeMobileSidebar}></div>}

        <div className="flex flex-grow"> {/* Use flex to arrange sidebar and main content */}
          {/* Desktop Header Elements - Positioned at the top-right */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
              <MenuIcon className="h-5 w-5" />
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
            <ThemeToggle />
            <Button variant="ghost" size="icon" asChild>
              <Link href="https://puter.com">
                <User className="h-5 w-5" />
                <span className="sr-only">Account</span>
              </Link>
            </Button>
            <LoginButton />
          </div>
          {isSidebarOpen && <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />}

          {/* Sidebar */}
          <div // Adjusted sidebar height to end before the footer (assuming footer height is around 64px or h-16)
            // Adjusted sidebar height to end before the footer (assuming footer height is around 64px or h-16) and added mobile/desktop classes
            className={`fixed top-0 left-0 w-64 h-[calc(100vh-4rem)] bg-gray-800 text-white overflow-y-auto transition-transform transform md:relative md:translate-x-0 pt-16 md:pt-4 ${
              openMobile ? 'translate-x-0' : '-translate-x-full' // Use openMobile state for mobile transform
            } z-40 rounded-bl-xl`} // Added fixed positioning, z-index for mobile, and rounded bottom left corner
          >
            <div className="p-4">
              <h2 className="text-xl font-bold mb-4">Chat History</h2>
              {/* New Chat Button - Added mb-6 for more spacing */}
              <Button onClick={startNewChat} className="w-full mb-6">New Chat</Button>
              <ul>
                {chatSessions.map((session) => (
                  <li key={session.id} className="mb-2 flex justify-between items-center">
                    {editingSessionId === session.id ? (
                      // Editing mode: show input field and save/cancel buttons
                      <div className="flex items-center w-full">
                        <Input
                          value={newSessionTitle}
                          onChange={(e) => setNewSessionTitle(e.target.value)}
                          onKeyPress={(e) => handleEditKeyPress(e, session.id)}
                          className="flex-grow mr-2 text-blue-400 bg-gray-700 border-gray-600"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-green-500 hover:text-green-700 h-6 w-6 p-0 mr-1"
                          onClick={() => handleTitleSave(session.id)}
                          aria-label={`Save new title for ${session.title}`}
                        >
                          <CheckIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                          onClick={cancelEditing}
                          aria-label="Cancel renaming"
                        >
                          <XIcon className="h-4 w-4" /> {/* Using XIcon for cancel */}
                        </Button>
                      </div>
                    ) : (
                      // Reading mode: show title, edit button, and delete button
                      <>
                        <button
                          className="text-blue-400 hover:underline text-left flex-grow mr-2"
                          onClick={() => loadChatSession(session.id)}
                        >
                          {session.title}
                        </button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-400 hover:text-gray-100 h-6 w-6 p-0 mr-1" // Styled edit button
                          onClick={() => startEditing(session)}
                          aria-label={`Rename chat session: ${session.title}`}
                        >
                          <Edit2Icon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                          onClick={() => deleteChatSession(session.id)}
                          aria-label={`Delete chat session: ${session.title}`}
                        >
                          <Trash2Icon className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Main Content */}
          <main className="flex-grow flex flex-col"> {/* Main content area */}
            <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pt-24 md:pt-12 flex-grow pb-32">
              {/* Mobile menu button - Fixed at top-left, below header */}
              <div className="md:hidden fixed top-4 left-4 z-50"> {/* Adjusted positioning to top-4 */}
                {/* Mobile menu icon - Positioned absolutely within this container for mobile */}
                <Button variant="outline" size="icon" onClick={toggleMobileSidebar} aria-label="Toggle Menu">
                  <PanelLeft className="h-6 w-6" />
                </Button>
                  
                
              </div>
              <div className="mb-8">
                {/* Pass down state and functions to ChatComponent */}
                <ChatComponent
                  messages={messages}
                  setMessages={setMessages}
                  currentChatId={currentChatId}
                  setCurrentChatId={setCurrentChatId}
                />
              </div>
              {/* Tools Section */}
              <section className="mt-12">
                <nav className="text-3xl md:text-4xl font-bold text-center text-primary mb-8 hidden md:flex items-center gap-6 mx-auto">
                  <Link href="/testimonials" className="text-sm font-medium hover:underline">Testimonials</Link>
                </nav>
                <div className="flex flex-col items-center space-y-4">
                  {/* Row 1: 8 buttons */}
                  <div className="flex flex-wrap justify-center gap-4 max-w-4xl">
                    {features.slice(0, 8).map((feature) => (
                      <Link key={feature.title} href={feature.href} passHref>
                        <Button variant="outline" className="flex items-center gap-2 p-4 h-auto rounded-lg shadow-sm hover:bg-muted transition-colors">
                          <feature.icon className="h-5 w-5 text-primary" />
                          <span className="text-sm font-medium">{feature.title}</span>
                        </Button>
                      </Link>
                    ))}
                  </div>
                  {/* Row 2: 6 buttons */}
                  <div className="flex flex-wrap justify-center gap-4 max-w-4xl">
                    {features.slice(8, 14).map((feature) => (
                      <Link key={feature.title} href={feature.href} passHref>
                        <Button variant="outline" className="flex items-center gap-2 p-4 h-auto rounded-lg shadow-sm hover:bg-muted transition-colors">
                          <feature.icon className="h-5 w-5 text-primary" />
                          <span className="text-sm font-medium">{feature.title}</span>
                        </Button>
                      </Link>
                    ))}
                  </div>
                  {/* Row 3: 4 buttons */}
                  <div className="flex flex-wrap justify-center gap-4 max-w-4xl">
                    {features.slice(14, features.length).map((feature) => (
                      <Link key={feature.title} href={feature.href} passHref>
                      <Button variant="outline" className="flex items-center gap-2 p-4 h-auto rounded-lg shadow-sm hover:bg-muted transition-colors">
                        <feature.icon className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium">{feature.title}</span>
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>

      <Footer />
    </div>
   </> 
  );
}