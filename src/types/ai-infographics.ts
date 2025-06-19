export interface InfographicData {
  type: 'pie' | 'bar' | 'line' | 'area' | 'scatter' | 'tree' | 'heatmap' | 'custom';
  title: string;
  description?: string;
  data: any; // This will be chart-specific data
  config?: any; // Chart configuration options
  svgContent?: string; // For custom SVG-based visualizations
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface AIInfographicsRequest {
  prompt: string;
  chartType?: string;
  data?: any;
  contextData?: any;
  imageData?: string;
}

export interface AIInfographicsResponse {
  message: string;
  visualization: InfographicData;
}