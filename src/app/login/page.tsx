'use client';

// Removed useEffect, useState, useRouter, Loader2 as initial auth check is removed.
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LoginButton from '@/components/auth/login-button';
import { ScanLine } from 'lucide-react';

export default function LoginPage() {
  // The useEffect for checking auth status and redirecting is removed.
  // The loading state and its UI are also removed.

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
