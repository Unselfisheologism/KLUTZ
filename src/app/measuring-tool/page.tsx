'use client';

import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ImageUp, Ruler, AlertTriangle, Info, Download } from 'lucide-react';
import { preprocessImage } from '@/lib/image-utils';
import { downloadTextFile } from '@/lib/utils';
import ImagePreview from '@/components/medi-scan/image-preview';
import type { MeasurementReport } from '@/types/measuring-tool';

const cleanJsonString = (rawString: string): string => {
  let cleanedString = rawString.trim();
  if (cleanedString.startsWith("```json") && cleanedString.endsWith("```")) {
    cleanedString = cleanedString.substring(7, cleanedString.length - 3).trim();
  } else if (cleanedString.startsWith("```") && cleanedString.endsWith("```")) {
    cleanedString = cleanedString.substring(3, cleanedString.length - 3).trim();
  }
  return cleanedString;
};

export default function MeasuringToolPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [metricSystem, setMetricSystem] = useState<string>('');
  const [measurementTarget, setMeasurementTarget] = useState<string>('');
  const [additionalContext, setAdditionalContext] = useState<string>('');
  
  const [analysisReport, setAnalysisReport] = useState<MeasurementReport | null>(null);
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
      } catch (error) {
        toast({ variant: "destructive", title: "Preview Error", description: "Could not generate image preview." });
        setImageDataUrl(null);
      }
    } else {
      setImageFile(null);
      setImageDataUrl(null);
    }
  };

  const performAnalysis = async () => {
    if (!imageFile) {
      toast({ variant: "destructive", title: "Missing Input", description: "Please upload an image of the object to measure." });
      return;
    }
    if (!measurementTarget.trim()) {
      toast({ variant: "destructive", title: "Missing Input", description: "Please specify what you want to measure." });
      return;
    }
    if (!metricSystem) {
      toast({ variant: "destructive", title: "Missing Input", description: "Please select a measurement system." });
      return;
    }

    setIsLoading(true);
    setAnalysisReport(null);
    setError(null);
    toast({ title: "Analysis Started", description: "AI is analyzing your measurement request..." });

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
        You are an AI assistant specialized in analyzing images to estimate measurements.
        Analyze this image and provide measurements for: "${measurementTarget}"
        Preferred measurement system: ${metricSystem}
        Additional context: "${additionalContext || 'None provided'}"

        Consider:
        1. Use visible reference objects or markers if present
        2. Look for standard-sized objects that could help with scale
        3. Consider perspective and depth
        4. Note any limitations in accuracy
        
        Return a JSON object with:
        {
          "image_description": "Brief description of the image and object to be measured",
          "measurements": [
            {
              "target": "What was measured",
              "value": number,
              "unit": "unit of measurement",
              "confidence": number (0-1)
            }
          ],
          "visual_reference_points": ["List of objects used as reference points"],
          "confidence": "High|Medium|Low|Not Applicable",
          "limitations": ["List of factors affecting measurement accuracy"],
          "disclaimer": "Standard measurement accuracy disclaimer"
        }
      `;

      const response = await puter.ai.chat(imagePrompt, preprocessedDataUrl);
      
      if (!response?.message?.content) {
        throw new Error("AI analysis did not return content.");
      }

      const parsedResponse: MeasurementReport = JSON.parse(cleanJsonString(response.message.content));
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

    let reportString = "KLUTZ AI Measuring Tool Report\n";
    reportString += "==============================\n\n";

    reportString += "Measurement Request:\n";
    reportString += "-------------------\n";
    reportString += `Target to Measure: ${measurementTarget}\n`;
    reportString += `Measurement System: ${metricSystem}\n`;
    if (additionalContext) {
      reportString += `Additional Context: ${additionalContext}\n`;
    }
    reportString += "\n";

    reportString += "Image Analysis:\n";
    reportString += "--------------\n";
    reportString += `${analysisReport.image_description}\n\n`;

    reportString += "Measurements:\n";
    reportString += "-------------\n";
    analysisReport.measurements.forEach(measurement => {
      reportString += `- ${measurement.target}: ${measurement.value} ${measurement.unit}\n`;
      reportString += `  Confidence: ${(measurement.confidence * 100).toFixed(1)}%\n`;
    });
    reportString += "\n";

    reportString += "Reference Points Used:\n";
    reportString += "--------------------\n";
    analysisReport.visual_reference_points.forEach(point => {
      reportString += `- ${point}\n`;
    });
    reportString += "\n";

    reportString += "Limitations:\n";
    reportString += "------------\n";
    analysisReport.limitations.forEach(limitation => {
      reportString += `- ${limitation}\n`;
    });
    reportString += "\n";

    reportString += "AI Confidence Level: " + analysisReport.confidence + "\n\n";
    reportString += "Disclaimer:\n";
    reportString += "-----------\n";
    reportString += analysisReport.disclaimer + "\n\n";
    
    reportString += "\nIMPORTANT: This report is AI-generated and for informational purposes only. Measurements are estimates and should be verified with proper measuring tools when accuracy is critical.";

    const timestamp = new Date().toISOString().replace(/[:.-]/g, '').slice(0, 14);
    downloadTextFile(reportString, `KLUTZ_MeasuringTool_Report_${timestamp}.txt`);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="max-w-3xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary flex items-center">
            <Ruler className="mr-3 h-8 w-8" />
            AI Measuring Tool
          </CardTitle>
          <CardDescription>
            Upload an image of a physical object and get AI-powered measurements in your preferred metric system.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert variant="default" className="bg-yellow-50 border-yellow-400 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <AlertTitle className="font-semibold">Important Note</AlertTitle>
            <AlertDescription>
              Measurements are estimates based on visual analysis. For precise measurements, always use proper measuring tools.
              The accuracy depends on image quality and available reference points.
            </AlertDescription>
          </Alert>

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
            <p className="text-sm text-muted-foreground mt-1">Upload a clear image of the object you want to measure.</p>
          </div>

          {imageDataUrl && <ImagePreview imageDataUrl={imageDataUrl} dataAiHint="object to measure"/>}

          <div className="space-y-4">
            <div>
              <Label htmlFor="metric-system" className="text-lg font-medium">Measurement System</Label>
              <Select value={metricSystem} onValueChange={setMetricSystem}>
                <SelectTrigger id="metric-system" className="w-full">
                  <SelectValue placeholder="Select measurement system" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="metric">Metric (cm, m, etc.)</SelectItem>
                  <SelectItem value="imperial">Imperial (inches, feet, etc.)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="measurement-target" className="text-lg font-medium">What to Measure</Label>
              <Textarea
                id="measurement-target"
                placeholder="Describe what you want to measure in the image (e.g., 'height of the table', 'width of the door')..."
                value={measurementTarget}
                onChange={(e) => setMeasurementTarget(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div>
              <Label htmlFor="additional-context" className="text-lg font-medium">Additional Context (Optional)</Label>
              <Textarea
                id="additional-context"
                placeholder="Any additional details that might help with measurement (e.g., known dimensions of visible objects)..."
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
              />
            </div>
          </div>

          <Button 
            onClick={performAnalysis} 
            disabled={isLoading || !imageFile || !metricSystem || !measurementTarget.trim()} 
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Measurements...
              </>
            ) : (
              'Analyze Measurements'
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
                  <Ruler className="mr-2 h-6 w-6 text-primary" />
                  Measurement Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-md mb-1">Image Analysis:</h4>
                  <p className="bg-muted/30 p-3 rounded-md">{analysisReport.image_description}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-md mb-1">Measurements:</h4>
                  <div className="space-y-2">
                    {analysisReport.measurements.map((measurement, index) => (
                      <div key={index} className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                        <p className="font-medium text-green-700 dark:text-green-300">
                          {measurement.target}: {measurement.value} {measurement.unit}
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-400">
                          Confidence: {(measurement.confidence * 100).toFixed(1)}%
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-md mb-1">Reference Points Used:</h4>
                  <ul className="list-disc pl-5 space-y-1 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                    {analysisReport.visual_reference_points.map((point, index) => (
                      <li key={index} className="text-blue-700 dark:text-blue-300">{point}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-md mb-1">Limitations:</h4>
                  <ul className="list-disc pl-5 space-y-1 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md">
                    {analysisReport.limitations.map((limitation, index) => (
                      <li key={index} className="text-yellow-700 dark:text-yellow-300">{limitation}</li>
                    ))}
                  </ul>
                </div>

                <Alert variant="default" className="text-xs bg-blue-50 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300">
                  <Info className="h-4 w-4 text-blue-500" />
                  <AlertTitle className="font-medium">Disclaimer</AlertTitle>
                  <AlertDescription>{analysisReport.disclaimer}</AlertDescription>
                </Alert>

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
              <p>Upload an image, select your measurement system, and specify what you want to measure to get AI-powered measurements.</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground w-full text-center">
            This tool uses AI for measurement estimation. For precise measurements, always use proper measuring tools.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}