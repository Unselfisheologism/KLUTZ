'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LoginButton from '@/components/auth/login-button';
import { ScanLine } from 'lucide-react';

const AUTH_KEY = 'mediscan_authenticated';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem(AUTH_KEY) === 'true') {
      router.push('/');
    }
  }, [router]);

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
            Please log in using your Puter.js account to continue.
          </p>
          <LoginButton />
          <p className="text-xs text-muted-foreground text-center px-4">
            This is a placeholder for Puter.js authentication. Clicking the button will simulate login.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
