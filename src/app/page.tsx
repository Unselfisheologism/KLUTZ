'use client';

import Head from 'next/head'; 
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area'; 
import { Separator } from '@/components/ui/separator';
import { ScanLine, Layers, ShieldCheck, Brain, ThermometerIcon, ArrowRight, Zap, Car, Ruler, Sparkles, Utensils, FileText, Languages, Calculator, Calendar, Mail, Shield, Eye, Package, HelpCircle, Cookie, Github, FileSpreadsheet, BarChart, Speech, AudioWaveform, Wand } from 'lucide-react';
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

export function EffectsPanel(props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isAiChatReady, setIsAiChatReady] = useState(false);
  const { toast } = useToast();

  // Add useEffect to log currentAudioFile changes
  useEffect(() => {
    console.log('currentAudioFile changed:', props.currentAudioFile);
  }, [props.currentAudioFile]);

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
    setInputMessage('')

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

     const response = await window.puter.ai.chat(prompt, {
      // You can add other options here if needed, like 'model'
    });

    // Get AI response text, prioritizing response.message.content
    const aiResponseText = response?.message?.content || response?.text;

    // Check if the response and response.text are valid before processing
    if (!aiResponseText) {
      console.error('Received empty or invalid text response from AI:', response);
      // Add the AI's response to the chat
       setMessages(prevMessages => [...prevMessages, {
         id: prevMessages.length + 1,
         text: 'Received an empty or invalid text response from the AI.',
         sender: 'bot',
       }]);
      return;
    }
  }
}
export default function HomePage() {
  return (
    <>
      <Head>
        <link rel="canonical" href="https://klutz.netlify.app/" />
        <meta name="google-site-verification" content="FVYY2_q5JUQa1Oqg8XGj4v2wqB4F1BcREDn_ZVlwNCA" />
      </Head>
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-8">
              <div className="badge-wrapper-270x54">
                {/* === PRODUCT HUNT BADGE REPLACEMENT START === */}
                <a
                  href="https://www.producthunt.com/products/klutz?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-klutz"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Featured on Product Hunt"
                >
                  <img
                    src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=977863&theme=light&t=1749888258779"
                    alt="KLUTZ - Suite&#0032;of&#0032;AI&#0032;Powered&#0032;Image&#0044;&#0032;Date&#0032;&#0038;&#0032;Text&#0032;Tools | Product Hunt"
                    style={{ width: '250px', height: '54px' }}
                    width={250}
                    height={54}
                  />
                </a>
                {/* === PRODUCT HUNT BADGE REPLACEMENT END === */}
              </div>  
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
              ACID PITS (Audio, Chat, Infographics, Date-Time, Problem-Solving, Image, Text, Spreadsheets)😆
            </p>
          </div>

          <Card className="h-full flex flex-col">
            <CardContent className="flex-grow overflow-hidden p-4">
              <ScrollArea ref={scrollAreaRef} className="h-full pr-4">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature) => (
                <Card key={feature.title} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex items-center mb-3 card">
                      <feature.icon className="h-10 w-10 text-accent mr-4" />
                      <CardTitle className="font-headline text-2xl">{feature.title}</CardTitle>
                    </div>
                    <CardDescription className="text-base min-h-[60px]">{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow" />
                  <CardFooter>
                    {feature.isImplemented ? (
                      <Link href={feature.href}>
                        <button className="cssbuttons-io-button">
                          Open Tool
                          <div className="icon">
                            <svg height="24" width="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0z" fill="none"></path><path d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z" fill="currentColor"></path></svg>
                          </div>
                        </button>
                      </Link>
                    ) : (
                      <Button variant="outline" className="w-full" disabled>
                        Coming Soon
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-muted/30 border-t mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
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

          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
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
  );
    </> 
)
      }

function ChatComponent() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setResponse(''); // Clear previous response
    try {
      // Assuming puter is available globally
      const chatResponse = await puter.ai.chat(input);
      setResponse(chatResponse.text);
    } catch (error) {
      console.error("Error during AI chat:", error);
      setResponse("Sorry, I couldn't process that request. Please try again.");
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <Input
        type="text"
        placeholder="Ask me anything about KLUTZ..."
        value={input}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        disabled={loading}
      />
      <Button onClick={handleSend} disabled={!input.trim() || loading}>Send</Button>
      {loading && <p className="text-sm text-muted-foreground">Thinking...</p>}
      {response && <p className="text-base text-foreground mt-4">{response}</p>}
    </div>
  );
}
