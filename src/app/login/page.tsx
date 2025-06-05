'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LoginButton from '@/components/auth/login-button';
import { ScanLine, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ensure puter.js is loaded
    if (typeof window.puter === 'undefined') {
      // Optional: add a small delay or a listener for puter.js load event
      const checkPuterInterval = setInterval(() => {
        if (typeof window.puter !== 'undefined') {
          clearInterval(checkPuterInterval);
          checkAuthStatus();
        }
      }, 100);
      return () => clearInterval(checkPuterInterval);
    } else {
      checkAuthStatus();
    }
  }, [router]);

  const checkAuthStatus = async () => {
    try {
      const signedIn = await window.puter.auth.isSignedIn();
      if (signedIn) {
        router.push('/');
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("Error checking Puter auth status:", error);
      // Stay on login page, allow manual login
      setLoading(false);
    }
  };

  if (loading) {
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
