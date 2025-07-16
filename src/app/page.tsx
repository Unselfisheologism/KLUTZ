'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle'; // Import ThemeToggle
import LoginButton from '@/components/auth/login-button'; // Import LoginButton
import { ScanLine, Layers, ShieldCheck, Brain, ThermometerIcon, ArrowRight, Zap, Car, Ruler, Sparkles, Utensils, XIcon, FileText, Languages, Calculator, Calendar, Mail, Shield, Eye, Package, HelpCircle, Cookie, Github, FileSpreadsheet, BarChart, Speech, AudioWaveform, Wand, GlobeIcon, CheckIcon, MenuIcon, Trash2Icon, Edit2Icon, User } from 'lucide-react'; // Import Edit2Icon
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import React from 'react';
import Sidebar from "@/components/layout/Sidebar";
import Footer from '@/components/layout/footer';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"


interface Feature {
  icon?: React.ElementType; // Make icon optional
  title: string;
  description: string;
  href: string;
  isImplemented: boolean;
  imageUrl: string;
}

const features: Feature[] = [
  {
    icon: undefined,
    title: 'Image to Text Converter',
    description: 'Extract and analyze all text content from images using AI-powered text recognition.',
    href: '/image-to-text',
    isImplemented: true,
    imageUrl: 'https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752162119/Screenshot_2025-07-10_205138_nqzsrk.png',
  },
  {
    icon: undefined,
    title: 'AI Translator',
    description: 'Translate text from images or typed input with support for 60+ languages and cultural context.',
    href: '/ai-translator',
    isImplemented: true,
    imageUrl: 'https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752162142/Screenshot_2025-07-10_205222_z5xvzl.png',
  },
  {
    icon: undefined,
    title: 'AI Problem Solver',
    description: 'Get step-by-step solutions for math, science, and academic problems with detailed explanations.',
    href: '/ai-problem-solver',
    isImplemented: true,
    imageUrl: 'https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752162154/Screenshot_2025-07-10_205337_kq5abm.png',
  },
  {
    icon: undefined,
    title: 'AI Date & Time Checker',
    description: 'Explore dates from any century or millennium and discover detailed historical and astronomical information.',
    href: '/ai-date-time-checker',
    isImplemented: true,
    imageUrl: 'https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752162170/Screenshot_2025-07-10_205422_b7izxl.png',
  },
  {
    icon: undefined,
    title: 'MediScan AI',
    description: 'Analyze medical images (X-rays, MRI, CT scans) using AI for insights.',
    href: '/mediscan',
    isImplemented: true,
    imageUrl: 'https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752162184/Screenshot_2025-07-10_205507_uw1suh.png',
  },
  {
    icon: undefined,
    title: 'Thumbnail Title Consistency Checker',
    description: 'Ensure your video thumbnails and titles are aligned for better engagement.',
    href: '/thumbnail-checker',
    isImplemented: true,
    imageUrl: 'https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752162202/Screenshot_2025-07-10_205602_iyegzx.png',
  },
  {
    icon: undefined,
    title: 'Content Ethnicity Certifier',
    description: 'Analyze content for ethical portrayal and representation related to ethnicity.',
    href: '/ethnicity-certifier',
    isImplemented: true,
    imageUrl: 'https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752162264/Screenshot_2025-07-10_205639_u9wahe.png',
  },
  {
    icon: undefined,
    title: 'Content Neurodiversity-Friendliness Checker',
    description: 'Assess content for neurodiversity inclusiveness and friendliness.',
    href: '/neurodiversity-checker',
    isImplemented: true,
    imageUrl: 'https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752162282/Screenshot_2025-07-10_205717_puu2fg.png',
  },
  {
    icon: undefined,
    title: 'Content Heatmap Generator',
    description: 'Generate heatmaps to visualize user engagement on your content.',
    href: '/heatmap-generator',
    isImplemented: true,
    imageUrl: 'https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752162305/Screenshot_2025-07-10_205841_fid3qo.png',
  },
  {
    icon: undefined,
    title: 'Electronic Appliance Troubleshooter',
    description: 'AI-powered analysis of malfunctioning electronic devices for troubleshooting assistance.',
    href: '/appliance-troubleshooter',
    isImplemented: true,
    imageUrl: 'https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752162334/Screenshot_2025-07-10_205941_wk8txn.png',
  },
  {
    icon: undefined,
    title: 'Vehicle Troubleshooter',
    description: 'AI-powered analysis of vehicle issues and malfunctions for diagnostic assistance.',
    href: '/vehicle-troubleshooter',
    isImplemented: true,
    imageUrl: 'https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752162348/Screenshot_2025-07-10_210037_ejmmzi.png',
  },
  {
    icon: undefined,
    title: 'AI Measuring Tool',
    description: 'Upload images of physical objects and get AI-powered measurements in your preferred metric system.',
    href: '/measuring-tool',
    isImplemented: true,
    imageUrl: 'https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752162361/Screenshot_2025-07-10_210120_ylcsjo.png',
  },
  {
    icon: undefined,
    title: 'AI Text-to-Image Generator',
    description: 'Generate high-quality images from text descriptions using advanced AI technology.',
    href: '/text-to-image-generator',
    isImplemented: true,
    imageUrl: 'https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752162374/Screenshot_2025-07-10_210309_vn079l.png',
  },
  {
    icon: undefined,
    title: 'AI Prompt Generator',
    description: 'Generate creative text prompts from images using AI analysis.',
    href: '/prompt-generator',
    isImplemented: true,
    imageUrl: 'https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752162456/Screenshot_2025-07-10_211722_orastr.png',
  },
  {
    icon: undefined,
    title: 'AI-Native Spreadsheets',
    description: 'Create and modify spreadsheets through natural language with an AI assistant that understands your data.',
    href: '/ai-spreadsheets',
    isImplemented: true,
    imageUrl: 'https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752162472/Screenshot_2025-07-10_210446_nutmko.png',
  },
  {
    icon: undefined,
    title: 'AI Native Infographics',
    description: 'Create data-driven infographics powered by AI for impactful visual storytelling.',
    href: '/ai-infographics',
    isImplemented: true,
    imageUrl: 'https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752162488/Screenshot_2025-07-10_210815_mb3xws.png',
  },
  {
    icon: undefined,
    title: 'AI Native Audio Editor',
    description: 'Edit and enhance audio files using AI-powered tools and natural language commands.',
    href: '/ai-audio-editor',
    isImplemented: true,
    imageUrl: 'https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752162547/screencapture-klutz-pi-vercel-app-ai-audio-editor-2025-07-10-21_09_22_isacwg.png',
  },
  {
    icon: undefined,
    title: 'AI Text-to-Speech Generator',
    description: 'Convert text into natural-sounding speech using AI.',
    href: '/ai-text-to-speech',
    isImplemented: true,
    imageUrl: 'https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752162567/Screenshot_2025-07-10_211048_ytodyc.png',
  },
];

export default function LandingPage() {
  const backgroundImage = 'https://res.cloudinary.com/ddz3nsnq1/image/upload/v1751263917/Image_fx_11_tmz9lo.png'; // Replace with your image URL
  const videoBackground = 'YOUR_VIDEO_URL'; // Replace with your video URL
  const logoImage = 'https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752078136/Screenshot_2025-07-09_215114-removebg-preview_wgbree.png'; // Replace with your logo URL
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center text-white overflow-hidden pt-16"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Background Overlay for better text readability */}
      <div className="absolute inset-0 bg-black opacity-50 z-0"></div>

      {/* Top Right Icons */}
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

      {/* add other landing page sections here */}
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
      {/* Footer (Optional, can be similar to your original footer) */}
      <Footer />

      {/* Horizontally Scrollable Carousel Section */}
      <div className="relative z-10 w-full max-w-6xl px-4 py-12">
        {[...Array(5)].map((_, rowIndex) => (
          <ScrollArea key={rowIndex} className="whitespace-nowrap mb-6">
            <div className="flex w-max space-x-4 p-4">
              {features.slice(rowIndex * 4, rowIndex * 4 + 5).map((feature, index) => ( // Display 4-5 features per row
                <Card key={index} className="w-[300px] inline-block">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center">
                      {feature.icon && <feature.icon className="w-6 h-6 mr-2" />}
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col justify-between p-4">
                    <p className="text-sm text-gray-400 mb-4">{feature.description}</p>
                    {feature.imageUrl && (
                      <Link href={feature.imageUrl} passHref>
                        <a target="_blank" rel="noopener noreferrer">
                          <div className="w-full h-32 mb-4 rounded-md overflow-hidden">
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
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        ))}

        {/* Bottom Left Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl font-semibold flex items-center">
              AI Chatbot: Any AI Model, Any Webpage
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-sm text-gray-400 mb-4">
              Interact with any AI model and get real-time insights from any webpage content.
            </p>
            <div className="w-full h-64 md:h-96 bg-gray-700 rounded-md flex flex-col justify-center text-gray-400 mb-4">
              <a href="https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752160444/Screenshot_2025-07-10_180305_kbaefl.png" target="_blank" rel="noopener noreferrer">
                <img src="https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752160444/Screenshot_2025-07-10_180305_kbaefl.png" alt="AI Chatbot Interface" className="w-full h-full object-cover rounded-md" />
              </a>
            </div>
            <Link href="/get-started" passHref>
              <Button variant="outline" className="w-full">
                Try Now <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Bottom Right Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl font-semibold flex items-center">
              <GlobeIcon className="w-6 h-6 mr-2" /> Your Website on Your AI Assistant
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-sm text-gray-400 mb-4">
              Integrate your website with your AI assistant for personalized interactions and enhanced user experience.
            </p>
            <div className="w-full h-64 md:h-96 bg-gray-700 rounded-md flex flex-col justify-center text-gray-400 mb-4">
              {/* Placeholder for image/video */}
            </div>
            {/* Assuming this feature is also implemented */}
            <Link href="/get-started" passHref>
              <Button variant="outline" className="w-full">
                Integrate Now <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* FAQs and Contact sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center"><HelpCircle className="w-6 h-6 mr-2" /> FAQs</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-gray-400">Find answers to commonly asked questions about KLUTZ.</p>
              <Link href="/faq" passHref>
                <Button variant="outline" className="mt-4">
                  View FAQs
                </Button>
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center"><Mail className="w-6 h-6 mr-2" /> Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-gray-400">Get in touch with us for support or inquiries.</p>
              <Link href="mailto:support@klutz.com" passHref>
                <Button variant="outline" className="mt-4">
                  Contact Support
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Legal Links */}
        <div className="flex justify-center space-x-6 mt-12 text-sm text-gray-400">
          <Link href="/privacy-policy">
            <a className="hover:underline">Privacy Policy</a>
          </Link>
          <Link href="/terms-of-service">
            <a className="hover:underline">Terms of Service</a>
          </Link>
          <Link href="/cookies">
            <a className="hover:underline">Cookie Policy</a>
          </Link>
          <Link href="/third-party-licenses">
            <a className="hover:underline">Third-Party Licenses</a>
          </Link>
        </div>

        {/* Social Media Icons */}
        <div className="flex justify-center space-x-6 mt-8">
          <a href="https://github.com/yourgithub" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <Github className="w-6 h-6 text-gray-400 hover:text-white" />
          </a>
          {/* Add other social media icons as needed */}
        </div>

        {/* Copyright */}
        <div className="text-center text-sm text-gray-500 mt-8">
          © 2024 KLUTZ. All rights reserved.
        </div>
      </div>

    </div>
  );
}

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
