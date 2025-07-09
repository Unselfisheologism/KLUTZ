import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Footer from '@/components/layout/footer';

export default function LandingPage() {
  const backgroundImage = 'https://res.cloudinary.com/ddz3nsnq1/image/upload/v1751263917/Image_fx_11_tmz9lo.png'; // Replace with your image URL
  const videoBackground = 'YOUR_VIDEO_URL'; // Replace with your video URL
  const logoImage = 'https://res.cloudinary.com/ddz3nsnq1/image/upload/v1751201919/Untitled_design_3_d8m11k.png'; // Replace with your logo URL

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center text-white overflow-hidden">
      {/* Background Video */}
      {/* <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src={videoBackground} type="video/mp4" />
        {/* Fallback Image
        <Image
          src={backgroundImage}
          alt="Background"
          fill
          className="absolute inset-0 object-cover"
        />
      </video> */}

      {/* Content Layer */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center">
        {/* Logo */}
        <div className="mb-8">
          <Image
            src={logoImage}
            alt="KLUTZ Logo"
            width={150} // Adjust size as needed
            height={150} // Adjust size as needed
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
      {/* <footer className="relative z-10 w-full bg-gray-800 bg-opacity-50 text-white mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>&copy; 2025 KLUTZ. All rights reserved.</p>
        </div>
      </footer> */}
    </div>
  );
}
