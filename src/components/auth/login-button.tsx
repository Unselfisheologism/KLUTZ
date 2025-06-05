
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export default function LoginButton() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); 
  const [isActionLoading, setIsActionLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkPuterReadyAndAuth = async () => {
      if (typeof window.puter === 'undefined') {
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
    setIsLoading(true); // Ensure loading state while checking
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
      setIsLoading(false); 
    }
  };

  const handleLogin = async () => {
    if (typeof window.puter === 'undefined') {
      toast({ variant: "destructive", title: "Error", description: "Puter.js SDK not loaded." });
      return;
    }
    setIsActionLoading(true);
    try {
      await window.puter.auth.signIn();
      const newAuthStatus = await window.puter.auth.isSignedIn();
      setIsAuthenticated(newAuthStatus);
      if (newAuthStatus) {
        toast({ title: "Login Successful", description: "Welcome to MediScan AI!" });
        // Only redirect if currently on the login page.
        if (window.location.pathname === '/login') {
          window.location.assign('/');
        }
      } else {
        toast({
            variant: "default",
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
      setIsActionLoading(false);
    }
  };

  const handleLogout = async () => {
    if (typeof window.puter === 'undefined') {
      toast({ variant: "destructive", title: "Error", description: "Puter.js SDK not loaded." });
      return;
    }
    setIsActionLoading(true);
    try {
      await window.puter.auth.signOut();
      setIsAuthenticated(false);
      toast({ title: "Logout Successful", description: "You have been logged out." });
      // If on any page other than /login, redirect to /login after logout.
      // If already on /login, no redirect needed.
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
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

  if (isLoading) {
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
