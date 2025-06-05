
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';

export default function LoginButton() {
  const [isPuterReady, setIsPuterReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); 
  const [isActionLoading, setIsActionLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    console.log("[LoginButton] useEffect for Puter availability check triggered.");
    const checkPuterAvailability = () => {
      if (typeof window.puter !== 'undefined' && typeof window.puter.auth !== 'undefined') {
        console.log("[LoginButton] Puter SDK is available.");
        setIsPuterReady(true);
        return true;
      }
      console.log("[LoginButton] Puter SDK not yet available.");
      return false;
    };

    if (checkPuterAvailability()) {
      // updateAuthState will be called via the isPuterReady useEffect
    } else {
      const intervalId = setInterval(() => {
        console.log("[LoginButton] Interval: Checking Puter SDK availability...");
        if (checkPuterAvailability()) {
          clearInterval(intervalId);
        }
      }, 100);
      return () => {
        console.log("[LoginButton] Cleanup: Clearing Puter availability check interval.");
        clearInterval(intervalId);
      };
    }
  }, []);

  useEffect(() => {
    if (isPuterReady) {
      console.log("[LoginButton] Puter SDK is ready, calling updateAuthState.");
      updateAuthState();
    } else {
      console.log("[LoginButton] isPuterReady useEffect: Puter SDK not ready yet.");
    }
  }, [isPuterReady]);

  const updateAuthState = async () => {
    if (!isPuterReady) {
      console.log("[LoginButton] updateAuthState: Aborted, Puter SDK not ready.");
      setIsLoading(true); 
      return;
    }
    console.log("[LoginButton] updateAuthState: Starting auth status check.");
    setIsLoading(true);
    try {
      const authStatus = await window.puter.auth.isSignedIn();
      console.log("[LoginButton] updateAuthState: Puter isSignedIn() returned:", authStatus);
      setIsAuthenticated(authStatus);
    } catch (error) {
      console.error("[LoginButton] updateAuthState: Error checking Puter auth status:", error);
      setIsAuthenticated(false);
    } finally {
      console.log("[LoginButton] updateAuthState: Finished. isLoading set to false.");
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!isPuterReady) {
      console.warn("[LoginButton] handleLogin: Aborted, Puter SDK not ready.");
      toast({ variant: "destructive", title: "Error", description: "Puter SDK not ready. Please try again in a moment." });
      return;
    }
    console.log("[LoginButton] handleLogin: Attempting Puter sign-in...");
    setIsActionLoading(true);
    try {
      const signInResult = await window.puter.auth.signIn(); 
      console.log("[LoginButton] handleLogin: Puter signIn() call resolved. Result:", signInResult);

      const newAuthStatus = await window.puter.auth.isSignedIn();
      console.log("[LoginButton] handleLogin: Auth status after signIn and explicit check:", newAuthStatus);
      setIsAuthenticated(newAuthStatus);

      if (newAuthStatus) {
        toast({ title: "Login Successful", description: "Welcome to MediScan AI!" });
        if (window.location.pathname === '/login') {
          console.log("[LoginButton] handleLogin: Redirecting from /login to /");
          router.replace('/');
        }
      } else {
        console.warn("[LoginButton] handleLogin: Login process did not result in authenticated state.");
        toast({
            variant: "default",
            title: "Login Incomplete",
            description: "Puter login process was not completed or was cancelled.",
        });
      }
    } catch (error) {
      console.error("[LoginButton] handleLogin: Puter login error caught:", error);
      setIsAuthenticated(false);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Puter login was unsuccessful or cancelled. Please try again.",
      });
    } finally {
      console.log("[LoginButton] handleLogin: Login action finished.");
      setIsActionLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!isPuterReady) {
      console.warn("[LoginButton] handleLogout: Aborted, Puter SDK not ready.");
      toast({ variant: "destructive", title: "Error", description: "Puter SDK not ready. Please try again in a moment." });
      return;
    }
    console.log("[LoginButton] handleLogout: Attempting Puter sign-out...");
    setIsActionLoading(true);
    try {
      await window.puter.auth.signOut();
      console.log("[LoginButton] handleLogout: Puter signOut() successful.");
      setIsAuthenticated(false);
      toast({ title: "Logout Successful", description: "You have been logged out." });
      if (window.location.pathname !== '/login') {
        console.log("[LoginButton] handleLogout: Redirecting to /login.");
        router.replace('/login');
      }
    } catch (error) {
      console.error("[LoginButton] handleLogout: Puter logout error:", error);
       toast({
        variant: "destructive",
        title: "Logout Failed",
        description: "Could not log out from Puter.",
      });
    } finally {
      console.log("[LoginButton] handleLogout: Logout action finished.");
      setIsActionLoading(false);
    }
  };

  if (!isPuterReady || isLoading) {
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
