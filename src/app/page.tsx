'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ImageUploadSection from '@/components/medi-scan/image-upload-section';
import ResultsSection from '@/components/medi-scan/results-section';
import type { MedicalReport, NextSteps, AnalysisResult } from '@/types/mediscan';
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';


export default function MediScanPage() {
  const [report, setReport] = useState<MedicalReport | null>(null);
  const [nextSteps, setNextSteps] = useState<NextSteps | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      if (typeof window.puter === 'undefined') {
        const intervalId = setInterval(async () => {
          if (typeof window.puter !== 'undefined') {
            clearInterval(intervalId);
            await verifyAuth();
          }
        }, 100);
        return () => clearInterval(intervalId);
      } else {
        await verifyAuth();
      }
    };
    checkAuth();
  }, [router]);

  const verifyAuth = async () => {
    try {
      const signedIn = await window.puter.auth.isSignedIn();
      if (!signedIn) {
        router.push('/login');
      } else {
        setAuthLoading(false);
      }
    } catch (e) {
      console.error("Error checking auth status on page load:", e);
      router.push('/login'); // Redirect on error
    }
  };

  const handleAnalysisStart = () => {
    setIsLoading(true);
    setError(null);
    setReport(null);
    setNextSteps(null);
    toast({
      title: "Analysis Started",
      description: "The AI is processing your image. This may take a moment.",
    });
  };

  const handleAnalysisComplete = (
    results: AnalysisResult | null, 
    errorMessage?: string
  ) => {
    setIsLoading(false);
    if (errorMessage) {
      setError(errorMessage);
      setReport(null);
      setNextSteps(null);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: errorMessage,
      });
    } else if (results) {
      setReport(results.report);
      setNextSteps(results.nextSteps);
      setError(null);
       toast({
        variant: "default",
        title: "Analysis Successful",
        description: "Medical report and next steps are ready.",
        className: "bg-green-500 text-white dark:bg-green-600",
      });
    }
  };
  
  if (authLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Verifying authentication...</p>
      </div>
    );
  }


  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="lg:sticky lg:top-24">
          <ImageUploadSection 
            onAnalysisStart={handleAnalysisStart}
            onAnalysisComplete={handleAnalysisComplete}
            isLoading={isLoading}
          />
        </div>
        <ResultsSection 
          report={report} 
          nextSteps={nextSteps} 
          isLoading={isLoading} 
          error={error} 
        />
      </div>
    </div>
  );
}
