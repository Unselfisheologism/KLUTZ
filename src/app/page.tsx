'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ImageUploadSection from '@/components/medi-scan/image-upload-section';
import ResultsSection from '@/components/medi-scan/results-section';
import type { GenerateMedicalReportOutput } from '@/ai/flows/generate-medical-report';
import type { SuggestNextStepsOutput } from '@/ai/flows/suggest-next-steps';
import { useToast } from "@/hooks/use-toast";

const AUTH_KEY = 'mediscan_authenticated';

export default function MediScanPage() {
  const [report, setReport] = useState<GenerateMedicalReportOutput | null>(null);
  const [nextSteps, setNextSteps] = useState<SuggestNextStepsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem(AUTH_KEY) !== 'true') {
      router.push('/login');
    }
  }, [router]);

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
    results: { report: GenerateMedicalReportOutput | null, nextSteps: SuggestNextStepsOutput | null } | null, 
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
        className: "bg-green-500 text-white dark:bg-green-600", // Custom styling for success
      });
    }
  };

  if (typeof window !== 'undefined' && localStorage.getItem(AUTH_KEY) !== 'true') {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="lg:sticky lg:top-24"> {/* Sticky upload section for large screens */}
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
