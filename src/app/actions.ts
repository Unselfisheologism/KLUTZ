'use server';

import { generateMedicalReport, GenerateMedicalReportInput, GenerateMedicalReportOutput } from '@/ai/flows/generate-medical-report';
import { suggestNextSteps, SuggestNextStepsInput, SuggestNextStepsOutput } from '@/ai/flows/suggest-next-steps';

interface AnalysisResult {
  report: GenerateMedicalReportOutput | null;
  nextSteps: SuggestNextStepsOutput | null;
  error?: string;
}

export async function handleImageAnalysis(
  imageDataUri: string,
  modality: string,
  patientDetails?: string
): Promise<AnalysisResult> {
  try {
    const reportInput: GenerateMedicalReportInput = {
      imageDataUri,
      modality,
      patientDetails: patientDetails || "Not provided",
    };

    const report = await generateMedicalReport(reportInput);

    if (!report || !report.findings) {
      return { report: null, nextSteps: null, error: 'Failed to generate medical report or report is incomplete.' };
    }

    const nextStepsInput: SuggestNextStepsInput = {
      imageAnalysis: `Modality: ${modality}. Patient Details: ${patientDetails || "Not provided"}.`, // Simplified imageAnalysis for next steps
      findings: report.findings,
    };
    const nextSteps = await suggestNextSteps(nextStepsInput);

    return { report, nextSteps };

  } catch (error) {
    console.error("Error in handleImageAnalysis:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during AI analysis.";
    return { report: null, nextSteps: null, error: errorMessage };
  }
}
