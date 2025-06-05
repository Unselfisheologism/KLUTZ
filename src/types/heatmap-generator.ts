
export interface ImageAttentionArea {
  area_description: string; // e.g., "The main subject's face", "Top-left logo"
  reason: string;         // Why it attracts attention
  attention_level: 'high' | 'medium' | 'low';
  location_hint?: 'center' | 'top-center' | 'bottom-center' | 'left-center' | 'right-center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | string; // string for more general AI descriptions
}

export interface ImageHeatmapReport {
  image_description: string; // General description of the image content
  high_attention_areas: ImageAttentionArea[];
  low_attention_areas: ImageAttentionArea[];
  confidence: 'High' | 'Medium' | 'Low' | 'Not Applicable';
  disclaimer: string;
}

export interface TextSegmentEngagement {
  segment: string;
  engagement_level: 'high' | 'medium' | 'low' | 'neutral';
  reason?: string; // Optional: why this engagement level
}

export interface TextHeatmapReport {
  overall_summary: string;
  segments: TextSegmentEngagement[];
  confidence: 'High' | 'Medium' | 'Low' | 'Not Applicable';
  disclaimer: string;
}

export interface HeatmapGeneratorFormValues {
  inputType: 'image' | 'text';
  imageFile?: FileList;
  textInput?: string;
  textFile?: FileList;
}
