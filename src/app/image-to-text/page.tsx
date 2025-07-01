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
import { Loader2, ImageUp, FileText, AlertTriangle, Info, Copy, Download } from 'lucide-react';
import { preprocessImage } from '@/lib/image-utils';
import { downloadTextFile } from '@/lib/utils';
import ImagePreview from '@/components/medi-scan/image-preview';
import type { ImageToTextReport } from '@/types/image-to-text';

const cleanJsonString = (rawString: string): string => {
  let cleanedString = rawString.trim();
  if (cleanedString.startsWith("```json") && cleanedString.endsWith("```")) {
    cleanedString = cleanedString.substring(7, cleanedString.length - 3).trim();
  } else if (cleanedString.startsWith("```") && cleanedString.endsWith("```")) {
    cleanedString = cleanedString.substring(3, cleanedString.length - 3).trim();
  }
  return cleanedString;
};

export default function ImageToTextPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [analysisType, setAnalysisType] = useState<string>('detailed');
  const [language, setLanguage] = useState<string>('auto');
  
  const [analysisReport, setAnalysisReport] = useState<ImageToTextReport | null>(null);
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
      toast({ variant: "destructive", title: "Missing Input", description: "Please upload an image containing text." });
      return;
    }

    setIsLoading(true);
    setAnalysisReport(null);
    setError(null);
    toast({ title: "Analysis Started", description: "AI is extracting text from your image..." });

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
        You are an AI assistant specialized in extracting and analyzing text from images.
        Analyze this image and extract all visible text content.
        Analysis type: ${analysisType}
        Preferred language: ${language === 'auto' ? 'Auto-detect' : language}

        Please provide a comprehensive analysis including:
        1. Extract ALL visible text from the image accurately
        2. Describe the image content and context
        3. Analyze the extracted text quality and formatting
        4. Provide text statistics and language detection
        5. Note any limitations or challenges in text extraction

        Return the analysis in a JSON object with these keys:
        - "image_description": (string) Brief description of the image and its content
        - "extracted_text": (string) All text extracted from the image, preserving formatting where possible
        - "text_analysis": (object) {
            "word_count": (number) Number of words extracted,
            "character_count": (number) Number of characters extracted,
            "language_detected": (string) Detected language of the text,
            "text_quality": (string, one of "High", "Medium", "Low") Quality of text extraction,
            "formatting_notes": (array of strings) Notes about text formatting, layout, fonts, etc.
          }
        - "confidence": (string, one of "High", "Medium", "Low", "Not Applicable") Your confidence in text extraction accuracy
        - "limitations": (array of strings) Any factors that affected text extraction quality
        - "disclaimer": (string) Standard disclaimer about AI text extraction limitations
      `;

      const response = await puter.ai.chat(imagePrompt, preprocessedDataUrl);
      
      if (!response?.message?.content) {
        throw new Error("AI analysis did not return content.");
      }

      const parsedResponse: ImageToTextReport = JSON.parse(cleanJsonString(response.message.content));
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

  const handleCopyText = () => {
    if (!analysisReport?.extracted_text) return;
    
    navigator.clipboard.writeText(analysisReport.extracted_text).then(() => {
      toast({ title: "Text Copied", description: "Extracted text has been copied to clipboard." });
    }).catch(() => {
      toast({ variant: "destructive", title: "Copy Failed", description: "Could not copy text to clipboard." });
    });
  };

  const handleDownloadReport = () => {
    if (!analysisReport) return;

    let reportString = "KLUTZ Image to Text Converter Report\n";
    reportString += "===================================\n\n";

    reportString += "Image Analysis:\n";
    reportString += "---------------\n";
    reportString += `${analysisReport.image_description}\n\n`;

    reportString += "Extracted Text:\n";
    reportString += "---------------\n";
    reportString += `${analysisReport.extracted_text || "No text extracted"}\n\n`;

    reportString += "Text Analysis:\n";
    reportString += "--------------\n";
    reportString += `Word Count: ${analysisReport.text_analysis.word_count}\n`;
    reportString += `Character Count: ${analysisReport.text_analysis.character_count}\n`;
    if (analysisReport.text_analysis.language_detected) {
      reportString += `Language Detected: ${analysisReport.text_analysis.language_detected}\n`;
    }
    reportString += `Text Quality: ${analysisReport.text_analysis.text_quality}\n\n`;

    if (analysisReport.text_analysis.formatting_notes && analysisReport.text_analysis.formatting_notes.length > 0) {
      reportString += "Formatting Notes:\n";
      reportString += "-----------------\n";
      analysisReport.text_analysis.formatting_notes.forEach(note => {
        reportString += `- ${note}\n`;
      });
      reportString += "\n";
    }

    if (analysisReport.limitations && analysisReport.limitations.length > 0) {
      reportString += "Limitations:\n";
      reportString += "------------\n";
      analysisReport.limitations.forEach(limitation => {
        reportString += `- ${limitation}\n`;
      });
      reportString += "\n";
    }

    reportString += "AI Confidence Level: " + analysisReport.confidence + "\n\n";
    reportString += "Disclaimer:\n";
    reportString += "-----------\n";
    reportString += analysisReport.disclaimer + "\n\n";
    
    reportString += "\nIMPORTANT: This report is AI-generated and for informational purposes only. Text extraction accuracy may vary based on image quality and text clarity.";

    const timestamp = new Date().toISOString().replace(/[:.-]/g, '').slice(0, 14);
    downloadTextFile(reportString, `KLUTZ_ImageToText_Report_${timestamp}.txt`);
  };

  const handleDownloadTextOnly = () => {
    if (!analysisReport?.extracted_text) return;
    
    const timestamp = new Date().toISOString().replace(/[:.-]/g, '').slice(0, 14);
    downloadTextFile(analysisReport.extracted_text, `KLUTZ_ExtractedText_${timestamp}.txt`);
  };

  return (
    <>
      <Head>
        <link rel="canonical" href="https://klutz.netlify.app/image-to-text" />
      </Head>
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="max-w-3xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary flex items-center">
            <FileText className="mr-3 h-8 w-8" />
            Image to Text Converter
          </CardTitle>
          <CardDescription>
            Upload an image containing text and extract all readable content using AI-powered text recognition.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert variant="default" className="bg-blue-50 border-blue-400 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            <Info className="h-5 w-5 text-blue-500" />
            <AlertTitle className="font-semibold">How it works</AlertTitle>
            <AlertDescription>
              Upload any image containing text (documents, screenshots, signs, handwriting, etc.) and our AI will extract and analyze all visible text content.
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
            <p className="text-sm text-muted-foreground mt-1">Upload a clear image containing text for best results.</p>
          </div>

          {imageDataUrl && <ImagePreview imageDataUrl={imageDataUrl} dataAiHint="image with text"/>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="analysis-type" className="text-lg font-medium">Analysis Type</Label>
              <Select value={analysisType} onValueChange={setAnalysisType}>
                <SelectTrigger id="analysis-type" className="w-full">
                  <SelectValue placeholder="Select analysis type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic Text Extraction</SelectItem>
                  <SelectItem value="detailed">Detailed Analysis</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="language" className="text-lg font-medium">Language Preference</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language" className="w-full">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto-detect</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="spanish">Spanish</SelectItem>
                  <SelectItem value="french">French</SelectItem>
                  <SelectItem value="german">German</SelectItem>
                  <SelectItem value="chinese">Chinese</SelectItem>
                  <SelectItem value="japanese">Japanese</SelectItem>
                  <SelectItem value="arabic">Arabic</SelectItem>
                  <SelectItem value="hindi">Hindi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={performAnalysis} 
            disabled={isLoading || !imageFile} 
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Extracting Text...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Extract Text from Image
              </>
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
                  Text Extraction Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-md mb-1">Image Description:</h4>
                  <p className="bg-muted/30 p-3 rounded-md">{analysisReport.image_description}</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-md">Extracted Text:</h4>
                    <Button onClick={handleCopyText} variant="outline" size="sm">
                      <Copy className="mr-1 h-3 w-3" />
                      Copy Text
                    </Button>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-md max-h-64 overflow-y-auto">
                    {analysisReport.extracted_text ? (
                      <pre className="whitespace-pre-wrap text-sm font-mono">{analysisReport.extracted_text}</pre>
                    ) : (
                      <p className="text-muted-foreground italic">No text was extracted from the image.</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md text-center">
                    <p className="text-sm text-muted-foreground">Words</p>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{analysisReport.text_analysis.word_count}</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md text-center">
                    <p className="text-sm text-muted-foreground">Characters</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">{analysisReport.text_analysis.character_count}</p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-md text-center">
                    <p className="text-sm text-muted-foreground">Quality</p>
                    <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{analysisReport.text_analysis.text_quality}</p>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-md text-center">
                    <p className="text-sm text-muted-foreground">Language</p>
                    <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{analysisReport.text_analysis.language_detected || 'N/A'}</p>
                  </div>
                </div>

                {analysisReport.text_analysis.formatting_notes && analysisReport.text_analysis.formatting_notes.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-md mb-1">Formatting Notes:</h4>
                    <ul className="list-disc pl-5 space-y-1 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md">
                      {analysisReport.text_analysis.formatting_notes.map((note, index) => (
                        <li key={index} className="text-yellow-700 dark:text-yellow-300">{note}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysisReport.limitations && analysisReport.limitations.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-md mb-1">Limitations:</h4>
                    <ul className="list-disc pl-5 space-y-1 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                      {analysisReport.limitations.map((limitation, index) => (
                        <li key={index} className="text-red-700 dark:text-red-300">{limitation}</li>
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

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button onClick={handleDownloadTextOnly} variant="outline" className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    Download Text Only
                  </Button>
                  <Button onClick={handleDownloadReport} variant="outline" className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    Download Full Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {!analysisReport && !isLoading && !error && (
            <div className="mt-6 p-4 border border-dashed rounded-md text-center text-muted-foreground">
              <Info className="mx-auto h-8 w-8 mb-2"/>
              <p>Upload an image containing text and click "Extract Text" to get AI-powered text extraction and analysis.</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground w-full text-center">
            This tool uses AI for text extraction. Accuracy may vary based on image quality and text clarity.
          </p>
        </CardFooter>
      </Card>

        <div className="max-w-3xl mx-auto mt-12 prose dark:prose-invert">
          <h1 className="font-headline text-4xl text-primary mb-6">Complete Guide to Image to Text Converters: Transform Pictures to Text Instantly</h1>

          <p className="mb-4">Need to extract text from images? Whether you're looking to convert text from pictures, transform picture to text, or simply need a reliable picture to text converter, AI-powered tools have revolutionized how we handle visual content. From converting pics to text for work projects to extracting text from pic files for personal use, these image to text solutions make digitizing visual content effortless.</p>

          <h2 className="font-headline text-2xl text-primary mt-8 mb-4">What is an Image to Text Converter?</h2>

          <p className="mb-4">An image to text converter is a powerful tool that uses artificial intelligence to convert text in picture format into editable digital text. These picture to text converters can transform any image containing text - whether it's a photo of a document, screenshot, or handwritten note - into searchable, editable content.</p>

          <p className="mb-4">Modern image text to text converters handle various scenarios: converting text picture to text, extracting text in image to text format, and even processing complex graphics to text converter tasks. The technology works by analyzing visual patterns to convert picture text to text with remarkable accuracy.</p>

          <h2 className="font-headline text-2xl text-primary mt-8 mb-4">Key Features When Choosing the Best Picture to Text Converter</h2>

          <p className="mb-4">When searching for the ideal image to text converter, consider these essential features:</p>

          <ul className="list-disc list-inside mb-4">
            <li><strong>Accuracy:</strong> How well the tool can convert text from picture sources while maintaining precision</li>
            <li><strong>Format Support:</strong> Ability to convert pics to text from various file types (JPEG, PNG, PDF)</li>
            <li><strong>Language Recognition:</strong> Multi-language support for converting text in a picture to text</li>
            <li><strong>Batch Processing:</strong> Convert multiple pictures to text simultaneously</li>
            <li><strong>Output Options:</strong> Various formats for your converted text from pictures</li>
            <li><strong>Handwriting Support:</strong> Advanced AI to convert picture in text scenarios including handwritten content</li>
            <li><strong>Speed:</strong> Quick processing to transform picture to text efficiently</li>
            <li><strong>Security:</strong> Safe handling of your image convert in text operations</li>
          </ul>

          <h2 className="font-headline text-2xl text-primary mt-8 mb-4">Best FREE Image to Text Converters</h2>

          <h2 className="font-headline text-2xl text-primary mt-8 mb-4">Klutz Image to Text Converter</h2>

          <p className="mb-4">Klutz stands out as an excellent free picture to text converter that excels at converting text from picture files with AI-powered precision. This image to text tool offers seamless conversion from image text to text format with detailed analysis capabilities that go beyond basic extraction.</p>

          <h3 className="font-headline text-xl text-primary mt-6 mb-3">Pros:</h3>
          <ul className="list-disc list-inside mb-4">
            <li>Completely free image to text conversion with no hidden costs</li>
            <li>Advanced AI technology for accurate text from pic extraction</li>
            <li>Clean, intuitive interface to convert text in picture to text</li>
            <li>Detailed analysis options beyond basic picture text to text conversion</li>
            <li>Auto-language detection for diverse text from pictures</li>
            <li>No registration required to convert picture to text</li>
          </ul>

          <h4 className="font-headline text-xl text-primary mt-6 mb-3">Cons:</h4>
          <ul className="list-disc list-inside mb-4">
            <li>Newer platform with growing user base</li>
            <li>Limited information on advanced batch processing features</li>
          </ul>

          <p className="mb-4"><strong>Price:</strong> Free</p>

          <h3 className="font-headline text-xl text-primary mt-6 mb-3">ImageToText.info</h3>

          <p className="mb-4">A popular online picture to text converter that provides straightforward image text to text conversion services.</p>

          <h4 className="font-headline text-xl text-primary mt-6 mb-3">Pros:</h4>
          <ul className="list-disc list-inside mb-4">
            <li>Simple interface for quick convert text from picture tasks</li>
            <li>Supports multiple image formats for picture to words converter needs</li>
            <li>Fast processing to transform picture to text</li>
            <li>No software installation required</li>
          </ul>

          <h4 className="font-headline text-xl text-primary mt-6 mb-3">Cons:</h4>
          <ul className="list-disc list-inside mb-4">
            <li>Basic features compared to AI-powered alternatives</li>
            <li>Limited advanced analysis for complex text from pic extraction</li>
            <li>Accuracy may vary with image quality</li>
          </ul>

          <p className="mb-4"><strong>Price:</strong> Free with potential premium features</p>

          <h3 className="font-headline text-xl text-primary mt-6 mb-3">ImageToText.io</h3>

          <p className="mb-4">Another established platform in the image to text converter market offering reliable picture text to text conversion.</p>

          <h4 className="font-headline text-xl text-primary mt-6 mb-3">Pros:</h4>
          <ul className="list-disc list-inside mb-4">
            <li>Established platform for convert pics to text operations</li>
            <li>Multiple language support for text in image to text conversion</li>
            <li>Decent accuracy for standard convert picture to text needs</li>
            <li>Web-based solution requiring no downloads</li>
          </ul>

          <h4 className="font-headline text-xl text-primary mt-6 mb-3">Cons:</h4>
          <ul className="list-disc list-inside mb-4">
            <li>Interface could be more user-friendly</li>
            <li>Limited advanced features for complex image convert in text scenarios</li>
            <li>Processing speed varies with server load</li>
          </ul>

          <p className="mb-4"><strong>Price:</strong> Free tier available</p>

          <h3 className="font-headline text-xl text-primary mt-6 mb-3">JPGToText.com</h3>

          <p className="mb-4">Specialized service focusing on converting text picture to text from JPEG and other common image formats.</p>

          <h4 className="font-headline text-xl text-primary mt-6 mb-3">Pros:</h4>
          <ul className="list-disc list-inside mb-4">
            <li>Specialized in JPEG format picture to text converter functionality</li>
            <li>Quick processing for basic convert text in picture to text needs</li>
            <li>Straightforward approach to text from pictures extraction</li>
            <li>Mobile-friendly for on-the-go convert picture in text tasks</li>
          </ul>

          <h4 className="font-headline text-xl text-primary mt-6 mb-3">Cons:</h4>
          <ul className="list-disc list-inside mb-4">
            <li>Limited to basic OCR without advanced AI features</li>
            <li>Fewer customization options for image text to text conversion</li>
            <li>May struggle with complex layouts or handwritten content</li>
          </ul>

          <p className="mb-4"><strong>Price:</strong> Free</p>

          <h3 className="font-headline text-xl text-primary mt-6 mb-3">Online OCR Tools (General Category)</h3>

          <p className="mb-4">Various free online OCR services provide basic image to text conversion capabilities.</p>

          <h4 className="font-headline text-xl text-primary mt-6 mb-3">Pros:</h4>
          <ul className="list-disc list-inside mb-4">
            <li>Multiple options available for picture to words converter needs</li>
            <li>No installation required for convert text from picture operations</li>
            <li>Usually free for basic text from pic extraction</li>
          </ul>

          <h4 className="font-headline text-xl text-primary mt-6 mb-3">Cons:</h4>
          <ul className="list-disc list-inside mb-4">
            <li>Varying quality and accuracy across different platforms</li>
            <li>Limited advanced features for complex convert pics to text scenarios</li>
            <li>Privacy concerns with uploading sensitive documents</li>
          </ul>

          <p className="mb-4"><strong>Price:</strong> Typically free with optional premium features</p>

          <h2 className="font-headline text-2xl text-primary mt-8 mb-4">TL;DR</h2>

          <p className="mb-4">Image to text converters have transformed how we convert text from pictures and transform picture to text content. When choosing a picture to text converter, focus on accuracy, ease of use, and compatibility with your image text to text conversion needs.</p>

          <p className="mb-4">For reliable free conversion with advanced AI capabilities, Klutz's Image to Text Converter excels at converting text in picture format with superior accuracy and detailed analysis. ImageToText.info, ImageToText.io, and JPGToText.com offer solid alternatives for basic convert picture text to text functionality.</p>

          <p className="mb-4">Whether you need occasional text from pic extraction or regular picture to words converter operations, there's an image to text solution that matches your requirements for converting pics to text efficiently and accurately.</p>

        </div>
      </div>
    </div>
  );
    </>
)}    