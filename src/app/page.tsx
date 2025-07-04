'use client';

import Head from 'next/head';
import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScanLine, Layers, ShieldCheck, Brain, ThermometerIcon, ArrowRight, Zap, Car, Ruler, Sparkles, Utensils, FileText, Languages, Calculator, Calendar, Mail, Shield, Eye, Package, HelpCircle, Cookie, Github, FileSpreadsheet, BarChart, Speech, AudioWaveform, Wand, GlobeIcon, CheckIcon } from 'lucide-react';
import { FaRegEnvelope, FaYoutube, FaXTwitter, FaLinkedin, FaMedium, FaDiscord } from 'react-icons/fa6';
import { useIsMobile } from "@/hooks/use-mobile";
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

const features: Feature[] = [
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
    icon: Utensils,
    title: 'AI Ingredients Checker',
    description: 'Analyze food ingredients for safety, dietary considerations, and potential concerns.',
    href: '/ingredients-checker',
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


function ChatComponent({ messages, setMessages, currentChatId, setCurrentChatId }: {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  currentChatId: string | null;
  setCurrentChatId: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const [inputMessage, setInputMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isAiChatReady, setIsAiChatReady] = useState(false);
  const { toast } = useToast();
  const [selectedModel, setSelectedModel] = useState<string>('gpt-4o-mini'); // State for selected model
  const [showUrlInput, setShowUrlInput] = useState(false); // State to control visibility of URL input
  const [urlInput, setUrlInput] = useState('');
  const [fetchedUrlContent, setFetchedUrlContent] = useState<string | null>(null); // State to store fetched URL content

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


  const handleSendMessage = async (messageText: string) => {
    if (messageText.trim() === '' && !fetchedUrlContent) return;

    const newUserMessage: Message = {
      id: messages.length + 1,
      text: messageText,
      sender: 'user',
    };

    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setInputMessage('');

    let chatSessionId = currentChatId;
    // If it's a new chat, generate a new ID and set it
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
        text: 'Brainstorming...', // Start with empty text
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
        const streamResponse = await window.puter.ai.chat(finalMessage, { model: selectedModel, stream: true });

        for await (const part of streamResponse) {
          let partText = '';
          if (part?.message?.content) {
            partText = part.message.content;
          } else if (part?.text) {
            partText = part.text;
          } else {
            // Log the structure of 'part' if text is not found in the usual places
            console.warn('Unexpected streamed part structure:', part);
          }
          if (partText) {
            accumulatedText += partText;
            // Update the last message in the chat with the streamed text
            setMessages(prevMessages =>
              prevMessages.map(msg =>
                msg.id === messageIdToUpdate ? { ...msg, text: accumulatedText } : msg
              )
            );
          }
        }
      } catch (error) {
        console.error(`Error during AI chat request for model "${selectedModel}":`, error);
        // If an error occurs, update the last message to an error message
        const botErrorResponse: Message = { id: messageIdToUpdate, text: `Error interacting with the AI model "${selectedModel}". Please try another model or try again later. Error details: ${error.message}`, sender: 'bot' };
        setMessages(prevMessages => [...prevMessages, botErrorResponse]);
        return; // Stop processing if the API call failed
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
        setMessages(prevMessages => prevMessages.map(msg =>
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
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            placeholder="Type your command..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && inputMessage.trim() !== '') {
                if (isAiChatReady && !showUrlInput) {
                  handleSendMessage(inputMessage);
                }
              }
            }}
            className="flex-grow"
            disabled={!isAiChatReady}
          />
          {/* URL Visit Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowUrlInput(!showUrlInput)}
            disabled={!isAiChatReady || showUrlInput} // Disable if already showing URL input
          >
            <GlobeIcon className="h-5 w-5" /> {/* Using GlobeIcon for URL visit */}
          </Button>
          <Select onValueChange={setSelectedModel} defaultValue={selectedModel}>
            <SelectTrigger className="w-[180px]" disabled={!isAiChatReady}>
              <SelectValue placeholder="Select Model" />
            </SelectTrigger>
            <SelectContent>
              {availableModels.map(model => (
                <SelectItem key={model} value={model}>{model}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={() => handleSendMessage(inputMessage)} disabled={!isAiChatReady || inputMessage.trim() === '' || showUrlInput}>
            Send
          </Button>
          {/* Optional: Add a button to clear URL context */}
          {fetchedUrlContent && <Button variant="destructive" onClick={clearUrlContext}>Clear URL Context</Button>}
        </div>
        {/* Conditional URL Input */}
        {showUrlInput && (
          <div className="flex gap-2">
            <Input
              placeholder="Paste URL"
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const isMobile = useIsMobile();

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

  // Function to start a new chat session
  const startNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
  };

  useEffect(() => {
    // Fetch chat sessions when the component mounts
    fetchChatSessions();

    // Automatically open sidebar when the app opens
    setIsSidebarOpen(true);
  }, []); // Empty dependency array ensures this runs only once

  // Effect to save the current chat session whenever messages change, but only if currentChatId is set
  useEffect(() => {
    if (currentChatId && messages.length > 0) {
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
    }
  }, [messages, currentChatId, chatSessions]); // Added chatSessions to dependencies

  if (isMobile) {
    return (
      <>
        <Head>
          <link rel="canonical" href="https://klutz.netlify.app/" />
          <meta name="google-site-verification" content="FVYY2_q5JUQa1Oqg8XGj4v2wqB4F1BcREDn_ZVlwNCA" />
        </Head>
        <div className="min-h-screen flex flex-col">
          {/* Header (using the existing AppHeader) */}
          {/* Note: AppHeader is rendered in layout.tsx, so it will appear above this content */}

          {/* Mobile Main Content - Centered */}
          <main className="flex-grow flex flex-col p-4">
            {/* Greeting Area */}
            <div className="flex flex-col items-center justify-center text-center my-8">
              <h1 className="text-2xl font-semibold text-foreground">
                Good Day, {window.puter?.auth?.getUser()?.name}
              </h1>
            </div>

            {/* Chat Component */}
            <div className="mb-8 flex-grow"> {/* flex-grow to make chat take available space */}
               <ChatComponent
                messages={messages}
                setMessages={setMessages}
                currentChatId={currentChatId}
                setCurrentChatId={setCurrentChatId}
              />
            </div>

            {/* Scrollable Tools Section (Vertical) */}
            <section className="mt-4">
              <h2 className="text-xl font-bold mb-4">Tools</h2>
               <ScrollArea
                className="h-[200px] w-full rounded-md p-4 relative" // Added relative for positioning gradients
                style={{
                  // Added gradient mask styles
                  maskImage: 'linear-gradient(to bottom, transparent, black 20px, black calc(100% - 20px), transparent)',
                  WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 20px, black calc(100% - 20px), transparent)',
                  border: '1px solid rgba(255, 255, 255, 0.05)', // More subtle border
                }}
              > {/* Adjust height as needed */}
                 {/* Optional: Add pseudo-elements for gradients if mask-image is not fully supported */}
                 <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-black to-transparent pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black to-transparent pointer-events-none"></div>

                {/* Content Wrapper with Padding for Gradient */}
                <div className="pb-8 pt-2"> {/* Added padding to ensure content is not hidden by gradients */}
                <div className="flex flex-col space-y-2"> {/* Stack buttons vertically */}
                  {features.map((feature) => (
                    <Link key={feature.title} href={feature.href} passHref>
                      <Button variant="outline" className="flex items-center gap-2 p-4 h-auto rounded-lg shadow-sm hover:bg-muted transition-colors w-full justify-start">
                        <feature.icon className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium">{feature.title}</span>
                      </Button>
                    </Link>
                  ))}
                </div>
                </div>
              </ScrollArea>
            </section>
          </main>

          {/* Footer */}
          {/* Note: Footer is rendered below this main content */}
           <footer className="bg-muted/30 border-t mt-8"> {/* Adjusted margin top */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8"> {/* Adjusted padding */}
              {/* Footer content goes here (can be simplified for mobile if desired) */}
              {/* For now, keeping the existing footer structure but it will be below the scrollable tools */}
              <div className="flex flex-col items-center space-y-4 text-center">
                  {/* Social Icons (simplified or kept as is) */}
                   <div className="flex justify-center gap-4"> {/* Reduced gap */}
                    <a href="https://github.com/Unselfisheologism/KLUTZ" target="_blank" rel="noopener noreferrer" title="GitHub (opens in a new window)"><Github className="text-gray-600 hover:text-gray-900 transition" size={24} aria-label="GitHub" /></a> {/* Reduced size */}
                    <a href="https://x.com/Jeff9James" target="_blank" rel="noopener noreferrer" title="X (opens in a new window)"><FaXTwitter className="text-gray-600 hover:text-black transition" size={24} aria-label="X" /></a> {/* Reduced size */}
                    <a href="https://medium.com/@jeffrinjames99" target="_blank" rel="noopener noreferrer" title="Medium (opens in a new window)"><FaMedium className="text-gray-600 hover:text-green-700 transition" size={24} aria-label="Medium" /></a> {/* Reduced size */}
                    <a href="https://discordapp.com/users/1293939031620456492" target="_blank" rel="noopener noreferrer" title="Discord (opens in a new window)"><FaDiscord className="text-gray-600 hover:text-indigo-600 transition" size={24} aria-label="Discord" /></a> {/* Reduced size */}
                  </div>
                <div className="text-sm text-muted-foreground">© 2025 KLUTZ. All rights reserved.</div>
              </div>
            </div>
          </footer>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <link rel="canonical" href="https://klutz.netlify.app/" />
        <meta name="google-site-verification" content="FVYY2_q5JUQa1Oqg8XGj4v2wqB4F1BcREDn_ZVlwNCA" />
      </Head>
      <div className="min-h-screen flex flex-col">
        <div className="flex flex-grow"> {/* Use flex to arrange sidebar and main content */}
          {/* Sidebar */}
          <div
            className={`flex-none w-64 bg-gray-800 text-white overflow-y-auto transition-transform transform ${
              isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="p-4">
              <h2 className="text-xl font-bold mb-4">Chat History</h2>
              {/* New Chat Button */}
              <Button onClick={startNewChat} className="w-full mb-4">New Chat</Button>
              <ul>
                {chatSessions.map((session) => (
                  <li key={session.id} className="mb-2">
                    <button
                      className="text-blue-400 hover:underline text-left w-full"
                      onClick={() => loadChatSession(session.id)}
                    >
                      {session.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Main Content */}
          <main className="flex-grow flex flex-col"> {/* Main content area */}
            <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 flex-grow">
              <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-8">
                  <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-4">
                    AI—Overpowered, but Underrated
                  </h1>
                  <div className="flex flex-col items-center">
                    <span className="text-sm font-medium mb-1">Made in</span>
                    <a
                      href="https://bolt.new"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Made in Bolt.new (opens in a new window)"
                      className="badge-wrapper-120x40"
                    >
                      {/* Light mode badge */}
                      <Image
                        src="https://res.cloudinary.com/ddz3nsnq1/image/upload/v1749185392/images-removebg-preview_j17by7.png"
                        alt="Made in Bolt.new (light mode)"
                        width={120}
                        height={40}
                        unoptimized
                        className="block dark:hidden"
                      />
                      {/* Dark mode badge */}
                      <Image
                        src="https://res.cloudinary.com/ddz3nsnq1/image/upload/v1749185170/images_karyms.png"
                        alt="Made in Bolt.new (dark mode)"
                        width={120}
                        height={40}
                        unoptimized
                        className="hidden dark:block"
                      />
                    </a>
                  </div>
                </div>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                  ACID TIPS (Audio, Chat, Infographics, Date-Time, Text, Image, Problem-Solving, Spreadsheets)😆
                </p>
                {/* === PRODUCT HUNT BADGE === */}
                <div className="mt-4 flex justify-center">
                  <a
                    href="https://www.producthunt.com/products/klutz?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-klutz"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Featured on Product Hunt"
                  >
                    <img
                      src=" https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=977863&theme=light&t=1749888258779"
                      alt="KLUTZ - Suite&#0032;of&#0032;AI&#0032;Powered&#0032;Image&#0044;&#0032;Date&#0032;&#0038;&#0032;Text&#0032;Tools | Product Hunt"
                      className="w-[150px] h-[32px] md:w-[250px] md:h-[54px]"
                      width={250}
                      height={54}
                    />
                  </a>
                </div>
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

      {/* Footer */}
      <footer className="bg-muted/30 border-t mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <ScanLine className="h-6 w-6 text-primary" />
                <span className="font-headline text-xl font-semibold">KLUTZ</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered content and image analysis suite providing intelligent insights across multiple domains.
              </p>
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="h-4 w-4 text-accent" />
                <a href="mailto:jeffrinjames99@gmail.com" className="text-muted-foreground hover:text-primary transition-colors">
                  jeffrinjames99@gmail.com
                </a>
              </div>
            </div>

            {/* Tools */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Popular Tools</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/mediscan" className="text-muted-foreground hover:text-primary transition-colors">MediScan AI</Link></li>
                <li><Link href="/ai-problem-solver" className="text-muted-foreground hover:text-primary transition-colors">AI Problem Solver</Link></li>
                <li><Link href="/ai-translator" className="text-muted-foreground hover:text-primary transition-colors">AI Translator</Link></li>
                <li><Link href="/text-to-image-generator" className="text-muted-foreground hover:text-primary transition-colors">Text-to-Image Generator</Link></li>
                <li><Link href="/ingredients-checker" className="text-muted-foreground hover:text-primary transition-colors">Ingredients Checker</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/faq" className="text-muted-foreground hover:text-primary transition-colors flex items-center">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/third-party-licenses" className="text-muted-foreground hover:text-primary transition-colors flex items-center">
                    <Package className="h-4 w-4 mr-2" />
                    Third-Party Licenses
                  </Link>
                </li>
                <li>
                  <a href="mailto:jeffrinjames99@gmail.com" className="text-muted-foreground hover:text-primary transition-colors flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    Support
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/terms-of-service" className="text-muted-foreground hover:text-primary transition-colors flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors flex items-center">
                    <Eye className="h-4 w-4 mr-2" />
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="text-muted-foreground hover:text-primary transition-colors flex items-center">
                    <Cookie className="h-4 w-4 mr-2" />
                    Cookies Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <Separator className="my-8" />

          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-4 lg:space-y-0">
            <div className="container mx-auto text-center">
              {/* Social Icons */}
              <div className="flex justify-center gap-4 mb-6">
                <a href="https://github.com/Unselfisheologism/KLUTZ" target="_blank" rel="noopener noreferrer" title="GitHub (opens in a new window)">
                <Github className="text-gray-600 hover:text-gray-900 transition" size={28} aria-label="GitHub" />
                </a>
                <a href="https://x.com/Jeff9James" target="_blank" rel="noopener noreferrer" title="X (opens in a new window)">
                  <FaXTwitter className="text-gray-600 hover:text-black transition" size={28} aria-label="X" />
                </a>
                <a href="https://medium.com/@jeffrinjames99" target="_blank" rel="noopener noreferrer" title="Medium (opens in a new window)">
                  <FaMedium className="text-gray-600 hover:text-green-700 transition" size={28} aria-label="Medium" />
                </a>
                <a href="https://discordapp.com/users/1293939031620456492" target="_blank" rel="noopener noreferrer" title="Discord (opens in a new window)">
                  <FaDiscord className="text-gray-600 hover:text-indigo-600 transition" size={28} aria-label="Discord" />
                </a>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2025 KLUTZ. All rights reserved.
            </div>
            <div className="text-sm text-muted-foreground">
              Built with AI-powered tools for the modern web.
            </div>
          </div>
        </div>
      </footer>
    </div>
   </> 
  );
}
