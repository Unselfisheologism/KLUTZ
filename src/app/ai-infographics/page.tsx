'use client';

import { useState, useEffect, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Send, Download, Info, Upload, Brain, Image, BarChart, PieChart, LineChart, AreaChart, ScatterChart } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Recharts for infographics
import {
  PieChart as RCPieChart, Pie, Cell, Tooltip as RCTooltip, Legend as RCLegend,
  BarChart as RCBarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart as RCLineChart, Line, AreaChart as RCAreaChart, Area,
  ScatterChart as RCScatterChart, Scatter, ZAxis
} from 'recharts';
// Simple react-heatmap
import HeatMapGrid from 'react-heatmap-grid';

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

const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#00bcd4', '#ff6384', '#36a2eb', '#cc65fe', '#ffce56', '#009688'
];

function summarizeData(type: string, data: any, config: any): string {
  if (!data) return "";
  if (type === "pie" && Array.isArray(data)) {
    const top = data.reduce((max, cur) => cur.value > max.value ? cur : max, data[0]);
    return `The largest segment is ${top.name} (${top.value}).`;
  }
  if ((type === "bar" || type === "line" || type === "area") && Array.isArray(data) && config?.yKey && config?.xKey) {
    const max = data.reduce((max, cur) => +cur[config.yKey] > +max[config.yKey] ? cur : max, data[0]);
    return `The peak value is ${max[config.yKey]} at ${max[config.xKey]}.`;
  }
  if (type === "scatter" && Array.isArray(data) && config?.xKey && config?.yKey) {
    return `Scatter plot of ${config.xKey} vs ${config.yKey}, ${data.length} points.`;
  }
  if (type === "heatmap" && Array.isArray(data)) {
    return `Heatmap with ${data.length} rows and ${data[0]?.length ?? 0} columns.`;
  }
  return "";
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
  const { toast } = useToast();

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // --- File upload and parsing logic (unchanged from your original) ---
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

  // --- Chat/AI logic remains as in your original code ---

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

  const handleDownloadInfographic = () => {
    if (!infographicData) return;
    try {
      const dataStr = JSON.stringify(infographicData, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', `infographic_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(linkElement);
      linkElement.click();
      document.body.removeChild(linkElement);
      toast({
        title: "Download Complete",
        description: "Infographic data has been downloaded successfully.",
      });
    } catch (error) {
      console.error("Error downloading infographic:", error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Failed to download the infographic. Please try again.",
      });
    }
  };

  const renderInfographic = () => {
    if (!infographicData) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <BarChart className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Visualization Yet</h3>
          <p className="text-muted-foreground">
            Ask the AI assistant to create a visualization or upload data to get started.
          </p>
        </div>
      );
    }
    const summary = summarizeData(infographicData.type, infographicData.data, infographicData.config);
    return (
      <div className="flex flex-col h-full">
        <div className="bg-muted/20 p-4 rounded-md mb-4">
          <h3 className="text-xl font-semibold mb-2">{infographicData.title}</h3>
          {infographicData.description && (
            <p className="text-muted-foreground mb-2">{infographicData.description}</p>
          )}
          {summary && (
            <p className="font-medium text-info mb-2">{summary}</p>
          )}
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-primary/20 text-primary px-2 py-1 rounded text-sm">
              {infographicData.type.charAt(0).toUpperCase() + infographicData.type.slice(1)} Chart
            </div>
            {infographicData.config && Object.keys(infographicData.config).length > 0 && (
              <div className="bg-secondary/20 text-secondary-foreground px-2 py-1 rounded text-sm">
                {Object.keys(infographicData.config).length} Configuration Options
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 border rounded-md p-4 flex items-center justify-center bg-card">
          {infographicData.type === 'pie' && Array.isArray(infographicData.data) && (
            <RCPieChart width={320} height={320}>
              <Pie
                data={infographicData.data}
                dataKey="value"
                nameKey="name"
                cx="50%" cy="50%"
                outerRadius={120}
                label
              >
                {infographicData.data.map((entry: any, idx: number) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <RCTooltip />
              <RCLegend />
            </RCPieChart>
          )}
          {infographicData.type === 'bar' && Array.isArray(infographicData.data) && infographicData.config && (
            <RCBarChart width={500} height={300} data={infographicData.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={infographicData.config.xKey} />
              <YAxis />
              <RCTooltip />
              <RCLegend />
              <Bar dataKey={infographicData.config.yKey} fill={COLORS[0]} />
            </RCBarChart>
          )}
          {infographicData.type === 'line' && Array.isArray(infographicData.data) && infographicData.config && (
            <RCLineChart width={500} height={300} data={infographicData.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={infographicData.config.xKey} />
              <YAxis />
              <RCTooltip />
              <RCLegend />
              <Line type="monotone" dataKey={infographicData.config.yKey} stroke={COLORS[0]} />
            </RCLineChart>
          )}
          {infographicData.type === 'area' && Array.isArray(infographicData.data) && infographicData.config && (
            <RCAreaChart width={500} height={300} data={infographicData.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={infographicData.config.xKey} />
              <YAxis />
              <RCTooltip />
              <RCLegend />
              <Area type="monotone" dataKey={infographicData.config.yKey} stroke={COLORS[0]} fill={COLORS[1]} />
            </RCAreaChart>
          )}
          {infographicData.type === 'scatter' && Array.isArray(infographicData.data) && infographicData.config && (
            <RCScatterChart width={500} height={300}>
              <CartesianGrid />
              <XAxis dataKey={infographicData.config.xKey} name={infographicData.config.xKey} />
              <YAxis dataKey={infographicData.config.yKey} name={infographicData.config.yKey} />
              <ZAxis dataKey={infographicData.config.zKey || undefined} range={[60, 400]} />
              <RCTooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Scatter Data" data={infographicData.data} fill={COLORS[2]} />
            </RCScatterChart>
          )}
          {infographicData.type === 'heatmap' && Array.isArray(infographicData.data) && (
            <div style={{ width: 400, height: 320 }}>
              <HeatMapGrid
                data={infographicData.data}
                xLabels={infographicData.config?.xLabels || Array.from({ length: infographicData.data[0]?.length || 0 }, (_, i) => `Col ${i+1}`)}
                yLabels={infographicData.config?.yLabels || Array.from({ length: infographicData.data.length }, (_, i) => `Row ${i+1}`)}
                cellStyle={(_background, value, _min, max) => ({
                  background: `rgb(66, 86, 244, ${max ? value / max : 0})`,
                  color: "#fff",
                  fontSize: "12px"
                })}
                cellRender={value => value && value.toFixed ? value.toFixed(0) : value}
              />
            </div>
          )}
          {(infographicData.type === 'custom' || !['pie','bar','line','area','scatter','heatmap'].includes(infographicData.type)) && (
            <div className="relative w-full h-64">
              <div className="text-center">
                <h4 className="font-medium mb-2">{infographicData.type.charAt(0).toUpperCase() + infographicData.type.slice(1)} Visualization</h4>
                {infographicData.svgContent ? (
                  <div dangerouslySetInnerHTML={{ __html: infographicData.svgContent }} />
                ) : (
                  <div className="border border-dashed rounded-md p-8 text-muted-foreground">
                    Custom visualization would render here
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="mt-4 bg-muted/20 p-4 rounded-md">
          <h4 className="font-medium mb-2">Data Preview</h4>
          <div className="max-h-32 overflow-y-auto">
            <pre className="text-xs whitespace-pre-wrap">
              {JSON.stringify(infographicData.data, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
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
              <div className="border rounded-lg h-[600px] overflow-auto bg-background">
                {renderInfographic()}
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
