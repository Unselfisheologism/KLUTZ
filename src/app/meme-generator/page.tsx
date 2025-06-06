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
import { Loader2, Sparkles, AlertTriangle, Info, Download, ImageIcon } from 'lucide-react';
import type { MemeGenerationReport } from '@/types/meme-generator';
import { downloadTextFile } from '@/lib/utils';

// Training images for the AI
const MEME_TRAINING_IMAGES = [
  "https://res.cloudinary.com/ddz3nsnq1/image/upload/v1749186685/hgnbtnmvvnqggpqzfvta.jpg",
  "https://res.cloudinary.com/ddz3nsnq1/image/upload/v1749186719/images_hlbdy9.jpg",
  "https://res.cloudinary.com/ddz3nsnq1/image/upload/v1749186744/images_xs96tf.jpg",
  "https://res.cloudinary.com/ddz3nsnq1/image/upload/v1749186776/images_igluvw.jpg",
  "https://res.cloudinary.com/ddz3nsnq1/image/upload/v1749186822/images_nagwga.jpg"
];

const cleanJsonString = (rawString: string): string => {
  let cleanedString = rawString.trim();
  if (cleanedString.startsWith("```json") && cleanedString.endsWith("```")) {
    cleanedString = cleanedString.substring(7, cleanedString.length - 3).trim();
  } else if (cleanedString.startsWith("```") && cleanedString.endsWith("```")) {
    cleanedString = cleanedString.substring(3, cleanedString.length - 3).trim();
  }
  return cleanedString;
};

export default function MemeGeneratorPage() {
  const [description, setDescription] = useState<string>('');
  const [style, setStyle] = useState<string>('');
  const [textPlacement, setTextPlacement] = useState<string>('');
  const [additionalContext, setAdditionalContext] = useState<string>('');
  
  const [generatedMeme, setGeneratedMeme] = useState<MemeGenerationReport | null>(null);
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

  const generateMeme = async () => {
    if (!description.trim()) {
      toast({ variant: "destructive", title: "Missing Input", description: "Please provide a description of the meme you want to generate." });
      return;
    }

    setIsLoading(true);
    setGeneratedMeme(null);
    setError(null);
    toast({ title: "Generation Started", description: "AI is analyzing your request and generating the meme..." });

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

      // First, analyze training images to understand meme style
      const styleAnalysisPromises = MEME_TRAINING_IMAGES.map(imageUrl => 
        puter.ai.chat("Analyze this meme image. Focus on: 1) Visual style 2) Text placement 3) Humor elements 4) Overall composition. Provide insights in a concise format.", imageUrl)
      );

      const styleAnalyses = await Promise.all(styleAnalysisPromises);
      
      // Process user's request with GPT-4
      const requestPrompt = `
        Based on the user's meme request: "${description}"
        Style preference: "${style || 'Not specified'}"
        Text placement preference: "${textPlacement || 'Not specified'}"
        Additional context: "${additionalContext || 'None provided'}"

        Create a DALL-E 3 prompt that will generate a meme image matching these requirements.
        The prompt should be clear, specific, and focus on visual elements.
        Avoid any text in the image itself - we'll add that separately.
        
        Return a JSON object with:
        {
          "dalle_prompt": "Your detailed prompt for DALL-E 3 (focus on visual elements only)",
          "style_notes": "Brief description of the chosen style",
          "text_placement": "Specific instructions for text placement"
        }
      `;

      const requestResponse = await puter.ai.chat(requestPrompt, { model: 'gpt-4o' });
      if (!requestResponse?.message?.content) {
        throw new Error("Failed to process meme request.");
      }

      const parsedRequest = JSON.parse(cleanJsonString(requestResponse.message.content));

      // Generate the meme image using DALL-E 3
      try {
        const imageResponse = await puter.ai.txt2img(parsedRequest.dalle_prompt);
        if (!imageResponse) {
          throw new Error("Image generation returned empty response");
        }

        const generatedReport: MemeGenerationReport = {
          generated_image: imageResponse.src,
          prompt_used: parsedRequest.dalle_prompt,
          style_applied: parsedRequest.style_notes,
          confidence: 'High',
          disclaimer: "AI-generated meme. Results may vary. For entertainment purposes only."
        };

        setGeneratedMeme(generatedReport);
        toast({ 
          title: "Meme Generated!", 
          variant: "default", 
          className: "bg-green-500 text-white dark:bg-green-600" 
        });
      } catch (imageError: any) {
        console.error("Image generation error:", imageError);
        throw new Error("Failed to generate image. This could be due to content restrictions or technical limitations. Please try a different description or try again later.");
      }

    } catch (err: any) {
      console.error("Generation error:", err);
      let errorMessage = "An error occurred during meme generation.";
      if (err instanceof Error) errorMessage = err.message;
      else if (typeof err === 'string') errorMessage = err;
      else if (err.error && err.error.message) errorMessage = err.error.message;
      setError(errorMessage);
      toast({ 
        variant: "destructive", 
        title: "Generation Failed", 
        description: errorMessage 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadMeme = async () => {
    if (!generatedMeme) return;

    // Download the image
    try {
      const response = await fetch(generatedMeme.generated_image);
      const blob = await response.blob();
      const imageUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `KLUTZ_Meme_${new Date().toISOString().replace(/[:.-]/g, '').slice(0, 14)}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(imageUrl);
    } catch (error) {
      console.error('Error downloading image:', error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Failed to download the meme image. Please try again."
      });
    }

    // Download the report
    let reportString = "KLUTZ AI Meme Generator Report\n";
    reportString += "================================\n\n";

    reportString += "Meme Details:\n";
    reportString += "-------------\n";
    reportString += `Description: ${description}\n`;
    if (style) reportString += `Style: ${style}\n`;
    if (textPlacement) reportString += `Text Placement: ${textPlacement}\n`;
    if (additionalContext) reportString += `Additional Context: ${additionalContext}\n\n`;

    reportString += "Generation Details:\n";
    reportString += "-----------------\n";
    reportString += `Prompt Used: ${generatedMeme.prompt_used}\n`;
    reportString += `Style Applied: ${generatedMeme.style_applied}\n`;
    reportString += `AI Confidence: ${generatedMeme.confidence}\n\n`;

    reportString += "Generated Image:\n";
    reportString += "---------------\n";
    reportString += `${generatedMeme.generated_image}\n\n`;

    reportString += "Disclaimer:\n";
    reportString += "-----------\n";
    reportString += generatedMeme.disclaimer;

    const timestamp = new Date().toISOString().replace(/[:.-]/g, '').slice(0, 14);
    downloadTextFile(reportString, `KLUTZ_MemeGenerator_Report_${timestamp}.txt`);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="max-w-3xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary flex items-center">
            <Sparkles className="mr-3 h-8 w-8" />
            AI Meme Generator
          </CardTitle>
          <CardDescription>
            Generate unique and engaging memes using AI trained on popular meme styles.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert variant="default" className="bg-yellow-50 border-yellow-400 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <AlertTitle className="font-semibold">Important Note</AlertTitle>
            <AlertDescription>
              The AI will generate a meme based on your description. For best results, be specific about the visual elements and humor you want to incorporate.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <Label htmlFor="description" className="text-lg font-medium">Meme Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the meme you want to generate in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div>
              <Label htmlFor="style" className="text-lg font-medium">Meme Style (Optional)</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger id="style" className="w-full">
                  <SelectValue placeholder="Choose a meme style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="classic">Classic Format</SelectItem>
                  <SelectItem value="modern">Modern/Minimalist</SelectItem>
                  <SelectItem value="dramatic">Dramatic/Intense</SelectItem>
                  <SelectItem value="wholesome">Wholesome</SelectItem>
                  <SelectItem value="surreal">Surreal/Abstract</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="text-placement" className="text-lg font-medium">Text Placement (Optional)</Label>
              <Select value={textPlacement} onValueChange={setTextPlacement}>
                <SelectTrigger id="text-placement" className="w-full">
                  <SelectValue placeholder="Choose text placement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top">Top Text</SelectItem>
                  <SelectItem value="bottom">Bottom Text</SelectItem>
                  <SelectItem value="both">Top and Bottom</SelectItem>
                  <SelectItem value="overlay">Text Overlay</SelectItem>
                  <SelectItem value="none">No Text</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="additional-context" className="text-lg font-medium">Additional Context (Optional)</Label>
              <Textarea
                id="additional-context"
                placeholder="Any additional context or specific requirements..."
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
              />
            </div>
          </div>

          <Button 
            onClick={generateMeme} 
            disabled={isLoading || !description.trim()} 
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Meme...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Meme
              </>
            )}
          </Button>

          {error && !isLoading && (
            <Alert variant="destructive" className="mt-6">
              <AlertTriangle className="h-5 w-5" />
              <AlertTitle>Generation Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {generatedMeme && !isLoading && !error && (
            <Card className="mt-6 shadow-md">
              <CardHeader>
                <CardTitle className="font-headline text-xl flex items-center">
                  <ImageIcon className="mr-2 h-6 w-6 text-primary" />
                  Generated Meme
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg overflow-hidden">
                  <img 
                    src={generatedMeme.generated_image} 
                    alt="Generated meme"
                    className="w-full h-auto"
                  />
                </div>

                <div>
                  <h4 className="font-semibold text-md mb-1">Style Notes:</h4>
                  <p className="bg-muted/30 p-3 rounded-md">{generatedMeme.style_applied}</p>
                </div>

                <Alert variant="default" className="text-xs bg-blue-50 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300">
                  <Info className="h-4 w-4 text-blue-500" />
                  <AlertTitle className="font-medium">AI Note</AlertTitle>
                  <AlertDescription>{generatedMeme.disclaimer}</AlertDescription>
                </Alert>

                <div className="flex flex-col gap-2">
                  <Button onClick={handleDownloadMeme} variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Download Meme & Report
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Downloads both the meme image and generation report
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {!generatedMeme && !isLoading && !error && (
            <div className="mt-6 p-4 border border-dashed rounded-md text-center text-muted-foreground">
              <Info className="mx-auto h-8 w-8 mb-2"/>
              <p>Describe your meme idea and click "Generate" to create a unique AI-generated meme.</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground w-full text-center">
            This tool uses AI for meme generation. Results may vary and are intended for entertainment purposes only.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}