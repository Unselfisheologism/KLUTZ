
'use client';

import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LoginButton from '@/components/auth/login-button';
import { ScanLine, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isPuterReady, setIsPuterReady] = useState(false);
  const [authCheckComplete, setAuthCheckComplete] = useState(false);

  useEffect(() => {
    console.log("[LoginPage] useEffect for Puter availability check triggered.");
    const checkPuterAvailability = () => {
      if (typeof window.puter !== 'undefined' && typeof window.puter.auth !== 'undefined') {
        console.log("[LoginPage] Puter SDK is available.");
        setIsPuterReady(true);
        return true;
      }
      console.log("[LoginPage] Puter SDK not yet available.");
      return false;
    };

    if (checkPuterAvailability()) {
      // If Puter is ready, proceed to check auth status in the next useEffect
    } else {
      const intervalId = setInterval(() => {
        console.log("[LoginPage] Interval: Checking Puter SDK availability...");
        if (checkPuterAvailability()) {
          clearInterval(intervalId);
        }
      }, 100);
      return () => {
        console.log("[LoginPage] Cleanup: Clearing Puter availability check interval.");
        clearInterval(intervalId);
      };
    }
  }, []);

  useEffect(() => {
    if (!isPuterReady) {
      console.log("[LoginPage] Auth check useEffect: Waiting for Puter SDK to be ready.");
      return;
    }

    console.log("[LoginPage] Auth check useEffect: Puter SDK is ready. Starting auth status check and redirect logic.");
    const checkAuthAndRedirect = async () => {
      try {
        const isSignedIn = await window.puter.auth.isSignedIn();
        console.log("[LoginPage] Auth check useEffect: Puter isSignedIn() returned:", isSignedIn);
        if (isSignedIn) {
          console.log("[LoginPage] Auth check useEffect: User is signed in, redirecting to /");
          router.replace('/'); 
        } else {
          console.log("[LoginPage] Auth check useEffect: User is not signed in. Auth check complete.");
          setAuthCheckComplete(true); 
        }
      } catch (error) {
        console.error("[LoginPage] Auth check useEffect: Error checking auth status:", error);
        setAuthCheckComplete(true); 
      }
    };

    checkAuthAndRedirect();
  }, [isPuterReady, router]); 

  if (!isPuterReady || !authCheckComplete) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <span className="ml-4 text-lg">Initializing...</span>
      </div>
    );
  }

  return (
    <>
      <Head>
        <link rel="canonical" href="https://klutz.netlify.app/login" />
      </Head>
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <ScanLine className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="font-headline text-3xl">Welcome to MediScan AI</CardTitle>
          <CardDescription>Securely analyze your medical images.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          <p className="text-center text-muted-foreground">
            Please log in using your Puter account to continue.
          </p>
          <LoginButton />
        </CardContent>
      </Card>
    </div>
  );
    </>
)}    
