export interface SpreadsheetCell {
  value: string;
  formula?: string;
  style?: {
    bold?: boolean;
    italic?: boolean;
    color?: string;
    backgroundColor?: string;
    textAlign?: 'left' | 'center' | 'right';
  };
}

export interface SpreadsheetData {
  rows: SpreadsheetCell[][];
  columnWidths?: number[];
  rowHeights?: number[];
  activeSheet: string;
  sheets: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface SpreadsheetOperation {
  type: 'update_cell' | 'update_row' | 'update_column' | 'add_row' | 'add_column' | 'delete_row' | 'delete_column' | 'format' | 'create_chart' | 'find_replace';
  details: any; // Specific details for each operation type
}

export interface AISpreadsheetResponse {
  operations: SpreadsheetOperation[];
  explanation: string;
}