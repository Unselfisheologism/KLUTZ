'use client';

import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ImageUp, Car, AlertTriangle, Info, CheckCircle, XCircle, FileText, Download, AlertOctagon } from 'lucide-react';
import { preprocessImage } from '@/lib/image-utils';
import { downloadTextFile } from '@/lib/utils';
import ImagePreview from '@/components/medi-scan/image-preview';
import type { VehicleTroubleshootingReport } from '@/types/vehicle-troubleshooter';

const cleanJsonString = (rawString: string): string => {
  let cleanedString = rawString.trim();
  if (cleanedString.startsWith("```json") && cleanedString.endsWith("```")) {
    cleanedString = cleanedString.substring(7, cleanedString.length - 3).trim();
  } else if (cleanedString.startsWith("```") && cleanedString.endsWith("```")) {
    cleanedString = cleanedString.substring(3, cleanedString.length - 3).trim();
  }
  return cleanedString;
};

export default function VehicleTroubleshooterPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [vehicleType, setVehicleType] = useState<string>('');
  const [vehicleInfo, setVehicleInfo] = useState<string>('');
  const [issueDescription, setIssueDescription] = useState<string>('');
  const [additionalDetails, setAdditionalDetails] = useState<string>('');
  
  const [analysisReport, setAnalysisReport] = useState<VehicleTroubleshootingReport | null>(null);
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
      toast({ variant: "destructive", title: "Missing Input", description: "Please upload an image of the vehicle issue." });
      return;
    }
    if (!issueDescription.trim()) {
      toast({ variant: "destructive", title: "Missing Input", description: "Please describe the issue you're experiencing." });
      return;
    }
    if (!vehicleType) {
      toast({ variant: "destructive", title: "Missing Input", description: "Please select the type of vehicle." });
      return;
    }

    setIsLoading(true);
    setAnalysisReport(null);
    setError(null);
    toast({ title: "Analysis Started", description: "AI is analyzing your vehicle issue..." });

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
        You are an AI assistant specialized in diagnosing vehicle issues.
        Analyze this image of a ${vehicleType} with the following reported issue: "${issueDescription}"
        Vehicle information: "${vehicleInfo || 'Not provided'}"
        Additional context: "${additionalDetails || 'None provided'}"

        Provide a comprehensive analysis including:
        1. Visual inspection of the vehicle part/component
        2. Identification of visible issues or damage
        3. Potential causes based on the symptoms
        4. Recommended troubleshooting and repair steps
        5. Safety considerations
        6. Maintenance recommendations

        Return the analysis in a JSON object with these keys:
        - "image_description": (string) Detailed description of what you see in the image
        - "vehicle_type": (string) Confirmed vehicle type based on the image
        - "identified_issues": (array of strings) List of visible problems or symptoms
        - "possible_causes": (array of strings) Potential causes of the malfunction
        - "recommended_solutions": (array of strings) Step-by-step troubleshooting or repair suggestions
        - "safety_warnings": (array of strings) Any safety concerns or precautions
        - "maintenance_tips": (array of strings) Preventive maintenance recommendations
        - "estimated_severity": (string, one of "Minor", "Moderate", "Severe", "Critical") Assessment of issue severity
        - "confidence": (string, one of "High", "Medium", "Low", "Not Applicable") Your confidence in this assessment
        - "disclaimer": (string) Standard disclaimer about AI limitations and professional mechanic consultation
      `;

      const response = await puter.ai.chat(imagePrompt, preprocessedDataUrl);
      
      if (!response?.message?.content) {
        throw new Error("AI analysis did not return content.");
      }

      const parsedResponse: VehicleTroubleshootingReport = JSON.parse(cleanJsonString(response.message.content));
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

    let reportString = "KLUTZ Vehicle Troubleshooting Report\n";
    reportString += "===================================\n\n";

    reportString += "Vehicle Information:\n";
    reportString += "-------------------\n";
    reportString += `Vehicle Type: ${analysisReport.vehicle_type}\n`;
    if (vehicleInfo) {
      reportString += `Additional Vehicle Info: ${vehicleInfo}\n`;
    }
    reportString += `Reported Issue: ${issueDescription}\n\n`;

    if (additionalDetails) {
      reportString += "Additional Details Provided:\n";
      reportString += `${additionalDetails}\n\n`;
    }

    reportString += "Image Analysis:\n";
    reportString += "--------------\n";
    reportString += `${analysisReport.image_description}\n\n`;

    reportString += "Issue Severity: " + analysisReport.estimated_severity + "\n\n";

    reportString += "Identified Issues:\n";
    reportString += "-----------------\n";
    analysisReport.identified_issues.forEach(issue => {
      reportString += `- ${issue}\n`;
    });
    reportString += "\n";

    reportString += "Possible Causes:\n";
    reportString += "---------------\n";
    analysisReport.possible_causes.forEach(cause => {
      reportString += `- ${cause}\n`;
    });
    reportString += "\n";

    reportString += "Recommended Solutions:\n";
    reportString += "--------------------\n";
    analysisReport.recommended_solutions.forEach((solution, index) => {
      reportString += `${index + 1}. ${solution}\n`;
    });
    reportString += "\n";

    if (analysisReport.maintenance_tips && analysisReport.maintenance_tips.length > 0) {
      reportString += "Maintenance Tips:\n";
      reportString += "----------------\n";
      analysisReport.maintenance_tips.forEach(tip => {
        reportString += `- ${tip}\n`;
      });
      reportString += "\n";
    }

    if (analysisReport.safety_warnings && analysisReport.safety_warnings.length > 0) {
      reportString += "⚠️ Safety Warnings:\n";
      reportString += "----------------\n";
      analysisReport.safety_warnings.forEach(warning => {
        reportString += `! ${warning}\n`;
      });
      reportString += "\n";
    }

    reportString += "AI Confidence Level: " + analysisReport.confidence + "\n\n";
    reportString += "Disclaimer:\n";
    reportString += "-----------\n";
    reportString += analysisReport.disclaimer + "\n\n";
    
    reportString += "\nIMPORTANT: This report is AI-generated and for informational purposes only. Always consult with a qualified mechanic for serious vehicle issues or safety concerns.";

    const timestamp = new Date().toISOString().replace(/[:.-]/g, '').slice(0, 14);
    downloadTextFile(reportString, `KLUTZ_VehicleTroubleshooter_Report_${timestamp}.txt`);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'minor':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'moderate':
        return 'text-orange-600 dark:text-orange-400';
      case 'severe':
        return 'text-red-600 dark:text-red-400';
      case 'critical':
        return 'text-red-700 dark:text-red-300 font-bold';
      default:
        return 'text-foreground';
    }
  };

  return (
    <>
      <Head>
        <link rel="canonical" href="https://klutz.netlify.app/vehicle-troubleshooter" />
      </Head>
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="max-w-3xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary flex items-center">
            <Car className="mr-3 h-8 w-8" />
            Vehicle Troubleshooter
          </CardTitle>
          <CardDescription>
            Upload an image of the vehicle issue and describe the problem for AI-powered diagnostic assistance.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert variant="default" className="bg-yellow-50 border-yellow-400 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <AlertTitle className="font-semibold">Safety Warning</AlertTitle>
            <AlertDescription>
              For serious mechanical issues or safety concerns, always consult with a qualified mechanic. 
              This tool provides general guidance only and should not replace professional inspection.
            </AlertDescription>
          </Alert>

          <div>
            <Label htmlFor="image-upload" className="text-lg font-medium flex items-center mb-2">
              <ImageUp className="mr-2 h-5 w-5 text-accent" />
              Vehicle Image
            </Label>
            <Input
              id="image-upload"
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleImageFileChange}
              className="file:text-primary file:font-semibold file:bg-primary/10 hover:file:bg-primary/20"
              disabled={isLoading}
            />
            <p className="text-sm text-muted-foreground mt-1">Upload a clear image of the vehicle issue or malfunctioning part.</p>
          </div>

          {imageDataUrl && <ImagePreview imageDataUrl={imageDataUrl} dataAiHint="vehicle issue"/>}

          <div className="space-y-4">
            <div>
              <Label htmlFor="vehicle-type" className="text-lg font-medium">Vehicle Type</Label>
              <Select value={vehicleType} onValueChange={setVehicleType}>
                <SelectTrigger id="vehicle-type" className="w-full">
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="car">Car</SelectItem>
                  <SelectItem value="motorcycle">Motorcycle</SelectItem>
                  <SelectItem value="bicycle">Bicycle</SelectItem>
                  <SelectItem value="truck">Truck</SelectItem>
                  <SelectItem value="auto-rickshaw">Auto Rickshaw</SelectItem>
                  <SelectItem value="engine">Engine Component</SelectItem>
                  <SelectItem value="other">Other Vehicle/Part</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="vehicle-info" className="text-lg font-medium">Vehicle Information (Optional)</Label>
              <Input
                id="vehicle-info"
                placeholder="e.g., Make, Model, Year"
                value={vehicleInfo}
                onChange={(e) => setVehicleInfo(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="issue-description" className="text-lg font-medium">Issue Description</Label>
              <Textarea
                id="issue-description"
                placeholder="Describe the problem you're experiencing with the vehicle..."
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div>
              <Label htmlFor="additional-details" className="text-lg font-medium">Additional Details (Optional)</Label>
              <Textarea
                id="additional-details"
                placeholder="Any additional context about the issue (e.g., when it started, what you've tried)..."
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
              />
            </div>
          </div>

          <Button 
            onClick={performAnalysis} 
            disabled={isLoading || !imageFile || !vehicleType || !issueDescription.trim()} 
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Issue...
              </>
            ) : (
              'Analyze Vehicle Issue'
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
                  <FileText className="mr-2 h-6 w-6 text-primary" />
                  Vehicle Diagnostic Report
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-md">Issue Severity:</h4>
                  <span className={`font-bold ${getSeverityColor(analysisReport.estimated_severity)}`}>
                    {analysisReport.estimated_severity === 'Critical' && <AlertOctagon className="inline mr-1 h-4 w-4" />}
                    {analysisReport.estimated_severity}
                  </span>
                </div>

                <div>
                  <h4 className="font-semibold text-md mb-1">Visual Assessment:</h4>
                  <p className="bg-muted/30 p-3 rounded-md">{analysisReport.image_description}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-md mb-1">Identified Issues:</h4>
                  <ul className="list-disc pl-5 space-y-1 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                    {analysisReport.identified_issues.map((issue, index) => (
                      <li key={index} className="text-red-700 dark:text-red-300">{issue}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-md mb-1">Possible Causes:</h4>
                  <ul className="list-disc pl-5 space-y-1 bg-orange-50 dark:bg-orange-900/20 p-3 rounded-md">
                    {analysisReport.possible_causes.map((cause, index) => (
                      <li key={index} className="text-orange-700 dark:text-orange-300">{cause}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-md mb-1">Recommended Solutions:</h4>
                  <ul className="list-decimal pl-5 space-y-2 bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                    {analysisReport.recommended_solutions.map((solution, index) => (
                      <li key={index} className="text-green-700 dark:text-green-300">{solution}</li>
                    ))}
                  </ul>
                </div>

                {analysisReport.maintenance_tips && analysisReport.maintenance_tips.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-md mb-1">Maintenance Tips:</h4>
                    <ul className="list-disc pl-5 space-y-1 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                      {analysisReport.maintenance_tips.map((tip, index) => (
                        <li key={index} className="text-blue-700 dark:text-blue-300">{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysisReport.safety_warnings && analysisReport.safety_warnings.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-md mb-1 text-red-600 dark:text-red-400">⚠️ Safety Warnings:</h4>
                    <ul className="list-disc pl-5 space-y-1 bg-red-50 dark:bg-red-900/20 p-3 rounded-md border-2 border-red-200 dark:border-red-800">
                      {analysisReport.safety_warnings.map((warning, index) => (
                        <li key={index} className="text-red-700 dark:text-red-300">{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-md mb-1">AI Confidence:</h4>
                  <p className="bg-muted/30 p-3 rounded-md">{analysisReport.confidence}</p>
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
              <p>Upload a vehicle image, select the vehicle type, and describe the issue to get AI-powered diagnostic assistance.</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground w-full text-center">
            This tool uses AI for general guidance only. For serious mechanical issues, always consult a qualified mechanic.
          </p>
        </CardFooter>
      </Card>

      <div className="mt-12 max-w-3xl mx-auto prose prose-lg dark:prose-invert">
        <h1>The Ultimate Guide to AI Vehicle Troubleshooters: Revolutionizing Auto Repair Diagnostics</h1>

        <p>Modern automotive technology has transformed how we approach vehicle maintenance and repair. AI vehicle troubleshooters represent a groundbreaking advancement in auto mechanic troubleshooting, offering drivers and mechanics powerful tools to diagnose vehicle issues efficiently. These intelligent systems utilize advanced algorithms to analyze symptoms and deliver accurate, personalized troubleshooting guides that can save both time and cost while enhancing customer satisfaction.</p>

        <h2>What is an AI Vehicle Troubleshooter?</h2>

        <p>An AI vehicle troubleshooter is a sophisticated tool that leverages artificial intelligence to diagnose automotive problems based on user input symptoms. These systems work by analyzing comprehensive databases of automotive knowledge, including common issues and solutions, to create structured troubleshooting guides tailored to specific vehicle problems. The AI processing capabilities allow these tools to quickly identify potential causes and provide relevant, up-to-date recommendations for repair.</p>

        <p>Unlike traditional diagnostic methods, AI auto mechanic systems can process vast amounts of information instantly, enabling mechanics and vehicle owners to receive accurate fast troubleshooting support. These tools represent the future of automotive repair, preparing future mechanics with relevant up-to-date knowledge while helping current professionals improve their diagnostic efficiency.</p>

        <h2>Key Features to Check When Searching for the Best AI Vehicle Troubleshooter</h2>

        <p><strong>Powerful Performance and Accuracy:</strong> The best AI auto troubleshooting tools utilize advanced algorithms to achieve high accuracy in processing vehicle symptoms. Look for systems that can quickly diagnose issues and provide reliable solutions.</p>

        <p><strong>Easy Integration:</strong> Effective tools should offer seamless setup with existing systems, minimizing disruption to daily operations. Auto repair shops need solutions that integrate efficiently without requiring extensive tech skills.</p>

        <p><strong>Comprehensive Database:</strong> Superior AI troubleshooting guide generators should access extensive automotive knowledge, including manufacturer-specific information and real-world scenarios to deliver personalized troubleshooting guides.</p>

        <p><strong>User-Friendly Interface:</strong> The tool should be accessible to users with varying technical backgrounds, from professional mechanics to vehicle owners seeking guidance.</p>

        <p><strong>Cost Effectiveness:</strong> Consider tools that provide significant value through improved efficiency, reducing diagnostic time and enhancing service quality while offering reasonable pricing.</p>

        <h2>Best FREE AI Vehicle Troubleshooters</h2>

        <h3>1. Klutz's AI Vehicle Troubleshooter - The Pioneer in AI Analysis</h3>

        <p><strong>Pricing:</strong> Completely free</p>

        <p><strong>Pros:</strong></p>

        <ul>
          <li>First-to-market AI analysis capabilities</li>
          <li>Image upload functionality for visual diagnostics</li>
          <li>No registration required</li>
          <li>Covers multiple vehicle types</li>
          <li>Instant results with detailed explanations</li>
          <li>User-friendly interface requiring no tech skills</li>
        </ul>

        <p><strong>Cons:</strong></p>

        <ul>
          <li>Limited to general guidance</li>
          <li>Recommends professional consultation for serious issues</li>
        </ul>

        <p>Klutz's system utilizes cutting-edge AI processing to analyze both visual and textual input symptoms, making it particularly effective for mechanics and vehicle owners who need quick, accurate diagnostics. The tool's ability to process images represents a significant advancement in AI auto mechanic troubleshooting.</p>

        <h3>2. LogicBalls Auto Mechanic Troubleshooting Guide Generator</h3>

        <p>LogicBalls offers a comprehensive AI auto mechanic troubleshooting guide generator that creates high-quality, well-structured troubleshooting guides for auto mechanics.</p>

        <p><strong>Pricing:</strong> Free basic version, premium features at $4.99/month</p>

        <p><strong>Pros:</strong></p>

        <ul>
          <li>Multiple tone options for different audiences</li>
          <li>Structured guide generation</li>
          <li>Automotive trainer-friendly content</li>
          <li>Suitable for training purposes</li>
        </ul>

        <p><strong>Cons:</strong></p>

        <ul>
          <li>Premium features require subscription</li>
          <li>Less visual diagnostic capability compared to Klutz's AI analysis features</li>
          <li>Limited real-time processing</li>
        </ul>

        <h3>3. VehicleScore AI Mechanic</h3>

        <p>VehicleScore provides an AI mechanic service that allows users to ask questions about specific engine codes and general symptoms.</p>

        <p><strong>Pricing:</strong> Free</p>

        <p><strong>Pros:</strong></p>

        <ul>
          <li>Specialized in engine code diagnostics</li>
          <li>Integration with vehicle history services</li>
          <li>Make and model-specific guidance</li>
          <li>Terms and conditions clearly outlined</li>
        </ul>

        <p><strong>Cons:</strong></p>

        <ul>
          <li>Requires user agreement acknowledgment</li>
          <li>Limited to text-based input</li>
          <li>No image analysis capabilities like Klutz's pioneering AI analysis features</li>
        </ul>

        <h3>4. OBDAI - OBD2 Scanner Enhancement</h3>

        <p>OBDAI transforms existing OBD2 scanners into intelligent diagnostic tools through AI enhancement.</p>

        <p><strong>Pricing:</strong> Free basic features, premium AI diagnostics available</p>

        <p><strong>Pros:</strong></p>

        <ul>
          <li>Works with existing OBD2 hardware</li>
          <li>Real-time vehicle monitoring</li>
          <li>Predictive analysis capabilities</li>
          <li>Comprehensive parameter monitoring</li>
        </ul>

        <p><strong>Cons:</strong></p>

        <ul>
          <li>Requires additional hardware</li>
          <li>Premium features need subscription</li>
          <li>More complex setup compared to web-based solutions</li>
        </ul>

        <h3>5. Car Mechanic GPT</h3>

        <p>Available through YesChat.ai, Car Mechanic GPT provides AI-powered automotive diagnostic assistance.</p>

        <p><strong>Pricing:</strong> Free access</p>

        <p><strong>Pros:</strong></p>

        <ul>
          <li>Natural language processing</li>
          <li>Detailed explanations</li>
          <li>Safety-focused recommendations</li>
          <li>Educational content for automotive learning</li>
        </ul>

        <p><strong>Cons:</strong></p>

        <ul>
          <li>Text-only interface</li>
          <li>No visual diagnostic features</li>
          <li>Generic responses compared to specialized tools</li>
        </ul>

        <h2>The Advantage of Klutz's AI Analysis Features</h2>

        <p>While multiple AI vehicle troubleshooters exist, Klutz's platform remains unique as <strong>the first tool with AI analysis features</strong> that can process both images and text descriptions. This dual-input capability allows for more accurate diagnostics, as visual information often reveals details that text descriptions might miss. The tool's AI processing can identify visual symptoms that enhance the overall troubleshooting experience.</p>

        <p>Auto repair shops utilizing Klutz's AI analysis features can quickly diagnose vehicle issues, resulting in faster repairs and enhanced customer satisfaction. The system's ability to process visual data represents a significant advancement in mechanic troubleshooting guide generation.</p>

        <h2>Benefits for Different User Groups</h2>

        <p><strong>Professional Mechanics:</strong> These tools help mechanics receive accurate fast troubleshooting support, increase productivity by reducing diagnosis time, and enhance customer satisfaction through quicker service. The AI processing capabilities allow professionals to validate results and implement recommended solutions efficiently.</p>

        <p><strong>Auto Repair Shops:</strong> Businesses can streamline operations and reduce labor costs while improving service quality through structured guides. The enhanced service capabilities help attract customers and improve profit margins through efficient operations.</p>

        <p><strong>Automotive Trainers:</strong> These systems provide real-world scenarios for training purposes, allowing trainers to utilize practical hands-on experience to engage trainees and prepare future mechanics with relevant up-to-date knowledge.</p>

        <p><strong>Vehicle Owners:</strong> Drivers can perform basic troubleshooting before visiting repair shops, potentially saving time and cost while gaining better understanding of their vehicle issues.</p>

        <h2>TLDR</h2>

        <p>AI vehicle troubleshooters are revolutionizing automotive diagnostics by providing instant, accurate troubleshooting support. Klutz's AI vehicle troubleshooter leads the field as <strong>the first tool with AI analysis features</strong>, offering free image and text-based diagnostics. Other notable free options include LogicBalls (with premium features), VehicleScore AI Mechanic, OBDAI (hardware-dependent), and Car Mechanic GPT. These tools deliver significant benefits including reduced diagnostic time, enhanced customer satisfaction, and improved service quality for mechanics, auto repair shops, and vehicle owners alike. The future of automotive troubleshooting lies in these AI-powered solutions that combine advanced algorithms with user-friendly interfaces to create cost-effective, efficient diagnostic experiences.</p>
     </div>
   </div> 
 );
   </>
)}   