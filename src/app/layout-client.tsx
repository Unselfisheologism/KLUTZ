'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import LoginButton from '@/components/auth/login-button';
import { ThemeToggle } from "@/components/theme-toggle";
import { User, MenuIcon } from 'lucide-react';
import Sidebar from "@/components/layout/Sidebar";
import { useState } from 'react';

export default function LayoutClient({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return (
    <>
      
      <main className="flex-grow">
          {children}
      </main>

    </>
  );
}
