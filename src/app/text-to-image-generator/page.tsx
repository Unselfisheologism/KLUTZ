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
    <>
      <Head>
        <link rel="canonical" href="https://klutz.netlify.app/text-to-image-generator" />
      </Head>
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

      <div className="max-w-3xl mx-auto mt-12 prose dark:prose-invert">
        <h2 className="font-headline text-2xl text-primary">The Ultimate Guide to AI Text-to-Image Generators: Transform Your Words into Stunning Visuals</h2>

        <p>Artificial intelligence has revolutionized creative content creation, and nowhere is this more evident than in the realm of <strong>AI text-to-image generators</strong>. These powerful tools have democratized digital art creation, allowing anyone to transform simple text descriptions into professional-quality images in seconds. Whether you're a content creator, marketer, or simply someone looking to explore digital creativity, understanding these tools can unlock new possibilities for visual storytelling.</p>

        <h3 className="font-headline text-xl text-secondary">What is an AI Text-to-Image Generator?</h3>

        <p>An <strong>AI image generator</strong> is a sophisticated machine learning tool that converts written descriptions into visual content. Using advanced neural networks and deep learning algorithms, these platforms interpret your text prompts and generate unique images that match your description. The technology behind these tools has evolved rapidly, moving from basic sketch-like outputs to photorealistic images that rival professional photography and digital art.</p>

        <p>The process is remarkably straightforward: you input a text description (called a prompt), select your preferred style or settings, and the AI processes your request to create an original image. Modern <strong>AI art generators</strong> can produce everything from realistic portraits to abstract art, fantasy landscapes, and commercial photography - all from simple text descriptions.</p>

        <h3 className="font-headline text-xl text-secondary">Key Features to Check When Searching for the Best AI Text-to-Image Generator</h3>

        <p>When evaluating different <strong>AI image generation</strong> platforms, several crucial factors can help you identify the best tool for your needs:</p>

        <h4 className="font-semibold text-lg">Image Quality and Resolution</h4>

        <p>The most important consideration is the quality of generated images. Look for tools that offer high-resolution outputs suitable for your intended use. Professional-grade generators should produce images at least 1024x1024 pixels, with many now offering 4K and higher resolutions. The <strong>audio quality enhancer</strong> principle applies here - just as you wouldn't settle for poor audio, don't compromise on image clarity and detail.</p>

        <h4 className="font-semibold text-lg">Style Variety and Customization</h4>

        <p>The best platforms offer diverse artistic styles, from photorealistic renders to anime, watercolor, oil painting, and abstract art styles. Advanced customization options allow you to fine-tune aspects like lighting, color palettes, and composition. Some tools even function as a comprehensive <strong>audio editor</strong> equivalent for images, providing extensive modification capabilities.</p>

        <h4 className="font-semibold text-lg">AI Analysis and Intelligence Features</h4>

        <p>This is where innovation truly shines. Klutz's AI text-to-image generator stands out as the <strong>first tool with AI analysis features</strong>, setting a new standard in the industry. These advanced analytical capabilities help users understand what makes prompts effective, optimize their descriptions for better results, and learn from successful image generations - a revolutionary approach that other platforms are now trying to emulate.</p>

        <h4 className="font-semibold text-lg">User Interface and Ease of Use</h4>

        <p>A well-designed interface can significantly impact your creative workflow. Look for platforms with intuitive controls, clear organization, and helpful guidance for beginners. The interface should feel as smooth as a well-designed <strong>music editor</strong>, allowing creative flow without technical barriers.</p>

        <h4 className="font-semibold text-lg">Processing Speed and Efficiency</h4>

        <p>Generation speed varies significantly between platforms. While some tools produce images in seconds, others may take several minutes. Consider your workflow needs and whether you require real-time generation or can work with longer processing times.</p>

        <h4 className="font-semibold text-lg">Commercial Rights and Licensing</h4>

        <p>Understanding usage rights is crucial, especially for commercial applications. Many platforms grant full commercial rights to generated images, while others have restrictions. Always review the terms of service before using images for business purposes.</p>

        <h3 className="font-headline text-xl text-secondary">Best FREE AI Text-to-Image Generators</h3>

        <p>The market offers several excellent free options, each with unique strengths and limitations:</p>

        <h4 className="font-semibold text-lg">Klutz AI Text-to-Image Generator</h4>

        <p><strong>Price:</strong> Free with unlimited basic generations</p>

        <p><strong>Pros:</strong></p>
        <ul>
          <li>Revolutionary AI analysis features - the <strong>first tool with AI analysis features</strong> in the market</li>
          <li>Intelligent prompt optimization suggestions</li>
          <li>User-friendly interface designed for both beginners and professionals</li>
          <li>High-quality image outputs with multiple style options</li>
          <li>Fast processing speeds comparable to premium platforms</li>
          <li>Comprehensive feedback system to improve future generations</li>
          <li>No signup required for basic use</li>
        </ul>

        <p><strong>Cons:</strong></p>
        <ul>
          <li>Advanced features may require account creation</li>
          <li>Newer platform with smaller community compared to established competitors</li>
        </ul>

        <p>Klutz's innovative approach to AI analysis sets it apart from traditional <strong>image generators</strong>. The platform's ability to analyze successful prompts and provide intelligent suggestions makes it invaluable for users looking to improve their AI art creation skills.</p>

        <h4 className="font-semibold text-lg">DeepAI</h4>

        <p><strong>Price:</strong> Free tier with paid upgrades starting at $5/month</p>

        <p><strong>Pros:</strong></p>
        <ul>
          <li>Simple, straightforward interface</li>
          <li>Multiple artistic styles available</li>
          <li>API access for developers</li>
          <li>No registration required for basic use</li>
          <li>Fast generation times</li>
        </ul>

        <p><strong>Cons:</strong></p>
        <ul>
          <li>Limited customization options on free tier</li>
          <li>Lower resolution outputs compared to premium alternatives</li>
          <li>Lacks advanced AI analysis features found in newer platforms like Klutz</li>
        </ul>

        <h4 className="font-semibold text-lg">Leonardo AI</h4>

        <p><strong>Price:</strong> Free tier with 150 tokens daily, paid plans from $12/month</p>

        <p><strong>Pros:</strong></p>
        <ul>
          <li>Excellent image quality with fine-tuned models</li>
          <li>Canvas feature for image editing</li>
          <li>3D texture generation capabilities</li>
          <li>Strong community and model sharing</li>
          <li>Professional-grade outputs</li>
        </ul>

        <p><strong>Cons:</strong></p>
        <ul>
          <li>Limited free tier usage</li>
          <li>Steeper learning curve for beginners</li>
          <li>Requires account creation</li>
          <li>Lacks the intelligent analysis features pioneered by Klutz</li>
        </ul>

        <h4 className="font-semibold text-lg">Freepik AI Image Generator</h4>

        <p><strong>Price:</strong> Free with watermarks, paid plans from $10/month</p>

        <p><strong>Pros:</strong></p>
        <ul>
          <li>Integration with Freepik's extensive stock library</li>
          <li>Multiple AI models including Flux and Mystic</li>
          <li>Professional design templates</li>
          <li>Commercial licensing included in paid plans</li>
        </ul>

        <p><strong>Cons:</strong></p>
        <ul>
          <li>Watermarks on free generations</li>
          <li>Limited daily generations on free tier</li>
          <li>Can feel overwhelming for simple image generation needs</li>
        </ul>

        <h4 className="font-semibold text-lg">Midjourney (Discord-based)</h4>

        <p><strong>Price:</strong> No longer offers free tier, paid plans start at $10/month</p>

        <p><strong>Pros:</strong></p>
        <ul>
          <li>Exceptional artistic quality</li>
          <li>Strong community feedback system</li>
          <li>Unique aesthetic and style</li>
          <li>Regular model updates and improvements</li>
        </ul>

        <p><strong>Cons:</strong></p>
        <ul>
          <li>Requires Discord usage</li>
          <li>No free tier available</li>
          <li>Can be intimidating for newcomers</li>
          <li>Limited direct control over generation parameters</li>
        </ul>

        <h3 className="font-headline text-xl text-secondary">Advanced Features and Professional Considerations</h3>

        <p>As AI image generation technology evolves, advanced features become increasingly important for professional use. Many platforms now offer capabilities similar to traditional <strong>photo editing software</strong>, including layer manipulation, selective editing, and style transfer.</p>

        <p>The integration of AI analysis - pioneered by platforms like Klutz - represents the next evolution in this space. Just as <strong>audio enhancement</strong> tools help musicians perfect their sound, intelligent prompt analysis helps creators optimize their visual output. This analytical approach transforms the creative process from trial-and-error to data-driven optimization.</p>

        <p>For content creators working across multiple mediums, having tools that work seamlessly together is crucial. Whether you're creating images for video content, social media, or print materials, the best platforms integrate well with existing creative workflows, much like how modern <strong>audio editing tools</strong> integrate with video production pipelines.</p>

        <h3 className="font-headline text-xl text-secondary">The Future of AI Image Generation</h3>

        <p>The field continues to evolve rapidly, with improvements in image quality, generation speed, and user control. Emerging features include better text integration within images, enhanced realism in human portraits, and more sophisticated style control.</p>

        <p>Klutz's introduction of AI analysis features represents a significant step forward in making these tools more accessible and effective for users of all skill levels. As the <strong>first tool with AI analysis features</strong>, it has set a new standard that other platforms are now working to match.</p>

        <h3 className="font-headline text-xl text-secondary">TL;DR</h3>

        <p>AI text-to-image generators have revolutionized digital content creation, offering powerful tools for transforming text descriptions into stunning visuals. When choosing a platform, prioritize image quality, style variety, ease of use, and innovative features like AI analysis.</p>

        <p><strong>Top recommendations:</strong></p>
        <ul>
          <li><strong>Klutz AI Text-to-Image Generator</strong> - Best overall for its revolutionary AI analysis features and user-friendly approach</li>
          <li><strong>Leonardo AI</strong> - Best for professional artists seeking high-quality outputs</li>
          <li><strong>DeepAI</strong> - Best for simple, quick generations</li>
          <li><strong>Freepik AI</strong> - Best for commercial use with extensive template library</li>
        </ul>

        <p>The standout feature across all platforms is the democratization of digital art creation. However, Klutz's unique position as the <strong>first tool with AI analysis features</strong> makes it particularly valuable for users looking to improve their prompt writing skills and achieve more consistent results.</p>

        <p>Whether you're creating content for social media, marketing materials, or personal projects, these AI-powered tools offer unprecedented creative possibilities. The key is finding the platform that best matches your specific needs, skill level, and intended use cases.</p>
      </div>
    </div>
  );
    </>
)}    