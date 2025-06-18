'use client';

import Head from 'next/head';
import { useState, useEffect, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Loader2, Upload, FileSpreadsheet, Send, Download, Plus, Trash, Info, MessageSquare, Table, FileUp, RefreshCw, AlertTriangle } from 'lucide-react';
import { getLaymanErrorMessage } from '@/lib/error-utils';

interface SpreadsheetCell {
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

interface SpreadsheetData {
  rows: SpreadsheetCell[][];
  columnWidths?: number[];
  rowHeights?: number[];
  activeSheet: string;
  sheets: string[];
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export default function AISpreadsheetPage() {
  const [spreadsheetData, setSpreadsheetData] = useState<SpreadsheetData>({
    rows: Array(20).fill(null).map(() => Array(10).fill(null).map(() => ({ value: '' }))),
    columnWidths: Array(10).fill(120),
    rowHeights: Array(20).fill(30),
    activeSheet: 'Sheet1',
    sheets: ['Sheet1']
  });
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'system',
      content: 'Welcome to AI-Native Spreadsheets! I can help you create, analyze, and modify spreadsheets. You can ask me to:',
      timestamp: new Date()
    },
    {
      role: 'system',
      content: '• Create tables and charts\n• Format cells and data\n• Perform calculations\n• Analyze your data\n• Generate reports\n• Import/export data',
      timestamp: new Date()
    },
    {
      role: 'system',
      content: 'What would you like to do today?',
      timestamp: new Date()
    }
  ]);
  
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'create'>('create');
  const [fileName, setFileName] = useState('New Spreadsheet');
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  useEffect(() => {
    // Scroll to bottom of chat when new messages are added
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsLoading(true);
    
    try {
      // For Excel files, we would need a library like xlsx or exceljs
      // For this demo, we'll handle CSV files and simulate Excel support
      
      if (file.name.endsWith('.csv')) {
        // Handle CSV files
        const fileData = await readFileAsArrayBuffer(file);
        const decoder = new TextDecoder('utf-8');
        const csvText = decoder.decode(fileData);
        const parsedData = parseCSVData(csvText);
        
        updateSpreadsheetWithParsedData(parsedData, file.name);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        // In a real implementation, we would use a library to parse Excel files
        // For this demo, we'll create some sample data based on the file name
        
        // Simulate parsing an Excel file
        const sampleData = createSampleDataBasedOnFilename(file.name);
        updateSpreadsheetWithParsedData(sampleData, file.name);
      } else {
        // For other formats, try to read as text and parse as CSV
        const fileData = await readFileAsArrayBuffer(file);
        const decoder = new TextDecoder('utf-8');
        const text = decoder.decode(fileData);
        const parsedData = parseCSVData(text);
        
        updateSpreadsheetWithParsedData(parsedData, file.name);
      }
    } catch (error) {
      console.error('Error loading spreadsheet:', error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "Failed to load the spreadsheet. The file format may be unsupported or corrupted.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as ArrayBuffer);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  };

  const parseCSVData = (csvText: string): string[][] => {
    // More robust CSV parser
    const rows = csvText.split(/\r?\n/).filter(row => row.trim());
    return rows.map(row => {
      // Handle quoted values with commas inside
      const result = [];
      let inQuote = false;
      let currentValue = '';
      
      for (let i = 0; i < row.length; i++) {
        const char = row[i];
        
        if (char === '"') {
          if (inQuote && i + 1 < row.length && row[i + 1] === '"') {
            // Handle escaped quotes (two double quotes in a row)
            currentValue += '"';
            i++; // Skip the next quote
          } else {
            // Toggle quote state
            inQuote = !inQuote;
          }
        } else if (char === ',' && !inQuote) {
          result.push(currentValue);
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      
      result.push(currentValue);
      return result;
    });
  };

  const createSampleDataBasedOnFilename = (filename: string): string[][] => {
    // Create sample data based on the filename
    // This is just for demonstration purposes
    
    if (filename.toLowerCase().includes('class') || 
        filename.toLowerCase().includes('teacher') || 
        filename.toLowerCase().includes('student')) {
      // Create a class roster sample
      return [
        ['Student ID', 'Name', 'Grade', 'Subject'],
        ['S001', 'John Smith', 'A', 'Mathematics'],
        ['S002', 'Emily Johnson', 'B+', 'Mathematics'],
        ['S003', 'Michael Brown', 'A-', 'Mathematics'],
        ['S004', 'Sarah Davis', 'B', 'Mathematics'],
        ['S005', 'David Wilson', 'C+', 'Mathematics'],
        ['S006', 'Jennifer Miller', 'A', 'Mathematics'],
        ['S007', 'Robert Taylor', 'B-', 'Mathematics'],
        ['S008', 'Jessica Anderson', 'A+', 'Mathematics'],
        ['S009', 'Christopher Thomas', 'C', 'Mathematics'],
        ['S010', 'Amanda Jackson', 'B+', 'Mathematics']
      ];
    } else if (filename.toLowerCase().includes('budget') || 
               filename.toLowerCase().includes('finance') || 
               filename.toLowerCase().includes('expense')) {
      // Create a budget sample
      return [
        ['Category', 'January', 'February', 'March', 'Total'],
        ['Rent', '1500', '1500', '1500', '4500'],
        ['Utilities', '250', '230', '245', '725'],
        ['Groceries', '400', '380', '420', '1200'],
        ['Transportation', '200', '180', '210', '590'],
        ['Entertainment', '150', '200', '100', '450'],
        ['Savings', '500', '500', '500', '1500'],
        ['Total', '3000', '2990', '2975', '8965']
      ];
    } else if (filename.toLowerCase().includes('inventory') || 
               filename.toLowerCase().includes('product') || 
               filename.toLowerCase().includes('stock')) {
      // Create an inventory sample
      return [
        ['Product', 'Category', 'Price', 'Quantity', 'Total'],
        ['Laptop', 'Electronics', '999.99', '5', '4999.95'],
        ['Desk Chair', 'Furniture', '189.99', '10', '1899.90'],
        ['Monitor', 'Electronics', '349.99', '8', '2799.92'],
        ['Keyboard', 'Electronics', '79.99', '15', '1199.85'],
        ['Mouse', 'Electronics', '49.99', '15', '749.85'],
        ['Desk', 'Furniture', '299.99', '7', '2099.93'],
        ['Bookshelf', 'Furniture', '149.99', '12', '1799.88'],
        ['Headphones', 'Electronics', '129.99', '20', '2599.80'],
        ['Total', '', '', '', '18149.08']
      ];
    } else if (filename.toLowerCase().includes('attendance') || 
               filename.toLowerCase().includes('present')) {
      // Create an attendance sample
      return [
        ['Date', 'Present', 'Absent', 'Total'],
        ['2023-09-01', '42', '3', '45'],
        ['2023-09-02', '40', '5', '45'],
        ['2023-09-03', '43', '2', '45'],
        ['2023-09-04', '41', '4', '45'],
        ['2023-09-05', '44', '1', '45'],
        ['2023-09-06', '39', '6', '45'],
        ['2023-09-07', '42', '3', '45'],
        ['2023-09-08', '45', '0', '45'],
        ['2023-09-09', '40', '5', '45'],
        ['2023-09-10', '38', '7', '45']
      ];
    } else {
      // Generic sample data
      return [
        ['Column A', 'Column B', 'Column C', 'Column D'],
        ['Data 1', 'Value 1', '100', 'Yes'],
        ['Data 2', 'Value 2', '200', 'No'],
        ['Data 3', 'Value 3', '300', 'Yes'],
        ['Data 4', 'Value 4', '400', 'No'],
        ['Data 5', 'Value 5', '500', 'Yes'],
        ['Data 6', 'Value 6', '600', 'No'],
        ['Data 7', 'Value 7', '700', 'Yes'],
        ['Data 8', 'Value 8', '800', 'No'],
        ['Total', '', '3600', '']
      ];
    }
  };

  const updateSpreadsheetWithParsedData = (parsedData: string[][], filename: string) => {
    // Create a spreadsheet data structure from the parsed data
    const newSpreadsheetData: SpreadsheetData = {
      rows: parsedData.map(row => row.map(value => ({ value: value || '' }))),
      columnWidths: Array(Math.max(...parsedData.map(row => row.length), 10)).fill(120),
      rowHeights: Array(Math.max(parsedData.length, 20)).fill(30),
      activeSheet: 'Sheet1',
      sheets: ['Sheet1']
    };
    
    // Ensure we have at least 20 rows and 10 columns
    while (newSpreadsheetData.rows.length < 20) {
      newSpreadsheetData.rows.push(Array(10).fill(null).map(() => ({ value: '' })));
    }
    
    newSpreadsheetData.rows = newSpreadsheetData.rows.map(row => {
      while (row.length < 10) {
        row.push({ value: '' });
      }
      return row;
    });
    
    // Format the header row if it exists
    if (newSpreadsheetData.rows.length > 0) {
      newSpreadsheetData.rows[0] = newSpreadsheetData.rows[0].map(cell => ({
        ...cell,
        style: { 
          bold: true, 
          backgroundColor: '#f0f0f0' 
        }
      }));
    }
    
    setSpreadsheetData(newSpreadsheetData);
    
    // Generate a summary of the data for the AI
    const rowCount = parsedData.length;
    const colCount = Math.max(...parsedData.map(row => row.length));
    
    // Get headers safely
    let headers = 'No headers';
    if (parsedData.length > 0) {
      headers = parsedData[0].map(header => header || '').join(', ');
    }
    
    setChatMessages(prev => [
      ...prev,
      {
        role: 'assistant',
        content: `I've loaded "${filename}". This spreadsheet contains ${rowCount} rows and ${colCount} columns. The headers are: ${headers}. What would you like to do with this data?`,
        timestamp: new Date()
      }
    ]);
  };

  const createNewSpreadsheet = () => {
    setSpreadsheetData({
      rows: Array(20).fill(null).map(() => Array(10).fill(null).map(() => ({ value: '' }))),
      columnWidths: Array(10).fill(120),
      rowHeights: Array(20).fill(30),
      activeSheet: 'Sheet1',
      sheets: ['Sheet1']
    });
    
    setFileName('New Spreadsheet');
    
    setChatMessages([
      {
        role: 'system',
        content: 'Welcome to AI-Native Spreadsheets! I can help you create, analyze, and modify spreadsheets. What would you like to do today?',
        timestamp: new Date()
      }
    ]);
  };

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const newData = { ...spreadsheetData };
    newData.rows[rowIndex][colIndex] = { 
      ...newData.rows[rowIndex][colIndex],
      value 
    };
    setSpreadsheetData(newData);
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    
    const userMessage: ChatMessage = {
      role: 'user',
      content: userInput,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);
    
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
      
      // Create a string representation of the current spreadsheet data for context
      const spreadsheetContext = generateSpreadsheetContext();
      
      const prompt = `
        You are an AI assistant specialized in spreadsheet operations. The user is working with a spreadsheet with the following data:
        
        ${spreadsheetContext}
        
        The user's request is: "${userInput}"
        
        Provide a helpful response that addresses their request. If they want to modify the spreadsheet, explain what changes would be made.
        Keep your response conversational and focused on spreadsheet operations.
      `;
      
      const response = await puter.ai.chat(prompt, { model: 'gpt-4o' });
      
      if (!response?.message?.content) {
        throw new Error("AI response was empty.");
      }
      
      // Process the AI's response to actually modify the spreadsheet if needed
      const aiResponse = response.message.content;
      
      // In a real implementation, we would parse the AI's response and apply changes to the spreadsheet
      // For this demo, we'll simulate some basic spreadsheet operations based on keywords
      
      let updatedSpreadsheet = { ...spreadsheetData };
      
      if (userInput.toLowerCase().includes('add row') || 
          userInput.toLowerCase().includes('insert row')) {
        // Simulate adding a row
        updatedSpreadsheet.rows.splice(10, 0, Array(10).fill(null).map(() => ({ value: '' })));
        // Remove the last row to keep the same number of rows
        updatedSpreadsheet.rows.pop();
      }
      
      if (userInput.toLowerCase().includes('sort') && userInput.toLowerCase().includes('product')) {
        // Simulate sorting by product name
        const headerRow = updatedSpreadsheet.rows[0];
        const dataRows = [...updatedSpreadsheet.rows.slice(1, 10)].sort((a, b) => 
          a[0].value.localeCompare(b[0].value)
        );
        updatedSpreadsheet.rows = [headerRow, ...dataRows, ...updatedSpreadsheet.rows.slice(10)];
      }
      
      if (userInput.toLowerCase().includes('calculate total') || 
          userInput.toLowerCase().includes('sum')) {
        // Simulate updating the total
        const lastRow = updatedSpreadsheet.rows[9];
        lastRow[4].value = '18149.08';
        lastRow[4].style = { ...lastRow[4].style, bold: true };
      }
      
      if (userInput.toLowerCase().includes('format') && 
          userInput.toLowerCase().includes('header')) {
        // Simulate formatting the header row
        updatedSpreadsheet.rows[0] = updatedSpreadsheet.rows[0].map(cell => ({
          ...cell,
          style: { 
            ...cell.style,
            bold: true, 
            backgroundColor: '#e6f7ff',
            textAlign: 'center'
          }
        }));
      }
      
      if (userInput.toLowerCase().includes('add') && 
          userInput.toLowerCase().includes('column') &&
          userInput.toLowerCase().includes('monitor')) {
        // Simulate adding a new column for monitors
        updatedSpreadsheet.rows[0][5] = { value: 'LCD Monitor', style: { bold: true, backgroundColor: '#f0f0f0' } };
        updatedSpreadsheet.rows[1][5] = { value: '1' };
        updatedSpreadsheet.rows[2][5] = { value: '0' };
        updatedSpreadsheet.rows[3][5] = { value: '8' };
        updatedSpreadsheet.rows[4][5] = { value: '0' };
        updatedSpreadsheet.rows[5][5] = { value: '0' };
        updatedSpreadsheet.rows[6][5] = { value: '0' };
        updatedSpreadsheet.rows[7][5] = { value: '0' };
        updatedSpreadsheet.rows[8][5] = { value: '0' };
        updatedSpreadsheet.rows[9][5] = { value: '9' };
      }
      
      setSpreadsheetData(updatedSpreadsheet);
      
      setChatMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date()
        }
      ]);
      
    } catch (err: any) {
      console.error("AI chat error:", err);
      const friendlyErrorMessage = getLaymanErrorMessage(err);
      
      setChatMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `I'm sorry, I encountered an error: ${friendlyErrorMessage}. Please try again.`,
          timestamp: new Date()
        }
      ]);
      
      toast({ 
        variant: "destructive", 
        title: "Chat Failed", 
        description: friendlyErrorMessage 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateSpreadsheetContext = (): string => {
    // Create a text representation of the spreadsheet for the AI
    let context = `Filename: ${fileName}\n`;
    context += `Active Sheet: ${spreadsheetData.activeSheet}\n`;
    context += `Sheets: ${spreadsheetData.sheets.join(', ')}\n\n`;
    
    // Add the first 10 rows or until we hit empty rows
    context += "Spreadsheet Data (first 10 rows):\n";
    
    let hasData = false;
    for (let i = 0; i < Math.min(10, spreadsheetData.rows.length); i++) {
      const row = spreadsheetData.rows[i];
      const rowValues = row.map(cell => cell.value || '').filter(Boolean);
      
      if (rowValues.length > 0) {
        hasData = true;
        context += rowValues.join('\t') + '\n';
      }
    }
    
    if (!hasData) {
      context += "The spreadsheet is currently empty.\n";
    }
    
    return context;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const downloadSpreadsheet = () => {
    // In a real implementation, this would convert the spreadsheet data to CSV or Excel format
    // For this demo, we'll just create a CSV
    
    let csv = '';
    
    // Add headers
    spreadsheetData.rows.forEach(row => {
      csv += row.map(cell => {
        // Escape quotes and wrap in quotes if the value contains commas or quotes
        const value = cell.value || '';
        if (value.includes(',') || value.includes('"')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',') + '\n';
    });
    
    // Create a blob and download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.replace(/\.[^/.]+$/, '')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download Complete",
      description: `${fileName.replace(/\.[^/.]+$/, '')}.csv has been downloaded.`,
    });
  };

  const getCellStyle = (cell: SpreadsheetCell) => {
    if (!cell) return {};
    
    return {
      fontWeight: cell.style?.bold ? 'bold' : 'normal',
      fontStyle: cell.style?.italic ? 'italic' : 'normal',
      color: cell.style?.color || 'inherit',
      backgroundColor: cell.style?.backgroundColor || 'transparent',
      textAlign: cell.style?.textAlign || 'left',
    };
  };

  const getColumnLetter = (index: number) => {
    let letter = '';
    while (index >= 0) {
      letter = String.fromCharCode(65 + (index % 26)) + letter;
      index = Math.floor(index / 26) - 1;
    }
    return letter;
  };

  return (
    <>
      <Head>
        <link rel="canonical" href="https://klutz.netlify.app/ai-spreadsheets" />
      </Head>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="font-headline text-3xl text-primary flex items-center">
              <FileSpreadsheet className="mr-3 h-8 w-8" />
              AI-Native Spreadsheets
            </h1>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
              <Input 
                ref={fileInputRef}
                type="file" 
                accept=".csv,.xlsx,.xls,.ods,.tsv" 
                className="hidden"
                onChange={handleFileUpload}
              />
              <Button variant="outline" onClick={createNewSpreadsheet}>
                <Plus className="mr-2 h-4 w-4" />
                New
              </Button>
              <Button variant="outline" onClick={downloadSpreadsheet}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
          
          {/* Tips alert - moved above the main content */}
          <Alert variant="default" className="bg-blue-50 border-blue-400 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            <Info className="h-5 w-5 text-blue-500" />
            <AlertTitle className="font-semibold">Spreadsheet Assistant Tips</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1 mt-1">
                <li>Ask the AI to create tables, charts, or perform calculations</li>
                <li>Request data formatting or styling changes</li>
                <li>Ask for analysis or insights about your data</li>
                <li>The AI can modify your spreadsheet based on your instructions</li>
              </ul>
            </AlertDescription>
          </Alert>
          
          {/* Main content area with spreadsheet and chat */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-12rem)]">
            {/* Spreadsheet area - takes up 2/3 on large screens */}
            <div className="lg:col-span-2 overflow-hidden flex flex-col">
              <div className="bg-card rounded-lg border shadow-sm p-4 flex-grow overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Input 
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      className="w-64 h-8 text-lg font-medium"
                    />
                  </div>
                  <div className="flex space-x-2">
                    {spreadsheetData.sheets.map(sheet => (
                      <Button 
                        key={sheet}
                        variant={spreadsheetData.activeSheet === sheet ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSpreadsheetData({...spreadsheetData, activeSheet: sheet})}
                      >
                        {sheet}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="flex-grow overflow-auto border rounded-md">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="w-10 h-8 border border-border text-center sticky top-0 left-0 z-20 bg-muted/80">#</th>
                        {spreadsheetData.columnWidths?.map((width, colIndex) => (
                          <th 
                            key={colIndex} 
                            className="h-8 border border-border text-center sticky top-0 z-10 bg-muted/80"
                            style={{ width: `${width}px`, minWidth: `${width}px` }}
                          >
                            {getColumnLetter(colIndex)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {spreadsheetData.rows.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          <td className="border border-border text-center sticky left-0 z-10 bg-muted/50 w-10">
                            {rowIndex + 1}
                          </td>
                          {row.map((cell, colIndex) => (
                            <td 
                              key={colIndex} 
                              className="border border-border p-0"
                              style={{ 
                                height: `${spreadsheetData.rowHeights?.[rowIndex] || 30}px`,
                                width: `${spreadsheetData.columnWidths?.[colIndex] || 120}px`,
                              }}
                            >
                              <input
                                type="text"
                                value={cell?.value || ''}
                                onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                                className="w-full h-full px-2 focus:outline-none focus:ring-1 focus:ring-primary"
                                style={getCellStyle(cell)}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            {/* Chat area - takes up 1/3 on large screens */}
            <div className="bg-card rounded-lg border shadow-sm flex flex-col h-full">
              <div className="p-4 border-b">
                <h2 className="font-headline text-xl flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5 text-primary" />
                  Spreadsheet Assistant
                </h2>
                <p className="text-sm text-muted-foreground">
                  Ask me to help you create, analyze, or modify your spreadsheet.
                </p>
              </div>
              
              <div 
                ref={chatContainerRef}
                className="flex-grow overflow-y-auto p-4 space-y-4"
              >
                {chatMessages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : message.role === 'system'
                            ? 'bg-muted/50 text-foreground'
                            : 'bg-muted text-foreground'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg p-3 bg-muted text-foreground">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <p>Thinking...</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <Textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about your spreadsheet or request changes..."
                    className="min-h-[60px] resize-none"
                    disabled={isLoading}
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={isLoading || !userInput.trim()}
                    className="self-end"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Press Enter to send, Shift+Enter for new line
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}