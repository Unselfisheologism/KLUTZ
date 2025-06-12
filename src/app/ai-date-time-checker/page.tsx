'use client';

import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Calendar, Clock, AlertTriangle, Info, Download, CalendarDays, History, Globe } from 'lucide-react';
import { downloadTextFile } from '@/lib/utils';
import type { DateTimeReport } from '@/types/ai-date-time-checker';

const cleanJsonString = (rawString: string): string => {
  let cleanedString = rawString.trim();
  if (cleanedString.startsWith("```json") && cleanedString.endsWith("```")) {
    cleanedString = cleanedString.substring(7, cleanedString.length - 3).trim();
  } else if (cleanedString.startsWith("```") && cleanedString.endsWith("```")) {
    cleanedString = cleanedString.substring(3, cleanedString.length - 3).trim();
  }
  return cleanedString;
};

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

// Generate years from 1 AD to 3000 AD
const generateYears = () => {
  const years = [];
  for (let year = 1; year <= 3000; year++) {
    years.push({ value: year, label: year.toString() });
  }
  return years;
};

const YEARS = generateYears();

export default function AIDateTimeCheckerPage() {
  const [queryType, setQueryType] = useState<'date-to-info' | 'day-to-dates'>('date-to-info');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(undefined);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<string>('');
  
  const [dateTimeReport, setDateTimeReport] = useState<DateTimeReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    if (typeof window.puter === 'undefined') {
      toast({
        variant: "destructive",
        title: "Puter SDK Error",
        description: "Puter.js SDK is not loaded. Please refresh the page.",
      });
    }
  }, [toast]);

  const performAnalysis = async () => {
    if (queryType === 'date-to-info' && !selectedDate) {
      toast({ variant: "destructive", title: "Missing Input", description: "Please select a date to analyze." });
      return;
    }
    if (queryType === 'day-to-dates' && (!selectedMonth || !selectedYear || !selectedDayOfWeek)) {
      toast({ variant: "destructive", title: "Missing Input", description: "Please select month, year, and day of the week." });
      return;
    }

    setIsLoading(true);
    setDateTimeReport(null);
    setError(null);
    toast({ title: "Analysis Started", description: "AI is analyzing your date/time query..." });

    try {
      if (typeof window.puter === 'undefined' || !window.puter.auth || !window.puter.ai) {
        throw new Error("Puter SDK not available. Please refresh.");
      }
      const puter = window.puter;

      let isSignedIn = await puter.auth.isSignedIn();
      if (!isSignedIn) {
        await puter.auth.signIn();
        isSignedIn = await puter.auth.isSignedIn();
        if (!isSignedIn) throw new Error("Authentication failed or was cancelled.");
      }

      let prompt: string;

      if (queryType === 'date-to-info') {
        const dateObj = new Date(selectedDate);
        const day = dateObj.getDate();
        const month = dateObj.getMonth() + 1;
        const year = dateObj.getFullYear();

        prompt = `
          You are an AI assistant specialized in calendar calculations and historical date analysis.
          
          Analyze the date: ${day}/${month}/${year} (${selectedDate})
          
          Provide comprehensive information about this specific date including:
          1. What day of the week it was/is/will be
          2. Historical and cultural significance
          3. Astronomical information
          4. Calendar system details
          
          Return your analysis in a JSON object with these keys:
          - "query_type": "date-to-info"
          - "date_info": {
              "formatted_date": "Full formatted date string",
              "day_of_week": "Monday/Tuesday/etc.",
              "day_number": ${day},
              "month_name": "Month name",
              "year": ${year},
              "century": "Which century (e.g., '21st century')",
              "millennium": "Which millennium (e.g., '3rd millennium')",
              "julian_day": "Julian day number if calculable",
              "historical_events": ["Array of notable historical events on this date"],
              "astronomical_info": ["Array of astronomical information"],
              "cultural_significance": ["Array of cultural/religious significance"],
              "season": "Spring/Summer/Fall/Winter (Northern Hemisphere)",
              "zodiac_sign": "Astrological sign if applicable"
            }
          - "calculation_method": "Description of how the day was calculated"
          - "confidence": "High/Medium/Low"
          - "historical_accuracy_note": "Note about historical calendar accuracy"
          - "disclaimer": "Standard disclaimer about AI calculations"
        `;
      } else {
        const monthName = MONTHS.find(m => m.value === selectedMonth)?.label || '';
        const dayName = DAYS_OF_WEEK.find(d => d.value === selectedDayOfWeek)?.label || '';

        prompt = `
          You are an AI assistant specialized in calendar calculations.
          
          Find all dates in ${monthName} ${selectedYear} that fall on a ${dayName}.
          
          Calculate which specific dates (1-31) in ${monthName} ${selectedYear} are ${dayName}s.
          
          Return your analysis in a JSON object with these keys:
          - "query_type": "day-to-dates"
          - "matching_dates": {
              "month_name": "${monthName}",
              "year": ${selectedYear},
              "day_of_week": "${dayName}",
              "dates": [Array of date numbers that are ${dayName}s],
              "total_count": "Number of ${dayName}s in the month",
              "formatted_dates": ["Array of full formatted date strings"]
            }
          - "calculation_method": "Description of how the dates were calculated"
          - "confidence": "High/Medium/Low"
          - "disclaimer": "Standard disclaimer about AI calculations"
        `;
      }

      const response = await puter.ai.chat(prompt, { model: 'gpt-4o' });

      if (!response?.message?.content) {
        throw new Error("AI analysis did not return content.");
      }

      const parsedResponse: DateTimeReport = JSON.parse(cleanJsonString(response.message.content));
      setDateTimeReport(parsedResponse);
      toast({ title: "Analysis Complete", variant: "default", className: "bg-green-500 text-white dark:bg-green-600" });

    } catch (err: any) {
      console.error("Date/time analysis error:", err);
      let errorMessage = "An error occurred during analysis.";
      if (err instanceof Error) errorMessage = err.message;
      else if (typeof err === 'string') errorMessage = err;
      else if (err.error && err.error.message) errorMessage = err.error.message;
      setError(errorMessage);
      toast({ variant: "destructive", title: "Analysis Failed", description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReport = () => {
    if (!dateTimeReport) return;

    let reportString = "KLUTZ AI Date & Time Checker Report\n";
    reportString += "===================================\n\n";

    if (dateTimeReport.query_type === 'date-to-info' && dateTimeReport.date_info) {
      const info = dateTimeReport.date_info;
      reportString += "Date Information Analysis:\n";
      reportString += "--------------------------\n";
      reportString += `Date: ${info.formatted_date}\n`;
      reportString += `Day of Week: ${info.day_of_week}\n`;
      reportString += `Century: ${info.century}\n`;
      reportString += `Millennium: ${info.millennium}\n`;
      reportString += `Season: ${info.season}\n`;
      if (info.zodiac_sign) reportString += `Zodiac Sign: ${info.zodiac_sign}\n`;
      if (info.julian_day) reportString += `Julian Day: ${info.julian_day}\n`;
      reportString += "\n";

      if (info.historical_events && info.historical_events.length > 0) {
        reportString += "Historical Events:\n";
        reportString += "------------------\n";
        info.historical_events.forEach(event => {
          reportString += `- ${event}\n`;
        });
        reportString += "\n";
      }

      if (info.astronomical_info && info.astronomical_info.length > 0) {
        reportString += "Astronomical Information:\n";
        reportString += "------------------------\n";
        info.astronomical_info.forEach(astro => {
          reportString += `- ${astro}\n`;
        });
        reportString += "\n";
      }

      if (info.cultural_significance && info.cultural_significance.length > 0) {
        reportString += "Cultural Significance:\n";
        reportString += "---------------------\n";
        info.cultural_significance.forEach(cultural => {
          reportString += `- ${cultural}\n`;
        });
        reportString += "\n";
      }
    } else if (dateTimeReport.query_type === 'day-to-dates' && dateTimeReport.matching_dates) {
      const matches = dateTimeReport.matching_dates;
      reportString += "Day-to-Dates Analysis:\n";
      reportString += "----------------------\n";
      reportString += `Month: ${matches.month_name} ${matches.year}\n`;
      reportString += `Day of Week: ${matches.day_of_week}\n`;
      reportString += `Total Count: ${matches.total_count}\n\n`;

      reportString += "Matching Dates:\n";
      reportString += "---------------\n";
      matches.dates.forEach(date => {
        reportString += `- ${date}\n`;
      });
      reportString += "\n";

      if (matches.formatted_dates && matches.formatted_dates.length > 0) {
        reportString += "Full Formatted Dates:\n";
        reportString += "--------------------\n";
        matches.formatted_dates.forEach(formattedDate => {
          reportString += `- ${formattedDate}\n`;
        });
        reportString += "\n";
      }
    }

    reportString += "Calculation Method:\n";
    reportString += "------------------\n";
    reportString += `${dateTimeReport.calculation_method}\n\n`;

    reportString += "AI Confidence Level: " + dateTimeReport.confidence + "\n\n";

    if (dateTimeReport.historical_accuracy_note) {
      reportString += "Historical Accuracy Note:\n";
      reportString += "------------------------\n";
      reportString += `${dateTimeReport.historical_accuracy_note}\n\n`;
    }

    reportString += "Disclaimer:\n";
    reportString += "-----------\n";
    reportString += dateTimeReport.disclaimer + "\n\n";
    
    reportString += "\nIMPORTANT: This report is AI-generated and for informational purposes only. For critical historical or astronomical calculations, consult specialized references.";

    const timestamp = new Date().toISOString().replace(/[:.-]/g, '').slice(0, 14);
    downloadTextFile(reportString, `KLUTZ_AIDateTimeChecker_Report_${timestamp}.txt`);
  };

  return (
    <>
      <Head>
        <link rel="canonical" href="https://klutz.netlify.app/ai-date-time-checker" />
      </Head>
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="max-w-3xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary flex items-center">
            <Calendar className="mr-3 h-8 w-8" />
            AI Date & Time Checker
          </CardTitle>
          <CardDescription>
            Explore dates from any century or millennium. Get detailed information about specific dates or find all dates in a month that fall on a particular day.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert variant="default" className="bg-blue-50 border-blue-400 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            <Info className="h-5 w-5 text-blue-500" />
            <AlertTitle className="font-semibold">Time Travel Features</AlertTitle>
            <AlertDescription>
              Choose a specific date to learn what day it was and its historical significance, or select a month/year and day of the week to find all matching dates.
            </AlertDescription>
          </Alert>

          <Tabs value={queryType} onValueChange={(value) => setQueryType(value as 'date-to-info' | 'day-to-dates')} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="date-to-info">Date Information</TabsTrigger>
              <TabsTrigger value="day-to-dates">Find Dates by Day</TabsTrigger>
            </TabsList>
            <TabsContent value="date-to-info" className="mt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="date-input" className="text-lg font-medium flex items-center mb-2">
                    <CalendarDays className="mr-2 h-5 w-5 text-accent" />
                    Select Date
                  </Label>
                  <Input
                    id="date-input"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min="0001-01-01"
                    max="2999-12-31"
                    disabled={isLoading}
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground mt-1">Choose any date from year 1 AD to 2999 AD to get detailed information.</p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="day-to-dates" className="mt-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="month-select" className="text-lg font-medium">Month</Label>
                    <Select value={selectedMonth?.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                      <SelectTrigger id="month-select" className="w-full">
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTHS.map((month) => (
                          <SelectItem key={month.value} value={month.value.toString()}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="year-select" className="text-lg font-medium">Year</Label>
                    <Select value={selectedYear?.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                      <SelectTrigger id="year-select" className="w-full">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {YEARS.map((year) => (
                          <SelectItem key={year.value} value={year.value.toString()}>
                            {year.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="day-select" className="text-lg font-medium">Day of Week</Label>
                    <Select value={selectedDayOfWeek} onValueChange={setSelectedDayOfWeek}>
                      <SelectTrigger id="day-select" className="w-full">
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        {DAYS_OF_WEEK.map((day) => (
                          <SelectItem key={day.value} value={day.value}>
                            {day.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Find all dates in the selected month and year that fall on the chosen day of the week.</p>
              </div>
            </TabsContent>
          </Tabs>

          <Button 
            onClick={performAnalysis} 
            disabled={isLoading || (queryType === 'date-to-info' && !selectedDate) || (queryType === 'day-to-dates' && (!selectedMonth || !selectedYear || !selectedDayOfWeek))} 
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Date & Time...
              </>
            ) : (
              <>
                <Clock className="mr-2 h-4 w-4" />
                Analyze Date & Time
              </>
            )}
          </Button>

          {error && !isLoading && (
            <Alert variant="destructive" className="mt-6">
              <AlertTriangle className="h-5 w-5" />
              <AlertTitle>Analysis Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {dateTimeReport && !isLoading && !error && (
            <Card className="mt-6 shadow-md">
              <CardHeader>
                <CardTitle className="font-headline text-xl flex items-center">
                  <Calendar className="mr-2 h-6 w-6 text-primary" />
                  {dateTimeReport.query_type === 'date-to-info' ? 'Date Information' : 'Matching Dates'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {dateTimeReport.query_type === 'date-to-info' && dateTimeReport.date_info && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
                        <h4 className="font-semibold text-md mb-2 flex items-center">
                          <CalendarDays className="mr-2 h-4 w-4 text-blue-500" />
                          Date Details
                        </h4>
                        <div className="space-y-1 text-sm">
                          <p><strong>Date:</strong> {dateTimeReport.date_info.formatted_date}</p>
                          <p><strong>Day:</strong> {dateTimeReport.date_info.day_of_week}</p>
                          <p><strong>Century:</strong> {dateTimeReport.date_info.century}</p>
                          <p><strong>Millennium:</strong> {dateTimeReport.date_info.millennium}</p>
                          <p><strong>Season:</strong> {dateTimeReport.date_info.season}</p>
                          {dateTimeReport.date_info.zodiac_sign && (
                            <p><strong>Zodiac:</strong> {dateTimeReport.date_info.zodiac_sign}</p>
                          )}
                        </div>
                      </div>

                      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-md">
                        <h4 className="font-semibold text-md mb-2 flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-purple-500" />
                          Technical Details
                        </h4>
                        <div className="space-y-1 text-sm">
                          <p><strong>Confidence:</strong> {dateTimeReport.confidence}</p>
                          {dateTimeReport.date_info.julian_day && (
                            <p><strong>Julian Day:</strong> {dateTimeReport.date_info.julian_day}</p>
                          )}
                          <p><strong>Method:</strong> {dateTimeReport.calculation_method}</p>
                        </div>
                      </div>
                    </div>

                    {dateTimeReport.date_info.historical_events && dateTimeReport.date_info.historical_events.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-md mb-2 flex items-center">
                          <History className="mr-2 h-4 w-4 text-amber-500" />
                          Historical Events:
                        </h4>
                        <ul className="list-disc pl-5 space-y-1 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md">
                          {dateTimeReport.date_info.historical_events.map((event, index) => (
                            <li key={index} className="text-amber-700 dark:text-amber-300">{event}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {dateTimeReport.date_info.astronomical_info && dateTimeReport.date_info.astronomical_info.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-md mb-2 flex items-center">
                          <Globe className="mr-2 h-4 w-4 text-indigo-500" />
                          Astronomical Information:
                        </h4>
                        <ul className="list-disc pl-5 space-y-1 bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-md">
                          {dateTimeReport.date_info.astronomical_info.map((astro, index) => (
                            <li key={index} className="text-indigo-700 dark:text-indigo-300">{astro}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {dateTimeReport.date_info.cultural_significance && dateTimeReport.date_info.cultural_significance.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-md mb-2 flex items-center">
                          <Globe className="mr-2 h-4 w-4 text-green-500" />
                          Cultural Significance:
                        </h4>
                        <ul className="list-disc pl-5 space-y-1 bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                          {dateTimeReport.date_info.cultural_significance.map((cultural, index) => (
                            <li key={index} className="text-green-700 dark:text-green-300">{cultural}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}

                {dateTimeReport.query_type === 'day-to-dates' && dateTimeReport.matching_dates && (
                  <>
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md">
                      <h4 className="font-semibold text-md mb-2 flex items-center">
                        <CalendarDays className="mr-2 h-4 w-4 text-green-500" />
                        Search Results
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p><strong>Month:</strong> {dateTimeReport.matching_dates.month_name} {dateTimeReport.matching_dates.year}</p>
                        <p><strong>Day of Week:</strong> {dateTimeReport.matching_dates.day_of_week}</p>
                        <p><strong>Total Count:</strong> {dateTimeReport.matching_dates.total_count} {dateTimeReport.matching_dates.day_of_week}s</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-md mb-2">Matching Dates:</h4>
                      <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                        {dateTimeReport.matching_dates.dates.map((date, index) => (
                          <div key={index} className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-md text-center font-medium text-blue-700 dark:text-blue-300">
                            {date}
                          </div>
                        ))}
                      </div>
                    </div>

                    {dateTimeReport.matching_dates.formatted_dates && dateTimeReport.matching_dates.formatted_dates.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-md mb-2">Full Dates:</h4>
                        <div className="bg-muted/30 p-3 rounded-md max-h-32 overflow-y-auto">
                          <ul className="list-disc pl-5 space-y-1 text-sm">
                            {dateTimeReport.matching_dates.formatted_dates.map((formattedDate, index) => (
                              <li key={index}>{formattedDate}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-md">
                      <p className="text-sm"><strong>Calculation Method:</strong> {dateTimeReport.calculation_method}</p>
                      <p className="text-sm"><strong>Confidence:</strong> {dateTimeReport.confidence}</p>
                    </div>
                  </>
                )}

                {dateTimeReport.historical_accuracy_note && (
                  <Alert variant="default" className="bg-yellow-50 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <AlertTitle className="font-medium">Historical Accuracy Note</AlertTitle>
                    <AlertDescription>{dateTimeReport.historical_accuracy_note}</AlertDescription>
                  </Alert>
                )}

                <Alert variant="default" className="text-xs bg-blue-50 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300">
                  <Info className="h-4 w-4 text-blue-500" />
                  <AlertTitle className="font-medium">Disclaimer</AlertTitle>
                  <AlertDescription>{dateTimeReport.disclaimer}</AlertDescription>
                </Alert>

                <Button onClick={handleDownloadReport} variant="outline" className="w-full mt-4">
                  <Download className="mr-2 h-4 w-4" />
                  Download Report
                </Button>
              </CardContent>
            </Card>
          )}

          {!dateTimeReport && !isLoading && !error && (
            <div className="mt-6 p-4 border border-dashed rounded-md text-center text-muted-foreground">
              <Info className="mx-auto h-8 w-8 mb-2"/>
              <p>Select a query type and provide the required information to explore dates and times across centuries and millennia.</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground w-full text-center">
            This tool uses AI for date and time calculations. For critical historical or astronomical calculations, consult specialized references.
          </p>
        </CardFooter>
      </Card>

      <div className="max-w-3xl mx-auto mt-12 space-y-8">
        <section>
          <h2 className="font-headline text-3xl text-primary mb-4">Unlocking Time's Secrets: An AI-Powered Date & Time Explorer</h2>
          <p className="text-muted-foreground text-lg">
            Have you ever wondered what day of the week your great-great-grandparents were born? Or perhaps you need to find all the Mondays in October of a specific historical year? Our AI Date & Time Checker is designed to pull back the curtain on time, offering insights into dates across centuries and millennia with surprising detail.
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-xl text-primary mb-3">Beyond Basic Calendars</h3>
          <p className="text-muted-foreground">
            This isn't just a simple day calculator. Leveraging powerful AI models, the tool can analyze a specific date to provide a wealth of information:
          </p>
          <ul className="list-disc pl-5 text-muted-foreground mt-3 space-y-2">
            <li><strong>Day of the Week:</strong> Instantly know if a date from the past, present, or future falls on a Monday, Friday, or any other day.</li>
            <li><strong>Historical Context:</strong> Discover notable historical events, cultural significance, and even astronomical information associated with that particular date.</li>
            <li><strong>Calendar Details:</strong> Get information about the century, millennium, and other calendar system specifics relevant to the date.</li>
          </ul>
        </section>

        <section>
          <h3 className="font-semibold text-xl text-primary mb-3">Find Specific Dates by Day</h3>
          <p className="text-muted-foreground">
            The tool also offers the reverse capability. If you know the month, year, and the day of the week, the AI can list all the specific dates within that period that match your criteria. Perfect for genealogical research, historical studies, or just satisfying your curiosity about calendar patterns.
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-xl text-primary mb-3">Powered by Cutting-Edge AI</h3>
          <p className="text-muted-foreground">
            Our AI Date & Time Checker utilizes advanced AI models to perform complex calendar calculations and access vast amounts of historical and astronomical data. While the AI strives for accuracy across wide date ranges, it's important to remember the inherent complexities of historical calendar systems and potential limitations for extremely distant past or future dates.
          </p>
        </section>
      </div>
    </div>
  );
    </>
)}