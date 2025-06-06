export interface MeasurementRequest {
  imageFile: File;
  metricSystem: 'metric' | 'imperial';
  measurementTarget: string;
  additionalContext?: string;
}

export interface MeasurementReport {
  image_description: string;
  measurements: {
    target: string;
    value: number;
    unit: string;
    confidence: number;
  }[];
  visual_reference_points: string[];
  confidence: 'High' | 'Medium' | 'Low' | 'Not Applicable';
  limitations: string[];
  disclaimer: string;
}

export interface MeasuringToolFormValues {
  imageFile: FileList;
  metricSystem: string;
  measurementTarget: string;
  additionalContext?: string;
}