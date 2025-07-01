"use client";

import { useState, useEffect } from "react";
import Head from 'next/head';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Loader2, AlertTriangle } from 'lucide-react';
import { MedicalImageAnalysisRequest, MedicalImageAnalysisResponse, MedicalImageType } from "@/types/mediscan";
import puter from "puter";
import { useToast } from "@/hooks/use-toast";
import { preprocessImage } from "@/lib/image-utils";
import ImagePreview from "@/components/medi-scan/image-preview";

const cleanJsonString = (rawString: string): string => {
  let cleanedString = rawString.trim();
  // Remove leading and trailing markdown code block fences if they exist
  if (cleanedString.startsWith("json") && cleanedString.endsWith("")) {
    cleanedString = cleanedString.substring(7, cleanedString.length - 3).trim();
  } else if (cleanedString.startsWith("") && cleanedString.endsWith("")) {
    cleanedString = cleanedString.substring(3, cleanedString.length - 3).trim();
  }
  return cleanedString;
};

export default function MedicalImageAnalyzerPage() {

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageType, setImageType] = useState<MedicalImageType | "">("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setImageFile(event.target.files?.[0] || null);
    const file = event.target.files?.[0];
    if (file) {
      const previewDataUrl = URL.createObjectURL(file);
      setImageDataUrl(previewDataUrl);
    } else {
      setImageDataUrl(null);
    }
    // Clear previous results and errors when a new image is uploaded
  };

  const [analysisResult, setAnalysisResult] = useState<MedicalImageAnalysisResponse | null>(null);
  useEffect(() => {
    // Optional: Add logic here that depends on analysisResult changing
  }, [analysisResult]); // Add analysisResult as a dependency if needed
  useEffect(() => {
    if (typeof window.puter === 'undefined') {
      toast({
        variant: "destructive",
        title: "Puter SDK Error",
        description: "Puter.js SDK is not loaded. Please refresh the page.",
      });
    }
  }, [toast]);
  const handleAnalyze = async () => {
    if (!imageFile || !imageType) {
      toast({ variant: "destructive", title: "Missing Input", description: "Please upload a medical image and select the image type." });
      return;
    }

    setIsLoading(true);
    setAnalysisResult(null); // Clear previous results
    const request: MedicalImageAnalysisRequest = {
      imageType: imageType as MedicalImageType,
      additionalInfo,
 image: '' // Will be replaced by preprocessed image data URL
    };

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

      const preprocessedDataUrl = await preprocessImage(imageFile, 1024);
      request.image = preprocessedDataUrl;

      const response = await puter.ai.chat("generateMedicalReport", { request });
      if (!response) {
        throw new Error("AI analysis did not return a response.");
      }
      // Assuming the response content is directly the analysis result string
      // You might need to parse this if the AI returns structured data
      setAnalysisResult({ abnormalities: response.message.content || 'N/A', diagnosis: 'N/A', nextSteps: 'N/A' }); // Placeholder parsing

      toast({ title: "Analysis Complete", variant: "default", className: "bg-green-500 text-white dark:bg-green-600" });
    } catch (error) {
      console.error("Error analyzing image:", error);
      let errorMessage = "An error occurred during analysis.";
      if (error instanceof Error) errorMessage = error.message;
      else if (typeof error === 'string') errorMessage = error;
      else if ((error as any).error && (error as any).error.message) errorMessage = (error as any).error.message;
      setError(errorMessage);
      toast({ variant: "destructive", title: "Analysis Failed", description: errorMessage });
      // Handle error displaying to the user
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <link rel="canonical" href="https://klutz.netlify.app/mediscan" />
        <title>Medical Image Analyzer - KLUTZ</title>
        <meta name="description" content="Upload medical images (X-rays, MRIs, CT scans) for AI-powered analysis and insights with KLUTZ Medical Scan." />
      </Head>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Medical Image Analyzer</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Upload Medical Image</CardTitle>
              </CardHeader>
              <CardContent>
                <Label htmlFor="medical-image">Upload Image</Label>
                <Input id="medical-image" type="file" accept="image/*" onChange={handleImageUpload} />
                {imageDataUrl && <ImagePreview imageDataUrl={imageDataUrl} dataAiHint="medical image" />}
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Image Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Label htmlFor="image-type">Image Type</Label>
                  <Select onValueChange={(value: MedicalImageType) => setImageType(value)} value={imageType}>
                    <SelectTrigger id="image-type">
                      <SelectValue placeholder="Select image type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="x-ray">X-Ray</SelectItem>
                      <SelectItem value="mri">MRI</SelectItem>
                      <SelectItem value="ct scan">CT Scan</SelectItem>
                      <SelectItem value="ultrasound">Ultrasound</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="additional-info">Additional Information (Optional)</Label>
                  <Textarea id="additional-info" value={additionalInfo} onChange={(e) => setAdditionalInfo(e.target.value)} rows={4} />
                </div>
                <Button onClick={handleAnalyze} disabled={!imageFile || !imageType || isLoading} className="mt-4 w-full">
                  {isLoading ? "Analyzing..." : "Analyze Image"}
                  {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                </Button>
                {!analysisResult && !isLoading && !error && (
                  <div className="mt-6 p-4 border border-dashed rounded-md text-center text-muted-foreground">
                    <Info className="mx-auto h-8 w-8 mb-2" />
                    <p>Upload a medical image, select its type, and click "Analyze Image" to get an AI-powered analysis.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {analysisResult && (
            <>
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle>Abnormalities Found</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{analysisResult.abnormalities}</p>
                </CardContent>
              </Card>

              <Card className="mb-4">
                <CardHeader>
                  <CardTitle>Diagnosis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{analysisResult.diagnosis}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Next Steps</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{analysisResult.nextSteps}</p>
                </CardContent>
              </Card>
            </>
          )}

          {error && !isLoading && (
            <Alert variant="destructive" className="mt-6">
              <AlertTriangle className="h-5 w-5" />
              <AlertTitle>Analysis Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </>
  );
}