'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Loader2, Send, FileSpreadsheet, Download, Upload, Image } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SpreadsheetData, ChatMessage, AISpreadsheetResponse, SpreadsheetCell, SpreadsheetOperation } from '@/types/ai-spreadsheets';
import * as XLSX from 'xlsx';

export default function AISpreadsheets() {
  const [spreadsheetData, setSpreadsheetData] = useState<SpreadsheetData>({
    rows: Array(20).fill(null).map(() => Array(10).fill(null).map(() => ({ value: '' }))),
    columnWidths: Array(10).fill(100),
    rowHeights: Array(20).fill(24),
    activeSheet: 'Sheet1',
    sheets: ['Sheet1']
  });
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'system',
      content: 'Welcome to AI Spreadsheets! I can help you create and modify spreadsheets through natural language. Try asking me to "add sales data for Q1-Q4" or "calculate the sum of column B".',
      timestamp: new Date()
    }
  ]);
  
  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [spreadsheetContext, setSpreadsheetContext] = useState<File | null>(null);
  const [screenshotContext, setScreenshotContext] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const spreadsheetContextInputRef = useRef<HTMLInputElement>(null);
  const screenshotContextInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleUserInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput(e.target.value);
  };

  const handleSpreadsheetContextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
          file.type === 'application/vnd.ms-excel' ||
          file.type === 'text/csv') {
        setSpreadsheetContext(file);
        toast({
          title: "Spreadsheet added",
          description: `${file.name} will be used as context for the AI.`,
        });
        
        // Read the spreadsheet data
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            // Convert to our spreadsheet format
            const newRows: SpreadsheetCell[][] = [];
            jsonData.forEach((row: any) => {
              const newRow: SpreadsheetCell[] = [];
              if (Array.isArray(row)) {
                row.forEach((cell) => {
                  newRow.push({ value: cell?.toString() || '' });
                });
              }
              newRows.push(newRow);
            });
            
            // Ensure all rows have the same number of columns
            const maxCols = Math.max(...newRows.map(row => row.length), 10);
            newRows.forEach(row => {
              while (row.length < maxCols) {
                row.push({ value: '' });
              }
            });
            
            // Ensure we have at least 20 rows
            while (newRows.length < 20) {
              newRows.push(Array(maxCols).fill(null).map(() => ({ value: '' })));
            }
            
            setSpreadsheetData({
              ...spreadsheetData,
              rows: newRows,
              columnWidths: Array(maxCols).fill(100),
              rowHeights: Array(newRows.length).fill(24)
            });
            
            // Add a system message
            setChatMessages([
              ...chatMessages,
              {
                role: 'system',
                content: `Spreadsheet "${file.name}" has been loaded. I can now help you work with this data.`,
                timestamp: new Date()
              }
            ]);
          } catch (error) {
            console.error('Error reading spreadsheet:', error);
            toast({
              variant: "destructive",
              title: "Error reading spreadsheet",
              description: "The file could not be processed. Please try another file.",
            });
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload an Excel or CSV file.",
        });
      }
    }
  };

  const handleScreenshotContextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        setScreenshotContext(file);
        
        // Create a preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setScreenshotPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
        
        toast({
          title: "Screenshot added",
          description: `${file.name} will be analyzed by the AI.`,
        });
        
        // Add a system message
        setChatMessages([
          ...chatMessages,
          {
            role: 'system',
            content: `Screenshot "${file.name}" has been uploaded. I'll analyze this image to understand your data better.`,
            timestamp: new Date()
          }
        ]);
      } else {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload an image file (PNG, JPG, etc.).",
        });
      }
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    
    const userMessage: ChatMessage = {
      role: 'user',
      content: userInput,
      timestamp: new Date()
    };
    
    setChatMessages([...chatMessages, userMessage]);
    setUserInput('');
    setIsProcessing(true);
    
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
      
      // Prepare the prompt with current spreadsheet state
      let prompt = `You are an AI assistant specialized in helping users with spreadsheet operations. 
      The user has a spreadsheet with the following data:\n\n`;
      
      // Add current spreadsheet state to the prompt
      prompt += `Current spreadsheet state:\n`;
      spreadsheetData.rows.forEach((row, rowIndex) => {
        const rowValues = row.map(cell => cell.value || '').join('\t');
        if (rowValues.trim()) {  // Only include non-empty rows
          prompt += `Row ${rowIndex + 1}: ${rowValues}\n`;
        }
      });
      
      prompt += `\nThe user's request is: "${userInput}"\n\n`;
      
      // Add instructions for response format
      prompt += `Please respond with a JSON object that contains:
      1. "operations": An array of operations to perform on the spreadsheet
      2. "explanation": A brief explanation of what you did
      
      Each operation should have a "type" and "details" field. Supported operation types:
      - "update_cell": Update a single cell (details: {row, column, value, formula})
      - "update_row": Update an entire row (details: {row, values})
      - "update_column": Update an entire column (details: {column, values})
      - "add_row": Add a new row (details: {position, values})
      - "add_column": Add a new column (details: {position, header, values})
      - "delete_row": Delete a row (details: {row})
      - "delete_column": Delete a column (details: {column})
      - "format": Format cells (details: {range, style})
      - "find_replace": Find and replace text (details: {find, replace})
      
      Example response:
      {
        "operations": [
          {
            "type": "add_column",
            "details": {
              "position": 3,
              "header": "Total",
              "values": ["=B2+C2", "=B3+C3"]
            }
          }
        ],
        "explanation": "Added a Total column that sums the values in columns B and C."
      }
      
      Return ONLY the JSON object, nothing else.`;
      
      // Process screenshot if available
      let response;
      if (screenshotContext && screenshotPreview) {
        // Use GPT-4 Vision to analyze the screenshot
        prompt += `\n\nThe user has also provided a screenshot of data. Please analyze this image and incorporate the information into your response.`;
        response = await puter.ai.chat(prompt, screenshotPreview);
      } else {
        response = await puter.ai.chat(prompt, { model: 'gpt-4o' });
      }
      
      if (!response?.message?.content) {
        throw new Error("AI did not return a valid response.");
      }
      
      // Parse the AI response
      let aiResponseData: AISpreadsheetResponse;
      try {
        // Clean the response if it contains markdown code blocks
        let content = response.message.content;
        if (content.includes("```json")) {
          content = content.split("```json")[1].split("```")[0].trim();
        } else if (content.includes("```")) {
          content = content.split("```")[1].split("```")[0].trim();
        }
        
        aiResponseData = JSON.parse(content);
      } catch (error) {
        console.error("Failed to parse AI response:", error);
        throw new Error("Failed to parse AI response. Please try again with a clearer request.");
      }
      
      // Apply the operations to the spreadsheet
      const newSpreadsheetData = applyOperations(spreadsheetData, aiResponseData.operations);
      setSpreadsheetData(newSpreadsheetData);
      
      // Add the AI response to the chat
      setChatMessages([
        ...chatMessages, 
        userMessage,
        {
          role: 'assistant',
          content: aiResponseData.explanation,
          timestamp: new Date()
        }
      ]);
      
      // Clear the screenshot context after processing
      if (screenshotContext) {
        setScreenshotContext(null);
        setScreenshotPreview(null);
      }
      
    } catch (error) {
      console.error("Error processing request:", error);
      setChatMessages([
        ...chatMessages,
        userMessage,
        {
          role: 'assistant',
          content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const applyOperations = (currentData: SpreadsheetData, operations: SpreadsheetOperation[]): SpreadsheetData => {
    let newData = { ...currentData };
    let newRows = [...currentData.rows.map(row => [...row.map(cell => ({ ...cell }))])];
    
    operations.forEach(operation => {
      switch (operation.type) {
        case 'update_cell': {
          const { row, column, value, formula } = operation.details;
          // Ensure the grid is large enough
          ensureGridSize(newRows, row, column);
          
          if (row >= 0 && column >= 0) {
            newRows[row][column] = { 
              value: value || '', 
              formula: formula || undefined 
            };
          }
          break;
        }
        
        case 'update_row': {
          const { row, values } = operation.details;
          // Ensure the grid is large enough
          ensureGridSize(newRows, row, values.length - 1);
          
          if (row >= 0 && Array.isArray(values)) {
            values.forEach((value, colIndex) => {
              if (colIndex < newRows[row].length) {
                newRows[row][colIndex] = { value: value || '' };
              }
            });
          }
          break;
        }
        
        case 'update_column': {
          const { column, values } = operation.details;
          // Ensure the grid is large enough
          ensureGridSize(newRows, values.length - 1, column);
          
          if (column >= 0 && Array.isArray(values)) {
            values.forEach((value, rowIndex) => {
              if (rowIndex < newRows.length) {
                newRows[rowIndex][column] = { value: value || '' };
              }
            });
          }
          break;
        }
        
        case 'add_row': {
          const { position, values } = operation.details;
          const newRow = Array.isArray(values) 
            ? values.map(value => ({ value: value || '' }))
            : Array(newRows[0]?.length || 10).fill(null).map(() => ({ value: '' }));
          
          // Ensure all rows have the same number of columns
          const maxCols = Math.max(newRows[0]?.length || 0, newRow.length);
          
          // Pad the new row if needed
          while (newRow.length < maxCols) {
            newRow.push({ value: '' });
          }
          
          // Pad existing rows if needed
          newRows = newRows.map(row => {
            while (row.length < maxCols) {
              row.push({ value: '' });
            }
            return row;
          });
          
          if (position >= 0 && position <= newRows.length) {
            newRows.splice(position, 0, newRow);
          } else {
            newRows.push(newRow);
          }
          
          // Update row heights
          newData.rowHeights = Array(newRows.length).fill(24);
          break;
        }
        
        case 'add_column': {
          const { position, header, values } = operation.details;
          const headerValue = header || '';
          
          // Calculate how many rows we need
          const totalRows = Math.max(newRows.length, (values?.length || 0) + 1); // +1 for header
          
          // Ensure we have enough rows
          while (newRows.length < totalRows) {
            newRows.push(Array(newRows[0]?.length || 0).fill(null).map(() => ({ value: '' })));
          }
          
          // Add the column
          if (position >= 0 && position <= (newRows[0]?.length || 0)) {
            // Add header and values
            newRows.forEach((row, rowIndex) => {
              if (rowIndex === 0) {
                row.splice(position, 0, { value: headerValue });
              } else if (values && rowIndex - 1 < values.length) {
                row.splice(position, 0, { value: values[rowIndex - 1] || '' });
              } else {
                row.splice(position, 0, { value: '' });
              }
            });
          } else {
            // Add to the end
            newRows.forEach((row, rowIndex) => {
              if (rowIndex === 0) {
                row.push({ value: headerValue });
              } else if (values && rowIndex - 1 < values.length) {
                row.push({ value: values[rowIndex - 1] || '' });
              } else {
                row.push({ value: '' });
              }
            });
          }
          
          // Update column widths
          newData.columnWidths = Array(newRows[0]?.length || 0).fill(100);
          break;
        }
        
        case 'delete_row': {
          const { row } = operation.details;
          if (row >= 0 && row < newRows.length) {
            newRows.splice(row, 1);
            
            // Ensure we have at least one row
            if (newRows.length === 0) {
              newRows.push(Array(10).fill(null).map(() => ({ value: '' })));
            }
            
            // Update row heights
            newData.rowHeights = Array(newRows.length).fill(24);
          }
          break;
        }
        
        case 'delete_column': {
          const { column } = operation.details;
          if (column >= 0 && newRows[0] && column < newRows[0].length) {
            newRows.forEach(row => {
              row.splice(column, 1);
              
              // Ensure we have at least one column
              if (row.length === 0) {
                row.push({ value: '' });
              }
            });
            
            // Update column widths
            newData.columnWidths = Array(newRows[0]?.length || 0).fill(100);
          }
          break;
        }
        
        case 'format': {
          const { range, style } = operation.details;
          // Simple implementation for now - just apply to a single cell
          if (range && range.row >= 0 && range.column >= 0 && style) {
            // Ensure the grid is large enough
            ensureGridSize(newRows, range.row, range.column);
            
            newRows[range.row][range.column] = {
              ...newRows[range.row][range.column],
              style: {
                ...newRows[range.row][range.column].style,
                ...style
              }
            };
          }
          break;
        }
        
        case 'find_replace': {
          const { find, replace } = operation.details;
          if (find && replace !== undefined) {
            newRows = newRows.map(row => 
              row.map(cell => ({
                ...cell,
                value: cell.value.replace(new RegExp(find, 'g'), replace)
              }))
            );
          }
          break;
        }
      }
    });
    
    return {
      ...newData,
      rows: newRows
    };
  };

  // Helper function to ensure the grid is large enough for the operation
  const ensureGridSize = (rows: SpreadsheetCell[][], rowIndex: number, colIndex: number) => {
    // Add rows if needed
    while (rows.length <= rowIndex) {
      const newRow = Array(rows[0]?.length || Math.max(10, colIndex + 1))
        .fill(null)
        .map(() => ({ value: '' }));
      rows.push(newRow);
    }
    
    // Add columns if needed
    if (colIndex >= 0) {
      rows.forEach(row => {
        while (row.length <= colIndex) {
          row.push({ value: '' });
        }
      });
    }
    
    // Ensure all rows have the same number of columns
    const maxCols = Math.max(...rows.map(row => row.length));
    rows.forEach(row => {
      while (row.length < maxCols) {
        row.push({ value: '' });
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDownloadSpreadsheet = () => {
    try {
      // Convert our data format to XLSX format
      const worksheet = XLSX.utils.aoa_to_sheet(
        spreadsheetData.rows.map(row => row.map(cell => cell.value))
      );
      
      // Create a new workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, spreadsheetData.activeSheet);
      
      // Generate the file
      XLSX.writeFile(workbook, 'ai_spreadsheet.xlsx');
    } catch (error) {
      console.error("Error downloading spreadsheet:", error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Failed to download the spreadsheet. Please try again.",
      });
    }
  };

  const handleAddDummyData = () => {
    // Create some sample data
    const dummyData: SpreadsheetCell[][] = [
      [{ value: 'Product' }, { value: 'Q1 Sales' }, { value: 'Q2 Sales' }, { value: 'Q3 Sales' }, { value: 'Q4 Sales' }],
      [{ value: 'Widgets' }, { value: '1200' }, { value: '1500' }, { value: '1300' }, { value: '1700' }],
      [{ value: 'Gadgets' }, { value: '850' }, { value: '900' }, { value: '950' }, { value: '1100' }],
      [{ value: 'Doohickeys' }, { value: '450' }, { value: '500' }, { value: '600' }, { value: '700' }],
      [{ value: 'Thingamajigs' }, { value: '350' }, { value: '400' }, { value: '450' }, { value: '500' }]
    ];
    
    // Create a new grid with the dummy data
    const newRows = [...spreadsheetData.rows];
    
    // Ensure the grid is large enough
    ensureGridSize(newRows, dummyData.length - 1, dummyData[0].length - 1);
    
    // Copy the dummy data into the grid
    dummyData.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        newRows[rowIndex][colIndex] = { ...cell };
      });
    });
    
    setSpreadsheetData({
      ...spreadsheetData,
      rows: newRows
    });
    
    toast({
      title: "Sample data added",
      description: "Sample sales data has been added to the spreadsheet.",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Spreadsheet Section */}
        <div className="flex-1">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileSpreadsheet className="mr-2 h-6 w-6" />
                AI-Native Spreadsheet
              </CardTitle>
              <CardDescription>
                Create and modify your spreadsheet using natural language
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="w-10 bg-muted p-2 text-center">#</th>
                      {spreadsheetData.rows[0]?.map((_, colIndex) => (
                        <th key={colIndex} className="min-w-[100px] border bg-muted p-2 text-center">
                          {String.fromCharCode(65 + colIndex)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {spreadsheetData.rows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        <td className="border bg-muted p-2 text-center">{rowIndex + 1}</td>
                        {row.map((cell, colIndex) => (
                          <td 
                            key={colIndex} 
                            className="border p-2"
                            style={{
                              fontWeight: cell.style?.bold ? 'bold' : 'normal',
                              fontStyle: cell.style?.italic ? 'italic' : 'normal',
                              color: cell.style?.color || 'inherit',
                              backgroundColor: cell.style?.backgroundColor || 'inherit',
                              textAlign: cell.style?.textAlign || 'left'
                            }}
                          >
                            {cell.value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleAddDummyData}>
                Add Sample Data
              </Button>
              <Button onClick={handleDownloadSpreadsheet}>
                <Download className="mr-2 h-4 w-4" />
                Download Spreadsheet
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Chat Section */}
        <div className="w-full lg:w-1/3">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>AI Assistant</CardTitle>
              <CardDescription>
                Chat with the AI to modify your spreadsheet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                ref={chatContainerRef}
                className="h-[400px] overflow-y-auto mb-4 p-4 border rounded-md"
              >
                {chatMessages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`mb-4 ${
                      message.role === 'user' 
                        ? 'text-right' 
                        : message.role === 'system' 
                          ? 'text-center italic text-muted-foreground' 
                          : 'text-left'
                    }`}
                  >
                    <div 
                      className={`inline-block rounded-lg px-4 py-2 ${
                        message.role === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : message.role === 'system' 
                            ? 'bg-muted text-muted-foreground text-sm' 
                            : 'bg-muted'
                      }`}
                    >
                      {message.content}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                ))}
                {isProcessing && (
                  <div className="flex justify-center items-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                )}
                
                {/* Display screenshot preview if available */}
                {screenshotPreview && (
                  <div className="my-4 p-2 border rounded-md">
                    <p className="text-sm text-muted-foreground mb-2">Screenshot context:</p>
                    <img 
                      src={screenshotPreview} 
                      alt="Screenshot context" 
                      className="max-w-full h-auto rounded-md"
                    />
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 mb-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => spreadsheetContextInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Add spreadsheet context
                </Button>
                <Input
                  ref={spreadsheetContextInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={handleSpreadsheetContextChange}
                />
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => screenshotContextInputRef.current?.click()}
                >
                  <Image className="h-4 w-4 mr-1" />
                  Add screenshot context
                </Button>
                <Input
                  ref={screenshotContextInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleScreenshotContextChange}
                />
              </div>
              
              <div className="flex gap-2">
                <Textarea
                  value={userInput}
                  onChange={handleUserInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask the AI to modify your spreadsheet..."
                  className="flex-1"
                  disabled={isProcessing}
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={isProcessing || !userInput.trim()}
                  className="self-end"
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="mt-12 max-w-3xl mx-auto prose dark:prose-invert">
        <h2>How to Use AI-Native Spreadsheets</h2>
        
        <p>
          This AI-powered spreadsheet allows you to create and modify spreadsheets using natural language commands.
          Simply chat with the AI assistant and tell it what you want to do with your data.
        </p>
        
        <h3>Example Commands</h3>
        
        <ul>
          <li><strong>Add data:</strong> "Add sales data for Q1-Q4 for our top 5 products"</li>
          <li><strong>Calculations:</strong> "Calculate the sum of column B" or "Find the average of row 3"</li>
          <li><strong>Formatting:</strong> "Make the header row bold" or "Color cells with values over 1000 in green"</li>
          <li><strong>Analysis:</strong> "What's the trend in our Q1 to Q4 sales?" or "Which product had the highest growth?"</li>
          <li><strong>Transformations:</strong> "Convert all values in column C to percentages"</li>
        </ul>
        
        <h3>Adding Context</h3>
        
        <p>
          You can upload an existing spreadsheet or a screenshot of data to provide context to the AI:
        </p>
        
        <ul>
          <li><strong>Spreadsheet Context:</strong> Upload an Excel or CSV file to work with existing data</li>
          <li><strong>Screenshot Context:</strong> Upload an image of a table or data that the AI will analyze using computer vision</li>
        </ul>
        
        <h3>Tips for Best Results</h3>
        
        <ul>
          <li>Be specific in your requests</li>
          <li>For complex operations, break them down into smaller steps</li>
          <li>When uploading screenshots, ensure the data is clearly visible</li>
          <li>You can download your spreadsheet at any time to save your work</li>
        </ul>
      </div>
    </div>
  );
}