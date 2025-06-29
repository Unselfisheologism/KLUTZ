'use client';

import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Sparkles, AlertTriangle, Info, ImageIcon } from 'lucide-react';
import type { ImageAnalysisResult } from '@/types/text-to-image-generator'; // Assuming this type is suitable
import { getLaymanErrorMessage } from '@/lib/error-utils';
import { preprocessImage } from '@/lib/image-utils';

const cleanJsonString = (rawString: string): string => {
  let cleanedString = rawString.trim();
  if (cleanedString.startsWith("json") && cleanedString.endsWith(" ")) {
        cleanedString = cleanedString.substring(7, cleanedString.length - 3).trim();
      } else if (cleanedString.startsWith(" ") && cleanedString.endsWith("")) 
          {
            cleanedString = cleanedString.substring(3, cleanedString.length - 3).trim();
          }
      return cleanedString;
      
};

export default function ImageToPromptGeneratorPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [inputType, setInputType] = useState<'image' | 'text'>('image');
  const [textInput, setTextInput] = useState<string>('');
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedImage(null);
      setGeneratedPrompt('');
      setError(null);
    } else {
      setSelectedImage(file);
      setGeneratedPrompt('');
      setError(null);
    }
  };

  const analyzeContentAndGeneratePrompt = async () => {
    if (inputType === 'image' && !selectedImage) {
      toast({ variant: "destructive", title: "Missing Image", description: "Please upload an image to analyze or switch to Text Analysis." });
      return;
    }
    if (inputType === 'text' && !textInput.trim()) {
      toast({ variant: "destructive", title: "Missing Text", description: "Please enter text to analyze or switch to Image Analysis." });
      setTextInput(''); // Clear potentially whitespace-only input
      return
    }

    setIsLoading(true);
    setError(null);
    setGeneratedPrompt('');
    toast({ title: "Analyzing Image", description: "AI is analyzing your image to generate a prompt..." });

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

      let analysisResponse;

      if (inputType === 'image' && selectedImage) {
        const base64Image = await preprocessImage(selectedImage, 1024);
        if (!base64Image) {
          throw new Error("Failed to preprocess image.");
        }

        const imagePrompt = `Analyze the following image and generate a detailed, high-quality DALL-E 3 text-to-image prompt to recreate a similar image. Focus on key visual elements, style, mood, lighting, and composition. Provide the prompt directly as a string in a JSON object like this: {"dalle_prompt": "Your generated prompt here"}.`;

        analysisResponse = await puter.ai.chat(imagePrompt, base64Image);

      } else if (inputType === 'text' && textInput.trim()) {
        const textAnalysisPrompt = `Analyze the following text and generate a creative and detailed prompt for a text generation model (like GPT-4) that captures the core themes, style, and mood of the input text. The generated prompt should be suitable for creating similar textual content. Structure the output as a JSON object like this: {"dalle_prompt": "Your generated prompt here"}. Even though you are returning the output as a JSON object of {"dalle_prompt": "Your generated prompt here"}, the 'dalle_prompt' doesn't mean you have to give a prompt for DALL-E. Text: "${textInput}"`;

        analysisResponse = await puter.ai.chat(textAnalysisPrompt);
      }

      if (!analysisResponse?.message?.content) {
        throw new Error("Failed to analyze image and generate prompt: Empty response from AI.");
      }

      const rawContent = cleanJsonString(analysisResponse.message.content);

      try {
        const parsedAnalysis: ImageAnalysisResult = JSON.parse(rawContent);
        if (parsedAnalysis.dalle_prompt) {
          setGeneratedPrompt(parsedAnalysis.dalle_prompt);
          toast({ title: "Prompt Generated", description: "Analysis complete. Prompt is ready for review." });
        } else {
          console.error("Parsed JSON did not contain 'dalle_prompt':", parsedAnalysis);
          throw new Error("AI response missing 'dalle_prompt'. Please try again.");
        }
      } catch (jsonError) {
        console.error("Failed to parse AI response as JSON:", rawContent);
        throw new Error("AI returned an invalid format. Please try again.");
      }
    } catch (err: any) {
      console.error("Analysis error:", err);
      setError(getLaymanErrorMessage("Failed to analyze image and generate prompt."));
      toast({ variant: "destructive", title: "Analysis Failed", description: "Failed to analyze image and generate prompt." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <link rel="canonical" href="https://klutz.netlify.app/image-to-prompt-generator" />
      </Head>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="max-w-3xl mx-auto shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline text-3xl text-primary flex items-center">
              <Sparkles className="mr-3 h-8 w-8" />
              AI Image to Prompt Generator
            </CardTitle>
            <CardDescription>
              Upload an image and let AI analyze it to generate a text prompt for image generation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert variant="default" className="bg-blue-50 border-blue-400 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              <Info className="h-5 w-5 text-blue-500" />
              <AlertTitle className="font-semibold">How it works</AlertTitle>
              {inputType === 'image' ? (
              <AlertDescription>
                Upload an image, and the AI will analyze its visual elements, style, and mood to create a detailed text prompt you can use for generating similar images.
              </AlertDescription>
              ) : (
                <AlertDescription>
                Enter text describing the image you want to generate, and the AI will refine it into a detailed text prompt suitable for image generation models.
              </AlertDescription>
              )}
            </Alert>

            <div className="space-y-4">
               <div className="flex items-center justify-center space-x-4">
                <Button
                  variant={inputType === 'image' ? 'default' : 'outline'}
                  onClick={() => {
                    setInputType('image');
                    setTextInput(''); // Clear text when switching to image
                    setGeneratedPrompt('');
                    setError(null);
                  }}
                >
                  Image Analysis
                </Button>
                <Button
                  variant={inputType === 'text' ? 'default' : 'outline'}
                  onClick={() => {
                    setInputType('text');
                    setSelectedImage(null); // Clear image when switching to text
                    setGeneratedPrompt('');
                    setError(null);
                  }}>Text Analysis</Button>
              </div>
            {inputType === 'image' && (
              <div>
                <Label htmlFor="image-upload" className="text-lg font-medium">Upload Image</Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
                {selectedImage && (
                  <p className="text-sm text-muted-foreground mt-1">Selected: {selectedImage.name}</p>
                )}
              </div>
            )}

             {inputType === 'text' && (
                <div className="space-y-2">
                  <Label htmlFor="text-input" className="text-lg font-medium">Enter Text</Label>
                  <Textarea id="text-input" placeholder="Describe the image you want to create..." value={textInput} onChange={(e) => setTextInput(e.target.value)} className="min-h-[100px]" />
                </div>
              )}


              <Button
                onClick={analyzeContentAndGeneratePrompt}
                disabled={isLoading || (inputType === 'image' && !selectedImage) || (inputType === 'text' && !textInput.trim())}
                className="w-full"
                variant={inputType === 'image' ? 'default' : 'secondary'}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Image...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Prompt
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

              {generatedPrompt && !isLoading && !error && (
                <div className="mt-6 space-y-2">
                  <Label htmlFor="generated-prompt" className="text-lg font-medium">Generated Prompt</Label>
                  <Textarea
                    id="generated-prompt"
                    value={generatedPrompt}
                    readOnly
                    className="min-h-[150px] font-mono text-sm bg-muted/30"
                  />
                </div>
              )}

              {!generatedPrompt && !isLoading && !error && inputType === 'image' && !selectedImage && (
                <div className="mt-6 p-4 border border-dashed rounded-md text-center text-muted-foreground">
                  <Info className="mx-auto h-8 w-8 mb-2" />
                  <p>Upload an image to generate a text prompt.</p>
                </div>
              )}
               {!generatedPrompt && !isLoading && !error && inputType === 'image' && selectedImage && (
                <div className="mt-6 p-4 border border-dashed rounded-md text-center text-muted-foreground">
                  <Info className="mx-auto h-8 w-8 mb-2" />
                  <p>Click "Generate Prompt" to analyze the uploaded image.</p>
                </div>  
              )}
            </div>
          </CardContent>
          <CardDescription className="text-xs text-muted-foreground w-full text-center pb-4 px-6">
            AI analysis may not always capture every nuance of the image. Review and refine the generated prompt as needed.
          </CardDescription>
        </Card>
      </div>
    </>
  );
}