'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Loader2 } from 'lucide-react'; // UserCircle removed
import { useToast } from "@/hooks/use-toast";

export default function LoginButton() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // True initially for the auth status check
  const [isActionLoading, setIsActionLoading] = useState(false); // For login/logout actions
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const checkPuterReadyAndAuth = async () => {
      setIsLoading(true); // Start loading for initial auth check
      if (typeof window.puter === 'undefined') {
        const intervalId = setInterval(async () => {
          if (typeof window.puter !== 'undefined') {
            clearInterval(intervalId);
            await updateAuthState();
          }
        }, 100);
        // Cleanup interval if component unmounts before puter is ready
        return () => clearInterval(intervalId);
      } else {
        await updateAuthState();
      }
    };
    checkPuterReadyAndAuth();
  }, []);

  const updateAuthState = async () => {
    try {
      const authStatus = await window.puter.auth.isSignedIn();
      setIsAuthenticated(authStatus);
    } catch (error) {
      console.error("Error checking Puter auth status:", error);
      setIsAuthenticated(false); 
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "Could not verify login status with Puter.",
      });
    } finally {
      setIsLoading(false); // Finish loading for initial auth check
    }
  };

  const handleLogin = async () => {
    if (typeof window.puter === 'undefined') {
      toast({ variant: "destructive", title: "Error", description: "Puter.js SDK not loaded." });
      return;
    }
    setIsActionLoading(true); // Start loading for login action
    try {
      await window.puter.auth.signIn();
      const newAuthStatus = await window.puter.auth.isSignedIn();
      setIsAuthenticated(newAuthStatus);
      if (newAuthStatus) {
        toast({ title: "Login Successful", description: "Welcome to MediScan AI!" });
        router.push('/');
        router.refresh();
      } else {
        // This case might happen if user closes Puter's dialog without signing in
        toast({
            variant: "default", // Not necessarily an error
            title: "Login Incomplete",
            description: "Puter login process was not completed.",
        });
      }
    } catch (error) {
      console.error("Puter login error:", error);
      setIsAuthenticated(false);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Puter.js login was unsuccessful or cancelled.",
      });
    } finally {
      setIsActionLoading(false); // Finish loading for login action
    }
  };

  const handleLogout = async () => {
    if (typeof window.puter === 'undefined') {
      toast({ variant: "destructive", title: "Error", description: "Puter.js SDK not loaded." });
      return;
    }
    setIsActionLoading(true); // Start loading for logout action
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
      setIsActionLoading(false); // Finish loading for logout action
    }
  };

  if (isLoading) { // This is for the initial auth check to show the correct button
    return <Button variant="outline" size="default" disabled><Loader2 className="animate-spin h-4 w-4 mr-2" />Loading...</Button>;
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
