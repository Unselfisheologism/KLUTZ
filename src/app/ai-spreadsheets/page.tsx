'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, Download, Upload, FileSpreadsheet, Trash2, Plus, Info, Image } from 'lucide-react';
import { SpreadsheetData, ChatMessage, AISpreadsheetResponse, SpreadsheetOperation } from '@/types/ai-spreadsheets';
import * as XLSX from 'xlsx';
import { preprocessImage } from '@/lib/image-utils';

export default function AISpreadsheets() {
  const [spreadsheetData, setSpreadsheetData] = useState<SpreadsheetData>({
    rows: Array(10).fill(null).map(() => Array(5).fill(null).map(() => ({ value: '' }))),
    activeSheet: 'Sheet1',
    sheets: ['Sheet1']
  });
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'system',
      content: 'Welcome to AI Spreadsheets! I can help you create and modify spreadsheets through natural language. Try asking me to "add sales data for Q1" or "calculate the sum of column B".',
      timestamp: new Date()
    }
  ]);
  
  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [contextFile, setContextFile] = useState<File | null>(null);
  const [contextImageUrl, setContextImageUrl] = useState<string | null>(null);
  const [contextSpreadsheetFile, setContextSpreadsheetFile] = useState<File | null>(null);
  const [contextSpreadsheetData, setContextSpreadsheetData] = useState<any | null>(null);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Auto-scroll chat to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);
  
  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = [...spreadsheetData.rows];
    
    // Ensure the row exists
    while (newRows.length <= rowIndex) {
      newRows.push(Array(spreadsheetData.rows[0]?.length || 5).fill(null).map(() => ({ value: '' })));
    }
    
    // Ensure the column exists in all rows
    for (let i = 0; i < newRows.length; i++) {
      while (newRows[i].length <= colIndex) {
        newRows[i].push({ value: '' });
      }
    }
    
    // Update the cell
    newRows[rowIndex][colIndex] = { ...newRows[rowIndex][colIndex], value };
    setSpreadsheetData({ ...spreadsheetData, rows: newRows });
  };
  
  const addRow = (index: number, values: any[] = []) => {
    const newRows = [...spreadsheetData.rows];
    const columnCount = Math.max(
      newRows[0]?.length || 5,
      values.length
    );
    
    // Ensure all existing rows have the same number of columns
    for (let i = 0; i < newRows.length; i++) {
      while (newRows[i].length < columnCount) {
        newRows[i].push({ value: '' });
      }
    }
    
    // Create the new row with the right number of columns
    const newRow = Array(columnCount).fill(null).map((_, i) => {
      return i < values.length ? { value: String(values[i]) } : { value: '' };
    });
    
    // Insert the new row at the specified index
    newRows.splice(index, 0, newRow);
    
    setSpreadsheetData({ ...spreadsheetData, rows: newRows });
    return newRows;
  };
  
  const addColumn = (index: number, values: any[] = []) => {
    const newRows = [...spreadsheetData.rows];
    
    // Ensure we have enough rows for all values
    while (newRows.length < values.length) {
      newRows.push(Array(newRows[0]?.length || 5).fill(null).map(() => ({ value: '' })));
    }
    
    // Add the new column to each row
    for (let i = 0; i < newRows.length; i++) {
      const value = i < values.length ? String(values[i]) : '';
      newRows[i].splice(index, 0, { value });
    }
    
    setSpreadsheetData({ ...spreadsheetData, rows: newRows });
    return newRows;
  };
  
  const deleteRow = (index: number) => {
    const newRows = [...spreadsheetData.rows];
    newRows.splice(index, 1);
    
    // Ensure we always have at least one row
    if (newRows.length === 0) {
      newRows.push(Array(5).fill(null).map(() => ({ value: '' })));
    }
    
    setSpreadsheetData({ ...spreadsheetData, rows: newRows });
  };
  
  const deleteColumn = (index: number) => {
    const newRows = [...spreadsheetData.rows];
    
    // Remove the column from each row
    for (let i = 0; i < newRows.length; i++) {
      newRows[i].splice(index, 1);
      
      // Ensure we always have at least one column
      if (newRows[i].length === 0) {
        newRows[i].push({ value: '' });
      }
    }
    
    setSpreadsheetData({ ...spreadsheetData, rows: newRows });
  };
  
  const clearSpreadsheet = () => {
    setSpreadsheetData({
      rows: Array(10).fill(null).map(() => Array(5).fill(null).map(() => ({ value: '' }))),
      activeSheet: 'Sheet1',
      sheets: ['Sheet1']
    });
    
    toast({
      title: "Spreadsheet cleared",
      description: "All data has been removed from the spreadsheet."
    });
  };
  
  const addDummyData = () => {
    const headers = ['Product', 'Category', 'Price', 'Quantity', 'Total'];
    const products = [
      ['Laptop', 'Electronics', '999.99', '5', '4999.95'],
      ['Smartphone', 'Electronics', '699.99', '10', '6999.90'],
      ['Headphones', 'Accessories', '149.99', '20', '2999.80'],
      ['Monitor', 'Electronics', '349.99', '8', '2799.92'],
      ['Keyboard', 'Accessories', '79.99', '15', '1199.85'],
      ['Mouse', 'Accessories', '49.99', '25', '1249.75'],
      ['Tablet', 'Electronics', '499.99', '12', '5999.88'],
      ['Printer', 'Office', '299.99', '6', '1799.94'],
      ['Desk Chair', 'Furniture', '199.99', '4', '799.96'],
      ['Desk', 'Furniture', '249.99', '3', '749.97']
    ];
    
    // Create a new spreadsheet with the dummy data
    const newRows = [];
    
    // Add header row
    newRows.push(headers.map(header => ({ value: header })));
    
    // Add product rows
    for (const product of products) {
      newRows.push(product.map(value => ({ value })));
    }
    
    // Ensure all rows have the same number of columns
    const maxColumns = Math.max(...newRows.map(row => row.length));
    for (let i = 0; i < newRows.length; i++) {
      while (newRows[i].length < maxColumns) {
        newRows[i].push({ value: '' });
      }
    }
    
    setSpreadsheetData({
      ...spreadsheetData,
      rows: newRows
    });
    
    toast({
      title: "Dummy data added",
      description: "Sample product data has been added to the spreadsheet."
    });
  };
  
  const handleContextFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.type.includes('image')) {
      setContextFile(file);
      try {
        const imageUrl = URL.createObjectURL(file);
        setContextImageUrl(imageUrl);
        setContextSpreadsheetFile(null);
        setContextSpreadsheetData(null);
        
        toast({
          title: "Spreadsheet image added",
          description: "The AI will analyze this image when processing your next request."
        });
      } catch (error) {
        console.error("Error creating object URL:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to process the image file."
        });
      }
    } else if (file.type.includes('spreadsheet') || file.name.endsWith('.xlsx') || file.name.endsWith('.csv')) {
      setContextSpreadsheetFile(file);
      setContextFile(null);
      setContextImageUrl(null);
      
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            setContextSpreadsheetData(jsonData);
            
            toast({
              title: "Spreadsheet file added",
              description: "The AI will use this spreadsheet data when processing your next request."
            });
          } catch (error) {
            console.error("Error parsing spreadsheet:", error);
            toast({
              variant: "destructive",
              title: "Error",
              description: "Failed to parse the spreadsheet file."
            });
          }
        };
        reader.readAsArrayBuffer(file);
      } catch (error) {
        console.error("Error reading file:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to read the spreadsheet file."
        });
      }
    } else {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload an image or spreadsheet file."
      });
    }
  };
  
  const clearContext = () => {
    setContextFile(null);
    setContextImageUrl(null);
    setContextSpreadsheetFile(null);
    setContextSpreadsheetData(null);
    
    toast({
      title: "Context cleared",
      description: "The spreadsheet context has been removed."
    });
  };
  
  const handleUserInputSubmit = async () => {
    if (!userInput.trim()) return;
    
    const userMessage: ChatMessage = {
      role: 'user',
      content: userInput,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
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
      
      // Prepare the current spreadsheet state for the AI
      const currentState = JSON.stringify(spreadsheetData.rows.map(row => 
        row.map(cell => cell.value)
      ));
      
      let prompt = `You are an AI assistant specialized in spreadsheet operations. 
      The user has the following request: "${userInput}"
      
      Current spreadsheet state (JSON array of rows):
      ${currentState}
      
      Please respond with operations to modify the spreadsheet based on the user's request.
      Your response should be a valid JSON object with these properties:
      1. "operations": An array of operation objects, each with "type" and "details" properties
      2. "explanation": A brief explanation of what changes you made
      
      Supported operation types:
      - update_cell: Update a specific cell
      - update_row: Update an entire row
      - update_column: Update an entire column
      - add_row: Add a new row
      - add_column: Add a new column
      - delete_row: Delete a row
      - delete_column: Delete a column
      - format: Apply formatting to cells
      - find_replace: Find and replace text
      
      Example response:
      {
        "operations": [
          {
            "type": "add_row",
            "details": {
              "index": 5,
              "values": ["Product X", "Category Y", "99.99", "10", "999.90"]
            }
          }
        ],
        "explanation": "Added a new product row at position 5."
      }`;
      
      let response;
      
      // If we have a context image, use vision capabilities
      if (contextImageUrl) {
        const preprocessedImage = await preprocessImage(contextFile!, 1024);
        
        const visionPrompt = `
          ${prompt}
          
          The user has also provided a screenshot of a spreadsheet as context. 
          Please analyze this image first to understand the spreadsheet structure and data.
          Then, apply the user's request to the current spreadsheet state provided above.
          
          Important: Focus on the content visible in the spreadsheet image, but apply changes to the current spreadsheet state.
        `;
        
        response = await puter.ai.chat(visionPrompt, preprocessedImage);
      } 
      // If we have a context spreadsheet file
      else if (contextSpreadsheetData) {
        const contextDataString = JSON.stringify(contextSpreadsheetData);
        
        const contextPrompt = `
          ${prompt}
          
          The user has also provided a spreadsheet file as context with the following data:
          ${contextDataString}
          
          Please use this context to better understand the user's request, but apply changes to the current spreadsheet state provided above.
        `;
        
        response = await puter.ai.chat(contextPrompt, { model: 'gpt-4o' });
      }
      // Regular request without additional context
      else {
        response = await puter.ai.chat(prompt, { model: 'gpt-4o' });
      }
      
      if (!response?.message?.content) {
        throw new Error("AI did not return a valid response.");
      }
      
      // Extract the JSON response
      const responseText = response.message.content;
      let jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || 
                      responseText.match(/```\n([\s\S]*?)\n```/) ||
                      responseText.match(/{[\s\S]*}/);
      
      let jsonResponse: AISpreadsheetResponse;
      
      if (jsonMatch) {
        try {
          jsonResponse = JSON.parse(jsonMatch[0].startsWith('{') ? jsonMatch[0] : jsonMatch[1]);
        } catch (e) {
          console.error("Failed to parse JSON response:", e);
          throw new Error("Failed to parse AI response. Please try again.");
        }
      } else {
        throw new Error("AI response did not contain valid JSON.");
      }
      
      // Apply the operations to the spreadsheet
      let newRows = [...spreadsheetData.rows];
      
      for (const operation of jsonResponse.operations) {
        switch (operation.type) {
          case 'update_cell':
            const { row, column, value } = operation.details;
            // Ensure the grid is large enough
            while (newRows.length <= row) {
              const newRow = Array(newRows[0]?.length || 5).fill(null).map(() => ({ value: '' }));
              newRows.push(newRow);
            }
            for (let i = 0; i < newRows.length; i++) {
              while (newRows[i].length <= column) {
                newRows[i].push({ value: '' });
              }
            }
            newRows[row][column] = { value: String(value) };
            break;
            
          case 'update_row':
            const { index: rowIndex, values: rowValues } = operation.details;
            // Ensure the grid is large enough
            while (newRows.length <= rowIndex) {
              const newRow = Array(newRows[0]?.length || 5).fill(null).map(() => ({ value: '' }));
              newRows.push(newRow);
            }
            
            // Ensure all rows have enough columns
            const maxColumns = Math.max(
              ...newRows.map(row => row.length),
              rowValues.length
            );
            
            for (let i = 0; i < newRows.length; i++) {
              while (newRows[i].length < maxColumns) {
                newRows[i].push({ value: '' });
              }
            }
            
            // Update the row
            for (let i = 0; i < rowValues.length; i++) {
              newRows[rowIndex][i] = { value: String(rowValues[i]) };
            }
            break;
            
          case 'update_column':
            const { index: colIndex, values: colValues } = operation.details;
            
            // Ensure we have enough rows for all values
            while (newRows.length < colValues.length) {
              const newRow = Array(newRows[0]?.length || 5).fill(null).map(() => ({ value: '' }));
              newRows.push(newRow);
            }
            
            // Ensure all rows have enough columns
            for (let i = 0; i < newRows.length; i++) {
              while (newRows[i].length <= colIndex) {
                newRows[i].push({ value: '' });
              }
            }
            
            // Update the column
            for (let i = 0; i < colValues.length; i++) {
              if (i < newRows.length) {
                newRows[i][colIndex] = { value: String(colValues[i]) };
              }
            }
            break;
            
          case 'add_row':
            const { index: newRowIndex, values: newRowValues } = operation.details;
            newRows = addRow(newRowIndex, newRowValues);
            break;
            
          case 'add_column':
            const { index: newColIndex, values: newColValues } = operation.details;
            newRows = addColumn(newColIndex, newColValues);
            break;
            
          case 'delete_row':
            const { index: delRowIndex } = operation.details;
            if (delRowIndex < newRows.length) {
              newRows.splice(delRowIndex, 1);
              // Ensure we always have at least one row
              if (newRows.length === 0) {
                newRows.push(Array(5).fill(null).map(() => ({ value: '' })));
              }
            }
            break;
            
          case 'delete_column':
            const { index: delColIndex } = operation.details;
            for (let i = 0; i < newRows.length; i++) {
              if (delColIndex < newRows[i].length) {
                newRows[i].splice(delColIndex, 1);
                // Ensure we always have at least one column
                if (newRows[i].length === 0) {
                  newRows[i].push({ value: '' });
                }
              }
            }
            break;
            
          case 'format':
            // Not implemented yet
            break;
            
          case 'find_replace':
            const { find, replace, column_only } = operation.details;
            for (let i = 0; i < newRows.length; i++) {
              for (let j = 0; j < newRows[i].length; j++) {
                if (!column_only || j === column_only) {
                  if (newRows[i][j].value.includes(find)) {
                    newRows[i][j].value = newRows[i][j].value.replace(new RegExp(find, 'g'), replace);
                  }
                }
              }
            }
            break;
        }
      }
      
      // Ensure all rows have the same number of columns
      const maxCols = Math.max(...newRows.map(row => row.length));
      for (let i = 0; i < newRows.length; i++) {
        while (newRows[i].length < maxCols) {
          newRows[i].push({ value: '' });
        }
      }
      
      setSpreadsheetData({ ...spreadsheetData, rows: newRows });
      
      // Add AI response to chat
      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: jsonResponse.explanation,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, aiMessage]);
      
    } catch (error) {
      console.error("Error processing request:", error);
      
      // Add error message to chat
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, errorMessage]);
      
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred."
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const downloadSpreadsheet = () => {
    try {
      // Convert the spreadsheet data to a worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(
        spreadsheetData.rows.map(row => row.map(cell => cell.value))
      );
      
      // Create a new workbook and add the worksheet
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, spreadsheetData.activeSheet);
      
      // Generate the Excel file
      XLSX.writeFile(workbook, 'spreadsheet.xlsx');
      
      toast({
        title: "Download successful",
        description: "The spreadsheet has been downloaded."
      });
    } catch (error) {
      console.error("Error downloading spreadsheet:", error);
      
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Failed to download the spreadsheet. Please try again."
      });
    }
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
                      {/* Column headers (A, B, C, etc.) */}
                      <th className="w-10 bg-muted p-2 text-center font-medium text-muted-foreground">#</th>
                      {spreadsheetData.rows[0]?.map((_, colIndex) => (
                        <th key={colIndex} className="min-w-[100px] bg-muted p-2 text-center font-medium text-muted-foreground">
                          {String.fromCharCode(65 + colIndex)}
                        </th>
                      ))}
                      <th className="w-10 bg-muted p-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {spreadsheetData.rows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-b">
                        {/* Row headers (1, 2, 3, etc.) */}
                        <td className="bg-muted p-2 text-center font-medium text-muted-foreground">
                          {rowIndex + 1}
                        </td>
                        {row.map((cell, colIndex) => (
                          <td key={colIndex} className="border p-0">
                            <input
                              type="text"
                              value={cell.value}
                              onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                              className="w-full h-full p-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                          </td>
                        ))}
                        <td className="p-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => deleteRow(rowIndex)}
                            className="h-6 w-6"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td className="p-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => addRow(spreadsheetData.rows.length)}
                          className="h-6 w-6"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </td>
                      {spreadsheetData.rows[0]?.map((_, colIndex) => (
                        <td key={colIndex} className="p-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => deleteColumn(colIndex)}
                            className="h-6 w-6 mx-auto block"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      ))}
                      <td className="p-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => addColumn(spreadsheetData.rows[0]?.length || 0)}
                          className="h-6 w-6"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="flex gap-2">
                <Button variant="outline" onClick={clearSpreadsheet}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear
                </Button>
                <Button variant="outline" onClick={addDummyData}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Sample Data
                </Button>
              </div>
              <Button onClick={downloadSpreadsheet}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Chat Section */}
        <div className="w-full lg:w-96">
          <Card className="shadow-lg h-full flex flex-col">
            <CardHeader>
              <CardTitle>AI Assistant</CardTitle>
              <CardDescription>
                Chat with the AI to modify your spreadsheet
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden flex flex-col">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">Spreadsheet Context</h3>
                  {(contextFile || contextSpreadsheetFile) && (
                    <Button variant="ghost" size="sm" onClick={clearContext}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                {contextImageUrl ? (
                  <div className="relative border rounded-md p-2 mb-2">
                    <div className="text-xs text-muted-foreground mb-1">Image context:</div>
                    <img 
                      src={contextImageUrl} 
                      alt="Spreadsheet context" 
                      className="max-h-32 max-w-full object-contain rounded border"
                    />
                  </div>
                ) : contextSpreadsheetFile ? (
                  <div className="border rounded-md p-2 mb-2">
                    <div className="text-xs text-muted-foreground mb-1">Spreadsheet file:</div>
                    <div className="flex items-center">
                      <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
                      <span className="text-sm truncate">{contextSpreadsheetFile.name}</span>
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed rounded-md p-3 mb-2">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Input
                        id="context-file"
                        type="file"
                        accept=".xlsx,.csv,image/*"
                        onChange={handleContextFileChange}
                        className="hidden"
                      />
                      <label 
                        htmlFor="context-file" 
                        className="flex flex-col items-center cursor-pointer text-center"
                      >
                        <Upload className="h-8 w-8 text-muted-foreground mb-1" />
                        <span className="text-sm font-medium">Upload spreadsheet or image</span>
                        <span className="text-xs text-muted-foreground">
                          Drag & drop or click to browse
                        </span>
                      </label>
                    </div>
                  </div>
                )}
                
                <Alert variant="outline" className="mb-2">
                  <Info className="h-4 w-4" />
                  <AlertTitle className="text-xs font-medium">Context helps the AI understand your data</AlertTitle>
                  <AlertDescription className="text-xs">
                    Upload a spreadsheet file or screenshot to give the AI more context about your data.
                  </AlertDescription>
                </Alert>
              </div>
              
              <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto mb-4 space-y-4 border rounded-md p-3"
                style={{ maxHeight: '400px' }}
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
                            ? 'bg-muted text-muted-foreground'
                            : 'bg-secondary text-secondary-foreground'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg p-3 bg-secondary text-secondary-foreground">
                      <div className="flex items-center">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <p className="text-sm">Processing your request...</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Textarea
                  placeholder="Ask the AI to modify your spreadsheet..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleUserInputSubmit();
                    }
                  }}
                  className="flex-1 min-h-[80px] resize-none"
                  disabled={isProcessing}
                />
                <Button 
                  className="self-end" 
                  onClick={handleUserInputSubmit}
                  disabled={isProcessing || !userInput.trim()}
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
    </div>
  );
}