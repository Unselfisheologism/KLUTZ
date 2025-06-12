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
import { Loader2, ImageUp, Zap, AlertTriangle, Info, CheckCircle, XCircle, FileText, Download } from 'lucide-react';
import { preprocessImage } from '@/lib/image-utils';
import { downloadTextFile } from '@/lib/utils';
import ImagePreview from '@/components/medi-scan/image-preview';
import type { ApplianceTroubleshootingReport } from '@/types/appliance-troubleshooter';

const cleanJsonString = (rawString: string): string => {
  let cleanedString = rawString.trim();
  if (cleanedString.startsWith("```json") && cleanedString.endsWith("```")) {
    cleanedString = cleanedString.substring(7, cleanedString.length - 3).trim();
  } else if (cleanedString.startsWith("```") && cleanedString.endsWith("```")) {
    cleanedString = cleanedString.substring(3, cleanedString.length - 3).trim();
  }
  return cleanedString;
};

export default function ApplianceTroubleshooterPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [deviceType, setDeviceType] = useState<string>('');
  const [issueDescription, setIssueDescription] = useState<string>('');
  const [additionalDetails, setAdditionalDetails] = useState<string>('');
  
  const [analysisReport, setAnalysisReport] = useState<ApplianceTroubleshootingReport | null>(null);
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
      toast({ variant: "destructive", title: "Missing Input", description: "Please upload an image of the malfunctioning device." });
      return;
    }
    if (!issueDescription.trim()) {
      toast({ variant: "destructive", title: "Missing Input", description: "Please describe the issue you're experiencing." });
      return;
    }
    if (!deviceType) {
      toast({ variant: "destructive", title: "Missing Input", description: "Please select the type of device." });
      return;
    }

    setIsLoading(true);
    setAnalysisReport(null);
    setError(null);
    toast({ title: "Analysis Started", description: "AI is analyzing your device issue..." });

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
        You are an AI assistant specialized in diagnosing electronic device issues.
        Analyze this image of a ${deviceType} with the following reported issue: "${issueDescription}"
        Additional context provided: "${additionalDetails || 'None provided'}"

        Provide a comprehensive analysis including:
        1. Visual inspection of the device
        2. Identification of visible issues or damage
        3. Potential causes based on the symptoms
        4. Recommended troubleshooting steps
        5. Safety considerations if applicable

        Return the analysis in a JSON object with these keys:
        - "image_description": (string) Detailed description of what you see in the image
        - "device_type": (string) Confirmed device type based on the image
        - "identified_issues": (array of strings) List of visible problems or symptoms
        - "possible_causes": (array of strings) Potential causes of the malfunction
        - "recommended_solutions": (array of strings) Step-by-step troubleshooting or repair suggestions
        - "safety_warnings": (array of strings) Any safety concerns or precautions
        - "confidence": (string, one of "High", "Medium", "Low", "Not Applicable") Your confidence in this assessment
        - "disclaimer": (string) Standard disclaimer about AI limitations and professional repair advice
      `;

      const response = await puter.ai.chat(imagePrompt, preprocessedDataUrl);
      
      if (!response?.message?.content) {
        throw new Error("AI analysis did not return content.");
      }

      const parsedResponse: ApplianceTroubleshootingReport = JSON.parse(cleanJsonString(response.message.content));
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

    let reportString = "KLUTZ Electronic Appliance Troubleshooting Report\n";
    reportString += "===============================================\n\n";

    reportString += "Device Information:\n";
    reportString += "------------------\n";
    reportString += `Device Type: ${analysisReport.device_type}\n`;
    reportString += `Reported Issue: ${issueDescription}\n\n`;

    if (additionalDetails) {
      reportString += "Additional Details Provided:\n";
      reportString += `${additionalDetails}\n\n`;
    }

    reportString += "Image Analysis:\n";
    reportString += "--------------\n";
    reportString += `${analysisReport.image_description}\n\n`;

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
    
    reportString += "\nIMPORTANT: This report is AI-generated and for informational purposes only. Always consult with a qualified technician for serious electrical issues or safety concerns.";

    const timestamp = new Date().toISOString().replace(/[:.-]/g, '').slice(0, 14);
    downloadTextFile(reportString, `KLUTZ_ApplianceTroubleshooter_Report_${timestamp}.txt`);
  };

  return (
    <>
      <Head>
        <link rel="canonical" href="https://klutz.netlify.app/appliance-troubleshooter" />
      </Head>
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="max-w-3xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary flex items-center">
            <Zap className="mr-3 h-8 w-8" />
            Electronic Appliance Troubleshooter
          </CardTitle>
          <CardDescription>
            Upload an image of your malfunctioning device and describe the issue for AI-powered troubleshooting assistance.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert variant="default" className="bg-yellow-50 border-yellow-400 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <AlertTitle className="font-semibold">Safety Warning</AlertTitle>
            <AlertDescription>
              For serious electrical issues or safety concerns, always consult with a qualified technician. 
              This tool provides general guidance only and should not replace professional inspection.
            </AlertDescription>
          </Alert>

          <div>
            <Label htmlFor="image-upload" className="text-lg font-medium flex items-center mb-2">
              <ImageUp className="mr-2 h-5 w-5 text-accent" />
              Device Image
            </Label>
            <Input
              id="image-upload"
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleImageFileChange}
              className="file:text-primary file:font-semibold file:bg-primary/10 hover:file:bg-primary/20"
              disabled={isLoading}
            />
            <p className="text-sm text-muted-foreground mt-1">Upload a clear image of the malfunctioning device.</p>
          </div>

          {imageDataUrl && <ImagePreview imageDataUrl={imageDataUrl} dataAiHint="electronic device"/>}

          <div className="space-y-4">
            <div>
              <Label htmlFor="device-type" className="text-lg font-medium">Device Type</Label>
              <Select value={deviceType} onValueChange={setDeviceType}>
                <SelectTrigger id="device-type" className="w-full">
                  <SelectValue placeholder="Select device type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="television">Television</SelectItem>
                  <SelectItem value="smartphone">Smartphone</SelectItem>
                  <SelectItem value="laptop">Laptop</SelectItem>
                  <SelectItem value="refrigerator">Refrigerator</SelectItem>
                  <SelectItem value="washing-machine">Washing Machine</SelectItem>
                  <SelectItem value="microwave">Microwave</SelectItem>
                  <SelectItem value="air-conditioner">Air Conditioner</SelectItem>
                  <SelectItem value="other">Other Electronic Device</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="issue-description" className="text-lg font-medium">Issue Description</Label>
              <Textarea
                id="issue-description"
                placeholder="Describe the problem you're experiencing with the device..."
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
            disabled={isLoading || !imageFile || !deviceType || !issueDescription.trim()} 
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Device...
              </>
            ) : (
              'Analyze Device Issue'
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
                  Device Analysis Report
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold text-md mb-1">Device Assessment:</h4>
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
              <p>Upload a device image, select the device type, and describe the issue to get AI-powered troubleshooting assistance.</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground w-full text-center">
            This tool uses AI for general guidance only. For serious electrical issues, always consult a qualified technician.
          </p>
        </CardFooter>
      </Card>

      <div className="mt-12 max-w-3xl mx-auto prose prose-lg dark:prose-invert">
        <h1>The Ultimate Guide to AI Electronic Appliance Troubleshooters: Transform Your Customer Support Experience</h1>

        <p>In today's fast-paced world, electronic appliances are essential to our daily operations, and when technical issues arise, users need quick and efficient solutions. Traditional customer support often involves lengthy waiting times and complex troubleshooting processes that can frustrate customers. Enter AI electronic appliance troubleshooters - revolutionary tools that are transforming how we approach technical issue resolution and enhancing customer satisfaction rates across businesses worldwide.</p>

        <h2>What is an AI Electronic Appliance Troubleshooter?</h2>

        <p>An AI electronic appliance troubleshooter is an advanced system that utilizes artificial intelligence algorithms to analyze user input and deliver instant solutions for appliance-related problems. These powerful tools work by processing user-reported issue details through sophisticated AI processing capabilities, allowing support teams to provide accurate and timely responses to customer inquiries. Unlike traditional customer support methods, these systems can instantly identify potential root causes and provide actionable insights that help users resolve technical issues efficiently.</p>

        <p>The technology behind these troubleshooters involves advanced algorithms that analyze system logs and data to systematically identify problems. When customers submit specific queries through a user-friendly interface, the AI analyzes the input and retrieves relevant information from a comprehensive knowledge base, ensuring accurate and timely responses. This process facilitates swift resolution, significantly reducing the time needed to resolve routine inquiries and improving overall operational efficiency.</p>

        <h2>Key Features to Check When Searching for the Best AI Electronic Appliance Troubleshooter</h2>

        <p>When selecting an effective AI troubleshooter tool, several critical features determine the system's performance and ability to enhance customer satisfaction. Here are the essential elements to consider:</p>

        <h3>Advanced AI Processing Capabilities</h3>

        <p>The most effective tools utilize powerful AI algorithms that can analyze complex technical issues and provide accurate solutions. Look for systems that offer sophisticated processing abilities to handle diverse customer support issues efficiently.</p>

        <h3>Easy Integration with Existing Systems</h3>

        <p>Leading solutions should offer seamless setup with existing customer support platforms, allowing businesses to quickly leverage AI technology without significant disruptions. The best tools cut implementation time dramatically, with most users becoming fully operational within hours rather than weeks.</p>

        <h3>User-Friendly Interface</h3>

        <p>An intuitive interface ensures that both support teams and customers can utilize the tool effectively. The system should allow customers to submit specific queries and describe issues clearly while providing instant solutions that feel valued and effective.</p>

        <h3>Comprehensive Knowledge Base</h3>

        <p>The troubleshooter should have access to extensive information about various appliances and common technical issues, enabling it to provide relevant solutions for a wide range of problems.</p>

        <h3>Cost-Effective Operation</h3>

        <p>Consider tools that offer significant cost savings through improved efficiency and automation. The best solutions help lower operational costs while delivering superior results that drive business growth.</p>

        <h2>Best FREE AI Electronic Appliance Troubleshooters</h2>

        <h3>1. Klutz AI Electronic Appliance Troubleshooter - The Pioneer</h3>

        <p><strong>Price:</strong> Free</p>

        <p><strong>Standout Feature:</strong> Klutz's AI Electronic Appliance Troubleshooter stands as the first tool with AI analysis features specifically designed for electronic appliance troubleshooting. This groundbreaking innovation has set the standard for how AI can transform customer support experiences.</p>

        <p><strong>Pros:</strong></p>

        <ul>
          <li>Revolutionary AI analysis capabilities that were first introduced by Klutz</li>
          <li>Excellent user experience with streamlined support processes</li>
          <li>Effective handling of routine queries, allowing support teams to focus on complex issues</li>
          <li>Quick and efficient solutions that enhance customer retention through timely support</li>
          <li>No tech skills needed to utilize the tool effectively</li>
          <li>Significant advantages for business owners looking to improve customer satisfaction</li>
        </ul>

        <p><strong>Cons:</strong></p>

        <ul>
          <li>As a newer innovation, some advanced features may still be developing</li>
          <li>Limited to electronic appliances (though this is also its strength)</li>
        </ul>

        <p>Klutz's tool represents a leading solution for customer support that delivers superior results. Users report average cost savings and improved efficiency within the first month of implementation, making it an essential tool for businesses seeking to drive growth through enhanced customer interactions.</p>

        <h3>2. LogicBalls AI Troubleshooter</h3>

        <p><strong>Price:</strong> Free tier available, Premium at $4.99/month</p>

        <p><strong>Pros:</strong></p>

        <ul>
          <li>Versatile tool that handles various customer support issues beyond just appliances</li>
          <li>Multiple tone options for different customer interactions</li>
          <li>Easy integration with existing support systems</li>
          <li>Advanced algorithms achieve high accuracy in processing customer queries</li>
          <li>Cost-effective solution with demonstrated return on investment for businesses</li>
        </ul>

        <p><strong>Cons:</strong></p>

        <ul>
          <li>Less specialized than Klutz's appliance-focused approach</li>
          <li>Premium features require subscription cost</li>
          <li>May lack the pioneering AI analysis features that Klutz first introduced</li>
        </ul>

        <h3>3. YesChat AI Repair Hero</h3>

        <p><strong>Price:</strong> Free</p>

        <p><strong>Pros:</strong></p>

        <ul>
          <li>Comprehensive repair guidance for various devices</li>
          <li>Safety-focused approach with detailed precautions</li>
          <li>Good for users with different technical skill levels</li>
          <li>Provides step-by-step instructions that improve user experience</li>
        </ul>

        <p><strong>Cons:</strong></p>

        <ul>
          <li>Broader focus means less specialized AI processing for electronic appliances</li>
          <li>May not offer the same level of instant solutions as dedicated tools</li>
          <li>Lacks the innovative AI analysis features that Klutz pioneered</li>
        </ul>

        <h3>4. YesChat Home Repair Helper</h3>

        <p><strong>Price:</strong> Free</p>

        <p><strong>Pros:</strong></p>

        <ul>
          <li>Handles wide range of home repair issues</li>
          <li>Image analysis capabilities for better problem identification</li>
          <li>Detailed maintenance tips that help prevent future technical issues</li>
        </ul>

        <p><strong>Cons:</strong></p>

        <ul>
          <li>General home repair focus rather than electronic appliance specialization</li>
          <li>May not provide the targeted efficiency that specialized tools offer</li>
          <li>Doesn't match the specific AI analysis capabilities that Klutz first introduced for appliances</li>
        </ul>

        <h2>The Competitive Advantage of Specialized AI Analysis</h2>

        <p>While many tools offer general troubleshooting capabilities, Klutz's AI Electronic Appliance Troubleshooter remains unique as the first tool with dedicated AI analysis features for electronic appliances. This specialization allows for more accurate problem identification and faster resolution times, leading to higher customer satisfaction rates and improved operational efficiency.</p>

        <p>The tool's innovative approach to AI processing enables support teams to handle customer inquiries more effectively, reducing workload through automation of routine queries while ensuring customers receive prompt and accurate solutions to their issues. This specialization has proven to be a significant advantage for businesses looking to enhance their customer support processes and achieve faster resolution times with improved customer feedback.</p>

        <h2>TL;DR</h2>

        <p>AI electronic appliance troubleshooters are transforming customer support by providing instant, accurate solutions that enhance user satisfaction and lower operational costs. Klutz's AI Electronic Appliance Troubleshooter stands out as the pioneering tool with the first AI analysis features specifically designed for electronic appliances, offering unmatched specialization in this field. While other tools like LogicBalls, YesChat Repair Hero, and Home Repair Helper provide valuable services, Klutz's innovative approach to AI analysis sets the standard for effective electronic appliance troubleshooting.</p>

        <p>For businesses seeking to improve their customer support experience, reduce waiting times, and provide valued, effective, and efficient service, investing in a specialized AI troubleshooter tool is essential. The technology not only helps streamline support processes and minimize downtime but also drives business growth through enhanced customer retention and satisfaction. As these tools continue to evolve, the emphasis on specialized AI analysis capabilities - like those first introduced by Klutz - will likely become the defining factor in choosing the most effective solution for your technical support needs.</p>
      </div>
    </div>
  );
    </>
)}