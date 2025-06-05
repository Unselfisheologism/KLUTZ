
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ImageUploadSection from '@/components/medi-scan/image-upload-section';
import ResultsSection from '@/components/medi-scan/results-section';
import type { MedicalReport, NextSteps, AnalysisResult } from '@/types/mediscan';
import { useToast } from "@/hooks/use-toast";
// Loader2 is removed as authLoading is removed. It might be needed if other loading states are introduced.

export default function MediScanPage() {
  const [report, setReport] = useState<MedicalReport | null>(null);
  const [nextSteps, setNextSteps] = useState<NextSteps | null>(null);
  const [isLoading, setIsLoading] = useState(false); // This is for AI analysis loading
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter(); // Keep router if other navigation is needed

  // Removed useEffect for initial auth check.
  // Authentication will be handled by ImageUploadSection or LoginButton.

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
  
  // Removed authLoading condition and its UI. Page renders directly.
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="lg:sticky lg:top-24">
          <ImageUploadSection 
            onAnalysisStart={handleAnalysisStart}
            onAnalysisComplete={handleAnalysisComplete}
            isLoading={isLoading} // This isLoading is for the AI analysis
          />
        </div>
        <ResultsSection 
          report={report} 
          nextSteps={nextSteps} 
          isLoading={isLoading} // This isLoading is for the AI analysis
          error={error} 
        />
      </div>
    </div>
  );
}
