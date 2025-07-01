export type MedicalImageType = 'x-ray' | 'mri' | 'ct scan' | 'ultrasound' | 'other';

export interface MedicalImageAnalysisRequest {
  image: string; // Base64 encoded image
  imageType: MedicalImageType;
  additionalInfo?: string;
}

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

export interface MedicalImageAnalysisResponse {
  abnormalities: string;
  diagnosis: string;
  nextSteps: string;
}
