import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Footer from '@/components/layout/footer';
import { ScanLine, Layers, ShieldCheck, Brain, ThermometerIcon, ArrowRight, Zap, Car, Ruler, Sparkles, Utensils, XIcon, FileText, Languages, Calculator, Calendar, Mail, Shield, Eye, Package, HelpCircle, Cookie, Github, FileSpreadsheet, BarChart, Speech, AudioWaveform, Wand, GlobeIcon, CheckIcon, MenuIcon, Trash2Icon, Edit2Icon } from 'lucide-react'; // Import Edit2Icon
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';


interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
  isImplemented: boolean;
  imageUrl: string;
}

const features: Feature[] = [
  {
    icon: FileText,
    title: 'Image to Text Converter',
    description: 'Extract and analyze all text content from images using AI-powered text recognition.',
    href: '/image-to-text',
    isImplemented: true,
    imageUrl: 'https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752162119/Screenshot_2025-07-10_205138_nqzsrk.png'
  },
  {
    icon: Languages,
    title: 'AI Translator',
    description: 'Translate text from images or typed input with support for 60+ languages and cultural context.',
    href: '/ai-translator',
    isImplemented: true,
    imageUrl: 'https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752162142/Screenshot_2025-07-10_205222_z5xvzl.png'
  },
  {
    icon: Calculator,
    title: 'AI Problem Solver',
    description: 'Get step-by-step solutions for math, science, and academic problems with detailed explanations.',
    href: '/ai-problem-solver',
    isImplemented: true,
    imageUrl: 'https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752162154/Screenshot_2025-07-10_205337_kq5abm.png'
  },
  {
    icon: Calendar,
    title: 'AI Date & Time Checker',
    description: 'Explore dates from any century or millennium and discover detailed historical and astronomical information.',
    href: '/ai-date-time-checker',
    isImplemented: true,
    imageUrl: 'https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752162170/Screenshot_2025-07-10_205422_b7izxl.png'
  },
  {
    icon: ScanLine,
    title: 'MediScan AI',
    description: 'Analyze medical images (X-rays, MRI, CT scans) using AI for insights.',
    href: '/mediscan',
    isImplemented: true,
    imageUrl: 'https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752162184/Screenshot_2025-07-10_205507_uw1suh.png'
  },
  {
    icon: Layers,
    title: 'Thumbnail Title Consistency Checker',
    description: 'Ensure your video thumbnails and titles are aligned for better engagement.',
    href: '/thumbnail-checker',
    isImplemented: true,
    imageUrl: 'https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752162202/Screenshot_2025-07-10_205602_iyegzx.png'
  },
  {
    icon: ShieldCheck,
    title: 'Content Ethnicity Certifier',
    description: 'Analyze content for ethical portrayal and representation related to ethnicity.',
    href: '/ethnicity-certifier',
    isImplemented: true,
    imageUrl: 'https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752162264/Screenshot_2025-07-10_205639_u9wahe.png'
  },
  {
    icon: Brain,
    title: 'Content Neurodiversity-Friendliness Checker',
    description: 'Assess content for neurodiversity inclusiveness and friendliness.',
    href: '/neurodiversity-checker',
    isImplemented: true,
    imageUrl: 'https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752162282/Screenshot_2025-07-10_205717_puu2fg.png'
  },
  {
    icon: ThermometerIcon,
    title: 'Content Heatmap Generator',
    description: 'Generate heatmaps to visualize user engagement on your content.',
    href: '/heatmap-generator',
    isImplemented: true,
    imageUrl: 'https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752162305/Screenshot_2025-07-10_205841_fid3qo.png'
  },
  {
    icon: Zap,
    title: 'Electronic Appliance Troubleshooter',
    description: 'AI-powered analysis of malfunctioning electronic devices for troubleshooting assistance.',
    href: '/appliance-troubleshooter',
    isImplemented: true,
    imageUrl: 'https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752162334/Screenshot_2025-07-10_205941_wk8txn.png'
  },
  {
    icon: Car,
    title: 'Vehicle Troubleshooter',
    description: 'AI-powered analysis of vehicle issues and malfunctions for diagnostic assistance.',
    href: '/vehicle-troubleshooter',
    isImplemented: true,
    imageUrl: 'https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752162348/Screenshot_2025-07-10_210037_ejmmzi.png'
  },
  {
    icon: Ruler,
    title: 'AI Measuring Tool',
    description: 'Upload images of physical objects and get AI-powered measurements in your preferred metric system.',
    href: '/measuring-tool',
    isImplemented: true,
    imageUrl: 'https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752162361/Screenshot_2025-07-10_210120_ylcsjo.png'
  },
  {
    icon: Sparkles,
    title: 'AI Text-to-Image Generator',
    description: 'Generate high-quality images from text descriptions using advanced AI technology.',
    href: '/text-to-image-generator',
    isImplemented: true,
    imageUrl: 'https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752162374/Screenshot_2025-07-10_210309_vn079l.png'
  },
  {
    icon: Wand,
    title: 'AI Prompt Generator',
    description: 'Generate creative text prompts from images using AI analysis.',
    href: '/prompt-generator',
    isImplemented: true,
    imageUrl: 'https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752162456/Screenshot_2025-07-10_211722_orastr.png'
  },
  {
    icon: FileSpreadsheet,
    title: 'AI-Native Spreadsheets',
    description: 'Create and modify spreadsheets through natural language with an AI assistant that understands your data.',
    href: '/ai-spreadsheets',
    isImplemented: true,
    imageUrl: 'https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752162472/Screenshot_2025-07-10_210446_nutmko.png'
  },
  {
    icon: BarChart,
    title: 'AI Native Infographics',
    description: 'Create data-driven infographics powered by AI for impactful visual storytelling.',
    href: '/ai-infographics',
    isImplemented: true,
    imageUrl: 'https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752162488/Screenshot_2025-07-10_210815_mb3xws.png'
  },
  {
    icon: AudioWaveform,
    title: 'AI Native Audio Editor',
    description: 'Edit and enhance audio files using AI-powered tools and natural language commands.',
    href: '/ai-audio-editor',
    isImplemented: true,
    imageUrl: 'https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752162547/screencapture-klutz-pi-vercel-app-ai-audio-editor-2025-07-10-21_09_22_isacwg.png'
  },
  {
    icon: Speech,
    title: 'AI Text-to-Speech Generator',
    description: 'Convert text into natural-sounding speech using AI.',
    href: '/ai-text-to-speech',
    isImplemented: true,
    imageUrl: 'https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752162567/Screenshot_2025-07-10_211048_ytodyc.png'
  },
];

export default function LandingPage() {
  const backgroundImage = 'https://res.cloudinary.com/ddz3nsnq1/image/upload/v1751263917/Image_fx_11_tmz9lo.png'; // Replace with your image URL
  const videoBackground = 'YOUR_VIDEO_URL'; // Replace with your video URL
  const logoImage = 'https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752078136/Screenshot_2025-07-09_215114-removebg-preview_wgbree.png'; // Replace with your logo URL

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center text-white overflow-hidden"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Background Overlay for better text readability */}
      <div className="absolute inset-0 bg-black opacity-50 z-0"></div>

      {/* Content Layer */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center">
        {/* Logo */}
        <div className="mb-8">
          <img
            src={logoImage}
            alt="KLUTZ Logo"
            width={150}
            height={150}
            objectFit="contain"
          />
        </div>

        {/* Heading */}
        <h1 className="text-5xl md:text-7xl font-bold mb-4 drop-shadow-lg">
          Who Said AI Is Gonna Take Over?
        </h1>

        {/* Subheading/Slogan */}
        <p className="text-xl md:text-2xl mb-8 drop-shadow-md">
          Make AI Your Slave (Audio, Chat, Infographics, Date-Time, Text, Image, Problem-Solving, Spreadsheets Tools)
        </p>

        {/* Get Started Button */}
        <Link href="/get-started" passHref>
          <Button size="lg" className="text-lg px-8 py-4 animate-pulse hover:animate-none">
            Get Started
          </Button>
        </Link>

        {/* Free To Use text */}
        <p className="mt-4 text-sm text-gray-300 drop-shadow-sm">
          Free To Use. No Credit Card
        </p>
      </div>

      {/* You can add other landing page sections here */}
      <div className="flex flex-col items-center">
        <span className="text-sm font-medium mb-1">Made in</span>
        <a
          href="https://bolt.new"
          target="_blank"
          rel="noopener noreferrer"
          title="Made in Bolt.new (opens in a new window)"
          className="badge-wrapper-120x40"
        >
          <Image src="https://res.cloudinary.com/ddz3nsnq1/image/upload/v1749185392/images-removebg-preview_j17by7.png" alt="Made in Bolt.new (Light Mode)">
            width={120}
            height={40}
            unoptimized
            className="block dark:hidden"
          </Image>
          <Image src="https://res.cloudinary.com/ddz3nsnq1/image/upload/v1749185170/images_karyms.png" alt="Made in Bolt.new (Dark mode)">
            width={120}
            height={40}
            unoptimized
            className="hidden dark:block"
          </Image>
        </a>
      </div>
      {/* Footer (Optional, can be similar to your original footer) */}
      <Footer />
     {/* Footer is in layout.tsx */}
     <div className="relative z-10 w-full max-w-6xl px-4 py-12">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:grid-rows-2">
          {/* Top Laptop-shaped Card */}
          <Card className="md:col-span-3 flex flex-col justify-between">
            <CardHeader className="pb-0">
              <CardTitle className="text-lg md:text-xl font-semibold flex items-center whitespace-normal break-words">Chat: Any AI Model, Any Webpage</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center p-4">
              {/* Placeholder for image/video */}
              <div className="w-full h-64 md:h-96 bg-gray-700 rounded-md flex flex-col justify-center text-gray-400 mb-4">
                <a href="https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752160444/Screenshot_2025-07-10_180305_kbaefl.png" target="_blank" rel="noopener noreferrer">
                  <img src="https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752160444/Screenshot_2025-07-10_180305_kbaefl.png" alt="AI-Powered Creativity" className="w-full h-full object-cover rounded-md" />
                </a>
                

              </div>
            </CardContent>
            {features[0].isImplemented ? (
              <Link href="/get-started" passHref className="p-4 pt-0">
              {/* Wrap button in a div to center it */}
                <Button variant="outline" className="w-full">
                  Try Now <ArrowRight className="ml-2 w-4 h-4" /> {/* Restored w-full for consistent behavior with other cards */}
                </Button>
              </Link>
            ) : null}
          </Card>
          {/* Square Cards */}
          {features.map((feature, index) => (
            <Card key={index} className="flex flex-col justify-between">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center">
                  <feature.icon className="w-6 h-6 mr-2" />
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-between p-4">
                <p className="text-sm text-gray-400 mb-4">{feature.description}</p>
                {feature.imageUrl && ( // Conditionally render the image if imageUrl exists
                  <Link href={feature.imageUrl} passHref>
                    <a target="_blank" rel="noopener noreferrer">
                      <div className="w-full h-32 mb-4 rounded-md overflow-hidden"> {/* Adjust size as needed */}
                        <img
                          src={feature.imageUrl}
                          alt={feature.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </a>
                  </Link>
                )}
                {feature.isImplemented ? (
                  <Link href={feature.href} passHref>
                    <Button variant="outline" className="w-full">
                      Try Now <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                ) : (
                  <Button variant="outline" className="w-full" disabled>
                    Coming Soon
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
