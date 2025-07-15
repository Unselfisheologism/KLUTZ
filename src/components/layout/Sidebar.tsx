import React from 'react';
import Link from 'next/link';
import { XIcon } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <div
      className={`fixed inset-y-0 left-0 w-64 bg-card/80 backdrop-blur-sm text-foreground transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } z-50 rounded-r-lg`}
    >
      <div className="flex justify-end p-4">
        <button onClick={onClose} className="text-foreground">
          <XIcon className="h-6 w-6" />
        </button>
      </div>
      <nav className="flex flex-col p-4 space-y-2">
        <Link href="/free-tools" className="text-foreground hover:text-muted-foreground" onClick={onClose}>
          Free Tools
        </Link>
        <Link href="/blog" className="text-foreground hover:text-muted-foreground" onClick={onClose}>
          Blog
        </Link>
        <Link href="/use-cases" className="text-foreground hover:text-muted-foreground" onClick={onClose}>
          Use Cases
        </Link>
        <Link href="/pricing" className="text-foreground hover:text-muted-foreground" onClick={onClose}>
          Pricing
        </Link>
        <Link href="/faq" className="text-foreground hover:text-muted-foreground" onClick={onClose}>
          FAQ
        </Link>
        <Link href="/support" className="text-foreground hover:text-muted-foreground" onClick={onClose}>
          Support
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;