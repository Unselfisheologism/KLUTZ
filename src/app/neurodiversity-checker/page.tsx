
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
import { Loader2, ImageUp, Type, Brain, AlertTriangle, Info, CheckCircle, XCircle, FileText, Download } from 'lucide-react';
import { preprocessImage } from '@/lib/image-utils';
import { downloadTextFile } from '@/lib/utils';
import ImagePreview from '@/components/medi-scan/image-preview'; 
import type { NeurodiversityAnalysisReport } from '@/types/neurodiversity-checker';

const cleanJsonString = (rawString: string): string => {
  let cleanedString = rawString.trim();
  if (cleanedString.startsWith("```json") && cleanedString.endsWith("```")) {
    cleanedString = cleanedString.substring(7, cleanedString.length - 3).trim();
  } else if (cleanedString.startsWith("```") && cleanedString.endsWith("```")) {
    cleanedString = cleanedString.substring(3, cleanedString.length - 3).trim();
  }
  return cleanedString;
};


export default function NeurodiversityCheckerPage() {
  const [inputType, setInputType] = useState<'image' | 'text'>('image');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [textInput, setTextInput] = useState<string>('');
  const [textFile, setTextFile] = useState<File | null>(null);

  const [analysisReport, setAnalysisReport] = useState<NeurodiversityAnalysisReport | null>(null);
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
        setAnalysisReport(null); 
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
    setAnalysisReport(null);
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
          setAnalysisReport(null);
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
      toast({ variant: "destructive", title: "Missing Input", description: "Please upload an image for analysis." });
      return;
    }
    if (inputType === 'text' && !textInput.trim()) {
      toast({ variant: "destructive", title: "Missing Input", description: "Please provide text for analysis." });
      return;
    }

    setIsLoading(true);
    setAnalysisReport(null);
    setError(null);
    toast({ title: "Analysis Started", description: "AI is analyzing the content for neurodiversity-friendliness..." });

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
      
      let prompt: string;
      let aiInput: string | undefined = undefined;
      let modelUsed = 'gpt-4o';

      if (inputType === 'image' && imageFile) {
        aiInput = await preprocessImage(imageFile, 1024);
        modelUsed = 'default vision'; 
        prompt = `
          You are an AI assistant specialized in evaluating content for neurodiversity-friendliness.
          First, provide a general description of the visual content of this image.
          Then, analyze this image for elements that might impact neurodivergent individuals. Consider aspects like:
          - Visual clarity and simplicity vs. clutter or excessive detail.
          - Use of colors (e.g., high contrast, potentially overwhelming combinations).
          - Presence of potentially distracting or overwhelming patterns, textures, or animations (if any are implied).
          - Clarity of information conveyed visually.
          - Potential for sensory overload.
          Provide your findings in a JSON object with the following keys:
          - "image_description": (string) Your general description of the image content.
          - "neurodiversity_friendliness_assessment": (string) Your overall assessment (e.g., "Appears generally neurodiversity-friendly", "Some considerations for improvement", "Potential challenges for neurodivergent individuals").
          - "positive_aspects": (array of strings) List any elements that are positive for neurodiversity (e.g., "Clear visual hierarchy", "Calm color palette").
          - "areas_for_improvement": (array of strings) List specific elements that could be challenging or suggest improvements (e.g., "Image is visually cluttered", "High contrast may be harsh for some individuals", "Consider simplifying the presented information").
          - "confidence": (string, one of "High", "Medium", "Low", "Not Applicable") Your confidence in this assessment.
          - "disclaimer": (string) "AI-generated assessment. This is not a substitute for human review and consultation with neurodivergent individuals. Accuracy and comprehensiveness are not guaranteed."
        `;
      } else if (inputType === 'text' && textInput.trim()) {
        aiInput = textInput;
        prompt = `
          You are an AI assistant specialized in evaluating content for neurodiversity-friendliness.
          Analyze the following text for neurodiversity-friendliness: "${textInput}"
          Consider aspects such as:
          - Clarity and conciseness of language.
          - Sentence structure complexity.
          - Use of jargon, idioms, or ambiguous phrasing.
          - Predictability and logical flow of information.
          - Explicitness of communication.
          - Potential for information overload (e.g., dense paragraphs, lack of clear formatting cues if these are part of the input).
          Provide your findings in a JSON object with the following keys:
          - "neurodiversity_friendliness_assessment": (string) Your overall assessment (e.g., "Appears generally neurodiversity-friendly", "Some considerations for improvement", "Potential challenges for neurodivergent individuals").
          - "positive_aspects": (array of strings) List any elements that are positive for neurodiversity (e.g., "Uses clear and direct language", "Well-structured information").
          - "areas_for_improvement": (array of strings) List specific elements that could be challenging or suggest improvements (e.g., "Sentence structures are complex", "Consider defining jargon like '[term]'", "Break down long paragraphs").
          - "confidence": (string, one of "High", "Medium", "Low", "Not Applicable") Your confidence in this assessment.
          - "disclaimer": (string) "AI-generated assessment. This is not a substitute for human review and consultation with neurodivergent individuals. Accuracy and comprehensiveness are not guaranteed."
        `;
      } else {
        throw new Error("No valid input provided for analysis.");
      }

      const response = inputType === 'image' 
        ? await puter.ai.chat(prompt, aiInput) 
        : await puter.ai.chat(prompt, { model: 'gpt-4o' }); 

      if (!response?.message?.content) {
        throw new Error(`AI analysis did not return content. Model used: ${modelUsed}.`);
      }

      const parsedResponse: NeurodiversityAnalysisReport = JSON.parse(cleanJsonString(response.message.content));
      setAnalysisReport(parsedResponse);
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
    if (!analysisReport) return;
    
    let reportString = "KLUTZ Neurodiversity-Friendliness Checker Report\n";
    reportString += "================================================\n\n";
    reportString += `Input Type: ${inputType === 'image' ? 'Image' : 'Text'}\n\n`;

    if (inputType === 'image' && analysisReport.image_description) {
      reportString += "Image Description:\n";
      reportString += "------------------\n";
      reportString += `${analysisReport.image_description}\n\n`;
    }

    reportString += "Overall Neurodiversity-Friendliness Assessment:\n";
    reportString += "-----------------------------------------------\n";
    reportString += `${analysisReport.neurodiversity_friendliness_assessment || "N/A"}\n\n`;

    reportString += "Positive Aspects:\n";
    reportString += "-----------------\n";
    if (analysisReport.positive_aspects && analysisReport.positive_aspects.length > 0) {
      analysisReport.positive_aspects.forEach(aspect => {
        reportString += `- ${aspect}\n`;
      });
    } else {
      reportString += "No specific positive aspects identified by the AI.\n";
    }
    reportString += "\n";
    
    reportString += "Areas for Improvement:\n";
    reportString += "----------------------\n";
    if (analysisReport.areas_for_improvement && analysisReport.areas_for_improvement.length > 0) {
      analysisReport.areas_for_improvement.forEach(item => {
        reportString += `- ${item}\n`;
      });
    } else {
      reportString += "No specific areas for improvement identified by the AI.\n";
    }
    reportString += "\n";

    reportString += "AI Confidence in Assessment:\n";
    reportString += "----------------------------\n";
    reportString += `${analysisReport.confidence || "N/A"}\n\n`;

    if (analysisReport.disclaimer) {
      reportString += "AI Disclaimer:\n";
      reportString += "--------------\n";
      reportString += `${analysisReport.disclaimer}\n\n`;
    }
    
    reportString += "\nImportant Note: This report is AI-generated and provides a preliminary analysis. It is not a substitute for human review and consultation with neurodivergent individuals. Accuracy and comprehensiveness are not guaranteed.";

    const timestamp = new Date().toISOString().replace(/[:.-]/g, '').slice(0, 14);
    const reportTypeForFilename = inputType === 'image' ? 'Image_Analysis' : 'Text_Analysis';
    downloadTextFile(reportString, `KLUTZ_NeurodiversityChecker_${reportTypeForFilename}_${timestamp}.txt`);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="max-w-3xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary flex items-center">
            <Brain className="mr-3 h-8 w-8" />
            Neurodiversity-Friendliness Checker
          </CardTitle>
          <CardDescription>
            Analyze images or text for neurodiversity-friendliness. 
            AI insights should be reviewed critically with human expertise.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert variant="default" className="bg-yellow-50 border-yellow-400 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <AlertTitle className="font-semibold">Important Disclaimer</AlertTitle>
            <AlertDescription>
              Assessing neurodiversity-friendliness is complex and nuanced. This AI tool provides a preliminary analysis and may have limitations or biases.
              Always consult with neurodivergent individuals and experts for comprehensive evaluations.
            </AlertDescription>
          </Alert>

          <Tabs value={inputType} onValueChange={(value) => setInputType(value as 'image' | 'text')} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="image">Image Analysis</TabsTrigger>
              <TabsTrigger value="text">Text Analysis</TabsTrigger>
            </TabsList>
            <TabsContent value="image" className="mt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="image-upload" className="text-lg font-medium flex items-center mb-2">
                    <ImageUp className="mr-2 h-5 w-5 text-accent" />
                    Upload Image
                  </Label>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleImageFileChange}
                    className="file:text-primary file:font-semibold file:bg-primary/10 hover:file:bg-primary/20"
                    disabled={isLoading}
                  />
                  <p className="text-sm text-muted-foreground mt-1">Supported formats: PNG, JPG, WEBP.</p>
                </div>
                {imageDataUrl && <ImagePreview imageDataUrl={imageDataUrl} dataAiHint="content image"/>}
              </div>
            </TabsContent>
            <TabsContent value="text" className="mt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="text-input" className="text-lg font-medium flex items-center mb-2">
                    <Type className="mr-2 h-5 w-5 text-accent" />
                    Paste Text
                  </Label>
                  <Textarea
                    id="text-input"
                    placeholder="Paste your text content here..."
                    value={textInput}
                    onChange={handleTextInputChange}
                    rows={8}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="text-file-upload" className="text-sm font-medium flex items-center mb-1">
                    Or Upload a .txt File
                  </Label>
                  <Input
                    id="text-file-upload"
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
                Analyzing Content...
              </>
            ) : (
              'Check Neurodiversity-Friendliness'
            )}
          </Button>

          {error && !isLoading && (
            <Alert variant="destructive" className="mt-6">
              <AlertTriangle className="h-5 w-5" />
              <AlertTitle>Analysis Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {analysisReport && !isLoading && !error && (
            <Card className="mt-6 shadow-md">
              <CardHeader>
                <CardTitle className="font-headline text-xl flex items-center">
                  <Brain className="mr-2 h-6 w-6 text-primary" />
                  AI Neurodiversity-Friendliness Report
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {analysisReport.image_description && inputType === 'image' && (
                  <div>
                    <h4 className="font-semibold text-md mb-1 flex items-center">
                      <FileText className="mr-2 h-4 w-4 text-accent" />
                      General Image Description:
                    </h4>
                    <p className="bg-muted/30 p-3 rounded-md">{analysisReport.image_description}</p>
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-md mb-1">Overall Assessment:</h4>
                  <p className={`p-3 rounded-md ${
                    analysisReport.neurodiversity_friendliness_assessment?.toLowerCase().includes("challenge") || analysisReport.neurodiversity_friendliness_assessment?.toLowerCase().includes("concern") ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300" :
                    analysisReport.neurodiversity_friendliness_assessment?.toLowerCase().includes("friendly") ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" :
                    "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" 
                  }`}>
                    {analysisReport.neurodiversity_friendliness_assessment || "Not specified."}
                    {(analysisReport.neurodiversity_friendliness_assessment?.toLowerCase().includes("challenge") || analysisReport.neurodiversity_friendliness_assessment?.toLowerCase().includes("concern")) && <XCircle className="inline ml-2 h-4 w-4"/>}
                    {analysisReport.neurodiversity_friendliness_assessment?.toLowerCase().includes("friendly") && <CheckCircle className="inline ml-2 h-4 w-4"/>}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-md mb-1">Positive Aspects:</h4>
                  {analysisReport.positive_aspects && analysisReport.positive_aspects.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1 bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                      {analysisReport.positive_aspects.map((aspect, index) => (
                        <li key={index}>{aspect}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="bg-muted/30 p-3 rounded-md">No specific positive aspects identified by the AI.</p>
                  )}
                </div>
                
                <div>
                  <h4 className="font-semibold text-md mb-1">Areas for Improvement:</h4>
                  {analysisReport.areas_for_improvement && analysisReport.areas_for_improvement.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md">
                      {analysisReport.areas_for_improvement.map((concern, index) => (
                        <li key={index}>{concern}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="bg-muted/30 p-3 rounded-md">No specific areas for improvement identified by the AI.</p>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-md mb-1">AI Confidence:</h4>
                  <p className="bg-muted/30 p-3 rounded-md">{analysisReport.confidence || "Not specified."}</p>
                </div>
                {analysisReport.disclaimer && (
                   <Alert variant="default" className="text-xs bg-blue-50 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300">
                    <Info className="h-4 w-4 text-blue-500" />
                    <AlertTitle className="font-medium">AI Note</AlertTitle>
                    <AlertDescription>{analysisReport.disclaimer}</AlertDescription>
                  </Alert>
                )}
                <Button onClick={handleDownloadReport} variant="outline" className="w-full mt-4">
                  <Download className="mr-2 h-4 w-4" />
                  Download Report
                </Button>
              </CardContent>
            </Card>
          )}
           {!analysisReport && !isLoading && !error && (
             <div className="mt-6 p-4 border border-dashed rounded-md text-center text-muted-foreground">
                <Info className="mx-auto h-8 w-8 mb-2"/>
                <p>Select input type, upload content, and click "Check" to view the AI's assessment.</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
            <p className="text-xs text-muted-foreground w-full text-center">
                This tool uses AI and is for informational purposes. Assessments may not be fully accurate or comprehensive. Always consult with human experts.
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
