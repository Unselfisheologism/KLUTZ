import Link from 'next/link';
import { ScanLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LoginButton from '@/components/auth/login-button';
import { ThemeToggle } from "@/components/theme-toggle";

export default function AppHeader() {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <ScanLine className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-headline font-semibold text-foreground">
            Klutz
          </h1>
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <LoginButton />
        </div>
      </div>
    </header>
  );
}