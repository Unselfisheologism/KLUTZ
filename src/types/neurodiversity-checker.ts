
export interface NeurodiversityAnalysisInput {
  type: 'image' | 'text';
  imageDataUrl?: string; // For image
  textData?: string;     // For text
}

export interface NeurodiversityAnalysisReport {
  image_description?: string; // General description of the image (for image analysis)
  neurodiversity_friendliness_assessment: string; // e.g., "Appears generally neurodiversity-friendly", "Potential areas for improvement", "Significant concerns"
  positive_aspects: string[]; // Elements identified as good for neurodiversity
  areas_for_improvement: string[]; // Specific suggestions or identified issues
  confidence: 'High' | 'Medium' | 'Low' | 'Not Applicable' | 'Unable to determine';
  disclaimer?: string; // Standard AI limitations disclaimer
}

export interface NeurodiversityCheckerFormValues {
  inputType: 'image' | 'text';
  imageFile?: FileList;
  textInput?: string;
  textFile?: FileList;
}
