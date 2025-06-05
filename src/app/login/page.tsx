
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LoginButton from '@/components/auth/login-button';
import { ScanLine, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [authCheckComplete, setAuthCheckComplete] = useState(false);
  const [isPuterReady, setIsPuterReady] = useState(false);

  useEffect(() => {
    if (typeof window.puter !== 'undefined' && typeof window.puter.auth !== 'undefined') {
      setIsPuterReady(true);
    } else {
      const intervalId = setInterval(() => {
        if (typeof window.puter !== 'undefined' && typeof window.puter.auth !== 'undefined') {
          clearInterval(intervalId);
          setIsPuterReady(true);
        }
      }, 100);
      return () => clearInterval(intervalId);
    }
  }, []);

  useEffect(() => {
    if (!isPuterReady) return;

    const checkAuthAndRedirect = async () => {
      try {
        const isSignedIn = await window.puter.auth.isSignedIn();
        if (isSignedIn) {
          router.replace('/'); // Use router.replace to avoid adding to history
          // No need to setAuthCheckComplete here as redirect will happen
          return; 
        }
      } catch (error) {
        console.error("Error checking auth status on login page:", error);
        // Stay on login page if error, allow form to render
      }
      setAuthCheckComplete(true); // Only set if not redirecting
    };
    checkAuthAndRedirect();
  }, [isPuterReady, router]);

  if (!isPuterReady || !authCheckComplete) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

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
