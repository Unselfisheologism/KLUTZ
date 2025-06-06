export interface MemeGenerationInput {
  description: string;
  style?: string;
  textPlacement?: string;
  additionalContext?: string;
}

export interface MemeGenerationReport {
  generated_image: string;
  prompt_used: string;
  style_applied: string;
  confidence: 'High' | 'Medium' | 'Low' | 'Not Applicable';
  disclaimer: string;
}

export interface MemeGeneratorFormValues {
  description: string;
  style?: string;
  textPlacement?: string;
  additionalContext?: string;
}