'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, UserCircle } from 'lucide-react';

const AUTH_KEY = 'mediscan_authenticated';

export default function LoginButton() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const authStatus = localStorage.getItem(AUTH_KEY) === 'true';
    setIsAuthenticated(authStatus);
  }, []);

  const handleLogin = () => {
    // Placeholder for Puter.js login flow
    localStorage.setItem(AUTH_KEY, 'true');
    setIsAuthenticated(true);
    router.push('/'); // Redirect to home or dashboard after login
  };

  const handleLogout = () => {
    // Placeholder for Puter.js logout flow
    localStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
    router.push('/login'); // Redirect to login page after logout
  };

  if (typeof window === 'undefined') {
    return <Button variant="ghost" size="icon" disabled><UserCircle /></Button>;
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
      <LogIn className="mr-2 h-4 w-4" /> Login with Puter.js
    </Button>
  );
}
