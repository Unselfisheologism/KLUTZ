import Link from 'next/link';
import { ScanLine, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LoginButton from '@/components/auth/login-button';
import { ThemeToggle } from "@/components/theme-toggle";

export default function AppHeader() {
  return (
    <header className="w-full mt-4 px-4 sm:px-6 lg:px-8">
      <div className="bg-card/80 backdrop-blur-sm rounded-b-lg border-b border-border w-full h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between w-full">
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
          <div className="flex items-center gap-4">
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
      </div>
    </header>
  );
}