'use client';

import Head from 'next/head';
import { useState, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Upload, FileSpreadsheet, Download, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function SpreadsheetAnalyzerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [spreadsheetData, setSpreadsheetData] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [userQuery, setUserQuery] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    setError(null);
    setAnalysisResult(null);
    
    // Read the file
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) throw new Error("Failed to read file");
        
        // Parse Excel/CSV file
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        setSpreadsheetData(jsonData);
        toast({
          title: "Spreadsheet Uploaded",
          description: `Successfully loaded ${jsonData.length} rows of data.`,
        });
      } catch (err) {
        console.error("Error parsing file:", err);
        setError("Failed to parse the spreadsheet. Please ensure it's a valid Excel or CSV file.");
        toast({
          variant: "destructive",
          title: "Upload Error",
          description: "Failed to parse the spreadsheet. Please ensure it's a valid Excel or CSV file.",
        });
      }
    };
    
    reader.onerror = () => {
      setError("Error reading the file. Please try again.");
      toast({
        variant: "destructive",
        title: "Upload Error",
        description: "Error reading the file. Please try again.",
      });
    };
    
    reader.readAsBinaryString(selectedFile);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const analyzeSpreadsheet = async () => {
    if (!spreadsheetData) {
      toast({
        variant: "destructive",
        title: "No Data",
        description: "Please upload a spreadsheet first.",
      });
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would call an AI service
      // For now, we'll simulate a basic analysis
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing time
      
      const columnNames = Object.keys(spreadsheetData[0] || {});
      const rowCount = spreadsheetData.length;
      
      // Generate a simple analysis
      let analysis = `# Spreadsheet Analysis\n\n`;
      analysis += `## Overview\n`;
      analysis += `- Total rows: ${rowCount}\n`;
      analysis += `- Total columns: ${columnNames.length}\n`;
      analysis += `- Column names: ${columnNames.join(', ')}\n\n`;
      
      // Data types analysis
      analysis += `## Data Types\n`;
      columnNames.forEach(column => {
        const values = spreadsheetData.map(row => row[column]);
        const types = new Set(values.map(value => typeof value));
        analysis += `- ${column}: ${Array.from(types).join(', ')}\n`;
      });
      
      // Basic statistics for numeric columns
      analysis += `\n## Basic Statistics\n`;
      columnNames.forEach(column => {
        const values = spreadsheetData.map(row => row[column])
          .filter(value => typeof value === 'number');
        
        if (values.length > 0) {
          const sum = values.reduce((a, b) => a + b, 0);
          const avg = sum / values.length;
          const min = Math.min(...values);
          const max = Math.max(...values);
          
          analysis += `### ${column}\n`;
          analysis += `- Average: ${avg.toFixed(2)}\n`;
          analysis += `- Min: ${min}\n`;
          analysis += `- Max: ${max}\n`;
          analysis += `- Sum: ${sum}\n\n`;
        }
      });
      
      // Add query-specific analysis if provided
      if (userQuery.trim()) {
        analysis += `\n## Query Analysis: "${userQuery}"\n`;
        
        if (userQuery.toLowerCase().includes('sum') || userQuery.toLowerCase().includes('total')) {
          // Find numeric columns
          const numericColumns = columnNames.filter(column => 
            typeof spreadsheetData[0][column] === 'number'
          );
          
          if (numericColumns.length > 0) {
            analysis += `### Sum of Numeric Columns\n`;
            numericColumns.forEach(column => {
              const sum = spreadsheetData.reduce((total, row) => 
                total + (typeof row[column] === 'number' ? row[column] : 0), 0
              );
              analysis += `- Sum of ${column}: ${sum}\n`;
            });
          }
        }
        
        if (userQuery.toLowerCase().includes('average') || userQuery.toLowerCase().includes('mean')) {
          // Find numeric columns
          const numericColumns = columnNames.filter(column => 
            typeof spreadsheetData[0][column] === 'number'
          );
          
          if (numericColumns.length > 0) {
            analysis += `### Average of Numeric Columns\n`;
            numericColumns.forEach(column => {
              const values = spreadsheetData
                .map(row => row[column])
                .filter(value => typeof value === 'number');
              
              if (values.length > 0) {
                const avg = values.reduce((a, b) => a + b, 0) / values.length;
                analysis += `- Average of ${column}: ${avg.toFixed(2)}\n`;
              }
            });
          }
        }
        
        if (userQuery.toLowerCase().includes('count') || userQuery.toLowerCase().includes('how many')) {
          analysis += `### Count Analysis\n`;
          analysis += `- Total rows: ${rowCount}\n`;
          
          // Count non-empty values in each column
          columnNames.forEach(column => {
            const nonEmptyCount = spreadsheetData.filter(row => 
              row[column] !== null && row[column] !== undefined && row[column] !== ''
            ).length;
            
            analysis += `- Non-empty values in ${column}: ${nonEmptyCount}\n`;
          });
        }
      }
      
      setAnalysisResult(analysis);
      toast({
        title: "Analysis Complete",
        description: "Spreadsheet analysis has been generated.",
      });
    } catch (err) {
      console.error("Analysis error:", err);
      setError("Failed to analyze the spreadsheet. Please try again.");
      toast({
        variant: "destructive",
        title: "Analysis Error",
        description: "Failed to analyze the spreadsheet. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadAnalysis = () => {
    if (!analysisResult) return;
    
    const element = document.createElement("a");
    const file = new Blob([analysisResult], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "spreadsheet_analysis.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <>
      <Head>
        <title>AI Spreadsheet Analyzer - KLUTZ</title>
        <meta name="description" content="Analyze spreadsheets with AI to extract insights and transform data" />
      </Head>
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">AI Spreadsheet Analyzer</CardTitle>
            <CardDescription>
              Upload and analyze spreadsheets with AI to extract insights, perform calculations, and transform data.
            </CardDescription>
          </CardHeader>
        </Card>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileSpreadsheet className="mr-2 h-5 w-5" />
                Upload Spreadsheet
              </CardTitle>
              <CardDescription>
                Upload an Excel or CSV file to analyze its contents with AI.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg p-10 text-center">
                <FileSpreadsheet className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="mb-2 text-sm text-muted-foreground">
                  Drag and drop your spreadsheet here, or click to browse
                </p>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button onClick={handleUploadClick} className="mt-2">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Spreadsheet
                </Button>
              </div>
              
              {file && (
                <Alert variant="default" className="bg-muted">
                  <FileSpreadsheet className="h-4 w-4" />
                  <AlertTitle>File Uploaded</AlertTitle>
                  <AlertDescription>
                    {file.name} ({(file.size / 1024).toFixed(2)} KB)
                  </AlertDescription>
                </Alert>
              )}
              
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {spreadsheetData && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Spreadsheet Preview</h3>
                  <div className="border rounded-md overflow-auto max-h-60">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-muted">
                          {Object.keys(spreadsheetData[0] || {}).map((column, index) => (
                            <th key={index} className="border p-2 text-left">{column}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {spreadsheetData.slice(0, 5).map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {Object.values(row).map((cell, cellIndex) => (
                              <td key={cellIndex} className="border p-2">
                                {String(cell)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {spreadsheetData.length > 5 && (
                      <div className="p-2 text-center text-sm text-muted-foreground">
                        Showing 5 of {spreadsheetData.length} rows
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                onClick={analyzeSpreadsheet} 
                disabled={!spreadsheetData || isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Analyze Spreadsheet
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
          
          {/* Analysis Section */}
          <Card>
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
              <CardDescription>
                AI-generated insights and analysis of your spreadsheet data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="mb-4">
                <label htmlFor="query" className="block text-sm font-medium mb-1">
                  Ask a specific question about your data (optional)
                </label>
                <Textarea
                  id="query"
                  placeholder="E.g., 'What is the sum of all sales?' or 'Find the average age'"
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              
              {analysisResult ? (
                <div className="border rounded-md p-4 bg-muted/30">
                  <div className="whitespace-pre-wrap font-mono text-sm">
                    {analysisResult}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-10 text-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                  <Info className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {spreadsheetData 
                      ? "Click 'Analyze Spreadsheet' to generate insights" 
                      : "Upload a spreadsheet to get started"}
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => {
                  setAnalysisResult(null);
                  setUserQuery('');
                }}
                disabled={!analysisResult}
              >
                Clear Results
              </Button>
              <Button 
                variant="outline" 
                onClick={downloadAnalysis}
                disabled={!analysisResult}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Analysis
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
}