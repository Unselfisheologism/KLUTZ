
'use client';

import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ImageUp, Type, CheckCircle, XCircle, HelpCircle, Info, Download } from 'lucide-react';
import { preprocessImage } from '@/lib/image-utils';
import { downloadTextFile } from '@/lib/utils';
import type { ThumbnailAnalysisResponse, TitleAnalysisResponse, ConsistencyReport } from '@/types/thumbnail-checker';
import ImagePreview from '@/components/medi-scan/image-preview';

const cleanJsonString = (rawString: string): string => {
  let cleanedString = rawString.trim();
  if (cleanedString.startsWith("```json") && cleanedString.endsWith("```")) {
    cleanedString = cleanedString.substring(7, cleanedString.length - 3).trim();
  } else if (cleanedString.startsWith("```") && cleanedString.endsWith("```")) {
    cleanedString = cleanedString.substring(3, cleanedString.length - 3).trim();
  }
  return cleanedString;
};

export default function ThumbnailCheckerPage() {
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailDataUrl, setThumbnailDataUrl] = useState<string | null>(null);
  const [titleText, setTitleText] = useState<string>('');
  const [titleFile, setTitleFile] = useState<File | null>(null);

  const [thumbnailAnalysis, setThumbnailAnalysis] = useState<ThumbnailAnalysisResponse | null>(null);
  const [titleAnalysis, setTitleAnalysis] = useState<TitleAnalysisResponse | null>(null);
  const [consistencyReport, setConsistencyReport] = useState<ConsistencyReport | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState('');

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

  const handleThumbnailChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      try {
        const previewDataUrl = URL.createObjectURL(file);
        setThumbnailDataUrl(previewDataUrl);
        setThumbnailAnalysis(null); 
        setConsistencyReport(null);
      } catch (error) {
        toast({ variant: "destructive", title: "Preview Error", description: "Could not generate image preview." });
        setThumbnailDataUrl(null);
      }
    } else {
      setThumbnailFile(null);
      setThumbnailDataUrl(null);
    }
  };

  const handleTitleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTitleText(event.target.value);
    setTitleAnalysis(null); 
    setConsistencyReport(null);
  };
  
  const handleTitleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'text/plain') {
        setTitleFile(file);
        setTitleText(''); 
        try {
          const textContent = await file.text();
          setTitleText(textContent); 
          setTitleAnalysis(null);
          setConsistencyReport(null);
        } catch (error) {
          toast({ variant: "destructive", title: "File Read Error", description: "Could not read the text file." });
        }
      } else {
        toast({ variant: "destructive", title: "Invalid File Type", description: "Please upload a .txt file for the title." });
        event.target.value = ''; 
      }
    } else {
      setTitleFile(null);
    }
  };

  const analyzeContent = async () => {
    if (!thumbnailFile && !thumbnailDataUrl) {
      toast({ variant: "destructive", title: "Missing Input", description: "Please upload a thumbnail image." });
      return;
    }
    if (!titleText.trim()) {
      toast({ variant: "destructive", title: "Missing Input", description: "Please enter or upload title text." });
      return;
    }

    setIsLoading(true);
    setThumbnailAnalysis(null);
    setTitleAnalysis(null);
    setConsistencyReport(null);

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

      setCurrentStep('Analyzing Thumbnail...');
      toast({ title: currentStep });
      const processedThumbnailUrl = thumbnailFile ? await preprocessImage(thumbnailFile, 512) : thumbnailDataUrl;
      if (!processedThumbnailUrl) throw new Error("Failed to process thumbnail image.");

      const imagePrompt = `Describe the key visual elements, objects, and the overall theme or message conveyed by this thumbnail image. Respond with a concise JSON object: {"image_summary": "Your description here"}`;
      const imageResponse = await puter.ai.chat(imagePrompt, processedThumbnailUrl);
      if (!imageResponse?.message?.content) throw new Error("Invalid response from thumbnail analysis.");
      const parsedImageResponse: { image_summary: string } = JSON.parse(cleanJsonString(imageResponse.message.content));
      setThumbnailAnalysis({ summary: parsedImageResponse.image_summary });

      setCurrentStep('Analyzing Title Text...');
      toast({ title: currentStep });
      const titlePrompt = `Analyze the following video title text and summarize its main topic or message. Title: "${titleText}". Respond with a concise JSON object: {"title_summary": "Your summary here"}`;
      const titleResponse = await puter.ai.chat(titlePrompt, { model: 'gpt-4o' });
      if (!titleResponse?.message?.content) throw new Error("Invalid response from title analysis.");
      const parsedTitleResponse: { title_summary: string } = JSON.parse(cleanJsonString(titleResponse.message.content));
      setTitleAnalysis({ summary: parsedTitleResponse.title_summary });

      setCurrentStep('Checking Consistency...');
      toast({ title: currentStep });
      const consistencyPrompt = `
        You are an AI assistant. You are given a summary of a video thumbnail image and a summary of its title.
        Image Summary: "${parsedImageResponse.image_summary}"
        Title Summary: "${parsedTitleResponse.title_summary}"
        Based on these summaries, determine if the thumbnail and title convey the same core message or concept.
        Provide your analysis in a JSON object with the following keys:
        - "is_consistent": (boolean) true if they are consistent, false otherwise.
        - "explanation": (string) A brief explanation for your conclusion (2-3 sentences).
        - "confidence_score": (number, 0.0 to 1.0) Your confidence in this assessment.
      `;
      const consistencyResponse = await puter.ai.chat(consistencyPrompt, { model: 'gpt-4o' });
      if (!consistencyResponse?.message?.content) throw new Error("Invalid response from consistency analysis.");
      const parsedConsistencyResponse: ConsistencyReport = JSON.parse(cleanJsonString(consistencyResponse.message.content));
      setConsistencyReport(parsedConsistencyResponse);
      
      toast({ title: "Analysis Complete!", variant: "default", className: "bg-green-500 text-white dark:bg-green-600" });

    } catch (error: any) {
      console.error("Analysis error:", error);
      let errorMessage = "An error occurred during analysis.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: errorMessage,
      });
      setConsistencyReport({ is_consistent: false, explanation: `Error: ${errorMessage}`, confidence_score: 0 });
    } finally {
      setIsLoading(false);
      setCurrentStep('');
    }
  };

  const handleDownloadReport = () => {
    if (!thumbnailAnalysis && !titleAnalysis && !consistencyReport) return;

    let reportString = "KLUTZ Thumbnail & Title Consistency Report\n";
    reportString += "=========================================\n\n";

    reportString += "User Inputs:\n";
    reportString += "------------\n";
    reportString += `Title Text: ${titleText || "N/A"}\n`;
    reportString += `Thumbnail File: ${thumbnailFile?.name || "Pasted/Not available"}\n\n`;

    if (thumbnailAnalysis) {
      reportString += "Thumbnail Image Analysis:\n";
      reportString += "-------------------------\n";
      reportString += `Summary: ${thumbnailAnalysis.summary || "N/A"}\n\n`;
    }

    if (titleAnalysis) {
      reportString += "Title Text Analysis:\n";
      reportString += "--------------------\n";
      reportString += `Summary: ${titleAnalysis.summary || "N/A"}\n\n`;
    }

    if (consistencyReport) {
      reportString += "Consistency Assessment:\n";
      reportString += "-----------------------\n";
      reportString += `Consistent: ${consistencyReport.is_consistent ? 'Yes' : 'No'}\n`;
      reportString += `Explanation: ${consistencyReport.explanation || "N/A"}\n`;
      reportString += `AI Confidence: ${(consistencyReport.confidence_score * 100).toFixed(0)}%\n\n`;
    }
    
    reportString += "\nDisclaimer: This report is AI-generated and for informational purposes only. Human review is recommended.";


    const timestamp = new Date().toISOString().replace(/[:.-]/g, '').slice(0, 14);
    downloadTextFile(reportString, `KLUTZ_ThumbnailChecker_Analysis_${timestamp}.txt`);
  };


  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="max-w-3xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary">Thumbnail & Title Consistency Checker</CardTitle>
          <CardDescription>Upload a thumbnail and provide a title to check if they align.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="thumbnail-upload" className="text-lg font-medium flex items-center mb-2">
              <ImageUp className="mr-2 h-5 w-5 text-accent" />
              Thumbnail Image
            </Label>
            <Input
              id="thumbnail-upload"
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleThumbnailChange}
              className="file:text-primary file:font-semibold file:bg-primary/10 hover:file:bg-primary/20"
              disabled={isLoading}
            />
            {thumbnailDataUrl && (
              <div className="mt-4">
                <ImagePreview imageDataUrl={thumbnailDataUrl} dataAiHint="video thumbnail"/>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="title-text" className="text-lg font-medium flex items-center mb-2">
              <Type className="mr-2 h-5 w-5 text-accent" />
              Video Title
            </Label>
            <Textarea
              id="title-text"
              placeholder="Enter your video title here..."
              value={titleText}
              onChange={handleTitleTextChange}
              rows={3}
              className="mb-2"
              disabled={isLoading}
            />
            <span className="text-sm text-muted-foreground mr-2">Or upload a .txt file:</span>
            <Input
              id="title-file-upload"
              type="file"
              accept=".txt"
              onChange={handleTitleFileChange}
              className="file:text-primary file:font-semibold file:bg-primary/10 hover:file:bg-primary/20 inline-block w-auto text-sm"
              disabled={isLoading}
            />
          </div>

          <Button onClick={analyzeContent} disabled={isLoading || !thumbnailDataUrl || !titleText.trim()} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {currentStep || 'Analyzing...'}
              </>
            ) : (
              'Check Consistency'
            )}
          </Button>

          {thumbnailAnalysis && (
            <Card className="bg-muted/30">
              <CardHeader><CardTitle className="text-md font-semibold">Image Analysis Summary:</CardTitle></CardHeader>
              <CardContent><p className="text-sm">{thumbnailAnalysis.summary}</p></CardContent>
            </Card>
          )}
          {titleAnalysis && (
            <Card className="bg-muted/30">
              <CardHeader><CardTitle className="text-md font-semibold">Title Analysis Summary:</CardTitle></CardHeader>
              <CardContent><p className="text-sm">{titleAnalysis.summary}</p></CardContent>
            </Card>
          )}

          {consistencyReport && !isLoading && (
            <Card className={`mt-6 ${consistencyReport.is_consistent ? 'border-green-500' : 'border-red-500'}`}>
              <CardHeader>
                <CardTitle className="flex items-center font-headline text-xl">
                  {consistencyReport.is_consistent ? (
                    <CheckCircle className="mr-2 h-6 w-6 text-green-500" />
                  ) : (
                    <XCircle className="mr-2 h-6 w-6 text-red-500" />
                  )}
                  Consistency Report
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className={`text-lg font-semibold ${consistencyReport.is_consistent ? 'text-green-600' : 'text-red-600'}`}>
                  {consistencyReport.is_consistent ? 'Consistent' : 'Not Consistent'}
                </p>
                <p><strong className="font-medium">Explanation:</strong> {consistencyReport.explanation}</p>
                <p><strong className="font-medium">Confidence:</strong> {(consistencyReport.confidence_score * 100).toFixed(0)}%</p>
                <Button onClick={handleDownloadReport} variant="outline" className="w-full mt-2">
                  <Download className="mr-2 h-4 w-4" />
                  Download Full Analysis
                </Button>
              </CardContent>
            </Card>
          )}
          {!consistencyReport && !isLoading && !thumbnailAnalysis && !titleAnalysis && (
             <div className="mt-6 p-4 border border-dashed rounded-md text-center text-muted-foreground">
                <Info className="mx-auto h-8 w-8 mb-2"/>
                <p>Upload a thumbnail and enter a title, then click "Check Consistency" to see the AI's analysis.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
