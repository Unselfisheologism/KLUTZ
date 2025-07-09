import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Footer from '@/components/layout/footer';

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

      {/* Footer (Optional, can be similar to your original footer) */}
      <Footer />
     {/* Footer is in layout.tsx */}
    </div>
  );
}
