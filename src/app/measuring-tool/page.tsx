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

      {/* Blog Section */}
      <div className="max-w-3xl mx-auto mt-12 px-4 sm:px-6 lg:px-8 prose prose-sm sm:prose lg:prose-lg dark:prose-invert">
        <h1>The Complete Guide to AI Measuring Tools: Revolutionizing Digital Measurements</h1>

        <p>In today's digital age, the ability to measure objects accurately without physical contact has become increasingly important. AI measuring tools represent a breakthrough in measurement technology, combining artificial intelligence with visual analysis to provide precise measurements from digital images. These innovative solutions are transforming how we approach measurement tasks across various industries and personal applications.</p>

        <h2>What is an AI Measuring Tool?</h2>

        <p>An AI measuring tool is a sophisticated software application that uses artificial intelligence algorithms to analyze images and calculate the dimensions of objects within them. Unlike traditional online ruler applications that require manual calibration with a physical reference like a plastic card, AI measuring tools can automatically determine scale and provide measurements in various units including inches and centimeters.</p>

        <p>These tools operate by analyzing pixels in uploaded images, using advanced computer vision technology to identify objects and calculate their actual physical dimensions. The measurement process typically involves setting a reference point or allowing the AI to automatically detect scale based on recognizable objects in the image.</p>

        <h2>Key Features to Check When Searching for the Best AI Measuring Tool</h2>

        <p>When evaluating AI measuring tools, several critical features determine their effectiveness and reliability:</p>

        <h3>Accuracy and Precision</h3>
        <p>The most important consideration is the tool's ability to provide accurate measurements. Look for tools that can handle various object sizes and shapes while maintaining high precision. The measurement accuracy depends on image quality, resolution, and the AI's ability to correctly interpret scale and proportions.</p>

        <h3>Calibration Methods</h3>
        <p>Effective AI measuring tools should offer multiple calibration options. Some tools require users to input screen diagonal information or use a standard reference object like a plastic card to set scale. The best tools can automatically calibrate using recognizable objects or by allowing users to enter known dimensions for reference.</p>

        <h3>Measurement Units and Flexibility</h3>
        <p>Quality tools should support multiple measurement systems, allowing users to switch between inches, centimeters, millimeters, and other metric units. The ability to change measurement units seamlessly is essential for different applications and user preferences.</p>

        <h3>User Interface and Ease of Use</h3>
        <p>The tool's interface should be intuitive, with clear input fields and simple navigation. Users should be able to easily upload images, set parameters, and view results without confusion. Desktop browsers should provide a smooth experience with minimal distortion when displaying measurements.</p>

        <h3>Image Processing Capabilities</h3>
        <p>Advanced AI measuring tools can handle various image formats and qualities. They should be able to process images effectively regardless of lighting conditions, angles, or background complexity while maintaining measurement reliability.</p>

        <h2>Best FREE AI Measuring Tools</h2>

        <h3>1. Klutz AI Measuring Tool - The Pioneer in AI Analysis</h3>
        <p>Klutz's AI measuring tool stands out as the first tool with AI analysis features, revolutionizing how we approach digital measurements. This groundbreaking platform combines sophisticated artificial intelligence with user-friendly design to deliver exceptional measurement capabilities.</p>

        <p><strong>Price:</strong> Free</p>

        <h4>Pros:</h4>
        <ul>
          <li>First-to-market AI analysis technology that automatically detects and measures objects</li>
          <li>No manual calibration required - the AI handles scale determination automatically</li>
          <li>Supports multiple measurement units (inches, centimeters, millimeters)</li>
          <li>Clean, intuitive interface that works seamlessly across desktop browsers</li>
          <li>High accuracy for various object types and sizes</li>
          <li>No account registration required</li>
          <li>Handles different image qualities and lighting conditions effectively</li>
        </ul>

        <h4>Cons:</h4>
        <ul>
          <li>Accuracy depends on image quality and clarity</li>
          <li>May require good lighting for optimal results</li>
          <li>Limited to 2D measurements from single images</li>
        </ul>

        <p>What makes Klutz's tool particularly impressive is its ability to analyze images without requiring users to manually set scale using a plastic card or enter screen diagonal information. The AI automatically determines the actual physical size of objects, making it incredibly convenient for quick measurements.</p>

        <h3>2. ImageMeasurement.online</h3>
        <p>This online ruler platform offers basic measurement functionality with some automated features.</p>

        <p><strong>Price:</strong> Free with premium plans available</p>

        <h4>Pros:</h4>
        <ul>
          <li>Simple drag-and-drop interface</li>
          <li>Automatic square detection for cropping</li>
          <li>Supports multiple image formats</li>
          <li>No download required - works entirely in browser</li>
        </ul>

        <h4>Cons:</h4>
        <ul>
          <li>Requires manual calibration using reference objects</li>
          <li>Limited AI analysis compared to Klutz's advanced features</li>
          <li>May experience scaling issues on different screen sizes</li>
          <li>Less accurate for complex object shapes</li>
        </ul>

        <h3>3. Measurement AI (YesChat.ai)</h3>
        <p>While primarily a conversational AI assistant for measurement guidance, this tool provides helpful measurement advice and unit conversions.</p>

        <p><strong>Price:</strong> Free</p>

        <h4>Pros:</h4>
        <ul>
          <li>Provides measurement guidance and tips</li>
          <li>Excellent for unit conversions</li>
          <li>Educational value for learning measurement techniques</li>
          <li>Available without login requirements</li>
        </ul>

        <h4>Cons:</h4>
        <ul>
          <li>Not a true image analysis tool</li>
          <li>Cannot directly measure objects from images</li>
          <li>Requires significant manual input for calculations</li>
          <li>Limited practical application for immediate measurement needs</li>
        </ul>

        <h2>Calibration and Accuracy Considerations</h2>

        <p>When using any AI measuring tool, understanding calibration is crucial for accurate results. Traditional online rulers often require users to calibrate their screen by measuring a plastic card or entering their screen diagonal in inches. However, advanced AI tools like Klutz's measuring solution have revolutionized this process by automatically determining scale through intelligent image analysis.</p>

        <p>The accuracy of measurements can be affected by several factors:</p>
        <ul>
          <li>Image resolution and quality</li>
          <li>Lighting conditions</li>
          <li>Camera angle and perspective</li>
          <li>Object positioning and background</li>
          <li>Screen calibration (for traditional tools)</li>
        </ul>

        <p>For optimal results, ensure images are clear, well-lit, and taken from appropriate angles. When manual calibration is required, use a standard plastic card as reference, as most tools are designed to recognize the standard width of payment cards (typically 3.375 inches or 85.6mm).</p>

        <h2>Technical Considerations and Browser Compatibility</h2>

        <p>Modern AI measuring tools are designed to work across various desktop browsers and devices. However, some technical considerations can affect performance:</p>

        <h3>Display and Resolution</h3>
        <p>The tool's accuracy can be influenced by your display resolution and screen size. Tools that require manual calibration often ask users to set screen diagonal measurements or use the actual physical size of reference objects for proper scaling.</p>

        <h3>JavaScript and Browser Requirements</h3>
        <p>Most AI measuring tools require JavaScript enabled browsers to function properly. Ensure your browser supports modern web applications and has JavaScript enabled for optimal functionality.</p>

        <h3>Pixel Density and PPI Calculations</h3>
        <p>Advanced tools calculate measurements by analyzing pixel relationships and determining the pixels per inch (PPI) ratio. This process involves complex algorithms that convert virtual pixels to real-world measurements based on reference points or AI analysis.</p>

        <h2>TLDR - Quick Summary</h2>

        <p>AI measuring tools represent a significant advancement in digital measurement technology, with Klutz's AI measuring tool leading the innovation as the first tool with comprehensive AI analysis features. Here are the key takeaways:</p>
        <ul>
          <li><strong>Best Overall:</strong> Klutz AI Measuring Tool - offers automatic AI analysis without manual calibration</li>
          <li><strong>Key Features to Look For:</strong> Accuracy, easy calibration, multiple measurement units, user-friendly interface</li>
          <li><strong>Calibration:</strong> Advanced tools like Klutz eliminate the need for manual calibration with plastic cards or screen diagonal input</li>
          <li><strong>Accuracy:</strong> Results depend on image quality, lighting, and the sophistication of the AI analysis</li>
          <li><strong>Cost:</strong> Several excellent free options available, with Klutz providing the most advanced features at no cost</li>
        </ul>

        <p>Whether you need to measure objects for professional purposes or personal projects, AI measuring tools offer convenient, accurate solutions that continue to evolve with advancing technology. Klutz's pioneering AI analysis approach sets the standard for what these tools can achieve, making precise measurements more accessible than ever before.</p>
      </div>
    </div>
  );
}