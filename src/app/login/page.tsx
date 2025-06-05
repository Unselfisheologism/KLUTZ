
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LoginButton from '@/components/auth/login-button';
import { ScanLine, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isPuterReady, setIsPuterReady] = useState(false);
  const [authCheckComplete, setAuthCheckComplete] = useState(false); // To track if the initial auth check has run

  useEffect(() => {
    // Function to check Puter SDK availability
    const checkPuterAvailability = () => {
      if (typeof window.puter !== 'undefined' && typeof window.puter.auth !== 'undefined') {
        setIsPuterReady(true);
        return true;
      }
      return false;
    };

    // Initial check
    if (checkPuterAvailability()) {
      // If Puter is ready, proceed to check auth status in the next useEffect
    } else {
      // If not ready, set an interval to check periodically
      const intervalId = setInterval(() => {
        if (checkPuterAvailability()) {
          clearInterval(intervalId);
          // setIsPuterReady(true) is called inside checkPuterAvailability
        }
      }, 100); // Check every 100ms
      return () => clearInterval(intervalId); // Cleanup interval on component unmount
    }
  }, []);

  useEffect(() => {
    if (!isPuterReady) {
      // Wait for Puter SDK to be ready
      return;
    }

    const checkAuthAndRedirect = async () => {
      try {
        const isSignedIn = await window.puter.auth.isSignedIn();
        if (isSignedIn) {
          router.replace('/'); // Redirect to main page if already signed in
        } else {
          setAuthCheckComplete(true); // Allow login form to render if not signed in
        }
      } catch (error) {
        console.error("Error checking auth status on login page:", error);
        setAuthCheckComplete(true); // Allow login form to render even on error
      }
    };

    checkAuthAndRedirect();
  }, [isPuterReady, router]); // Rerun when Puter SDK is ready or router changes

  // Show loading indicator until Puter SDK is ready AND initial auth check is complete (or decided not to redirect)
  if (!isPuterReady || !authCheckComplete) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <span className="ml-4 text-lg">Initializing...</span>
      </div>
    );
  }

  // Render login form
  return (
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
}
