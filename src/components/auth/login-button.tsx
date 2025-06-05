
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation'; // Import useRouter

export default function LoginButton() {
  const [isPuterReady, setIsPuterReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // For initial auth check
  const [isActionLoading, setIsActionLoading] = useState(false); // For login/logout process
  const { toast } = useToast();
  const router = useRouter(); // Initialize useRouter

  useEffect(() => {
    const checkPuterAvailability = () => {
      if (typeof window.puter !== 'undefined' && typeof window.puter.auth !== 'undefined') {
        setIsPuterReady(true);
        return true;
      }
      return false;
    };

    if (checkPuterAvailability()) {
      updateAuthState();
    } else {
      const intervalId = setInterval(() => {
        if (checkPuterAvailability()) {
          clearInterval(intervalId);
          // updateAuthState will be called via the isPuterReady useEffect
        }
      }, 100);
      return () => clearInterval(intervalId);
    }
  }, []);

  useEffect(() => {
    if (isPuterReady) {
      updateAuthState();
    }
  }, [isPuterReady]);

  const updateAuthState = async () => {
    if (!isPuterReady) {
      setIsLoading(true); // Not ready, so still "loading" auth state
      return;
    }
    setIsLoading(true);
    try {
      const authStatus = await window.puter.auth.isSignedIn();
      setIsAuthenticated(authStatus);
    } catch (error) {
      console.error("Error checking Puter auth status:", error);
      setIsAuthenticated(false);
      // Don't toast here, as it can be annoying on every load if Puter is temporarily unavailable
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!isPuterReady) {
      toast({ variant: "destructive", title: "Error", description: "Puter SDK not ready. Please try again in a moment." });
      return;
    }
    setIsActionLoading(true);
    try {
      await window.puter.auth.signIn();
      // Crucially, re-check auth status directly from Puter after signIn completes
      const newAuthStatus = await window.puter.auth.isSignedIn();
      setIsAuthenticated(newAuthStatus); // Update internal state

      if (newAuthStatus) {
        toast({ title: "Login Successful", description: "Welcome to MediScan AI!" });
        if (window.location.pathname === '/login') {
          router.replace('/'); // Use router.replace for better history management
        }
      } else {
        // This case means signIn resolved, but user is still not signed in (e.g., popup closed early)
        toast({
            variant: "default",
            title: "Login Incomplete",
            description: "Puter login process was not completed or was cancelled.",
        });
      }
    } catch (error) {
      console.error("Puter login error:", error);
      setIsAuthenticated(false); // Ensure state reflects failure
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Puter login was unsuccessful or cancelled. Please try again.",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!isPuterReady) {
      toast({ variant: "destructive", title: "Error", description: "Puter SDK not ready. Please try again in a moment." });
      return;
    }
    setIsActionLoading(true);
    try {
      await window.puter.auth.signOut();
      setIsAuthenticated(false); // Update internal state
      toast({ title: "Logout Successful", description: "You have been logged out." });
      if (window.location.pathname !== '/login') {
        router.replace('/login'); // Use router.replace
      }
    } catch (error) {
      console.error("Puter logout error:", error);
       toast({
        variant: "destructive",
        title: "Logout Failed",
        description: "Could not log out from Puter.",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  if (!isPuterReady || isLoading) { // Show loading if Puter not ready OR initial auth check is happening
    return <Button variant="outline" size="default" disabled><Loader2 className="animate-spin h-4 w-4 mr-2" />Loading Auth...</Button>;
  }

  if (isAuthenticated) {
    return (
      <Button variant="outline" onClick={handleLogout} disabled={isActionLoading}>
        {isActionLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <LogOut className="mr-2 h-4 w-4" />}
         Logout
      </Button>
    );
  }

  return (
    <Button onClick={handleLogin} disabled={isActionLoading}>
      {isActionLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <LogIn className="mr-2 h-4 w-4" />}
      Login with Puter
    </Button>
  );
}
