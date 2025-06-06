export interface TranslationRequest {
  inputType: 'image' | 'text';
  imageFile?: File;
  textInput?: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export interface TranslationReport {
  original_text: string;
  translated_text: string;
  source_language_detected?: string;
  target_language: string;
  translation_confidence: 'High' | 'Medium' | 'Low';
  context_notes?: string[];
  alternative_translations?: string[];
  image_description?: string; // For image input
  text_extraction_quality?: 'High' | 'Medium' | 'Low'; // For image input
  disclaimer: string;
}

export interface AITranslatorFormValues {
  inputType: 'image' | 'text';
  imageFile?: FileList;
  textInput?: string;
  sourceLanguage: string;
  targetLanguage: string;
}