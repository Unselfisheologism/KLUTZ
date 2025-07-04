'use client';

import { useState } from 'react';
import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string; // Although not used in the sidebar directly, keep the interface consistent
  href: string;
  isImplemented: boolean;
}

interface SidebarProps {
  features: Feature[];
}

// Determine if we are on a mobile device
const isMobileDevice = () => typeof window !== 'undefined' && window.innerWidth < 768; // Assuming 768px is your mobile breakpoint

const Sidebar: React.FC<SidebarProps> = ({ features }) => {
  const [isOpen, setIsOpen] = useState(!isMobileDevice()); // Open by default on desktop, closed on mobile

  // Effect to update sidebar state based on window size changes
  useEffect(() => {
    const handleResize = () => {
      setIsOpen(!isMobileDevice());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col border-r h-full overflow-y-auto">
        <ScrollArea className="flex-grow">
          <nav className="flex flex-col p-4 space-y-2">
            {features.map((feature) => (
              <Button
                key={feature.title}
                variant="ghost"
                className="w-full justify-start"
                asChild
              >
                <Link href={feature.href} passHref>
                  <feature.icon className="h-5 w-5 mr-2" />
                  {feature.title}
                </Link>
              </Button>
            ))}
          </nav>
        </ScrollArea>
      </div>

      {/* Mobile Sidebar (using Sheet) */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild onClick={() => setIsOpen(true)}>
            <Button variant="outline" size="icon" className="absolute top-4 left-4 z-50">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <ScrollArea className="h-full">
              <nav className="flex flex-col p-4 space-y-2 mt-12"> {/* Added margin-top to avoid overlapping the close button on Sheet */}
                {features.map((feature) => (
                  <Button
                    key={feature.title}
                    variant="ghost"
                    className="w-full justify-start"
                    asChild
                  >
                    <Link href={feature.href} passHref>
                      <feature.icon className="h-5 w-5 mr-2" />
                      {feature.title}
                    </Link>
                  </Button>
                ))}
              </nav>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

export default Sidebar;