
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
import * as XLSX from 'xlsx';

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

interface SpreadsheetOperation {
  type: string;
  details: any;
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
  const [fileName, setFileName] = useState('New Spreadsheet');
  const [originalWorkbook, setOriginalWorkbook] = useState<XLSX.WorkBook | null>(null);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load XLSX library dynamically
    const loadXLSX = async () => {
      try {
        await import('xlsx');
      } catch (error) {
        console.error('Failed to load XLSX library:', error);
        toast({
          variant: "destructive",
          title: "Library Error",
          description: "Failed to load spreadsheet processing library. Please refresh the page.",
        });
      }
    };
    
    loadXLSX();
    
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
      // Read the file as an ArrayBuffer
      const arrayBuffer = await readFileAsArrayBuffer(file);
      
      // Process different file types
      if (file.name.endsWith('.csv')) {
        // For CSV files
        processCSVFile(arrayBuffer, file.name);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        // For Excel files
        processExcelFile(arrayBuffer, file.name);
      } else {
        // Try to process as CSV for other formats
        processCSVFile(arrayBuffer, file.name);
      }
    } catch (error) {
      console.error('Error loading spreadsheet:', error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "Failed to load the spreadsheet. The file format may be unsupported or corrupted.",
      });
      
      // Create a new empty spreadsheet as fallback
      createNewSpreadsheet();
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

  const processCSVFile = (arrayBuffer: ArrayBuffer, filename: string) => {
    try {
      // Use XLSX to parse CSV
      const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
      setOriginalWorkbook(workbook);
      
      // Get the first sheet
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 });
      
      // Create spreadsheet data
      updateSpreadsheetWithParsedData(jsonData, filename, workbook.SheetNames);
    } catch (error) {
      console.error('Error processing CSV:', error);
      throw new Error('Failed to process CSV file');
    }
  };

  const processExcelFile = (arrayBuffer: ArrayBuffer, filename: string) => {
    try {
      // Use XLSX to parse Excel
      const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
      setOriginalWorkbook(workbook);
      
      // Get the first sheet
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 });
      
      // Create spreadsheet data
      updateSpreadsheetWithParsedData(jsonData, filename, workbook.SheetNames);
    } catch (error) {
      console.error('Error processing Excel:', error);
      throw new Error('Failed to process Excel file');
    }
  };

  const updateSpreadsheetWithParsedData = (parsedData: any[][], filename: string, sheetNames: string[] = ['Sheet1']) => {
    // Ensure we have data
    if (!parsedData || parsedData.length === 0) {
      parsedData = [[]];
    }
    
    // Create a spreadsheet data structure from the parsed data
    const newSpreadsheetData: SpreadsheetData = {
      rows: parsedData.map(row => 
        row.map(value => ({ 
          value: value !== null && value !== undefined ? String(value) : '' 
        }))
      ),
      columnWidths: Array(Math.max(...parsedData.map(row => row.length), 10)).fill(120),
      rowHeights: Array(Math.max(parsedData.length, 20)).fill(30),
      activeSheet: sheetNames[0],
      sheets: sheetNames
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
    if (parsedData.length > 0 && parsedData[0].length > 0) {
      headers = parsedData[0]
        .map(header => header !== null && header !== undefined ? String(header) : '')
        .filter(Boolean)
        .join(', ');
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
    setOriginalWorkbook(null);
    
    setChatMessages([
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
        
        Analyze what changes need to be made to the spreadsheet. I will implement these changes directly based on your analysis.
        
        Return your response in JSON format with these fields:
        {
          "operations": [
            {
              "type": "find_replace", // or "add_column", "add_row", "update_cell", "format_cells", etc.
              "details": {
                // Specific details for each operation type
                // For find_replace: { "find": "text to find", "replace": "replacement text" }
                // For add_column: { "header": "column name", "position": 3, "values": ["val1", "val2"] }
                // For update_cell: { "row": 2, "col": 3, "value": "new value" }
              }
            }
          ],
          "explanation": "A clear explanation of what changes should be made"
        }
        
        If you can't determine specific operations, just provide an explanation field with your response.
      `;
      
      const response = await puter.ai.chat(prompt, { model: 'gpt-4o' });
      
      if (!response?.message?.content) {
        throw new Error("AI response was empty.");
      }
      
      // Process the AI's response to actually modify the spreadsheet
      const aiResponseText = response.message.content;
      let aiResponse;
      let operations: SpreadsheetOperation[] = [];
      let explanation = "";
      
      try {
        // Try to parse the JSON response
        const jsonStart = aiResponseText.indexOf('{');
        const jsonEnd = aiResponseText.lastIndexOf('}') + 1;
        if (jsonStart >= 0 && jsonEnd > jsonStart) {
          const jsonStr = aiResponseText.substring(jsonStart, jsonEnd);
          aiResponse = JSON.parse(jsonStr);
          operations = aiResponse.operations || [];
          explanation = aiResponse.explanation || aiResponseText;
        } else {
          explanation = aiResponseText;
        }
      } catch (error) {
        console.error("Failed to parse AI response as JSON:", error);
        explanation = aiResponseText;
      }
      
      // Implement the actual spreadsheet modifications based on operations
      let updatedSpreadsheet = { ...spreadsheetData };
      let operationsPerformed = false;
      
      // Process each operation
      for (const operation of operations) {
        switch (operation.type) {
          case 'find_replace':
            if (operation.details?.find && operation.details?.replace) {
              const findText = operation.details.find;
              const replaceText = operation.details.replace;
              
              // Perform find and replace across all cells
              updatedSpreadsheet.rows = updatedSpreadsheet.rows.map(row => 
                row.map(cell => ({
                  ...cell,
                  value: cell.value.replace(new RegExp(findText, 'g'), replaceText)
                }))
              );
              operationsPerformed = true;
            }
            break;
            
          case 'add_column':
            if (operation.details?.header) {
              const header = operation.details.header;
              const position = operation.details.position || updatedSpreadsheet.rows[0].length;
              const values = operation.details.values || [];
              
              // Add a new column
              updatedSpreadsheet.rows = updatedSpreadsheet.rows.map((row, rowIndex) => {
                const newRow = [...row];
                if (rowIndex === 0) {
                  // Add header
                  newRow.splice(position, 0, { 
                    value: header, 
                    style: { bold: true, backgroundColor: '#f0f0f0' } 
                  });
                } else {
                  // Add value or empty cell
                  const value = rowIndex - 1 < values.length ? values[rowIndex - 1] : '';
                  newRow.splice(position, 0, { value: String(value) });
                }
                return newRow;
              });
              
              // Update column widths
              if (updatedSpreadsheet.columnWidths) {
                updatedSpreadsheet.columnWidths.splice(position, 0, 120);
              }
              
              operationsPerformed = true;
            }
            break;
            
          case 'update_cell':
            if (operation.details?.row !== undefined && 
                operation.details?.col !== undefined && 
                operation.details?.value !== undefined) {
              
              const row = operation.details.row;
              const col = operation.details.col;
              const value = operation.details.value;
              
              // Make sure the row and column exist
              if (row >= 0 && row < updatedSpreadsheet.rows.length &&
                  col >= 0 && col < updatedSpreadsheet.rows[row].length) {
                
                updatedSpreadsheet.rows[row][col] = {
                  ...updatedSpreadsheet.rows[row][col],
                  value: String(value)
                };
                
                operationsPerformed = true;
              }
            }
            break;
            
          case 'format_cells':
            if (operation.details?.cells && operation.details?.style) {
              const cells = operation.details.cells;
              const style = operation.details.style;
              
              for (const cell of cells) {
                const { row, col } = cell;
                
                // Make sure the row and column exist
                if (row >= 0 && row < updatedSpreadsheet.rows.length &&
                    col >= 0 && col < updatedSpreadsheet.rows[row].length) {
                  
                  updatedSpreadsheet.rows[row][col] = {
                    ...updatedSpreadsheet.rows[row][col],
                    style: {
                      ...updatedSpreadsheet.rows[row][col].style,
                      ...style
                    }
                  };
                }
              }
              
              operationsPerformed = true;
            }
            break;
            
          // Add more operation types as needed
        }
      }
      
      // If no operations were performed but we have a user request that looks like a find/replace
      if (!operationsPerformed) {
        // Handle common operations based on user input patterns
        if (userInput.toLowerCase().includes('change') || 
            userInput.toLowerCase().includes('replace')) {
          
          // Try to extract find and replace terms
          const findReplacePattern = /change\s+["']?([^"']+)["']?\s+to\s+["']?([^"']+)["']?/i;
          const match = userInput.match(findReplacePattern);
          
          if (match && match.length >= 3) {
            const findText = match[1].trim();
            const replaceText = match[2].trim();
            
            // Perform find and replace across all cells
            updatedSpreadsheet.rows = updatedSpreadsheet.rows.map(row => 
              row.map(cell => ({
                ...cell,
                value: cell.value.replace(new RegExp(findText, 'g'), replaceText)
              }))
            );
            
            operationsPerformed = true;
            explanation = `I've replaced all instances of "${findText}" with "${replaceText}" throughout the spreadsheet.`;
          }
        }
        
        // Handle adding a column
        else if (userInput.toLowerCase().includes('add') && 
                 userInput.toLowerCase().includes('column')) {
          
          // Try to extract column name
          const columnNamePattern = /add\s+(?:a\s+)?column\s+(?:for|called|named|with header)\s+["']?([^"']+)["']?/i;
          const match = userInput.match(columnNamePattern);
          
          if (match && match.length >= 2) {
            const columnName = match[1].trim();
            
            // Add a new column
            updatedSpreadsheet.rows = updatedSpreadsheet.rows.map((row, rowIndex) => {
              const newRow = [...row];
              if (rowIndex === 0) {
                // Add header
                newRow.push({ 
                  value: columnName, 
                  style: { bold: true, backgroundColor: '#f0f0f0' } 
                });
              } else {
                // Add empty cell
                newRow.push({ value: '' });
              }
              return newRow;
            });
            
            // Update column widths
            if (updatedSpreadsheet.columnWidths) {
              updatedSpreadsheet.columnWidths.push(120);
            }
            
            operationsPerformed = true;
            explanation = `I've added a new column titled "${columnName}" to your spreadsheet.`;
          }
        }
      }
      
      // Update the spreadsheet if operations were performed
      if (operationsPerformed) {
        setSpreadsheetData(updatedSpreadsheet);
      }
      
      // Add the AI's response to the chat
      setChatMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: explanation,
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
      const rowValues = row.map(cell => cell.value || '');
      
      if (rowValues.some(value => value !== '')) {
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
    try {
      // Create a new workbook
      const wb = originalWorkbook || XLSX.utils.book_new();
      
      // Convert the current spreadsheet data to a worksheet
      const wsData = spreadsheetData.rows.map(row => 
        row.map(cell => cell.value)
      );
      
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      
      // Add the worksheet to the workbook
      // Only attempt to remove a sheet if originalWorkbook exists,
      // otherwise a new workbook is created and doesn't have a sheet to remove
      if (originalWorkbook) {
         XLSX.utils.book_remove_sheet(wb, 0); // Remove existing sheet if any
      }
      XLSX.utils.book_append_sheet(wb, ws, spreadsheetData.activeSheet);
      
      // Generate the file
      XLSX.writeFile(wb, `${fileName.replace(/\.[^/.]+$/, '')}.xlsx`);
      
      toast({
        title: "Download Complete",
        description: `${fileName.replace(/\.[^/.]+$/, '')}.xlsx has been downloaded.`,
      });
    } catch (error) {
      console.error('Error downloading spreadsheet:', error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Failed to download the spreadsheet. Please try again.",
      });
    }
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
