export interface ApplianceTroubleshootingReport {
  image_description: string;
  device_type: string;
  identified_issues: string[];
  possible_causes: string[];
  recommended_solutions: string[];
  safety_warnings?: string[];
  confidence: 'High' | 'Medium' | 'Low' | 'Not Applicable';
  disclaimer: string;
}

export interface ApplianceTroubleshooterFormValues {
  imageFile: FileList;
  issueDescription: string;
  deviceType: string;
  additionalDetails?: string;
}