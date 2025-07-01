"use client";

import { useState, useEffect } from "react";
import Head from 'next/head';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Loader2, AlertTriangle } from 'lucide-react';
import { MedicalImageAnalysisRequest, MedicalImageAnalysisResponse, MedicalImageType } from "@/types/mediscan";
import puter from "puter";
import { useToast } from "@/hooks/use-toast";
import { preprocessImage } from "@/lib/image-utils";
import ImagePreview from "@/components/medi-scan/image-preview";
import { Copy, Download } from 'lucide-react';

declare global {
  interface Window { puter: any; }
}

const cleanJsonString = (rawString: string): string => {
  let cleanedString = rawString.trim();
  if (cleanedString.startsWith("```json") && cleanedString.endsWith("```")) {
    cleanedString = cleanedString.substring(7, cleanedString.length - 3).trim();
  } else if (cleanedString.startsWith("```") && cleanedString.endsWith("```")) {
    cleanedString = cleanedString.substring(3, cleanedString.length - 3).trim();
  }
  return cleanedString;
};

const downloadTextFile = (text: string, filename: string) => {
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  window.puter.fs.download(url, filename);
};

export default function MedicalImageAnalyzerPage() {

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageType, setImageType] = useState<MedicalImageType | "">("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [analysisResult, setAnalysisResult] = useState<MedicalImageAnalysisResponse | null>(null);
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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      try {
        const previewDataUrl = URL.createObjectURL(file);
        setImageDataUrl(previewDataUrl);
        setAnalysisResult(null);
        setError(null);
      } catch (error) {
        toast({ variant: "destructive", title: "Preview Error", description: "Could not generate image preview." });
        setImageDataUrl(null);
      }
    } else {
      setImageFile(null);
      setImageDataUrl(null);
    }
  };

  const handleAnalyze = async () => {
    if (!imageFile) {
      toast({ variant: "destructive", title: "Missing Input", description: "Please upload an image containing text." });
      return;
    }

    setIsLoading(true);
    setAnalysisResult(null);
    setError(null);
    toast({ title: "Analysis Started", description: "AI is Analyzing The Medical Image..." });

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

      const imagePrompt = `
        You are an AI assistant specialized in analyzing medical images.
        Analyze the provided ${imageType} medical image and generate a structured report.
        Include: 
        1. Identified abnormalities (if any). If none, state clearly.
        2. A potential diagnosis based on the findings (clearly state this is NOT a substitute for professional medical advice)
        3. Suggested next steps or recommendations (again, non-diagnostic)
        Consider the additional information: ${additionalInfo || 'None provided.'}

        Return the analysis as a JSON object with the following keys:
        - "abnormalities": (string) Description of any abnormalities found.
        - "diagnosis": (string) Potential diagnosis (clearly marked as NOT professional medical advice).
        - "nextSteps": (string) Suggested next steps (clearly marked as non-diagnostic).
      `;

      const response = await puter.ai.chat(imagePrompt, preprocessedDataUrl);
      
      if (!response?.message?.content) {
        throw new Error("AI analysis did not return content.");
      }

      const parsedResponse: MedicalImageAnalysisResponse = JSON.parse(cleanJsonString(response.message.content));
      setAnalysisResult(parsedResponse);
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

  const handleCopyReport = () => {
    if (!analysisResult) return;
    const reportString = `
Medical Image Analysis Report
===========================

Abnormalities Found:
-------------------
${analysisResult.abnormalities}

Potential Diagnosis:
------------------
${analysisResult.diagnosis}

Suggested Next Steps:
-------------------
${analysisResult.nextSteps}

Disclaimer: This is an AI-generated analysis and NOT a substitute for professional medical advice. Always consult a healthcare professional for diagnosis and treatment.
`;
    navigator.clipboard.writeText(reportString.trim())
      .then(() => {
        toast({ title: "Report Copied", description: "Analysis report copied to clipboard." });
      })
      .catch(() => {
        toast({ variant: "destructive", title: "Copy Failed", description: "Could not copy report to clipboard." });
      });
  };

  const handleDownloadReport = () => {
    if (!analysisResult) return;
    const reportString = `Medical Image Analysis Report\n\nAbnormalities Found:\n${analysisResult.abnormalities}\n\nPotential Diagnosis:\n${analysisResult.diagnosis}\n\nSuggested Next Steps:\n${analysisResult.nextSteps}\n\nDisclaimer: This is an AI-generated analysis and NOT a substitute for professional medical advice. Always consult a healthcare professional for diagnosis and treatment.`;
    const timestamp = new Date().toISOString().replace(/[:.-]/g, '').slice(0, 14);
    downloadTextFile(reportString, `KLUTZ_MediScan_Report_${timestamp}.txt`);
    toast({ title: "Report Downloaded", description: "Analysis report downloaded as a text file." });
  };

  const disclaimer = "Disclaimer: This is an AI-generated analysis and NOT a substitute for professional medical advice. Always consult a healthcare professional for diagnosis and treatment.";




  return (
    <>
      <Head>
        <link rel="canonical" href="https://klutz.netlify.app/mediscan" />
        <title>Medical Image Analyzer - KLUTZ</title>
        <meta name="description" content="Upload medical images (X-rays, MRIs, CT scans) for AI-powered analysis and insights with KLUTZ Medical Scan." />
      </Head>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <div className="space-y-4">
              <Card className="border-green-500 dark:border-green-700 bg-green-50 dark:bg-green-900/20">
                <CardHeader>
                  <CardTitle className="text-green-700 dark:text-green-300">Abnormalities Found</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-green-800 dark:text-green-200">{analysisResult.abnormalities}</p>
                </CardContent>
              </Card>

              <Card className="border-blue-500 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20">
                <CardHeader>
                  <CardTitle className="text-blue-700 dark:text-blue-300">Potential Diagnosis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-blue-800 dark:text-blue-200">{analysisResult.diagnosis}</p>
                </CardContent>
              </Card>

              <Card className="border-purple-500 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20">
                <CardHeader>
                  <CardTitle className="text-purple-700 dark:text-purple-300">Suggested Next Steps</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-purple-800 dark:text-purple-200">{analysisResult.nextSteps}</p>
                </CardContent>
              </Card>

              <Card className="border-yellow-500 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20">
                 <CardHeader>
                  <CardTitle className="text-yellow-700 dark:text-yellow-300">Disclaimer</CardTitle>
                 </CardHeader>
                 <CardContent>
                  <p className="text-yellow-800 dark:text-yellow-200 text-sm italic">{disclaimer}</p>
                 </CardContent>
              </Card>

              <Card className="p-4 flex gap-4 bg-muted/30">
                 <Button onClick={handleCopyReport} className="flex-1">
                  <Copy className="mr-2 h-4 w-4" /> Copy Report
                 </Button>
                 <Button onClick={handleDownloadReport} className="flex-1">
                  <Download className="mr-2 h-4 w-4" /> Download Report
                 </Button>
              </Card>
            </div>
          )}

          {error && !isLoading && (
            <Alert variant="destructive" className="mt-6">
              <AlertTriangle className="h-5 w-5" />
              <AlertTitle>Analysis Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
        <div className="mt-16">
          <h2 className="text-3xl font-bold mb-6">The Complete Guide to MediScan: Revolutionizing Medical Image Analysis</h2>

          <p className="mb-4">In the rapidly evolving landscape of healthcare technology, tools that enhance diagnostic capabilities and streamline workflows are invaluable. MediScan is at the forefront of this revolution, offering a powerful AI-driven platform designed to assist medical professionals in analyzing medical images with unprecedented speed and accuracy.</p>

          <h3 className="text-2xl font-semibold mb-4">What is MediScan?</h3>

          <p className="mb-4">MediScan is an advanced medical image analysis tool that utilizes artificial intelligence to interpret medical scans, such as X-rays, CT scans, and MRIs. By processing these images through sophisticated algorithms, MediScan can help identify potential anomalies, generate detailed reports, and suggest next steps for diagnosis and treatment. It acts as an intelligent assistant, augmenting the expertise of healthcare providers.</p>

          <h3 className="text-2xl font-semibold mb-4">How MediScan Works</h3>

          <p className="mb-4">The core of MediScan lies in its AI engine, trained on vast datasets of medical images. When a medical image is uploaded, the AI analyzes it, looking for patterns and indicators of various conditions. The process involves:</p>

          <ul className="list-disc list-inside mb-4">
            <li><strong>Image Processing:</strong> Enhancing image quality and preparing it for analysis.</li>
            <li><strong>Feature Extraction:</strong> Identifying key visual features within the image.</li>
            <li><strong>Pattern Recognition:</strong> Comparing identified features against learned patterns of medical conditions.</li>
            <li><strong>Report Generation:</strong> Compiling findings into a structured medical report.</li>
            <li><strong>Suggestion of Next Steps:</strong> Proposing potential follow-up actions based on the analysis.</li>
          </ul>

          <h3 className="text-2xl font-semibold mb-4">Key Features and Benefits</h3>

          <ul className="list-disc list-inside mb-4">
            <li><strong>Enhanced Accuracy:</strong> AI analysis can identify subtle details that might be missed by the human eye.</li>
            <li><strong>Increased Efficiency:</strong> Rapid processing of images saves valuable time for medical professionals.</li>
            <li><strong>Detailed Reporting:</strong> Automatically generated reports provide comprehensive summaries of findings.</li>
            <li><strong>Consistent Analysis:</strong> AI applies consistent criteria, reducing variability in interpretations.</li>
            <li><strong>Assistive Tool:</strong> MediScan is designed to support, not replace, the expertise of medical practitioners.</li>
            <li><strong>Accessibility:</strong> Cloud-based platforms can make advanced analysis more accessible.</li>
          </ul>

          <h3 className="text-2xl font-semibold mb-4">Applications of MediScan</h3>

          <p className="mb-4">MediScan has a wide range of applications across various medical specialties:</p>

          <ul className="list-disc list-inside mb-4">
            <li><strong>Radiology:</strong> Assisting in the detection of fractures, tumors, and other abnormalities in X-rays, CTs, and MRIs.</li>
            <li><strong>Dermatology:</strong> Analyzing skin images for potential signs of melanoma and other skin conditions.</li>
            <li><strong>Pathology:</strong> Assisting in the analysis of tissue samples.</li>
            <li><strong>Cardiology:</strong> Identifying issues in cardiac imaging.</li>
            <li><strong>Preventative Medicine:</strong> Aiding in early detection of diseases.</li>
          </ul>

          <h3 className="text-2xl font-semibold mb-4">Limitations and Ethical Considerations</h3>

          <p className="mb-4">While powerful, it's crucial to acknowledge the limitations of AI in healthcare. MediScan is a tool to aid diagnosis, and the final medical interpretation and decision-making always rest with qualified healthcare professionals. Ethical considerations, such as data privacy, algorithmic bias, and the responsible use of AI in clinical settings, are paramount and continuously addressed in the development and deployment of such tools.</p>

          <h3 className="text-2xl font-semibold mb-4">The Future of Medical Image Analysis with AI</h3>

          <p className="mb-4">The field of AI in medical image analysis is rapidly advancing. Future iterations of tools like MediScan are expected to offer even greater precision, integrate with electronic health records more seamlessly, and potentially contribute to personalized medicine by identifying subtle markers linked to individual patient characteristics.</p>

          <h3 className="text-2xl font-semibold mb-4">Conclusion</h3>

          <p className="mb-4">MediScan represents a significant step forward in leveraging artificial intelligence to enhance medical image analysis. By providing rapid, detailed, and consistent interpretations, it empowers healthcare professionals to make more informed decisions, potentially leading to earlier diagnoses and improved patient outcomes. As the technology continues to evolve, tools like MediScan will play an increasingly vital role in the future of healthcare.</p>

          <h3 className="text-2xl font-semibold mb-4">TLDR: Quick Summary</h3>

          <p className="mb-4">MediScan is an AI tool that analyzes medical images to help detect anomalies, generate reports, and suggest next steps. It enhances accuracy and efficiency for medical professionals but does not replace their judgment. It has various applications in radiology, dermatology, and more. While powerful, it's important to consider its limitations and ethical implications. AI in medical imaging is a growing field with the potential for significant future impact.</p>

        </div>
      </div>
    </>
  );
}