
export interface ThumbnailAnalysisResponse {
  summary: string;
  // Potentially add keywords, dominant_colors etc. in future
}

export interface TitleAnalysisResponse {
  summary: string;
  // Potentially add sentiment, keywords etc. in future
}

export interface ConsistencyReport {
  is_consistent: boolean;
  explanation: string;
  confidence_score: number; // 0.0 to 1.0
}

export interface ThumbnailCheckerFormValues {
  thumbnailImage: FileList;
  titleText: string;
  titleFile?: FileList;
}
