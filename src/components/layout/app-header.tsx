import Link from 'next/link';
import { ScanLine, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LoginButton from '@/components/auth/login-button';
import { ThemeToggle } from "@/components/theme-toggle";

export default function AppHeader() {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
        <Link href="/" className="flex items-center gap-2">
          <img
            src="https://res.cloudinary.com/ddz3nsnq1/image/upload/v1751201919/Untitled_design_3_d8m11k.png"
            alt="Klutz Logo"
            className="h-8 w-8 rounded-lg"
          />
          <h1 className="text-2xl font-headline font-semibold text-foreground">
            Klutz
          </h1>
        </Link>
        <div className="flex items-center gap-2 sm:gap-4 flex-row-reverse sm:flex-row ml-auto">
          <ThemeToggle />
          <Button variant="ghost" size="icon" asChild>
            <Link href="https://puter.com">
              <User className="h-5 w-5" />
              <span className="sr-only">Account</span>
            </Link>
          </Button>
          <LoginButton />
        </div>
      </div>
    </header>
  );
}