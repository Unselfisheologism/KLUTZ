'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScanLine, Layers, ShieldCheck, Brain, ThermometerIcon, ArrowRight, Zap, Car, Ruler, Sparkles, Utensils, FileText, Languages, Calculator } from 'lucide-react'; 

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
    title: 'AI Meme Generator',
    description: 'Generate unique and engaging memes using AI trained on popular meme styles.',
    href: '/meme-generator',
    isImplemented: true,
  },
];

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-8">
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-4">
            AI-Powered Content & Image Analysis Suite
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
          Explore our suite of tools designed to provide insights and enhance your content using advanced AI capabilities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature) => (
          <Card key={feature.title} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center mb-3">
                <feature.icon className="h-10 w-10 text-accent mr-4" />
                <CardTitle className="font-headline text-2xl">{feature.title}</CardTitle>
              </div>
              <CardDescription className="text-base min-h-[60px]">{feature.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              {/* Additional content can go here if needed */}
            </CardContent>
            <CardFooter>
              {feature.isImplemented ? (
                <Button asChild className="w-full bg-primary hover:bg-primary/90">
                  <Link href={feature.href}>
                    Open Tool <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
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
  );
}