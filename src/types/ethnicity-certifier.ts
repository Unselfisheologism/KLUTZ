
export interface EthnicityAnalysisInput {
  type: 'image' | 'text';
  imageDataUrl?: string; // For image
  textData?: string;     // For text
}

export interface EthnicityAnalysisReport {
  image_description?: string; // General description of the image (for image analysis)
  representation_summary: string;
  ethical_assessment: string;
  concerns_raised: string[];
  confidence: 'High' | 'Medium' | 'Low' | 'Not Applicable' | 'Unable to determine';
  disclaimer?: string; // Optional: To reinforce AI limitations
}

export interface EthnicityCertifierFormValues {
  inputType: 'image' | 'text';
  imageFile?: FileList;
  textInput?: string;
  textFile?: FileList;
}

