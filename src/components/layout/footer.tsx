import Link from 'next/link';
import React from 'react';
import { Shield, Eye, Cookie, HelpCircle, Package, Mail } from 'lucide-react';
import { FaXTwitter, FaLinkedin, FaDiscord, FaGithub } from 'react-icons/fa6';

export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-20 w-full bg-gradient-to-t from-black via-black/70 to-transparent text-white py-4 px-8">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center md:items-start text-center md:text-left">
        {/* Left side links */}
        <div className="flex flex-wrap justify-center md:justify-start space-x-4 mb-2 md:mb-0">
          <Link href="/terms-of-service" className="text-muted-foreground hover:text-primary transition-colors flex items-center md:space-x-2">
            <Shield className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Terms</span>
          </Link>
          <Link href="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors flex items-center md:space-x-2">
            <Eye className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Privacy</span>
          </Link>
          <Link href="/cookies" className="text-muted-foreground hover:text-primary transition-colors flex items-center md:space-x-2">
            <Cookie className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Cookies</span>
          </Link>
          <Link href="/faq" className="text-muted-foreground hover:text-primary transition-colors flex items-center md:space-x-2">
            <HelpCircle className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">FAQ</span>
          </Link>
          <Link href="/third-party-licenses" className="text-muted-foreground hover:text-primary transition-colors flex items-center md:space-x-2">
            <Package className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Licenses</span>
          </Link>
          <Mail className="text-muted-foreground hover:text-primary transition-colors flex items-center md:space-x-2" />
          <a href="mailto:jeffrinjames99@gmail.com" className="h-4 w-4 mr-2">
            jeffrinjames99@gmail.com
          </a>

        </div>

        {/* Right side text/links */}
        <div className="flex flex-col md:flex-row items-center text-sm">
          <Link href="https://onee.page/jeffrin" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
            Created by Jeffrin
          </Link>
          <div className="flex flex-wrap justify-center space-x-4 ml-4 items-center">
            <Link href="https://www.linkedin.com/in/jeffrin" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <FaLinkedin className="h-5 w-5" />
            </Link>
            <Link href="https://x.com/jeff9james" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <FaXTwitter className="h-5 w-5" />
            </Link>
            <Link href="https://github.com/Unselfisheologism" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <FaGithub className="h-5 w-5" />
            </Link>
            <Link href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <FaDiscord className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}