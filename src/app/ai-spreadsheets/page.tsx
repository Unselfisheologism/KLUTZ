'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsItem, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, FileSpreadsheet, Download, Trash2, Plus, Link } from 'lucide-react';
import type { SpreadsheetData, ChatMessage, AISpreadsheetResponse, SpreadsheetOperation, SpreadsheetCell } from '@/types/ai-spreadsheets';
import * as XLSX from 'xlsx';

export default function AISpreadsheets() {
  const [spreadsheetData, setSpreadsheetData] = useState<SpreadsheetData>({
    rows: Array(10).fill(null).map(() => Array(5).fill(null).map(() => ({ value: '' }))),
    columnWidths: Array(5).fill(150),
    rowHeights: Array(10).fill(30),
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
  const [contextData, setContextData] = useState<any | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = [...spreadsheetData.rows];
    if (!newRows[rowIndex]) {
      // Expand rows if needed
      while (newRows.length <= rowIndex) {
        newRows.push(Array(newRows[0]?.length || 5).fill(null).map(() => ({ value: '' })));
      }
    }
    
    if (!newRows[rowIndex][colIndex]) {
      // Expand columns if needed
      while (newRows[rowIndex].length <= colIndex) {
        newRows[rowIndex].push({ value: '' });
      }
      
      // Ensure all rows have the same number of columns
      const maxCols = Math.max(...newRows.map(row => row.length));
      newRows.forEach(row => {
        while (row.length < maxCols) {
          row.push({ value: '' });
        }
      });
    }
    
    newRows[rowIndex][colIndex] = { ...newRows[rowIndex][colIndex], value };
    setSpreadsheetData({ ...spreadsheetData, rows: newRows });
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
    setIsProcessing(true);
    
    try {
      // In a real implementation, this would be an API call to an AI service
      // For now, we'll simulate a response
      
      // Prepare context for the AI
      const context = {
        spreadsheetData,
        contextData,
        userMessage: userInput
      };
      
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Process the user's request and generate operations
      const aiResponse = await processUserRequest(context);
      
      // Apply the operations to the spreadsheet
      const updatedSpreadsheet = applyOperations(spreadsheetData, aiResponse.operations);
      setSpreadsheetData(updatedSpreadsheet);
      
      // Add the AI's response to the chat
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: aiResponse.explanation,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error processing request:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to process your request. Please try again.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setContextFile(file);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        if (typeof data === 'string') {
          // Parse CSV or other text formats
          const parsedData = parseFileData(file, data);
          setContextData(parsedData);
          
          toast({
            title: 'File Uploaded',
            description: `${file.name} has been uploaded as context.`
          });
        }
      } catch (error) {
        console.error('Error parsing file:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to parse the uploaded file.'
        });
      }
    };
    
    reader.readAsText(file);
  };

  const parseFileData = (file: File, data: string) => {
    // Simple CSV parsing for demonstration
    // In a real implementation, you would use a proper CSV/Excel parser
    if (file.name.endsWith('.csv')) {
      const lines = data.split('\n');
      const headers = lines[0].split(',');
      const rows = lines.slice(1).map(line => {
        const values = line.split(',');
        return headers.reduce((obj, header, index) => {
          obj[header.trim()] = values[index]?.trim() || '';
          return obj;
        }, {} as Record<string, string>);
      });
      return rows;
    }
    
    // For other file types, just return the raw data
    return data;
  };

  const clearSpreadsheet = () => {
    setSpreadsheetData({
      rows: Array(10).fill(null).map(() => Array(5).fill(null).map(() => ({ value: '' }))),
      columnWidths: Array(5).fill(150),
      rowHeights: Array(10).fill(30),
      activeSheet: 'Sheet1',
      sheets: ['Sheet1']
    });
    
    toast({
      title: 'Spreadsheet Cleared',
      description: 'All data has been cleared from the spreadsheet.'
    });
  };

  const downloadSpreadsheet = () => {
    try {
      // Convert our data structure to one that xlsx can understand
      const wsData = spreadsheetData.rows.map(row => 
        row.map(cell => cell.value)
      );
      
      // Create a new workbook
      const wb = XLSX.utils.book_new();
      
      // Create a worksheet from the data
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      
      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(wb, ws, spreadsheetData.activeSheet);
      
      // Generate the Excel file
      XLSX.writeFile(wb, 'ai_spreadsheet.xlsx');
      
      toast({
        title: 'Download Complete',
        description: 'Spreadsheet has been downloaded as Excel file.'
      });
    } catch (error) {
      console.error('Error downloading spreadsheet:', error);
      toast({
        variant: 'destructive',
        title: 'Download Failed',
        description: 'Failed to download the spreadsheet. Please try again.'
      });
    }
  };

  const addDummyData = () => {
    // Add some sample data for demonstration
    const newRows = [
      [{ value: 'Product' }, { value: 'Category' }, { value: 'Price' }, { value: 'Stock' }, { value: 'Rating' }],
      [{ value: 'Laptop' }, { value: 'Electronics' }, { value: '999.99' }, { value: '45' }, { value: '4.5' }],
      [{ value: 'Smartphone' }, { value: 'Electronics' }, { value: '699.99' }, { value: '120' }, { value: '4.8' }],
      [{ value: 'Headphones' }, { value: 'Audio' }, { value: '149.99' }, { value: '78' }, { value: '4.2' }],
      [{ value: 'Monitor' }, { value: 'Electronics' }, { value: '349.99' }, { value: '32' }, { value: '4.6' }],
      [{ value: 'Keyboard' }, { value: 'Peripherals' }, { value: '89.99' }, { value: '65' }, { value: '4.3' }],
    ];
    
    // Ensure the grid is large enough
    const currentRows = [...spreadsheetData.rows];
    while (currentRows.length < newRows.length) {
      currentRows.push(Array(spreadsheetData.columnWidths.length).fill(null).map(() => ({ value: '' })));
    }
    
    // Update with dummy data
    for (let i = 0; i < newRows.length; i++) {
      for (let j = 0; j < newRows[i].length; j++) {
        if (j >= currentRows[i].length) {
          // Ensure all rows have enough columns
          for (let row of currentRows) {
            while (row.length <= j) {
              row.push({ value: '' });
            }
          }
        }
        currentRows[i][j] = newRows[i][j];
      }
    }
    
    // Update column widths if needed
    let columnWidths = [...spreadsheetData.columnWidths];
    while (columnWidths.length < Math.max(...currentRows.map(row => row.length))) {
      columnWidths.push(150);
    }
    
    setSpreadsheetData({
      ...spreadsheetData,
      rows: currentRows,
      columnWidths
    });
    
    toast({
      title: 'Sample Data Added',
      description: 'Dummy data has been added to the spreadsheet.'
    });
  };

  // Simulated AI processing function
  const processUserRequest = async (context: any): Promise<AISpreadsheetResponse> => {
    // This is where you would call your AI service
    // For now, we'll use some simple pattern matching
    
    const userMessage = context.userMessage.toLowerCase();
    
    // Simple pattern matching for demonstration
    if (userMessage.includes('add sample data') || userMessage.includes('add dummy data')) {
      return {
        operations: [
          {
            type: 'update_cell',
            details: {
              row: 0,
              column: 0,
              value: 'Product'
            }
          },
          {
            type: 'update_cell',
            details: {
              row: 0,
              column: 1,
              value: 'Category'
            }
          },
          {
            type: 'update_cell',
            details: {
              row: 0,
              column: 2,
              value: 'Price'
            }
          },
          // More cell updates would go here
        ],
        explanation: 'I\'ve added sample product data with columns for Product, Category, Price, Stock, and Rating.'
      };
    }
    
    if (userMessage.includes('sum') || userMessage.includes('total')) {
      // Find numeric columns to sum
      const numericColumns: number[] = [];
      const headerRow = context.spreadsheetData.rows[0] || [];
      
      headerRow.forEach((cell: SpreadsheetCell, index: number) => {
        // Check if this column has numeric values
        const hasNumericValues = context.spreadsheetData.rows.slice(1).some((row: SpreadsheetCell[]) => {
          const value = row[index]?.value;
          return value && !isNaN(parseFloat(value));
        });
        
        if (hasNumericValues) {
          numericColumns.push(index);
        }
      });
      
      if (numericColumns.length === 0) {
        return {
          operations: [],
          explanation: 'I couldn\'t find any numeric columns to sum. Please add some numeric data first.'
        };
      }
      
      // For simplicity, just sum the first numeric column found
      const columnToSum = numericColumns[0];
      const columnName = headerRow[columnToSum]?.value || `Column ${columnToSum + 1}`;
      
      // Calculate the sum
      let sum = 0;
      context.spreadsheetData.rows.slice(1).forEach((row: SpreadsheetCell[]) => {
        const value = row[columnToSum]?.value;
        if (value && !isNaN(parseFloat(value))) {
          sum += parseFloat(value);
        }
      });
      
      // Add a row with the sum
      const rowIndex = context.spreadsheetData.rows.length;
      
      return {
        operations: [
          {
            type: 'add_row',
            details: {
              index: rowIndex,
              values: Array(headerRow.length).fill('').map((_, i) => 
                i === 0 ? 'Total' : i === columnToSum ? sum.toFixed(2) : ''
              )
            }
          }
        ],
        explanation: `I've calculated the sum of ${columnName} and added it to a new row. The total is ${sum.toFixed(2)}.`
      };
    }
    
    if (userMessage.includes('sort')) {
      // Determine which column to sort by
      let columnToSort = 0;
      const headerRow = context.spreadsheetData.rows[0] || [];
      
      // Look for column names in the message
      headerRow.forEach((cell: SpreadsheetCell, index: number) => {
        if (cell.value && userMessage.toLowerCase().includes(cell.value.toLowerCase())) {
          columnToSort = index;
        }
      });
      
      const columnName = headerRow[columnToSort]?.value || `Column ${columnToSort + 1}`;
      
      // Create a sorted version of the data (excluding header)
      const dataRows = [...context.spreadsheetData.rows.slice(1)];
      dataRows.sort((a: SpreadsheetCell[], b: SpreadsheetCell[]) => {
        const aVal = a[columnToSort]?.value || '';
        const bVal = b[columnToSort]?.value || '';
        
        // Try numeric sort first
        const aNum = parseFloat(aVal);
        const bNum = parseFloat(bVal);
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return aNum - bNum;
        }
        
        // Fall back to string sort
        return aVal.localeCompare(bVal);
      });
      
      // Create operations to update the sorted rows
      const operations: SpreadsheetOperation[] = [];
      
      // Add header row first
      operations.push({
        type: 'update_row',
        details: {
          index: 0,
          values: headerRow.map(cell => cell.value)
        }
      });
      
      // Add sorted data rows
      dataRows.forEach((row: SpreadsheetCell[], index: number) => {
        operations.push({
          type: 'update_row',
          details: {
            index: index + 1,
            values: row.map(cell => cell.value)
          }
        });
      });
      
      return {
        operations,
        explanation: `I've sorted the data by ${columnName} in ascending order.`
      };
    }
    
    // If we have context data from an uploaded file
    if (context.contextData && Array.isArray(context.contextData)) {
      // Check if the user wants to add the context data to the spreadsheet
      if (userMessage.includes('add') || userMessage.includes('import') || userMessage.includes('use') || 
          userMessage.includes('insert') || userMessage.includes('put')) {
        
        const operations: SpreadsheetOperation[] = [];
        
        // If the context data has objects with keys, use those as headers
        if (typeof context.contextData[0] === 'object') {
          const headers = Object.keys(context.contextData[0]);
          
          // Add headers
          operations.push({
            type: 'add_row',
            details: {
              index: 0,
              values: headers
            }
          });
          
          // Add data rows
          context.contextData.forEach((item: any, index: number) => {
            operations.push({
              type: 'add_row',
              details: {
                index: index + 1,
                values: headers.map(key => String(item[key] || ''))
              }
            });
          });
          
          return {
            operations,
            explanation: `I've imported the data from your file with ${headers.length} columns and ${context.contextData.length} rows.`
          };
        }
        
        // If it's just an array of strings or other simple values
        operations.push({
          type: 'add_column',
          details: {
            header: 'Data',
            position: 0,
            values: context.contextData.map((item: any) => String(item))
          }
        });
        
        return {
          operations,
          explanation: `I've imported ${context.contextData.length} items from your file into the spreadsheet.`
        };
      }
      
      // If the user wants explanations or analysis of the context data
      if (userMessage.includes('explain') || userMessage.includes('analyze') || 
          userMessage.includes('describe') || userMessage.includes('summarize')) {
        
        // For this example, we'll just add the data with an explanation column
        const operations: SpreadsheetOperation[] = [];
        
        if (typeof context.contextData[0] === 'object') {
          // Get a sample of keys to use
          const sampleKeys = Object.keys(context.contextData[0]).slice(0, 2);
          
          // Add a column for the data items
          operations.push({
            type: 'add_column',
            details: {
              header: 'Keyword Text',
              position: 0,
              values: context.contextData.map((item: any) => 
                String(item[sampleKeys[0]] || item[Object.keys(item)[0]] || '')
              )
            }
          });
          
          // Add a column for explanations
          operations.push({
            type: 'add_column',
            details: {
              header: 'Explanation',
              position: 1,
              values: context.contextData.map((item: any) => {
                // Generate a simple explanation based on the data
                return `This item has properties including ${Object.keys(item).join(', ')}.`;
              })
            }
          });
        } else {
          // For simple arrays
          operations.push({
            type: 'add_column',
            details: {
              header: 'Data',
              position: 0,
              values: context.contextData.map((item: any) => String(item))
            }
          });
          
          operations.push({
            type: 'add_column',
            details: {
              header: 'Explanation',
              position: 1,
              values: context.contextData.map(() => 'Item from imported data')
            }
          });
        }
        
        return {
          operations,
          explanation: `I've added the data from your file along with explanations. You can further refine these explanations by asking specific questions about the data.`
        };
      }
    }
    
    // Default response if no patterns match
    return {
      operations: [],
      explanation: "I'm not sure how to process that request. Try asking me to add data, calculate sums, or sort your spreadsheet."
    };
  };

  // Apply operations to the spreadsheet
  const applyOperations = (currentData: SpreadsheetData, operations: SpreadsheetOperation[]): SpreadsheetData => {
    let newData = { ...currentData };
    let newRows = [...currentData.rows];
    let newColumnWidths = [...(currentData.columnWidths || [])];
    let newRowHeights = [...(currentData.rowHeights || [])];
    
    operations.forEach(operation => {
      switch (operation.type) {
        case 'update_cell': {
          const { row, column, value } = operation.details;
          
          // Ensure we have enough rows
          while (newRows.length <= row) {
            newRows.push(Array(newRows[0]?.length || 5).fill(null).map(() => ({ value: '' })));
          }
          
          // Ensure we have enough columns in this row
          while (newRows[row].length <= column) {
            newRows[row].push({ value: '' });
            
            // Ensure all rows have the same number of columns
            for (let i = 0; i < newRows.length; i++) {
              if (i !== row && newRows[i].length <= column) {
                newRows[i].push({ value: '' });
              }
            }
            
            // Add column width if needed
            if (newColumnWidths.length <= column) {
              newColumnWidths.push(150);
            }
          }
          
          newRows[row][column] = { ...newRows[row][column], value };
          break;
        }
        
        case 'update_row': {
          const { index, values } = operation.details;
          
          // Ensure we have enough rows
          while (newRows.length <= index) {
            newRows.push(Array(newRows[0]?.length || 5).fill(null).map(() => ({ value: '' })));
          }
          
          // Create the new row with the provided values
          const newRow = values.map((value: string) => ({ value }));
          
          // Ensure the row has enough cells
          while (newRow.length < (newRows[0]?.length || 5)) {
            newRow.push({ value: '' });
          }
          
          // Update the row
          newRows[index] = newRow;
          
          // If this row has more columns than others, expand all rows
          if (newRow.length > (newRows[0]?.length || 0)) {
            for (let i = 0; i < newRows.length; i++) {
              if (i !== index) {
                while (newRows[i].length < newRow.length) {
                  newRows[i].push({ value: '' });
                }
              }
            }
            
            // Add column widths if needed
            while (newColumnWidths.length < newRow.length) {
              newColumnWidths.push(150);
            }
          }
          
          break;
        }
        
        case 'update_column': {
          const { index, values } = operation.details;
          
          // Ensure we have enough columns
          const maxColumns = Math.max(...newRows.map(row => row.length), index + 1);
          newRows.forEach(row => {
            while (row.length < maxColumns) {
              row.push({ value: '' });
            }
          });
          
          // Update column values
          values.forEach((value: string, rowIndex: number) => {
            // Ensure we have enough rows
            while (newRows.length <= rowIndex) {
              newRows.push(Array(maxColumns).fill(null).map(() => ({ value: '' })));
            }
            
            newRows[rowIndex][index] = { ...newRows[rowIndex][index], value };
          });
          
          // Add column width if needed
          while (newColumnWidths.length <= index) {
            newColumnWidths.push(150);
          }
          
          break;
        }
        
        case 'add_row': {
          const { index, values } = operation.details;
          
          // Create the new row
          const newRow = values.map((value: string) => ({ value }));
          
          // Ensure the row has enough cells
          const maxColumns = Math.max(...newRows.map(row => row.length), newRow.length);
          while (newRow.length < maxColumns) {
            newRow.push({ value: '' });
          }
          
          // Ensure all existing rows have enough columns
          newRows.forEach(row => {
            while (row.length < maxColumns) {
              row.push({ value: '' });
            }
          });
          
          // Insert the row at the specified index
          if (index >= newRows.length) {
            newRows.push(newRow);
          } else {
            newRows.splice(index, 0, newRow);
          }
          
          // Add row height if needed
          if (newRowHeights.length < newRows.length) {
            newRowHeights.push(30);
          }
          
          // Add column widths if needed
          while (newColumnWidths.length < maxColumns) {
            newColumnWidths.push(150);
          }
          
          break;
        }
        
        case 'add_column': {
          const { position, header, values } = operation.details;
          
          // Ensure we have enough rows for all values
          while (newRows.length < values.length + 1) { // +1 for header
            newRows.push(Array(newRows[0]?.length || 0).fill(null).map(() => ({ value: '' })));
          }
          
          // Add the header
          if (!newRows[0]) {
            newRows[0] = [];
          }
          
          // Ensure all rows have the same length before inserting
          const maxLength = Math.max(...newRows.map(row => row.length), position + 1);
          newRows.forEach(row => {
            while (row.length < maxLength) {
              row.push({ value: '' });
            }
          });
          
          // Insert the header
          newRows[0].splice(position, 0, { value: header });
          
          // Insert the values
          values.forEach((value: string, i: number) => {
            const rowIndex = i + 1; // +1 because the header is at index 0
            
            // Ensure we have this row
            while (newRows.length <= rowIndex) {
              newRows.push(Array(newRows[0].length - 1).fill(null).map(() => ({ value: '' })));
            }
            
            // Insert the value
            newRows[rowIndex].splice(position, 0, { value });
          });
          
          // Add column width
          newColumnWidths.splice(position, 0, 150);
          
          break;
        }
        
        case 'delete_row': {
          const { index } = operation.details;
          if (index < newRows.length) {
            newRows.splice(index, 1);
            newRowHeights.splice(index, 1);
          }
          break;
        }
        
        case 'delete_column': {
          const { index } = operation.details;
          newRows.forEach(row => {
            if (index < row.length) {
              row.splice(index, 1);
            }
          });
          
          if (index < newColumnWidths.length) {
            newColumnWidths.splice(index, 1);
          }
          
          break;
        }
        
        case 'format': {
          const { row, column, style } = operation.details;
          
          // Ensure we have this cell
          while (newRows.length <= row) {
            newRows.push(Array(newRows[0]?.length || 0).fill(null).map(() => ({ value: '' })));
          }
          
          while (newRows[row].length <= column) {
            newRows[row].push({ value: '' });
          }
          
          newRows[row][column] = {
            ...newRows[row][column],
            style: { ...newRows[row][column].style, ...style }
          };
          
          break;
        }
        
        // Additional operation types can be added here
      }
    });
    
    // Ensure all rows have the same number of columns
    const maxColumns = Math.max(...newRows.map(row => row.length), 1);
    newRows.forEach(row => {
      while (row.length < maxColumns) {
        row.push({ value: '' });
      }
    });
    
    // Ensure we have enough column widths
    while (newColumnWidths.length < maxColumns) {
      newColumnWidths.push(150);
    }
    
    // Ensure we have enough row heights
    while (newRowHeights.length < newRows.length) {
      newRowHeights.push(30);
    }
    
    return {
      ...newData,
      rows: newRows,
      columnWidths: newColumnWidths,
      rowHeights: newRowHeights
    };
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">AI-Native Spreadsheets</CardTitle>
          <CardDescription>
            Create and modify spreadsheets through natural language with an AI assistant that understands your data.
          </CardDescription>
        </CardHeader>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spreadsheet Section */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Spreadsheet</CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={addDummyData}>
                    <Plus className="mr-1 h-4 w-4" />
                    Sample Data
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearSpreadsheet}>
                    <Trash2 className="mr-1 h-4 w-4" />
                    Clear
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadSpreadsheet}>
                    <Download className="mr-1 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto max-h-[600px] border rounded-md">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="w-10 bg-muted border-r border-b p-2 text-center sticky top-0 z-10">#</th>
                      {spreadsheetData.columnWidths?.map((width, colIndex) => (
                        <th 
                          key={colIndex} 
                          className="bg-muted border-r border-b p-2 text-center sticky top-0 z-10"
                          style={{ width: `${width}px`, minWidth: `${width}px` }}
                        >
                          {String.fromCharCode(65 + colIndex)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {spreadsheetData.rows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        <td className="border-r border-b p-2 text-center bg-muted sticky left-0 z-10">
                          {rowIndex + 1}
                        </td>
                        {row.map((cell, colIndex) => (
                          <td key={colIndex} className="border-r border-b p-0">
                            <input
                              type="text"
                              value={cell?.value || ''}
                              onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                              className="w-full h-full p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                              style={{
                                fontWeight: cell?.style?.bold ? 'bold' : 'normal',
                                fontStyle: cell?.style?.italic ? 'italic' : 'normal',
                                color: cell?.style?.color || 'inherit',
                                backgroundColor: cell?.style?.backgroundColor || 'transparent',
                                textAlign: cell?.style?.textAlign || 'left',
                              }}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Chat Section */}
        <div className="lg:col-span-1">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle>AI Assistant</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept=".csv,.txt,.xlsx,.xls"
              />
              
              <ScrollArea className="flex-grow mb-4 h-[500px] pr-4">
                <div className="space-y-4">
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
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
              </ScrollArea>
              
              <div className="flex items-end gap-2">
                <Textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask the AI to help with your spreadsheet..."
                  className="flex-grow resize-none"
                  rows={3}
                />
                <div className="flex flex-col gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    title="Add spreadsheet context"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-full"
                  >
                    <Link className="h-4 w-4" />
                    <span className="sr-only">Spreadsheet</span>
                  </Button>
                  <Button
                    size="icon"
                    onClick={handleSendMessage}
                    disabled={isProcessing || !userInput.trim()}
                    className="rounded-full"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    <span className="sr-only">Send</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}