'use client';

import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import AppHeader from '@/components/layout/app-header';
import Link from 'next/link';
import { ThemeProvider } from "@/components/providers";
import { Button } from '@/components/ui/button';
import LoginButton from '@/components/auth/login-button';
import { ThemeToggle } from "@/components/theme-toggle";
import { User, MenuIcon } from 'lucide-react';
import Sidebar from "@/components/layout/Sidebar";
import { useState } from 'react';

export const metadata: Metadata = {
  title: 'KLUTZ',
  description: 'Suite of AI-powered Image Analysis Tools',
  icons: {
    icon: 'https://res.cloudinary.com/ddz3nsnq1/image/upload/v1751201919/Untitled_design_3_d8m11k.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return (
    <html lang="en\" suppressHydrationWarning>
      <head>
        <link rel="preconnect\" href="https://fonts.googleapis.com" />
        <link rel="preconnect\" href="https://fonts.gstatic.com\" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap\" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap\" rel="stylesheet" />
        <script src="https://js.puter.com/v2/"></script>
        
        <meta name="google-site-verification" content="FVYY2_q5JUQa1Oqg8XGj4v2wqB4F1BcREDn_ZVlwNCA" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <header className="fixed top-0 z-50 w-full max-w-screen-xl mx-auto p-4 sm:px-6 lg:px-8">
            <div className="bg-card/80 backdrop-blur-sm rounded-xl border-b border-border w-full h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between w-full h-full">
                <Link href="/" className="flex items-center gap-2">
                  <img
                    src="https://res.cloudinary.com/ddz3nsnq1/image/upload/v1751201919/Untitled_design_3_d8m11k.png"
                    alt="Klutz Logo"
                    className="h-8 w-8 rounded-lg"
                  />
                  <h1 className="text-2xl font-headline font-semibold text-foreground">
                    Klutz
                  </h1>
                </Link>
                <div className="flex items-center gap-4">
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
              </div>
            </div>

          </header>
          {isSidebarOpen && <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />}
          <main className="flex-grow">
            {children}
          </main>
          <Toaster />
        </ThemeProvider>
      </body>

    </html>
  );
}
