
import MedicalReportCard from './medical-report-card';
import NextStepsCard from './next-steps-card';
import { AlertCircle, CheckCircle2, Info, Download } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent } from '@/components/ui/card'; 
import type { MedicalReport, NextSteps } from '@/types/mediscan';
import { downloadTextFile } from '@/lib/utils';

interface ResultsSectionProps {
  report: MedicalReport | null;
  nextSteps: NextSteps | null;
  isLoading: boolean;
  error?: string | null;
}

export default function ResultsSection({ report, nextSteps, isLoading, error }: ResultsSectionProps) {
  const handleDownloadReport = () => {
    if (!report && !nextSteps) return;

    let reportContent = "KLUTZ MediScan AI Report\n";
    reportContent += "=========================\n\n";
    
    if (report) {
      reportContent += "AI Medical Report:\n";
      reportContent += "-----------------\n";
      reportContent += `Findings:\n${report.findings || "N/A"}\n\n`;
      reportContent += `Possible Diagnoses:\n${report.possibleDiagnoses && report.possibleDiagnoses.length > 0 ? report.possibleDiagnoses.map(d => `- ${d}`).join("\n") : "N/A"}\n\n`;
      reportContent += `Recommendations:\n${report.recommendations || "N/A"}\n\n`;
    }

    if (nextSteps) {
      reportContent += "Actionable Next Steps:\n";
      reportContent += "----------------------\n";
      const formattedSteps = (nextSteps.nextSteps || "N/A")
        .split('\n')
        .map(step => step.trim())
        .filter(step => step.length > 0)
        .map(step => `- ${step.replace(/^[-*]\s*/, '').replace(/^\d+\.\s*/, '')}`)
        .join("\n");
      reportContent += `${formattedSteps}\n\n`;
    }
    
    reportContent += "\nDisclaimer: This report is AI-generated and for informational purposes only. It is not a substitute for professional medical advice. Consult with a qualified healthcare provider for any health concerns or before making any decisions related to your health or treatment.";

    const timestamp = new Date().toISOString().replace(/[:.-]/g, '').slice(0, 14);
    downloadTextFile(reportContent, `KLUTZ_MediScan_Report_${timestamp}.txt`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="shadow-xl">
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
         <Card className="shadow-xl">
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="shadow-lg">
        <AlertCircle className="h-5 w-5" />
        <AlertTitle className="font-headline">Analysis Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!report && !nextSteps && !isLoading && !error) {
     return (
      <Alert className="shadow-md bg-card">
        <Info className="h-5 w-5 text-primary" />
        <AlertTitle className="font-headline text-primary">Ready for Analysis</AlertTitle>
        <AlertDescription>
          Upload a medical image and provide details to start the AI analysis. Results will appear here.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-8">
      {report && <MedicalReportCard report={report} />}
      {nextSteps && <NextStepsCard nextSteps={nextSteps} />}
      {(report || nextSteps) && (
        <Button onClick={handleDownloadReport} variant="outline" className="w-full mt-4">
          <Download className="mr-2 h-4 w-4" />
          Download Full Report
        </Button>
      )}
      {report && nextSteps && (
         <Alert variant="default" className="bg-green-50 border-green-300 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300 shadow-md">
          <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-400" />
          <AlertTitle className="font-headline text-green-600 dark:text-green-300">Analysis Complete</AlertTitle>
          <AlertDescription>
            The AI analysis has finished. Review the report and suggested next steps.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
