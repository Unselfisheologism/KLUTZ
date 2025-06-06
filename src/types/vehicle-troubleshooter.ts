export interface VehicleTroubleshootingReport {
  image_description: string;
  vehicle_type: string;
  identified_issues: string[];
  possible_causes: string[];
  recommended_solutions: string[];
  safety_warnings?: string[];
  maintenance_tips?: string[];
  estimated_severity: 'Minor' | 'Moderate' | 'Severe' | 'Critical';
  confidence: 'High' | 'Medium' | 'Low' | 'Not Applicable';
  disclaimer: string;
}

export interface VehicleTroubleshooterFormValues {
  imageFile: FileList;
  issueDescription: string;
  vehicleType: string;
  vehicleInfo?: string;
  additionalDetails?: string;
}