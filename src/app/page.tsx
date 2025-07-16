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

export default function LandingPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
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

      {/* Background Image with Gradient */}
      <section className="relative h-96 overflow-hidden">
        <img
          src="https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752160444/Screenshot_2025-07-10_180305_kbaefl.png"
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-100"></div>
      </section>

      <main className="container mx-auto px-4 py-12">
        {/* Klutz Logo and Text */}
        <div className="text-center mb-12">
          <img src="https://res.cloudinary.com/ddz3nsnq1/image/upload/v1751201919/Untitled_design_3_d8m11k.png" alt="Klutz Logo" className="mx-auto mb-4 w-24 h-24" />
          <p className="text-2xl font-semibold text-gray-700">Klutz</p>
        </div>

        {/* Heading and Subheading */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">Who Said AI Is Gonna Take Over?</h1>
          <p className="text-xl text-gray-600">Make AI Your Slave, With KLUTZ!</p>
        </div>

        {/* Horizontally Scrollable Carousels */}
        <HorizontalCarousel
          title="Chat"
          content={[
            { title: "With Any AI Model", description: "Choose From 20+ AI Models To Chat With", imageUrl: "https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752678871/Screenshot_2025-07-16_204359_abdlvo.png" },
            { title: "With Any Website", description: "Chat With The Content Of Any Website", imageUrl: "https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752678916/Screenshot_2025-07-16_204503_ahsgxv.png" },
            { title: "With Any Image", description: "Upload An Image & Chat About it", imageUrl: "https://res.cloudinary.com/ddz3nsnq1/image/upload/v1752678982/Screenshot_2025-07-16_204604_unp1p1.png" },
          ]}
        />

        <HorizontalCarousel
          title="Analyze"
          content={[
            { title: "To Solve Problems", description: "Description 6", imageUrl: "https://via.placeholder.com/400x300" },
            { title: "For Neurodiversity", description: "Description 7", imageUrl: "https://via.placeholder.com/400x300" },
            { title: "", description: "Description 8", imageUrl: "https://via.placeholder.com/400x300" },
            { title: "Title 9", description: "Description 9", imageUrl: "https://via.placeholder.com/400x300" },
            { title: "Title 10", description: "Description 10", imageUrl: "https://via.placeholder.com/400x300" },
          ]}
        />

        <HorizontalCarousel
          title="Generate"
          content={[
            { title: "Title 11", description: "Description 11", imageUrl: "https://via.placeholder.com/400x300" },
            { title: "Title 12", description: "Description 12", imageUrl: "https://via.placeholder.com/400x300" },
            { title: "Title 13", description: "Description 13", imageUrl: "https://via.placeholder.com/400x300" },
            { title: "Title 14", description: "Description 14", imageUrl: "https://via.placeholder.com/400x300" },
            { title: "Title 15", description: "Description 15", imageUrl: "https://via.placeholder.com/400x300" },
          ]}
        />

        {/* Testimonials */}
        <section className="mb-16">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">What Our Users Say</h2>
          <div className="overflow-x-auto">
            <div className="flex space-x-6 pb-4">
              {[16, 17, 18, 19, 20].map((item) => (
                <div key={item} className="flex-none w-80 h-60 bg-white rounded-lg shadow-md flex items-center justify-center text-gray-600">
                  Carousel Item {item}
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}