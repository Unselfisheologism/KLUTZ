export interface DateTimeRequest {
  queryType: 'date-to-info' | 'day-to-dates';
  // For date-to-info queries
  selectedDate?: string; // ISO date string
  // For day-to-dates queries
  selectedMonth?: number;
  selectedYear?: number;
  selectedDayOfWeek?: string;
}

export interface DateTimeReport {
  query_type: 'date-to-info' | 'day-to-dates';
  
  // For date-to-info responses
  date_info?: {
    formatted_date: string;
    day_of_week: string;
    day_number: number;
    month_name: string;
    year: number;
    century: string;
    millennium: string;
    julian_day?: number;
    historical_events?: string[];
    astronomical_info?: string[];
    cultural_significance?: string[];
    season: string;
    zodiac_sign?: string;
  };
  
  // For day-to-dates responses
  matching_dates?: {
    month_name: string;
    year: number;
    day_of_week: string;
    dates: number[];
    total_count: number;
    formatted_dates: string[];
  };
  
  calculation_method: string;
  confidence: 'High' | 'Medium' | 'Low';
  historical_accuracy_note?: string;
  disclaimer: string;
}

export interface AIDateTimeCheckerFormValues {
  queryType: 'date-to-info' | 'day-to-dates';
  selectedDate?: string;
  selectedMonth?: number;
  selectedYear?: number;
  selectedDayOfWeek?: string;
}