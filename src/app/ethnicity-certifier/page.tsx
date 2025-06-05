
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
import { Loader2, ImageUp, Type, ShieldCheck, AlertTriangle, Info, CheckCircle, XCircle, FileText, Download } from 'lucide-react';
import { preprocessImage } from '@/lib/image-utils';
import { downloadTextFile } from '@/lib/utils';
import ImagePreview from '@/components/medi-scan/image-preview'; 
import type { EthnicityAnalysisReport } from '@/types/ethnicity-certifier';

const cleanJsonString = (rawString: string): string => {
  let cleanedString = rawString.trim();
  if (cleanedString.startsWith("```json") && cleanedString.endsWith("```")) {
    cleanedString = cleanedString.substring(7, cleanedString.length - 3).trim();
  } else if (cleanedString.startsWith("```") && cleanedString.endsWith("```")) {
    cleanedString = cleanedString.substring(3, cleanedString.length - 3).trim();
  }
  return cleanedString;
};


export default function EthnicityCertifierPage() {
  const [inputType, setInputType] = useState<'image' | 'text'>('image');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [textInput, setTextInput] = useState<string>('');
  const [textFile, setTextFile] = useState<File | null>(null);

  const [analysisReport, setAnalysisReport] = useState<EthnicityAnalysisReport | null>(null);
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
    toast({ title: "Analysis Started", description: "AI is analyzing the content..." });

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
          First, provide a general description of the contents of this image.
          Then, analyze this image for perceived ethnic representation of individuals. 
          Additionally, assess if the portrayal of any identified individuals or groups appears to perpetuate harmful stereotypes, is disrespectful, or could be considered unethical in the context of ethnic representation.
          If specific ethnicities are difficult to determine or not apparent, state that. Acknowledge the limitations of this visual assessment.
          Provide your findings in a JSON object with the following keys:
          - "image_description": (string) Your general description of the image content.
          - "representation_summary": (string) A description of perceived ethnic representations, or a statement if none are clear.
          - "ethical_assessment": (string) Your assessment regarding the ethical portrayal related to ethnicity (e.g., "Appears respectful", "Raises concerns", "Neutral/Not Applicable").
          - "concerns_raised": (array of strings) A list of specific concerns if any (e.g., "Potential stereotype: [description]"). Empty if no concerns.
          - "confidence": (string, one of "High", "Medium", "Low", "Not Applicable") Your confidence in this assessment.
          - "disclaimer": (string) "AI-generated assessment. Verify with human oversight. Accuracy and fairness are not guaranteed."
        `;
      } else if (inputType === 'text' && textInput.trim()) {
        aiInput = textInput; 
        prompt = `
          Analyze the following text for mentions or portrayals of ethnicity: "${textInput}"
          Assess if these portrayals are respectful or if they could be considered unethical (e.g., perpetuating stereotypes, discriminatory language) in the context of ethnic representation.
          Acknowledge the limitations of inferring ethnicity or intent from text.
          Provide your findings in a JSON object with the following keys:
          - "representation_summary": (string) A description of ethnicities discussed/portrayed, or a statement if not a significant aspect.
          - "ethical_assessment": (string) Your assessment regarding the ethical portrayal related to ethnicity (e.g., "Appears respectful", "Raises concerns", "Neutral/Not Applicable").
          - "concerns_raised": (array of strings) A list of specific concerns if any (e.g., "Use of potentially insensitive term: '[term]'"). Empty if no concerns.
          - "confidence": (string, one of "High", "Medium", "Low", "Not Applicable") Your confidence in this assessment.
          - "disclaimer": (string) "AI-generated assessment. Verify with human oversight. Accuracy and fairness are not guaranteed."
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

      const parsedResponse: EthnicityAnalysisReport = JSON.parse(cleanJsonString(response.message.content));
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

    let reportString = "KLUTZ Content Ethnicity Certifier Report\n";
    reportString += "=======================================\n\n";
    reportString += `Input Type: ${inputType === 'image' ? 'Image' : 'Text'}\n\n`;

    if (inputType === 'image' && analysisReport.image_description) {
      reportString += "Image Description:\n";
      reportString += "------------------\n";
      reportString += `${analysisReport.image_description}\n\n`;
    }

    reportString += "Representation Summary:\n";
    reportString += "-----------------------\n";
    reportString += `${analysisReport.representation_summary || "N/A"}\n\n`;

    reportString += "Ethical Assessment:\n";
    reportString += "-------------------\n";
    reportString += `${analysisReport.ethical_assessment || "N/A"}\n\n`;

    reportString += "Specific Concerns Raised:\n";
    reportString += "-------------------------\n";
    if (analysisReport.concerns_raised && analysisReport.concerns_raised.length > 0) {
      analysisReport.concerns_raised.forEach(concern => {
        reportString += `- ${concern}\n`;
      });
    } else {
      reportString += "No specific concerns raised by the AI.\n";
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
    
    reportString += "\nImportant Note: This report is AI-generated and for informational purposes only. It is not a substitute for human judgment and cultural sensitivity. Assessments may not be fully accurate or unbiased.";


    const timestamp = new Date().toISOString().replace(/[:.-]/g, '').slice(0, 14);
    const reportTypeForFilename = inputType === 'image' ? 'Image_Analysis' : 'Text_Analysis';
    downloadTextFile(reportString, `KLUTZ_EthnicityCertifier_${reportTypeForFilename}_${timestamp}.txt`);
  };


  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="max-w-3xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary flex items-center">
            <ShieldCheck className="mr-3 h-8 w-8" />
            Content Ethnicity Certifier
          </CardTitle>
          <CardDescription>
            Analyze images or text for ethical representation related to ethnicity. 
            This tool uses AI and its assessments should be critically reviewed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert variant="default" className="bg-yellow-50 border-yellow-400 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <AlertTitle className="font-semibold">Important Disclaimer</AlertTitle>
            <AlertDescription>
              AI-driven ethnicity and ethical assessments are complex and have limitations. 
              This tool is for informational purposes only and may produce inaccurate or biased results. 
              Always use human judgment and cultural sensitivity for final decisions.
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
              'Analyze Content for Ethical Representation'
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
                  <ShieldCheck className="mr-2 h-6 w-6 text-primary" />
                  AI Analysis Report
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
                  <h4 className="font-semibold text-md mb-1">Representation Summary:</h4>
                  <p className="bg-muted/30 p-3 rounded-md">{analysisReport.representation_summary || "Not specified."}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-md mb-1">Ethical Assessment:</h4>
                  <p className={`p-3 rounded-md ${
                    analysisReport.ethical_assessment?.toLowerCase().includes("concern") ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300" :
                    analysisReport.ethical_assessment?.toLowerCase().includes("respectful") ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" :
                    "bg-muted/30"
                  }`}>
                    {analysisReport.ethical_assessment || "Not specified."}
                    {analysisReport.ethical_assessment?.toLowerCase().includes("concern") && <XCircle className="inline ml-2 h-4 w-4"/>}
                    {analysisReport.ethical_assessment?.toLowerCase().includes("respectful") && <CheckCircle className="inline ml-2 h-4 w-4"/>}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-md mb-1">Specific Concerns Raised:</h4>
                  {analysisReport.concerns_raised && analysisReport.concerns_raised.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1 bg-muted/30 p-3 rounded-md">
                      {analysisReport.concerns_raised.map((concern, index) => (
                        <li key={index}>{concern}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="bg-muted/30 p-3 rounded-md">No specific concerns raised by the AI.</p>
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
                <p>Select input type, upload content, and click "Analyze" to view the AI's assessment.</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
            <p className="text-xs text-muted-foreground w-full text-center">
                This tool uses AI and is for informational purposes. Assessments may not be fully accurate or unbiased.
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
