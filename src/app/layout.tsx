
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import AppHeader from '@/components/layout/app-header';

export const metadata: Metadata = {
  title: 'MediScan AI',
  description: 'AI-powered medical image analysis',
  icons: {
    icon: 'https://res.cloudinary.com/ddz3nsnq1/image/upload/v1749123324/Image_fx__7_-removebg-preview_bxjg0s.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap" rel="stylesheet" />
        <script src="https://js.puter.com/v2/"></script>
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col">
        <AppHeader />
        <main className="flex-grow">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
