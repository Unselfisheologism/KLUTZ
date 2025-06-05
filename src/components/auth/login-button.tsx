'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, UserCircle, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export default function LoginButton() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const checkPuterReadyAndAuth = async () => {
      if (typeof window.puter === 'undefined') {
        // Wait for puter to be defined
        const intervalId = setInterval(async () => {
          if (typeof window.puter !== 'undefined') {
            clearInterval(intervalId);
            await updateAuthState();
          }
        }, 100);
        return () => clearInterval(intervalId);
      } else {
        await updateAuthState();
      }
    };
    checkPuterReadyAndAuth();
  }, []);

  const updateAuthState = async () => {
    setIsLoading(true);
    try {
      const authStatus = await window.puter.auth.isSignedIn();
      setIsAuthenticated(authStatus);
    } catch (error) {
      console.error("Error checking Puter auth status:", error);
      setIsAuthenticated(false); // Assume not authenticated on error
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "Could not verify login status with Puter.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (typeof window.puter === 'undefined') {
      toast({ variant: "destructive", title: "Error", description: "Puter.js SDK not loaded." });
      return;
    }
    setIsLoading(true);
    try {
      await window.puter.auth.signIn();
      setIsAuthenticated(true);
      toast({ title: "Login Successful", description: "Welcome to MediScan AI!" });
      router.push('/');
      router.refresh(); // Ensure page re-renders with new auth state
    } catch (error) {
      console.error("Puter login error:", error);
      setIsAuthenticated(false);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Puter.js login was unsuccessful or cancelled.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (typeof window.puter === 'undefined') {
      toast({ variant: "destructive", title: "Error", description: "Puter.js SDK not loaded." });
      return;
    }
    setIsLoading(true);
    try {
      await window.puter.auth.signOut();
      setIsAuthenticated(false);
      toast({ title: "Logout Successful", description: "You have been logged out." });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error("Puter logout error:", error);
       toast({
        variant: "destructive",
        title: "Logout Failed",
        description: "Could not log out from Puter.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Button variant="ghost" size="icon" disabled><Loader2 className="animate-spin" /></Button>;
  }

  if (isAuthenticated) {
    return (
      <Button variant="outline" onClick={handleLogout}>
        <LogOut className="mr-2 h-4 w-4" /> Logout
      </Button>
    );
  }

  return (
    <Button onClick={handleLogin}>
      <LogIn className="mr-2 h-4 w-4" /> Login with Puter
    </Button>
  );
}
