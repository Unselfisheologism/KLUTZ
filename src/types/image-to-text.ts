export interface ImageToTextRequest {
  imageFile: File;
  analysisType?: 'basic' | 'detailed';
  language?: string;
}

export interface ExtractedText {
  content: string;
  confidence: number;
  location?: string;
  formatting?: string;
}

export interface ImageToTextReport {
  image_description: string;
  extracted_text: string;
  text_analysis: {
    word_count: number;
    character_count: number;
    language_detected?: string;
    text_quality: 'High' | 'Medium' | 'Low';
    formatting_notes: string[];
  };
  text_segments?: ExtractedText[];
  confidence: 'High' | 'Medium' | 'Low' | 'Not Applicable';
  limitations: string[];
  disclaimer: string;
}

export interface ImageToTextFormValues {
  imageFile: FileList;
  analysisType?: string;
  language?: string;
}