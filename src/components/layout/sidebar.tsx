'use client';

import { useState, useEffect } from 'react'; // Import useEffect
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { PanelLeft } from 'lucide-react'; // Assuming PanelLeft is the icon you want for the trigger

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

const Sidebar: React.FC<SidebarProps> = ({ features }) => {
  const [isSheetOpen, setIsSheetOpen] = useState(true); // Open by default


  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed top-4 left-4 z-50">
          <PanelLeft className="h-6 w-6" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0 flex flex-col"> {/* This line would have been changed */}
        <ScrollArea className="flex-grow mt-12 md:mt-0"> {/* Added margin-top for mobile */}
          <nav className="flex flex-col p-4 space-y-2">
            {features.map((feature) => (
              <Button
                key={feature.title}
                variant="ghost"
                className="w-full justify-start"
                asChild
                onClick={() => setIsSheetOpen(false)} // Close sheet on link click
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
  );
};

export default Sidebar;
