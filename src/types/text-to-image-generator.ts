export interface TextToImageGenerationInput {
  description: string;
  style?: string;
  aspectRatio?: string;
  additionalContext?: string;
}

export interface ImageAnalysisResult {
  dalle_prompt: string;
}

export interface TextToImageGenerationReport {
  generated_image: string;
  prompt_used: string;
  style_applied: string;
  confidence: 'High' | 'Medium' | 'Low' | 'Not Applicable';
  disclaimer: string;
}

export interface TextToImageGeneratorFormValues {
  description: string;
  style?: string;
  aspectRatio?: string;
  additionalContext?: string;
}