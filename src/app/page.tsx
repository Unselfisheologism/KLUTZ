'use client';

import Footer from "@/components/layout/footer";
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';
import { Button } from '@/components/ui/button';
import Sidebar from "@/components/layout/Sidebar";
import { MenuIcon, User } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle'; // Import ThemeToggle
import LoginButton from '@/components/auth/login-button';
import HorizontalCarousel from '@/components/HorizontalCarousel'; // Import the new component
import AutoScrollMarquee from '@/components/AutoScrollMarquee'; // Import the new component

export default function LandingPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ backgroundImage: 'linear-gradient(to bottom, #193067, #7190be)' }}>
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
  
      <section className="relative h-96 overflow-hidden">
        <img
          src="https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752160444/Screenshot_2025-07-10_180305_kbaefl.png"
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover object-center"  
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#193067]/50 to-[#193067]"></div>
      </section>
  
      <div className="absolute inset-x-0 ">
        {/* Overlaid content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full">
          {/* Klutz logo and text */}
          <div className="flex items-center justify-center mb-12 pt-40">
            <img src="https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752076900/Untitled_design__3_-removebg-preview_dydzqt.png" alt="Klutz Logo" className="w-24 h-24 mr-4" />
            <p className="text-2xl font-semibold text-gray-700">Klutz</p>
          </div>
          {/* Heading and Subheading */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-800 mb-4">Who Said AI Is Gonna Take Over?</h1>
            <p className="text-xl text-gray-600">Make AI Your Slave, With KLUTZ!</p>
          </div>
        </div>


        {/* Horizontally Scrollable Carousels */}
        <HorizontalCarousel
          title="Chat"
          content={[
            { title: "With Any AI Model", imageUrl: "https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752678871/Screenshot_2025-07-16_204359_abdlvo.png" },
            { title: "With Any Website", imageUrl: "https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752678916/Screenshot_2025-07-16_204503_ahsgxv.png" },
            { title: "With Any Image", imageUrl: "https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752678982/Screenshot_2025-07-16_204604_unp1p1.png" },
          ]}
        />

        <HorizontalCarousel
          title="Analyze"
          content={[
            { title: "Date & Time", imageUrl: "https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752162170/Screenshot_2025-07-10_205422_b7izxl.png" },
            { title: "To Solve Problems", imageUrl: "https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752162154/Screenshot_2025-07-10_205337_kq5abm.png" },
            { title: "Medical Images", imageUrl: "https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752162184/Screenshot_2025-07-10_205507_uw1suh.png" },
            { title: "To Translate", imageUrl: "https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752162142/Screenshot_2025-07-10_205222_z5xvzl.png" },
            { title: "For Measuring", imageUrl: "https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752162361/Screenshot_2025-07-10_210120_ylcsjo.png"},
            { title: "For Neurodiversity", imageUrl: "https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752162282/Screenshot_2025-07-10_205717_puu2fg.png" },
            { title: "For Engagement", imageUrl: "https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752162305/Screenshot_2025-07-10_205841_fid3qo.png" },
            { title: "For Ethnicity", imageUrl: "https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752162264/Screenshot_2025-07-10_205639_u9wahe.png" },
            { title: "For Consistency", imageUrl: "https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752162202/Screenshot_2025-07-10_205602_iyegzx.png" },
          ]}
        />

        <HorizontalCarousel
          title="Generate"
          content={[
            { title: "Images", imageUrl: "https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752162374/Screenshot_2025-07-10_210309_vn079l.png" },
            { title: "Speech", imageUrl: "https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752162567/Screenshot_2025-07-10_211048_ytodyc.png" },
            { title: "Infographics", imageUrl: "https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752162488/Screenshot_2025-07-10_210815_mb3xws.png" },
            { title: "Prompts", imageUrl: "https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752162456/Screenshot_2025-07-10_211722_orastr.png" },
            { title: "Vehicle Diagnosis", imageUrl: "https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752162348/Screenshot_2025-07-10_210037_ejmmzi.png" },
            { title: "Device Diagnosis", imageUrl: "https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752162334/Screenshot_2025-07-10_205941_wk8txn.png" },
            { title: "Text From Images", imageUrl: "https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752162119/Screenshot_2025-07-10_205138_nqzsrk.png" },
          ]}
        />

        <HorizontalCarousel
          title="AI-Native"
          content={[
            { title: "Audio Editor", imageUrl: "https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752162547/screencapture-klutz-pi-vercel-app-ai-audio-editor-2025-07-10-21_09_22_isacwg.png" },
            { title: "Spreadsheets", imageUrl: "https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752162472/Screenshot_2025-07-10_210446_nutmko.png" },
          ]}
        />

        {/* Testimonials */}
        <section className="mb-16">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">What Users Say</h2>
          <AutoScrollMarquee
            content={[
              <iframe key="1" style={{ border: 'none' }} src="https://cards.producthunt.com/cards/reviews/1275497?v=1" width="500" height="405" frameBorder="0" scrolling="no" allowFullScreen></iframe>,
              <iframe key="2" style={{ border: 'none' }} src="https://cards.producthunt.com/cards/reviews/1279092?v=1" width="500" height="405" frameBorder="0" scrolling="no" allowFullScreen></iframe>,
              <iframe key="3" style={{ border: 'none' }} src="https://cards.producthunt.com/cards/reviews/1279088?v=1" width="500" height="405" frameBorder="0" scrolling="no" allowFullScreen></iframe>,
              <iframe key="4" style={{ border: 'none' }} src="https://cards.producthunt.com/cards/reviews/1277790?v=1" width="500" height="405" frameBorder="0" scrolling="no" allowFullScreen></iframe>,
            ]}
          />
        </section>

        {/* Footer */}
        <Footer />
      </div>  
    </div>
  );
}