export interface MedicalReport {
  findings: string;
  possibleDiagnoses: string[];
  recommendations: string;
}

export interface NextSteps {
  nextSteps: string;
}

export interface AnalysisResult {
  report: MedicalReport | null;
  nextSteps: NextSteps | null;
  error?: string;
}
