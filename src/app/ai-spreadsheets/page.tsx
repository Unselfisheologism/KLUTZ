'use client';

import { useState, useEffect, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Send, Download, Clipboard, Info, Upload, Search, Image, Brain } from 'lucide-react';
import * as XLSX from 'xlsx';
import type { SpreadsheetData, ChatMessage, SpreadsheetOperation } from '@/types/ai-spreadsheets';

const DEFAULT_ROWS = 10;
const DEFAULT_COLS = 5;

// Create empty spreadsheet data
const createEmptySpreadsheet = (rows: number = DEFAULT_ROWS, cols: number = DEFAULT_COLS): SpreadsheetData => {
  const emptyData: SpreadsheetData = {
    rows: Array(rows).fill(null).map(() => 
      Array(cols).fill(null).map(() => ({ value: '' }))
    ),
    activeSheet: 'Sheet1',
    sheets: ['Sheet1']
  };
  return emptyData;
};

// Helper to ensure the grid has enough rows and columns
const ensureGridSize = (data: SpreadsheetData, rowIndex: number, colIndex: number): SpreadsheetData => {
  const newData = { ...data };
  
  // Ensure we have enough rows
  while (newData.rows.length <= rowIndex) {
    const newRow = Array(newData.rows[0]?.length || DEFAULT_COLS).fill(null).map(() => ({ value: '' }));
    newData.rows.push(newRow);
  }
  
  // Ensure all rows have enough columns
  for (let i = 0; i < newData.rows.length; i++) {
    while (newData.rows[i].length <= colIndex) {
      newData.rows[i].push({ value: '' });
    }
  }
  
  // Ensure all rows have the same number of columns
  const maxCols = Math.max(...newData.rows.map(row => row.length));
  for (let i = 0; i < newData.rows.length; i++) {
    while (newData.rows[i].length < maxCols) {
      newData.rows[i].push({ value: '' });
    }
  }
  
  return newData;
};

export default function AISpreadsheetPage() {
  const [spreadsheetData, setSpreadsheetData] = useState<SpreadsheetData>(createEmptySpreadsheet());
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCommandOptions, setShowCommandOptions] = useState(false);
  const [selectedCommands, setSelectedCommands] = useState<{
    analyze: boolean;
    web: boolean;
    image: boolean;
  }>({
    analyze: true,
    web: false,
    image: false
  });
  const [webSearchUrl, setWebSearchUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [spreadsheetFile, setSpreadsheetFile] = useState<File | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  
  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // Handle input change and check for command trigger
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setUserInput(value);
    
    // Show command options when user types '/'
    if (value === '/') {
      setShowCommandOptions(true);
    } else if (showCommandOptions && !value.startsWith('/')) {
      setShowCommandOptions(false);
    }
  };

  // Handle command selection
  const handleCommandSelect = (command: 'analyze' | 'web' | 'image') => {
    setSelectedCommands(prev => ({
      ...prev,
      [command]: !prev[command]
    }));
    
    // Focus back on input after selecting command
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle web search URL input
  const handleWebSearchUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWebSearchUrl(e.target.value);
  };

  // Handle image file upload
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    }
  };

  // Handle spreadsheet file upload
  const handleSpreadsheetFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSpreadsheetFile(file);
      
      // Read and parse the spreadsheet
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          if (event.target?.result) {
            const data = new Uint8Array(event.target.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // Convert to JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            // Create spreadsheet data structure
            const newData: SpreadsheetData = {
              rows: jsonData.map((row: any) => 
                Array.isArray(row) 
                  ? row.map((cell: any) => ({ value: cell?.toString() || '' }))
                  : [{ value: row?.toString() || '' }]
              ),
              activeSheet: firstSheetName,
              sheets: workbook.SheetNames
            };
            
            // Ensure all rows have the same number of columns
            const maxCols = Math.max(...newData.rows.map(row => row.length), DEFAULT_COLS);
            newData.rows = newData.rows.map(row => {
              while (row.length < maxCols) {
                row.push({ value: '' });
              }
              return row;
            });
            
            // Ensure minimum number of rows
            while (newData.rows.length < DEFAULT_ROWS) {
              newData.rows.push(Array(maxCols).fill(null).map(() => ({ value: '' })));
            }
            
            setSpreadsheetData(newData);
            
            toast({
              title: "Spreadsheet Loaded",
              description: `Loaded spreadsheet with ${newData.rows.length} rows and ${maxCols} columns.`,
            });
          }
        } catch (error) {
          console.error("Error parsing spreadsheet:", error);
          toast({
            variant: "destructive",
            title: "Error Loading Spreadsheet",
            description: "Failed to parse the spreadsheet file. Please check the format and try again.",
          });
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() && !imageFile) return;
    
    const userMessage: ChatMessage = {
      role: 'user',
      content: userInput,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setShowCommandOptions(false);
    setIsLoading(true);
    setError(null);
    
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
      
      // Prepare context for the AI
      let contextPrompt = "You are an AI assistant specialized in helping with spreadsheet operations. ";
      
      // Add command context
      if (selectedCommands.analyze) {
        contextPrompt += "Analyze the user's spreadsheet data and provide insights. ";
      }
      
      if (selectedCommands.web && webSearchUrl) {
        contextPrompt += `Use information from the web URL: ${webSearchUrl} to enhance your response. `;
        
        // Here you would integrate with crawl4ai API
        // For now, we'll simulate this with a message
        setChatMessages(prev => [
          ...prev, 
          {
            role: 'system',
            content: `Searching web content from: ${webSearchUrl}...`,
            timestamp: new Date()
          }
        ]);
      }
      
      // Process image if provided
      let imageAnalysisResult = '';
      if (selectedCommands.image && imageFile) {
        setChatMessages(prev => [
          ...prev, 
          {
            role: 'system',
            content: 'Analyzing uploaded image...',
            timestamp: new Date()
          }
        ]);
        
        try {
          // Convert image to data URL
          const reader = new FileReader();
          const imageDataPromise = new Promise<string>((resolve) => {
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(imageFile);
          });
          
          const imageData = await imageDataPromise;
          
          // Analyze image with GPT-4 Vision
          const imagePrompt = "Describe this image in detail, focusing on any data, charts, or spreadsheet-related content visible.";
          const imageResponse = await puter.ai.chat(imagePrompt, imageData);
          
          if (imageResponse?.message?.content) {
            imageAnalysisResult = imageResponse.message.content;
            contextPrompt += `Based on the image analysis: ${imageAnalysisResult} `;
          }
        } catch (imageError) {
          console.error("Image analysis error:", imageError);
          setChatMessages(prev => [
            ...prev, 
            {
              role: 'system',
              content: 'Error analyzing image. Proceeding without image context.',
              timestamp: new Date()
            }
          ]);
        }
      }
      
      // Create a description of the current spreadsheet state
      const spreadsheetDescription = generateSpreadsheetDescription(spreadsheetData);
      contextPrompt += `\n\nCurrent spreadsheet state: ${spreadsheetDescription}\n\n`;
      
      // Add spreadsheet file context if provided
      if (spreadsheetFile) {
        contextPrompt += `The user has also uploaded a spreadsheet file named "${spreadsheetFile.name}" for context. `;
      }
      
      // Prepare the main prompt
      const prompt = `${contextPrompt}
      
User request: "${userInput}"

Respond with a JSON object that contains:
1. "operations": An array of spreadsheet operations to perform
2. "explanation": A clear explanation of what changes you're making and why

Available operation types:
- "update_cell": Update a specific cell
- "update_row": Update an entire row
- "update_column": Update an entire column
- "add_row": Add a new row
- "add_column": Add a new column
- "delete_row": Delete a row
- "delete_column": Delete a column
- "format": Apply formatting
- "create_chart": Create a chart
- "find_replace": Find and replace text

Example response format:
{
  "operations": [
    {
      "type": "update_cell",
      "details": {
        "row": 0,
        "col": 0,
        "value": "New Value"
      }
    },
    {
      "type": "add_column",
      "details": {
        "header": "New Column",
        "position": 2,
        "values": ["Value 1", "Value 2"]
      }
    }
  ],
  "explanation": "I've updated the cell A1 with 'New Value' and added a new column with header 'New Column' at position C."
}

If you need to analyze the data without making changes, just provide an explanation without operations.
`;
      
      const response = await puter.ai.chat(prompt, { model: 'gpt-4o' });
      
      if (!response?.message?.content) {
        throw new Error("AI response was empty or invalid.");
      }
      
      // Process the AI response
      const aiResponseText = response.message.content;
      let aiOperations: SpreadsheetOperation[] = [];
      let aiExplanation = "";
      
      try {
        // Extract JSON from the response
        const jsonMatch = aiResponseText.match(/```json\n([\s\S]*?)\n```/) || 
                          aiResponseText.match(/```\n([\s\S]*?)\n```/) ||
                          aiResponseText.match(/{[\s\S]*?}/);
                          
        if (jsonMatch) {
          const jsonStr = jsonMatch[0].startsWith('{') ? jsonMatch[0] : jsonMatch[1];
          const parsedResponse = JSON.parse(jsonStr);
          
          if (parsedResponse.operations) {
            aiOperations = parsedResponse.operations;
          }
          
          if (parsedResponse.explanation) {
            aiExplanation = parsedResponse.explanation;
          }
        } else {
          // If no JSON found, use the whole response as explanation
          aiExplanation = aiResponseText;
        }
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError);
        aiExplanation = aiResponseText;
      }
      
      // Apply operations to the spreadsheet
      if (aiOperations.length > 0) {
        const newSpreadsheetData = applyOperations(spreadsheetData, aiOperations);
        setSpreadsheetData(newSpreadsheetData);
      }
      
      // Add AI response to chat
      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: aiExplanation,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, aiMessage]);
      
    } catch (err: any) {
      console.error("AI processing error:", err);
      setError(err.message || "An error occurred while processing your request.");
      
      setChatMessages(prev => [
        ...prev, 
        {
          role: 'system',
          content: `Error: ${err.message || "An error occurred while processing your request."}`,
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
      setWebSearchUrl('');
      setImageFile(null);
    }
  };
  
  // Generate a text description of the spreadsheet for the AI
  const generateSpreadsheetDescription = (data: SpreadsheetData): string => {
    // Get headers (first row)
    const headers = data.rows[0]?.map(cell => cell.value) || [];
    
    // Count non-empty cells
    let nonEmptyCells = 0;
    data.rows.forEach(row => {
      row.forEach(cell => {
        if (cell.value.trim() !== '') nonEmptyCells++;
      });
    });
    
    // Sample some data
    const sampleData: string[] = [];
    for (let i = 1; i < Math.min(data.rows.length, 5); i++) {
      if (data.rows[i].some(cell => cell.value.trim() !== '')) {
        const rowValues = data.rows[i].map(cell => cell.value).join(', ');
        sampleData.push(`Row ${i+1}: ${rowValues}`);
      }
    }
    
    return `
Spreadsheet with ${data.rows.length} rows and ${data.rows[0]?.length || 0} columns.
Headers: ${headers.join(', ') || 'None'}
Contains ${nonEmptyCells} non-empty cells.
Sample data:
${sampleData.join('\n') || 'No data available'}
Active sheet: ${data.activeSheet}
Available sheets: ${data.sheets.join(', ')}
`;
  };
  
  // Apply operations to the spreadsheet
  const applyOperations = (data: SpreadsheetData, operations: SpreadsheetOperation[]): SpreadsheetData => {
    let newData = { ...data, rows: [...data.rows.map(row => [...row])] };
    
    operations.forEach(operation => {
      switch (operation.type) {
        case 'update_cell': {
          const { row, col, value } = operation.details;
          // Ensure the grid is large enough
          newData = ensureGridSize(newData, row, col);
          newData.rows[row][col] = { ...newData.rows[row][col], value: value.toString() };
          break;
        }
        
        case 'update_row': {
          const { row, values } = operation.details;
          // Ensure the grid is large enough
          newData = ensureGridSize(newData, row, values.length - 1);
          values.forEach((value: any, colIndex: number) => {
            if (colIndex < newData.rows[row].length) {
              newData.rows[row][colIndex] = { ...newData.rows[row][colIndex], value: value.toString() };
            }
          });
          break;
        }
        
        case 'update_column': {
          const { col, values } = operation.details;
          values.forEach((value: any, rowIndex: number) => {
            // Ensure the grid is large enough
            newData = ensureGridSize(newData, rowIndex, col);
            newData.rows[rowIndex][col] = { ...newData.rows[rowIndex][col], value: value.toString() };
          });
          break;
        }
        
        case 'add_row': {
          const { position = newData.rows.length, values } = operation.details;
          const rowIndex = Math.min(position, newData.rows.length);
          
          // Create a new row with the right number of columns
          const colCount = Math.max(newData.rows[0]?.length || 0, values?.length || 0);
          const newRow = Array(colCount).fill(null).map((_, i) => {
            return { value: values && i < values.length ? values[i].toString() : '' };
          });
          
          // Insert the new row
          newData.rows.splice(rowIndex, 0, newRow);
          
          // Ensure all rows have the same number of columns
          const maxCols = Math.max(...newData.rows.map(row => row.length));
          newData.rows = newData.rows.map(row => {
            while (row.length < maxCols) {
              row.push({ value: '' });
            }
            return row;
          });
          break;
        }
        
        case 'add_column': {
          const { position = newData.rows[0]?.length || 0, header, values } = operation.details;
          const colIndex = Math.min(position, newData.rows[0]?.length || 0);
          
          // Ensure we have at least one row for the header
          if (newData.rows.length === 0) {
            newData.rows.push([]);
          }
          
          // Add the header
          const headerRow = newData.rows[0];
          headerRow.splice(colIndex, 0, { value: header || '' });
          
          // Add values to each row
          for (let i = 1; i < newData.rows.length; i++) {
            const value = values && i - 1 < values.length ? values[i - 1].toString() : '';
            newData.rows[i].splice(colIndex, 0, { value });
          }
          
          // If values array is longer than existing rows, add new rows
          if (values && values.length > newData.rows.length - 1) {
            for (let i = newData.rows.length - 1; i < values.length; i++) {
              const newRow = Array(newData.rows[0].length).fill(null).map((_, colIdx) => {
                return { value: colIdx === colIndex ? values[i].toString() : '' };
              });
              newData.rows.push(newRow);
            }
          }
          break;
        }
        
        case 'delete_row': {
          const { row } = operation.details;
          if (row >= 0 && row < newData.rows.length) {
            newData.rows.splice(row, 1);
            
            // Ensure we have at least DEFAULT_ROWS rows
            while (newData.rows.length < DEFAULT_ROWS) {
              const colCount = newData.rows[0]?.length || DEFAULT_COLS;
              newData.rows.push(Array(colCount).fill(null).map(() => ({ value: '' })));
            }
          }
          break;
        }
        
        case 'delete_column': {
          const { col } = operation.details;
          if (col >= 0 && newData.rows.length > 0 && col < newData.rows[0].length) {
            newData.rows = newData.rows.map(row => {
              row.splice(col, 1);
              return row;
            });
            
            // Ensure we have at least DEFAULT_COLS columns
            if (newData.rows[0]?.length < DEFAULT_COLS) {
              newData.rows = newData.rows.map(row => {
                while (row.length < DEFAULT_COLS) {
                  row.push({ value: '' });
                }
                return row;
              });
            }
          }
          break;
        }
        
        case 'format': {
          const { row, col, style } = operation.details;
          if (row >= 0 && row < newData.rows.length && 
              col >= 0 && col < newData.rows[row].length) {
            newData.rows[row][col] = { 
              ...newData.rows[row][col], 
              style: { ...newData.rows[row][col].style, ...style } 
            };
          }
          break;
        }
        
        // Other operation types can be added here
      }
    });
    
    return newData;
  };
  
  // Handle key press in the input field
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Download the spreadsheet
  const handleDownloadSpreadsheet = () => {
    try {
      // Convert spreadsheet data to worksheet
      const ws = XLSX.utils.aoa_to_sheet(
        spreadsheetData.rows.map(row => row.map(cell => cell.value))
      );
      
      // Create a new workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, spreadsheetData.activeSheet);
      
      // Generate file and trigger download
      XLSX.writeFile(wb, 'ai_spreadsheet.xlsx');
      
      toast({
        title: "Download Complete",
        description: "Spreadsheet has been downloaded successfully.",
      });
    } catch (error) {
      console.error("Error downloading spreadsheet:", error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Failed to download the spreadsheet. Please try again.",
      });
    }
  };
  
  // Copy cell value to clipboard
  const handleCopyCellValue = (value: string) => {
    navigator.clipboard.writeText(value).then(() => {
      toast({
        title: "Copied to Clipboard",
        description: "Cell value has been copied to clipboard.",
      });
    }).catch(err => {
      console.error("Failed to copy:", err);
      toast({
        variant: "destructive",
        title: "Copy Failed",
        description: "Failed to copy cell value to clipboard.",
      });
    });
  };
  
  // Render cell with appropriate styling
  const renderCell = (cell: { value: string, style?: any }, rowIndex: number, colIndex: number) => {
    const isHeader = rowIndex === 0;
    const cellStyle = cell.style || {};
    
    return (
      <div 
        key={`cell-${rowIndex}-${colIndex}`}
        className={`
          border border-gray-200 dark:border-gray-700 p-2 min-w-[100px] 
          ${isHeader ? 'bg-muted font-semibold' : 'bg-card'}
          ${cellStyle.bold ? 'font-bold' : ''}
          ${cellStyle.italic ? 'italic' : ''}
          ${cellStyle.textAlign === 'center' ? 'text-center' : 
            cellStyle.textAlign === 'right' ? 'text-right' : 'text-left'}
        `}
        style={{
          color: cellStyle.color,
          backgroundColor: cellStyle.backgroundColor,
        }}
        onClick={() => handleCopyCellValue(cell.value)}
        title="Click to copy"
      >
        {cell.value || ''}
      </div>
    );
  };
  
  // Render row labels (A, B, C, etc.)
  const renderColumnLabels = () => {
    const colCount = spreadsheetData.rows[0]?.length || DEFAULT_COLS;
    return (
      <div className="flex">
        <div className="w-10 bg-muted border border-gray-200 dark:border-gray-700 flex items-center justify-center font-semibold">
          #
        </div>
        {Array(colCount).fill(null).map((_, colIndex) => (
          <div 
            key={`col-label-${colIndex}`}
            className="min-w-[100px] bg-muted border border-gray-200 dark:border-gray-700 p-2 text-center font-semibold"
          >
            {String.fromCharCode(65 + colIndex)}
          </div>
        ))}
      </div>
    );
  };
  
  // Render the spreadsheet grid
  const renderSpreadsheet = () => {
    return (
      <div className="overflow-auto max-h-[500px]">
        {renderColumnLabels()}
        {spreadsheetData.rows.map((row, rowIndex) => (
          <div key={`row-${rowIndex}`} className="flex">
            <div className="w-10 bg-muted border border-gray-200 dark:border-gray-700 flex items-center justify-center font-semibold">
              {rowIndex + 1}
            </div>
            {row.map((cell, colIndex) => renderCell(cell, rowIndex, colIndex))}
          </div>
        ))}
      </div>
    );
  };
  
  // Render chat messages
  const renderChatMessages = () => {
    return (
      <div className="flex flex-col space-y-4 p-4 max-h-[500px] overflow-y-auto">
        {chatMessages.length === 0 ? (
          <div className="text-center text-muted-foreground p-4">
            <Info className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Ask the AI assistant to help you with your spreadsheet.</p>
            <p className="text-sm mt-2">Examples:</p>
            <ul className="text-sm mt-1 space-y-1 text-left max-w-md mx-auto">
              <li>• "Create a monthly budget template with income and expenses"</li>
              <li>• "Add formulas to calculate the sum of column B"</li>
              <li>• "Format the header row with bold text"</li>
              <li>• "Analyze this data and create a summary"</li>
            </ul>
          </div>
        ) : (
          chatMessages.map((message, index) => (
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
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">AI-Native Spreadsheets</CardTitle>
          <CardDescription>
            Create and modify spreadsheets through natural language with an AI assistant that understands your data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="spreadsheet">
            <TabsList className="mb-4">
              <TabsTrigger value="spreadsheet">Spreadsheet</TabsTrigger>
              <TabsTrigger value="chat">AI Assistant</TabsTrigger>
            </TabsList>
            
            <TabsContent value="spreadsheet" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                  <Input 
                    value={spreadsheetData.activeSheet} 
                    onChange={(e) => setSpreadsheetData({...spreadsheetData, activeSheet: e.target.value})}
                    className="w-32"
                  />
                  <span className="text-sm text-muted-foreground">
                    {spreadsheetData.rows.length} × {spreadsheetData.rows[0]?.length || 0}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={handleDownloadSpreadsheet}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <div className="relative">
                    <Button variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Import
                      <Input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleSpreadsheetFileChange}
                      />
                    </Button>
                  </div>
                </div>
              </div>
              
              {renderSpreadsheet()}
              
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Tip</AlertTitle>
                <AlertDescription>
                  Switch to the AI Assistant tab to modify this spreadsheet using natural language.
                </AlertDescription>
              </Alert>
            </TabsContent>
            
            <TabsContent value="chat" className="space-y-4">
              <div className="border rounded-lg h-[500px] flex flex-col">
                {renderChatMessages()}
                
                <Separator />
                
                <div className="p-4 space-y-4">
                  {/* Command options */}
                  {showCommandOptions && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Button 
                        variant={selectedCommands.analyze ? "default" : "outline"} 
                        size="sm"
                        onClick={() => handleCommandSelect('analyze')}
                        className="flex items-center"
                      >
                        <Brain className="h-4 w-4 mr-1" />
                        Analyze
                      </Button>
                      
                      <Button 
                        variant={selectedCommands.web ? "default" : "outline"} 
                        size="sm"
                        onClick={() => handleCommandSelect('web')}
                        className="flex items-center"
                      >
                        <Search className="h-4 w-4 mr-1" />
                        Web
                      </Button>
                      
                      <Button 
                        variant={selectedCommands.image ? "default" : "outline"} 
                        size="sm"
                        onClick={() => handleCommandSelect('image')}
                        className="flex items-center"
                      >
                        <Image className="h-4 w-4 mr-1" />
                        Image
                      </Button>
                    </div>
                  )}
                  
                  {/* Web search input */}
                  {selectedCommands.web && (
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Enter URL to search or provide search query"
                        value={webSearchUrl}
                        onChange={handleWebSearchUrlChange}
                        className="flex-1"
                      />
                    </div>
                  )}
                  
                  {/* Image upload */}
                  {selectedCommands.image && (
                    <div className="flex items-center gap-2">
                      <Image className="h-4 w-4 text-muted-foreground" />
                      <div className="relative flex-1">
                        <Input
                          type="file"
                          accept="image/*"
                          className="opacity-0 absolute inset-0 cursor-pointer"
                          onChange={handleImageFileChange}
                        />
                        <Input
                          readOnly
                          placeholder="Click to upload an image"
                          value={imageFile ? imageFile.name : ''}
                          className="pointer-events-none"
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Spreadsheet context */}
                  {spreadsheetFile && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clipboard className="h-4 w-4" />
                      <span>Using spreadsheet context: {spreadsheetFile.name}</span>
                    </div>
                  )}
                  
                  <div className="flex items-end gap-2">
                    <Textarea
                      ref={inputRef}
                      placeholder="Ask the AI assistant to help with your spreadsheet..."
                      value={userInput}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyPress}
                      className="flex-1 min-h-[80px] resize-none"
                      disabled={isLoading}
                    />
                    <Button 
                      onClick={handleSendMessage} 
                      disabled={isLoading || (!userInput.trim() && !imageFile)}
                      className="mb-1"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">
            Powered by AI. All data is processed securely.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}