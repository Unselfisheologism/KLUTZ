
'use client';

import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ImageUp, Type, Thermometer, AlertTriangle, Info, Eye, FileTextIcon, Sparkles, Pin, CircleHelp, Download } from 'lucide-react';
import { preprocessImage } from '@/lib/image-utils';
import { downloadTextFile } from '@/lib/utils';
import ImagePreview from '@/components/medi-scan/image-preview';
import type { ImageHeatmapReport, TextHeatmapReport, ImageAttentionArea } from '@/types/heatmap-generator';

const cleanJsonString = (rawString: string): string => {
  let cleanedString = rawString.trim();
  if (cleanedString.startsWith("```json") && cleanedString.endsWith("```")) {
    cleanedString = cleanedString.substring(7, cleanedString.length - 3).trim();
  } else if (cleanedString.startsWith("```") && cleanedString.endsWith("```")) {
    cleanedString = cleanedString.substring(3, cleanedString.length - 3).trim();
  }
  return cleanedString;
};

export default function HeatmapGeneratorPage() {
  const [inputType, setInputType] = useState<'image' | 'text'>('image');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [textInput, setTextInput] = useState<string>('');
  const [textFile, setTextFile] = useState<File | null>(null);

  const [imageReport, setImageReport] = useState<ImageHeatmapReport | null>(null);
  const [textReport, setTextReport] = useState<TextHeatmapReport | null>(null);
  
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

  const handleImageFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      try {
        const previewDataUrl = URL.createObjectURL(file);
        setImageDataUrl(previewDataUrl);
        setImageReport(null); 
        setError(null);
      } catch (previewError) {
        toast({ variant: "destructive", title: "Preview Error", description: "Could not generate image preview." });
        setImageDataUrl(null);
      }
    } else {
      setImageFile(null);
      setImageDataUrl(null);
    }
  };

  const handleTextInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextInput(event.target.value);
    setTextReport(null);
    setError(null);
  };

  const handleTextFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'text/plain') {
        setTextFile(file);
        try {
          const textContent = await file.text();
          setTextInput(textContent);
          setTextReport(null);
          setError(null);
        } catch (readError) {
          toast({ variant: "destructive", title: "File Read Error", description: "Could not read the text file." });
        }
      } else {
        toast({ variant: "destructive", title: "Invalid File Type", description: "Please upload a .txt file for text analysis." });
        event.target.value = '';
      }
    } else {
      setTextFile(null);
    }
  };

  const performAnalysis = async () => {
    if (inputType === 'image' && !imageFile) {
      toast({ variant: "destructive", title: "Missing Input", description: "Please upload an image." });
      return;
    }
    if (inputType === 'text' && !textInput.trim()) {
      toast({ variant: "destructive", title: "Missing Input", description: "Please provide text." });
      return;
    }

    setIsLoading(true);
    setImageReport(null);
    setTextReport(null);
    setError(null);
    toast({ title: "Analysis Started", description: "AI is generating engagement insights..." });

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
      
      if (inputType === 'image' && imageFile) {
        const processedImageUrl = await preprocessImage(imageFile, 1024);
        const imagePrompt = `
          You are an AI assistant specializing in predicting visual attention in images.
          First, provide a general description of the image content.
          Then, analyze this image to identify areas likely to attract high visual attention and areas likely to receive low visual attention. For each area, briefly explain why it is engaging or not.
          Also, try to provide a general location_hint for each area identified, using one of the following: 'center', 'top-center', 'bottom-center', 'left-center', 'right-center', 'top-left', 'top-right', 'bottom-left', 'bottom-right'. If a precise hint isn't possible, you can use a more general textual description for location_hint or leave it empty.
          Provide your findings in a JSON object with the following structure:
          {
            "image_description": "string (A brief overall description of the image content.)",
            "high_attention_areas": [
              { "area_description": "string (e.g., 'The bright red apple')", "reason": "string (e.g., 'Color contrast')", "attention_level": "high", "location_hint": "string (e.g., 'center' or 'top-left or textual hint like 'around the main subject's eyes')" }
            ],
            "low_attention_areas": [
              { "area_description": "string (e.g., 'The blurry background foliage')", "reason": "string (e.g., 'Out of focus')", "attention_level": "low", "location_hint": "string (e.g., 'bottom-right' or 'background area')" }
            ],
            "confidence": "string (One of 'High', 'Medium', 'Low')",
            "disclaimer": "string (AI-predicted engagement is subjective. Location hints are approximate. Use as a guide.)"
          }
          Focus on descriptive locations rather than precise coordinates.
        `;
        const response = await puter.ai.chat(imagePrompt, processedImageUrl);
        if (!response?.message?.content) throw new Error("AI analysis for image did not return content.");
        const parsedResponse: ImageHeatmapReport = JSON.parse(cleanJsonString(response.message.content));
        setImageReport(parsedResponse);
      } else if (inputType === 'text' && textInput.trim()) {
        const textPrompt = `
          You are an AI assistant specializing in analyzing text engagement.
          Analyze the following text for predicted user engagement: "${textInput}"
          Segment the text into meaningful phrases or short sentences. For each segment, assign an engagement level ('high', 'medium', 'low', 'neutral') and optionally a brief reason.
          Also provide an overall summary of the text's engagement potential.
          Provide your findings in a JSON object with the following structure:
          {
            "overall_summary": "string (A brief summary of the text's overall engagement potential.)",
            "segments": [
              { "segment": "string (The text segment)", "engagement_level": "string ('high'|'medium'|'low'|'neutral')", "reason": "string (optional explanation)" }
            ],
            "confidence": "string (One of 'High', 'Medium', 'Low')",
            "disclaimer": "string (AI-predicted engagement is subjective. Use as a guide.)"
          }
        `;
        const response = await puter.ai.chat(textPrompt, { model: 'gpt-4o' });
        if (!response?.message?.content) throw new Error("AI analysis for text did not return content.");
        const parsedResponse: TextHeatmapReport = JSON.parse(cleanJsonString(response.message.content));
        setTextReport(parsedResponse);
      }
      toast({ title: "Analysis Complete", variant: "default", className: "bg-green-500 text-white dark:bg-green-600" });
    } catch (err: any) {
      console.error("Analysis error:", err);
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
    let reportString = "KLUTZ Content Engagement Heatmap Report\n";
    reportString += "=========================================\n\n";
    let reportTypeForFilename: string;

    if (inputType === 'image' && imageReport) {
      reportTypeForFilename = 'Image_Engagement';
      reportString += `Input Type: Image\n`;
      if (imageFile) reportString += `Original Filename: ${imageFile.name}\n\n`;
      
      reportString += "Image Description:\n";
      reportString += "------------------\n";
      reportString += `${imageReport.image_description || "N/A"}\n\n`;

      reportString += "Identified High Attention Areas:\n";
      reportString += "--------------------------------\n";
      if (imageReport.high_attention_areas && imageReport.high_attention_areas.length > 0) {
        imageReport.high_attention_areas.forEach(area => {
          reportString += `- Area: ${area.area_description}\n`;
          reportString += `  Reason: ${area.reason}\n`;
          if (area.location_hint) reportString += `  Approx. Location: ${area.location_hint}\n`;
          reportString += "\n";
        });
      } else {
        reportString += "No specific high attention areas identified by AI.\n\n";
      }

      reportString += "Identified Low Attention Areas:\n";
      reportString += "-------------------------------\n";
      if (imageReport.low_attention_areas && imageReport.low_attention_areas.length > 0) {
        imageReport.low_attention_areas.forEach(area => {
          reportString += `- Area: ${area.area_description}\n`;
          reportString += `  Reason: ${area.reason}\n`;
          if (area.location_hint) reportString += `  Approx. Location: ${area.location_hint}\n`;
          reportString += "\n";
        });
      } else {
        reportString += "No specific low attention areas identified by AI.\n\n";
      }
      reportString += `AI Confidence: ${imageReport.confidence || "N/A"}\n`;
      reportString += `Disclaimer: ${imageReport.disclaimer || "N/A"}\n`;

    } else if (inputType === 'text' && textReport) {
      reportTypeForFilename = 'Text_Engagement';
      reportString += `Input Type: Text\n\n`;
      
      reportString += "Overall Summary of Text Engagement:\n";
      reportString += "-----------------------------------\n";
      reportString += `${textReport.overall_summary || "N/A"}\n\n`;

      reportString += "Segment Engagement Analysis:\n";
      reportString += "----------------------------\n";
      if (textReport.segments && textReport.segments.length > 0) {
        textReport.segments.forEach(segment => {
          reportString += `- Segment: "${segment.segment}"\n`;
          reportString += `  Engagement: ${segment.engagement_level}\n`;
          if (segment.reason) reportString += `  Reason: ${segment.reason}\n`;
          reportString += "\n";
        });
      } else {
        reportString += "No text segments analyzed.\n\n";
      }
      reportString += `AI Confidence: ${textReport.confidence || "N/A"}\n`;
      reportString += `Disclaimer: ${textReport.disclaimer || "N/A"}\n`;
    } else {
      return; 
    }
    
    reportString += "\n\nImportant Note: AI-predicted engagement is an estimation and can be subjective. It may not reflect actual user behavior or specific audience preferences. Use these insights as a guide, not a definitive measure.";

    const timestamp = new Date().toISOString().replace(/[:.-]/g, '').slice(0, 14);
    downloadTextFile(reportString, `KLUTZ_Heatmap_${reportTypeForFilename}_Report_${timestamp}.txt`);
  };

  const getEngagementColor = (level: 'high' | 'medium' | 'low' | 'neutral' | undefined) => {
    switch (level) {
      case 'high': return 'bg-red-500/70 text-white'; 
      case 'medium': return 'bg-orange-400/70 text-white';
      case 'low': return 'bg-yellow-300/70 text-yellow-900';
      case 'neutral': return 'bg-blue-200/70 text-blue-900'; 
      default: return 'bg-gray-200/70 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="max-w-3xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary flex items-center">
            <Thermometer className="mr-3 h-8 w-8" />
            Content Engagement Heatmap
          </CardTitle>
          <CardDescription>
            AI-powered prediction of user engagement for images and text.
            Visual heatmaps for text are simulated with highlighting. Image heatmaps are descriptive with approximate visual cues.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert variant="default" className="bg-yellow-50 border-yellow-400 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <AlertTitle className="font-semibold">Important Disclaimer</AlertTitle>
            <AlertDescription>
              AI-predicted engagement is an estimation and can be subjective. Visual markers on images are approximations. It may not reflect actual user behavior or specific audience preferences. Use these insights as a guide, not a definitive measure.
            </AlertDescription>
          </Alert>

          <Tabs value={inputType} onValueChange={(value) => {
            setInputType(value as 'image' | 'text');
            setImageReport(null);
            setTextReport(null);
            setError(null);
            setImageDataUrl(null);
            setImageFile(null);
          }} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="image">Image Engagement</TabsTrigger>
              <TabsTrigger value="text">Text Engagement</TabsTrigger>
            </TabsList>
            <TabsContent value="image" className="mt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="image-upload-heatmap" className="text-lg font-medium flex items-center mb-2">
                    <ImageUp className="mr-2 h-5 w-5 text-accent" />
                    Upload Image
                  </Label>
                  <Input
                    id="image-upload-heatmap"
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleImageFileChange}
                    className="file:text-primary file:font-semibold file:bg-primary/10 hover:file:bg-primary/20"
                    disabled={isLoading}
                  />
                  <p className="text-sm text-muted-foreground mt-1">Supported formats: PNG, JPG, WEBP.</p>
                </div>
                {imageDataUrl && (
                  <ImagePreview 
                    imageDataUrl={imageDataUrl} 
                    dataAiHint="engagement content"
                    highAttentionAreas={imageReport?.high_attention_areas}
                    lowAttentionAreas={imageReport?.low_attention_areas}
                  />
                )}
              </div>
            </TabsContent>
            <TabsContent value="text" className="mt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="text-input-heatmap" className="text-lg font-medium flex items-center mb-2">
                    <Type className="mr-2 h-5 w-5 text-accent" />
                    Paste Text
                  </Label>
                  <Textarea
                    id="text-input-heatmap"
                    placeholder="Paste your text content here..."
                    value={textInput}
                    onChange={handleTextInputChange}
                    rows={10}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="text-file-upload-heatmap" className="text-sm font-medium flex items-center mb-1">
                    Or Upload a .txt File
                  </Label>
                  <Input
                    id="text-file-upload-heatmap"
                    type="file"
                    accept=".txt"
                    onChange={handleTextFileChange}
                    className="file:text-primary file:font-semibold file:bg-primary/10 hover:file:bg-primary/20 text-sm"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <Button onClick={performAnalysis} disabled={isLoading || (inputType === 'image' && !imageFile) || (inputType === 'text' && !textInput.trim())} className="w-full mt-6">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Heatmap Insights...
              </>
            ) : (
              'Generate Engagement Insights'
            )}
          </Button>

          {error && !isLoading && (
            <Alert variant="destructive" className="mt-6">
              <AlertTriangle className="h-5 w-5" />
              <AlertTitle>Analysis Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {(imageReport && inputType === 'image' || textReport && inputType === 'text') && !isLoading && !error && (
             <Button onClick={handleDownloadReport} variant="outline" className="w-full mt-4">
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Button>
          )}

          {imageReport && !isLoading && inputType === 'image' && (
            <Card className="mt-6 shadow-md">
              <CardHeader>
                <CardTitle className="font-headline text-xl flex items-center">
                  <Eye className="mr-2 h-6 w-6 text-primary" />
                  Image Engagement Report
                </CardTitle>
                 <CardDescription>
                   Approximate attention areas are marked on the image preview above.
                   <span className="inline-flex items-center ml-2">
                      <span className="w-3 h-3 rounded-full bg-red-500/70 mr-1"></span> High
                      <span className="w-3 h-3 rounded-full bg-blue-500/70 ml-2 mr-1"></span> Low
                   </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold text-md mb-1 flex items-center"><FileTextIcon className="mr-2 h-4 w-4 text-accent"/>Image Description:</h4>
                  <p className="bg-muted/30 p-3 rounded-md">{imageReport.image_description || "Not provided."}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-md mb-1 text-red-600 dark:text-red-400 flex items-center"><Sparkles className="mr-2 h-4 w-4"/>Identified High Attention Areas:</h4>
                  {imageReport.high_attention_areas && imageReport.high_attention_areas.length > 0 ? (
                    <ul className="list-none space-y-2">
                      {imageReport.high_attention_areas.map((area, index) => (
                        <li key={`high-${index}`} className="bg-red-50 dark:bg-red-900/20 p-2 rounded-md">
                          <strong className="flex items-center"><Pin className="w-4 h-4 mr-1 text-red-600 dark:text-red-400" />{area.area_description}</strong>
                          <p className="text-xs pl-5">{area.reason}</p>
                          {area.location_hint && <p className="text-xs pl-5 text-muted-foreground">Hint: {area.location_hint}</p>}
                        </li>
                      ))}
                    </ul>
                  ) : <p className="bg-muted/30 p-3 rounded-md">No specific high attention areas identified by AI.</p>}
                </div>
                <div>
                  <h4 className="font-semibold text-md mb-1 text-blue-600 dark:text-blue-400 flex items-center"><CircleHelp className="mr-2 h-4 w-4"/>Identified Low Attention Areas:</h4>
                  {imageReport.low_attention_areas && imageReport.low_attention_areas.length > 0 ? (
                     <ul className="list-none space-y-2">
                      {imageReport.low_attention_areas.map((area, index) => (
                        <li key={`low-${index}`} className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-md">
                          <strong className="flex items-center"><Pin className="w-4 h-4 mr-1 text-blue-600 dark:text-blue-400" />{area.area_description}</strong>
                           <p className="text-xs pl-5">{area.reason}</p>
                           {area.location_hint && <p className="text-xs pl-5 text-muted-foreground">Hint: {area.location_hint}</p>}
                        </li>
                      ))}
                    </ul>
                  ) : <p className="bg-muted/30 p-3 rounded-md">No specific low attention areas identified by AI.</p>}
                </div>
                 <div>
                  <h4 className="font-semibold text-md mb-1">AI Confidence:</h4>
                  <p className="bg-muted/30 p-3 rounded-md">{imageReport.confidence}</p>
                </div>
                <Alert variant="default" className="text-xs bg-blue-50 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300">
                  <Info className="h-4 w-4 text-blue-500" />
                  <AlertTitle className="font-medium">AI Note</AlertTitle>
                  <AlertDescription>{imageReport.disclaimer}</AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {textReport && !isLoading && inputType === 'text' && (
            <Card className="mt-6 shadow-md">
              <CardHeader>
                <CardTitle className="font-headline text-xl flex items-center">
                  <Type className="mr-2 h-6 w-6 text-primary" />
                  Text Engagement Report
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold text-md mb-1 flex items-center"><FileTextIcon className="mr-2 h-4 w-4 text-accent"/>Overall Summary:</h4>
                  <p className="bg-muted/30 p-3 rounded-md">{textReport.overall_summary || "Not provided."}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-md mb-2">Engagement Heatmap (Simulated):</h4>
                  <div className="p-3 rounded-md border bg-background leading-relaxed">
                    {textReport.segments && textReport.segments.length > 0 ? (
                      textReport.segments.map((item, index) => (
                        <span key={index} className={`px-1 py-0.5 rounded-sm ${getEngagementColor(item.engagement_level)} mr-0.5 mb-0.5 inline-block`}>
                          {item.segment}
                        </span>
                      ))
                    ) : <p>No text segments analyzed.</p>}
                  </div>
                   <div className="flex flex-wrap gap-2 mt-3 text-xs">
                        <span className="flex items-center"><span className="w-3 h-3 rounded-sm bg-red-500/70 mr-1"></span> High Engagement</span>
                        <span className="flex items-center"><span className="w-3 h-3 rounded-sm bg-orange-400/70 mr-1"></span> Medium Engagement</span>
                        <span className="flex items-center"><span className="w-3 h-3 rounded-sm bg-yellow-300/70 mr-1"></span> Low Engagement</span>
                        <span className="flex items-center"><span className="w-3 h-3 rounded-sm bg-blue-200/70 mr-1"></span> Neutral</span>
                    </div>
                </div>
                 <div>
                  <h4 className="font-semibold text-md mb-1">AI Confidence:</h4>
                  <p className="bg-muted/30 p-3 rounded-md">{textReport.confidence}</p>
                </div>
                 <Alert variant="default" className="text-xs bg-blue-50 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300">
                  <Info className="h-4 w-4 text-blue-500" />
                  <AlertTitle className="font-medium">AI Note</AlertTitle>
                  <AlertDescription>{textReport.disclaimer}</AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {!imageReport && !textReport && !isLoading && !error && (
             <div className="mt-6 p-4 border border-dashed rounded-md text-center text-muted-foreground">
                <Info className="mx-auto h-8 w-8 mb-2"/>
                <p>Upload content and click "Generate" to see AI-predicted engagement insights.</p>
            </div>
          )}

        </CardContent>
        <CardFooter>
            <p className="text-xs text-muted-foreground w-full text-center">
                AI heatmap insights are predictive and should be combined with user testing for best results.
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
