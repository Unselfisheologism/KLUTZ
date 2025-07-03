'use client';

import { toPng } from 'html-to-image';
import React, { useRef, useEffect, useState } from 'react';
import dynamic from "next/dynamic";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Send, Download, Info, Upload, Brain, Image, BarChart } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Dynamically import the client-only chart component
const ClientInfographicRenderer = dynamic(
  () => import("./ClientInfographicRenderer"),
  { ssr: false }
);

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface InfographicData {
  type: 'pie' | 'bar' | 'line' | 'area' | 'scatter' | 'tree' | 'heatmap' | 'custom';
  title: string;
  description?: string;
  data: any;
  config?: any;
  svgContent?: string;
}

export default function AIInfographicsPage() {
  const [infographicData, setInfographicData] = useState<InfographicData | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCommandOptions, setShowCommandOptions] = useState(false);
  const [selectedCommands, setSelectedCommands] = useState<{ analyze: boolean; image: boolean; dataContext: boolean; }>({
    analyze: true, image: false, dataContext: false
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [contextFile, setContextFile] = useState<File | null>(null);
  const [contextData, setContextData] = useState<any | null>(null);
  const [selectedChartType, setSelectedChartType] = useState<string>('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const infographicRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // --- File upload and parsing logic ---
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setUserInput(value);
    if (value === '/') {
      setShowCommandOptions(true);
    } else if (showCommandOptions && !value.startsWith('/')) {
      setShowCommandOptions(false);
    }
  };

  const handleCommandSelect = (command: 'analyze' | 'image' | 'dataContext') => {
    setSelectedCommands(prev => ({
      ...prev,
      [command]: !prev[command]
    }));
    if (inputRef.current) inputRef.current.focus();
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) setImageFile(e.target.files[0]);
  };

  const handleContextFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setContextFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          if (event.target?.result) {
            let parsedData: any = null;
            if (file.type === 'application/json') {
              parsedData = JSON.parse(event.target.result as string);
            } else if (file.type === 'text/csv') {
              const csvData = (event.target.result as string).split('\n').map(row => row.split(','));
              const headers = csvData[0];
              parsedData = csvData.slice(1).map(row => {
                const rowData: Record<string, string> = {};
                headers.forEach((header, index) => { rowData[header] = row[index]; });
                return rowData;
              });
            } else if (file.type.includes('spreadsheet') || file.type.includes('excel')) {
              parsedData = { message: "Excel file detected. Data will be processed for visualization." };
            } else {
              parsedData = { rawText: event.target.result };
            }
            setContextData(parsedData);
            toast({
              title: "Context Data Loaded",
              description: `Loaded data from ${file.name} for visualization.`,
            });
          }
        } catch (error) {
          console.error("Error parsing context file:", error);
          toast({
            variant: "destructive",
            title: "Error Loading Context Data",
            description: "Failed to parse the file. Please check the format and try again.",
          });
        }
      };
      if (file.type === 'application/json' || file.type === 'text/csv' || file.type === 'text/plain') {
        reader.readAsText(file);
      } else if (file.type.includes('spreadsheet') || file.type.includes('excel')) {
        reader.readAsArrayBuffer(file);
      } else {
        toast({
          variant: "destructive",
          title: "Unsupported File Type",
          description: "Please upload JSON, CSV, Excel, or text files for data context.",
        });
      }
    }
  };

  const handleInfographicFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          if (event.target?.result) {
            let parsedData: any = null;
            if (file.type === 'application/json') {
              parsedData = JSON.parse(event.target.result as string);
              processInfographicData(parsedData);
            } else if (file.type === 'text/csv') {
              const csvData = (event.target.result as string).split('\n').map(row => row.split(','));
              const headers = csvData[0];
              const processedData = csvData.slice(1).map(row => {
                const rowData: Record<string, string> = {};
                headers.forEach((header, index) => { rowData[header] = row[index]; });
                return rowData;
              });
              const defaultInfographic: InfographicData = {
                type: 'bar',
                title: 'Data Visualization from CSV',
                data: processedData,
                config: { xKey: headers[0], yKey: headers[1] }
              };
              setInfographicData(defaultInfographic);
              setChatMessages(prev => [
                ...prev,
                {
                  role: 'system',
                  content: `CSV data loaded with ${processedData.length} rows and ${headers.length} columns. Headers: ${headers.join(', ')}`,
                  timestamp: new Date()
                }
              ]);
            } else {
              toast({
                variant: "destructive",
                title: "Unsupported File Type",
                description: "Please upload JSON or CSV files for visualization.",
              });
            }
          }
        } catch (error) {
          console.error("Error parsing file:", error);
          toast({
            variant: "destructive",
            title: "Error Loading File",
            description: "Failed to parse the file. Please check the format and try again.",
          });
        }
      };
      if (file.type === 'application/json' || file.type === 'text/csv') {
        reader.readAsText(file);
      } else {
        toast({
          variant: "destructive",
          title: "Unsupported File Type",
          description: "Please upload JSON or CSV files for visualization.",
        });
      }
    }
  };

  const processInfographicData = (data: any) => {
    if (Array.isArray(data)) {
      const defaultInfographic: InfographicData = {
        type: 'bar',
        title: 'Data Visualization',
        data: data,
        config: { xKey: Object.keys(data[0])[0], yKey: Object.keys(data[0])[1] }
      };
      setInfographicData(defaultInfographic);
    } else if (typeof data === 'object') {
      if (data.type && data.data) {
        setInfographicData(data as InfographicData);
      } else {
        const pieData = Object.entries(data).map(([key, value]) => ({
          name: key,
          value: typeof value === 'number' ? value : 1
        }));
        const defaultInfographic: InfographicData = {
          type: 'pie',
          title: 'Data Visualization',
          data: pieData
        };
        setInfographicData(defaultInfographic);
      }
    }
  };

  // --- Chat/AI logic ---
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
      let contextPrompt = "You are an AI assistant specialized in creating data visualizations and infographics. ";
      if (selectedCommands.analyze) {
        contextPrompt += "Analyze the user's data and provide visualization recommendations. ";
      }
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
          const reader = new FileReader();
          const imageDataPromise = new Promise<string>((resolve) => {
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(imageFile);
          });
          const imageData = await imageDataPromise;
          const imagePrompt = "Describe this image in detail, focusing on any charts, graphs, or data visualizations visible. If it contains data, extract and summarize it.";
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
      if (selectedCommands.dataContext && contextData) {
        contextPrompt += `\n\nContext data: ${JSON.stringify(contextData)}\n\n`;
        setChatMessages(prev => [
          ...prev,
          {
            role: 'system',
            content: 'Using provided data context for visualization.',
            timestamp: new Date()
          }
        ]);
      }
      if (infographicData) {
        contextPrompt += `\n\nCurrent visualization: ${JSON.stringify({
          type: infographicData.type,
          title: infographicData.title,
          description: infographicData.description
        })}\n\n`;
      }
      const prompt = `${contextPrompt}
User request: "${userInput}"

Respond with a JSON object that contains:
1. "message": A clear explanation of what visualization you're creating and why
2. "visualization": An object with the following structure:
   - "type": The chart type (e.g., "pie", "bar", "line", "area", "scatter", "tree", "heatmap", "custom")
   - "title": A descriptive title for the visualization
   - "description": A brief explanation of what the visualization shows
   - "data": The data for the visualization in an appropriate format
   - "config": Configuration options for the visualization
   - "svgContent": (Optional) For custom visualizations, provide SVG code

Example response format:
{
  "message": "I've created a bar chart showing monthly sales data. The chart highlights the growth trend over the past year.",
  "visualization": {
    "type": "bar",
    "title": "Monthly Sales Performance",
    "description": "Sales figures from January to December 2024",
    "data": [
      {"month": "Jan", "value": 1200},
      {"month": "Feb", "value": 1500},
      {"month": "Mar", "value": 1800}
    ],
    "config": {
      "xKey": "month",
      "yKey": "value",
      "colors": ["#3F51B5", "#009688"]
    }
  }
}

If the user is asking for information without requesting a visualization, just provide a helpful response without the visualization object.
`;
      const response = await puter.ai.chat(prompt, { model: 'gpt-4o' });
      if (!response?.message?.content) throw new Error("AI response was empty or invalid.");
      const aiResponseText = response.message.content;
      let aiMessage = "";
      let newInfographicData: InfographicData | null = null;
      try {
        const jsonMatch = aiResponseText.match(/```json\n([\s\S]*?)\n```/) ||
          aiResponseText.match(/```\n([\s\S]*?)\n```/) ||
          aiResponseText.match(/{[\s\S]*?}/);
        if (jsonMatch) {
          const jsonStr = jsonMatch[0].startsWith('{') ? jsonMatch[0] : jsonMatch[1];
          const parsedResponse = JSON.parse(jsonStr);
          if (parsedResponse.message) aiMessage = parsedResponse.message;
          if (parsedResponse.visualization) newInfographicData = parsedResponse.visualization as InfographicData;
        } else {
          aiMessage = aiResponseText;
        }
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError);
        aiMessage = aiResponseText;
      }
      if (newInfographicData) setInfographicData(newInfographicData);
      const aiChatMessage: ChatMessage = {
        role: 'assistant',
        content: aiMessage,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, aiChatMessage]);
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
      setImageFile(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDownloadInfographic = async () => {
    if (!infographicRef.current) return;
    try {
      const dataUrl = await toPng(infographicRef.current, { cacheBust: true, backgroundColor: null }); // Added transparent background
      const link = document.createElement('a');
      link.download = `infographic_${new Date().toISOString().slice(0,10)}.png`;
      link.href = dataUrl;
      link.click();
      toast({
        title: "Download Complete",
        description: "Infographic image has been downloaded successfully.",
      });
    } catch (error) {
      console.error("Error downloading infographic as image:", error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Failed to download the infographic image. Please try again.",
      });
    } 
  };

  const renderChatMessages = () => (
    <div className="flex flex-col space-y-4 p-4 max-h-[500px] overflow-y-auto">
      {chatMessages.length === 0 ? (
        <div className="text-center text-muted-foreground p-4">
          <Info className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Ask the AI assistant to help you create infographics and data visualizations.</p>
          <p className="text-sm mt-2">Examples:</p>
          <ul className="text-sm mt-1 space-y-1 text-left max-w-md mx-auto">
            <li>• "Create a pie chart showing market share distribution"</li>
            <li>• "Generate a bar chart comparing monthly sales data"</li>
            <li>• "Visualize this data as a line graph with trend analysis"</li>
            <li>• "Make an infographic about global warming statistics"</li>
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

  const handleChartTypeSelect = (type: string) => {
    setSelectedChartType(type);
    const currentInput = userInput.trim();
    const newInput = currentInput
      ? `${currentInput} as a ${type} chart`
      : `Create a ${type} chart with the current data`;
    setUserInput(newInput);
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">AI-Native Infographics Generator</CardTitle>
          <CardDescription>
            Create and customize data visualizations through natural language with an AI assistant.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Infographic Section - Takes 2/3 of the space on large screens */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                  <Input
                    value={infographicData?.title || "Untitled Visualization"}
                    onChange={(e) => infographicData && setInfographicData({ ...infographicData, title: e.target.value })}
                    className="w-64"
                  />
                  <Select value={selectedChartType} onValueChange={handleChartTypeSelect}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Chart Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pie">Pie Chart</SelectItem>
                      <SelectItem value="bar">Bar Chart</SelectItem>
                      <SelectItem value="line">Line Chart</SelectItem>
                      <SelectItem value="area">Area Chart</SelectItem>
                      <SelectItem value="scatter">Scatter Plot</SelectItem>
                      <SelectItem value="tree">Tree Diagram</SelectItem>
                      <SelectItem value="heatmap">Heat Map</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={handleDownloadInfographic}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <div className="relative">
                    <Button variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Import
                      <Input
                        type="file"
                        accept=".json,.csv,.xlsx,.xls"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleInfographicFileUpload}
                      />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="border rounded-lg h-[600px] overflow-auto bg-background" ref={infographicRef}>
                <ClientInfographicRenderer infographicData={infographicData} />
              </div>
            </div>
            {/* Chat Section - Takes 1/3 of the space on large screens */}
            <div className="border rounded-lg flex flex-col h-[600px]">
              <div className="p-3 bg-muted border-b flex justify-between items-center">
                <h3 className="font-semibold">AI Assistant</h3>
              </div>
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
                      variant={selectedCommands.image ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleCommandSelect('image')}
                      className="flex items-center"
                    >
                      <Image className="h-4 w-4 mr-1" />
                      Image
                    </Button>
                    <Button
                      variant={selectedCommands.dataContext ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleCommandSelect('dataContext')}
                      className="flex items-center"
                    >
                      <BarChart className="h-4 w-4 mr-1" />
                      Data Context
                    </Button>
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
                {/* Data context */}
                {selectedCommands.dataContext && (
                  <div className="flex items-center gap-2">
                    <BarChart className="h-4 w-4 text-muted-foreground" />
                    <div className="relative flex-1">
                      <Input
                        type="file"
                        accept=".json,.csv,.xlsx,.xls,.txt"
                        className="opacity-0 absolute inset-0 cursor-pointer"
                        onChange={handleContextFileChange}
                      />
                      <Input
                        readOnly
                        placeholder="Click to upload data context"
                        value={contextFile ? contextFile.name : ''}
                        className="pointer-events-none"
                      />
                    </div>
                  </div>
                )}
                {/* Context indicators */}
                {(contextFile || imageFile) && (
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {contextFile && (
                      <div className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-md">
                        <BarChart className="h-3 w-3" />
                        <span>Using: {contextFile.name}</span>
                      </div>
                    )}
                    {imageFile && (
                      <div className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-md">
                        <Image className="h-3 w-3" />
                        <span>Using: {imageFile.name}</span>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex items-end gap-2">
                  <Textarea
                    ref={inputRef}
                    placeholder="Ask the AI assistant to create visualizations..."
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
                {error && (
                  <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">
            Powered by AI. Create beautiful data visualizations with natural language.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
