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
import type { TextToImageGenerationReport } from '@/types/text-to-image-generator';
import { getLaymanErrorMessage } from '@/lib/error-utils';
import { downloadTextFile } from '@/lib/utils';

const cleanJsonString = (rawString: string): string => {
  let cleanedString = rawString.trim();
  if (cleanedString.startsWith("```json") && cleanedString.endsWith("```")) {
    cleanedString = cleanedString.substring(7, cleanedString.length - 3).trim();
  } else if (cleanedString.startsWith("```") && cleanedString.endsWith("```")) {
    cleanedString = cleanedString.substring(3, cleanedString.length - 3).trim();
  }
  return cleanedString;
};

export default function TextToImageGeneratorPage() {
  const [description, setDescription] = useState<string>('');
  const [style, setStyle] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<string>('');
  const [additionalContext, setAdditionalContext] = useState<string>('');
  
  const [generatedImage, setGeneratedImage] = useState<TextToImageGenerationReport | null>(null);
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

  const generateImage = async () => {
    if (!description.trim()) {
      toast({ variant: "destructive", title: "Missing Input", description: "Please provide a description of the image you want to generate." });
      return;
    }

    setIsLoading(true);
    setGeneratedImage(null);
    setError(null);
    toast({ title: "Generation Started", description: "AI is analyzing your request and generating the image..." });

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

      // Process user's request with GPT-4
      const requestPrompt = `
        Based on the user's image generation request: "${description}"
        Style preference: "${style || 'Not specified'}"
        Aspect ratio preference: "${aspectRatio || 'Not specified'}"
        Additional context: "${additionalContext || 'None provided'}"

        Create a detailed DALL-E 3 prompt that will generate a high-quality image matching these requirements.
        The prompt should be clear, specific, and focus on visual elements that will create an impressive result.
        
        Return a JSON object with:
        {
          "dalle_prompt": "Your detailed prompt for DALL-E 3",
          "style_notes": "Brief description of the chosen style and approach"
        }
      `;

      const requestResponse = await puter.ai.chat(requestPrompt, { model: 'gpt-4o' });
      if (!requestResponse?.message?.content) {
        throw new Error("Failed to process image generation request.");
      }

      const parsedRequest = JSON.parse(cleanJsonString(requestResponse.message.content));

      // Generate the image using DALL-E 3
      try {
        const imageResponse = await puter.ai.txt2img(parsedRequest.dalle_prompt);
        if (!imageResponse) {
          throw new Error("Image generation returned empty response");
        }

        const generatedReport: TextToImageGenerationReport = {
          generated_image: imageResponse.src,
          prompt_used: parsedRequest.dalle_prompt,
          style_applied: parsedRequest.style_notes,
          confidence: 'High',
          disclaimer: "AI-generated image. Results may vary. For creative and educational purposes."
        };

        setGeneratedImage(generatedReport);
        toast({ 
          title: "Image Generated!", 
          variant: "default", 
          className: "bg-green-500 text-white dark:bg-green-600" 
        });
      } catch (imageError: any) {
        console.error("Image generation error:", imageError);
        throw new Error("Failed to generate image. This could be due to content restrictions or technical limitations. Please try a different description or try again later.");
      }

    } catch (err: any) {
      console.error("Generation error:", err);
      const friendlyErrorMessage = getLaymanErrorMessage(err);
      setError(friendlyErrorMessage);
      toast({ 
        variant: "destructive", 
        title: "Generation Failed", 
        description: friendlyErrorMessage 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadImage = async () => {
    if (!generatedImage) return;

    // Download the image
    try {
      const response = await fetch(generatedImage.generated_image);
      const blob = await response.blob();
      const imageUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `KLUTZ_Generated_Image_${new Date().toISOString().replace(/[:.-]/g, '').slice(0, 14)}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(imageUrl);
    } catch (error) {
      console.error('Error downloading image:', error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Failed to download the generated image. Please try again."
      });
    }

    // Download the report
    let reportString = "KLUTZ AI Text-to-Image Generator Report\n";
    reportString += "======================================\n\n";

    reportString += "Image Generation Details:\n";
    reportString += "-------------------------\n";
    reportString += `Description: ${description}\n`;
    if (style) reportString += `Style: ${style}\n`;
    if (aspectRatio) reportString += `Aspect Ratio: ${aspectRatio}\n`;
    if (additionalContext) reportString += `Additional Context: ${additionalContext}\n\n`;

    reportString += "Generation Details:\n";
    reportString += "-----------------\n";
    reportString += `Prompt Used: ${generatedImage.prompt_used}\n`;
    reportString += `Style Applied: ${generatedImage.style_applied}\n`;
    reportString += `AI Confidence: ${generatedImage.confidence}\n\n`;

    reportString += "Generated Image:\n";
    reportString += "---------------\n";
    reportString += `${generatedImage.generated_image}\n\n`;

    reportString += "Disclaimer:\n";
    reportString += "-----------\n";
    reportString += generatedImage.disclaimer;

    const timestamp = new Date().toISOString().replace(/[:.-]/g, '').slice(0, 14);
    downloadTextFile(reportString, `KLUTZ_TextToImageGenerator_Report_${timestamp}.txt`);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="max-w-3xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary flex items-center">
            <Sparkles className="mr-3 h-8 w-8" />
            AI Text-to-Image Generator
          </CardTitle>
          <CardDescription>
            Generate high-quality images from text descriptions using advanced AI technology.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert variant="default" className="bg-blue-50 border-blue-400 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            <Info className="h-5 w-5 text-blue-500" />
            <AlertTitle className="font-semibold">How it works</AlertTitle>
            <AlertDescription>
              Describe the image you want to create in detail. The AI will generate a unique, high-quality image based on your description. Be specific about colors, style, composition, and mood for best results.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <Label htmlFor="description" className="text-lg font-medium">Image Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the image you want to generate in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div>
              <Label htmlFor="style" className="text-lg font-medium">Art Style (Optional)</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger id="style" className="w-full">
                  <SelectValue placeholder="Choose an art style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="photorealistic">Photorealistic</SelectItem>
                  <SelectItem value="digital-art">Digital Art</SelectItem>
                  <SelectItem value="oil-painting">Oil Painting</SelectItem>
                  <SelectItem value="watercolor">Watercolor</SelectItem>
                  <SelectItem value="sketch">Pencil Sketch</SelectItem>
                  <SelectItem value="cartoon">Cartoon Style</SelectItem>
                  <SelectItem value="anime">Anime Style</SelectItem>
                  <SelectItem value="abstract">Abstract Art</SelectItem>
                  <SelectItem value="vintage">Vintage Style</SelectItem>
                  <SelectItem value="minimalist">Minimalist</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="aspect-ratio" className="text-lg font-medium">Aspect Ratio (Optional)</Label>
              <Select value={aspectRatio} onValueChange={setAspectRatio}>
                <SelectTrigger id="aspect-ratio" className="w-full">
                  <SelectValue placeholder="Choose aspect ratio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="square">Square (1:1)</SelectItem>
                  <SelectItem value="landscape">Landscape (16:9)</SelectItem>
                  <SelectItem value="portrait">Portrait (9:16)</SelectItem>
                  <SelectItem value="wide">Wide (21:9)</SelectItem>
                  <SelectItem value="classic">Classic (4:3)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="additional-context" className="text-lg font-medium">Additional Context (Optional)</Label>
              <Textarea
                id="additional-context"
                placeholder="Any additional details, mood, lighting, or specific requirements..."
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
              />
            </div>
          </div>

          <Button 
            onClick={generateImage} 
            disabled={isLoading || !description.trim()} 
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Image...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Image
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

          {generatedImage && !isLoading && !error && (
            <Card className="mt-6 shadow-md">
              <CardHeader>
                <CardTitle className="font-headline text-xl flex items-center">
                  <ImageIcon className="mr-2 h-6 w-6 text-primary" />
                  Generated Image
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg overflow-hidden">
                  <img 
                    src={generatedImage.generated_image} 
                    alt="Generated image"
                    className="w-full h-auto"
                  />
                </div>

                <div>
                  <h4 className="font-semibold text-md mb-1">Style & Approach:</h4>
                  <p className="bg-muted/30 p-3 rounded-md">{generatedImage.style_applied}</p>
                </div>

                <Alert variant="default" className="text-xs bg-blue-50 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300">
                  <Info className="h-4 w-4 text-blue-500" />
                  <AlertTitle className="font-medium">AI Note</AlertTitle>
                  <AlertDescription>{generatedImage.disclaimer}</AlertDescription>
                </Alert>

                <div className="flex flex-col gap-2">
                  <Button onClick={handleDownloadImage} variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Download Image & Report
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Downloads both the generated image and generation report
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {!generatedImage && !isLoading && !error && (
            <div className="mt-6 p-4 border border-dashed rounded-md text-center text-muted-foreground">
              <Info className="mx-auto h-8 w-8 mb-2"/>
              <p>Describe your image idea and click "Generate" to create a unique AI-generated image.</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground w-full text-center">
            This tool uses AI for image generation. Results may vary and are intended for creative and educational purposes.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}