'use client';

import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ImageUp, Type, Languages, AlertTriangle, Info, Copy, Download, ArrowRight } from 'lucide-react';
import { preprocessImage } from '@/lib/image-utils';
import { downloadTextFile } from '@/lib/utils';
import ImagePreview from '@/components/medi-scan/image-preview';
import type { TranslationReport } from '@/types/ai-translator';

const cleanJsonString = (rawString: string): string => {
  let cleanedString = rawString.trim();
  if (cleanedString.startsWith("```json") && cleanedString.endsWith("```")) {
    cleanedString = cleanedString.substring(7, cleanedString.length - 3).trim();
  } else if (cleanedString.startsWith("```") && cleanedString.endsWith("```")) {
    cleanedString = cleanedString.substring(3, cleanedString.length - 3).trim();
  }
  return cleanedString;
};

const LANGUAGES = [
  { code: 'auto', name: 'Auto-detect' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese (Simplified)' },
  { code: 'zh-tw', name: 'Chinese (Traditional)' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'th', name: 'Thai' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'tr', name: 'Turkish' },
  { code: 'pl', name: 'Polish' },
  { code: 'nl', name: 'Dutch' },
  { code: 'sv', name: 'Swedish' },
  { code: 'da', name: 'Danish' },
  { code: 'no', name: 'Norwegian' },
  { code: 'fi', name: 'Finnish' },
  { code: 'he', name: 'Hebrew' },
  { code: 'cs', name: 'Czech' },
  { code: 'hu', name: 'Hungarian' },
  { code: 'ro', name: 'Romanian' },
  { code: 'bg', name: 'Bulgarian' },
  { code: 'hr', name: 'Croatian' },
  { code: 'sk', name: 'Slovak' },
  { code: 'sl', name: 'Slovenian' },
  { code: 'et', name: 'Estonian' },
  { code: 'lv', name: 'Latvian' },
  { code: 'lt', name: 'Lithuanian' },
  { code: 'uk', name: 'Ukrainian' },
  { code: 'be', name: 'Belarusian' },
  { code: 'mk', name: 'Macedonian' },
  { code: 'sq', name: 'Albanian' },
  { code: 'sr', name: 'Serbian' },
  { code: 'bs', name: 'Bosnian' },
  { code: 'mt', name: 'Maltese' },
  { code: 'is', name: 'Icelandic' },
  { code: 'ga', name: 'Irish' },
  { code: 'cy', name: 'Welsh' },
  { code: 'eu', name: 'Basque' },
  { code: 'ca', name: 'Catalan' },
  { code: 'gl', name: 'Galician' },
  { code: 'fa', name: 'Persian' },
  { code: 'ur', name: 'Urdu' },
  { code: 'bn', name: 'Bengali' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'kn', name: 'Kannada' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'mr', name: 'Marathi' },
  { code: 'ne', name: 'Nepali' },
  { code: 'si', name: 'Sinhala' },
  { code: 'my', name: 'Myanmar' },
  { code: 'km', name: 'Khmer' },
  { code: 'lo', name: 'Lao' },
  { code: 'ka', name: 'Georgian' },
  { code: 'am', name: 'Amharic' },
  { code: 'sw', name: 'Swahili' },
  { code: 'zu', name: 'Zulu' },
  { code: 'af', name: 'Afrikaans' },
  { code: 'xh', name: 'Xhosa' },
  { code: 'yo', name: 'Yoruba' },
  { code: 'ig', name: 'Igbo' },
  { code: 'ha', name: 'Hausa' },
];

export default function AITranslatorPage() {
  const [inputType, setInputType] = useState<'image' | 'text'>('text');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [textInput, setTextInput] = useState<string>('');
  const [sourceLanguage, setSourceLanguage] = useState<string>('auto');
  const [targetLanguage, setTargetLanguage] = useState<string>('en');
  
  const [translationReport, setTranslationReport] = useState<TranslationReport | null>(null);
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
        setTranslationReport(null);
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

  const handleTextInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextInput(event.target.value);
    setTranslationReport(null);
    setError(null);
  };

  const performTranslation = async () => {
    if (inputType === 'image' && !imageFile) {
      toast({ variant: "destructive", title: "Missing Input", description: "Please upload an image containing text to translate." });
      return;
    }
    if (inputType === 'text' && !textInput.trim()) {
      toast({ variant: "destructive", title: "Missing Input", description: "Please enter text to translate." });
      return;
    }
    if (!targetLanguage || targetLanguage === 'auto') {
      toast({ variant: "destructive", title: "Missing Target Language", description: "Please select a target language for translation." });
      return;
    }

    setIsLoading(true);
    setTranslationReport(null);
    setError(null);
    toast({ title: "Translation Started", description: "AI is processing your translation request..." });

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

      let prompt: string;
      let aiInput: string | undefined = undefined;

      const sourceLanguageName = LANGUAGES.find(lang => lang.code === sourceLanguage)?.name || 'Auto-detect';
      const targetLanguageName = LANGUAGES.find(lang => lang.code === targetLanguage)?.name || 'English';

      if (inputType === 'image' && imageFile) {
        aiInput = await preprocessImage(imageFile, 1024);
        prompt = `
          You are an AI assistant specialized in text extraction and translation.
          
          First, extract all visible text from this image accurately.
          Then, translate the extracted text from ${sourceLanguageName} to ${targetLanguageName}.
          
          Provide your analysis in a JSON object with these keys:
          - "original_text": (string) All text extracted from the image
          - "translated_text": (string) The translation of the extracted text
          - "source_language_detected": (string) The detected language of the original text
          - "target_language": (string) The target language name
          - "translation_confidence": (string, one of "High", "Medium", "Low") Your confidence in the translation accuracy
          - "context_notes": (array of strings) Any important context or cultural notes about the translation
          - "alternative_translations": (array of strings) Alternative ways to translate key phrases (max 3)
          - "image_description": (string) Brief description of the image content
          - "text_extraction_quality": (string, one of "High", "Medium", "Low") Quality of text extraction from the image
          - "disclaimer": (string) Standard disclaimer about AI translation limitations
        `;
      } else if (inputType === 'text' && textInput.trim()) {
        prompt = `
          You are an AI assistant specialized in translation.
          
          Translate the following text from ${sourceLanguageName} to ${targetLanguageName}:
          "${textInput}"
          
          Provide your analysis in a JSON object with these keys:
          - "original_text": (string) The original text provided
          - "translated_text": (string) The translation of the text
          - "source_language_detected": (string) The detected language of the original text
          - "target_language": (string) The target language name
          - "translation_confidence": (string, one of "High", "Medium", "Low") Your confidence in the translation accuracy
          - "context_notes": (array of strings) Any important context or cultural notes about the translation
          - "alternative_translations": (array of strings) Alternative ways to translate key phrases (max 3)
          - "disclaimer": (string) Standard disclaimer about AI translation limitations
        `;
      } else {
        throw new Error("No valid input provided for translation.");
      }

      const response = inputType === 'image' 
        ? await puter.ai.chat(prompt, aiInput) 
        : await puter.ai.chat(prompt, { model: 'gpt-4o' });

      if (!response?.message?.content) {
        throw new Error("AI translation did not return content.");
      }

      const parsedResponse: TranslationReport = JSON.parse(cleanJsonString(response.message.content));
      setTranslationReport(parsedResponse);
      toast({ title: "Translation Complete", variant: "default", className: "bg-green-500 text-white dark:bg-green-600" });

    } catch (err: any) {
      console.error("Translation error:", err);
      let errorMessage = "An error occurred during translation.";
      if (err instanceof Error) errorMessage = err.message;
      else if (typeof err === 'string') errorMessage = err;
      else if (err.error && err.error.message) errorMessage = err.error.message;
      setError(errorMessage);
      toast({ variant: "destructive", title: "Translation Failed", description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyTranslation = () => {
    if (!translationReport?.translated_text) return;
    
    navigator.clipboard.writeText(translationReport.translated_text).then(() => {
      toast({ title: "Translation Copied", description: "Translated text has been copied to clipboard." });
    }).catch(() => {
      toast({ variant: "destructive", title: "Copy Failed", description: "Could not copy translation to clipboard." });
    });
  };

  const handleDownloadReport = () => {
    if (!translationReport) return;

    let reportString = "KLUTZ AI Translator Report\n";
    reportString += "==========================\n\n";

    reportString += "Translation Details:\n";
    reportString += "-------------------\n";
    reportString += `Input Type: ${inputType === 'image' ? 'Image' : 'Text'}\n`;
    reportString += `Source Language: ${translationReport.source_language_detected || 'Not detected'}\n`;
    reportString += `Target Language: ${translationReport.target_language}\n`;
    reportString += `Translation Confidence: ${translationReport.translation_confidence}\n\n`;

    if (translationReport.image_description) {
      reportString += "Image Description:\n";
      reportString += "------------------\n";
      reportString += `${translationReport.image_description}\n\n`;
    }

    if (translationReport.text_extraction_quality) {
      reportString += `Text Extraction Quality: ${translationReport.text_extraction_quality}\n\n`;
    }

    reportString += "Original Text:\n";
    reportString += "--------------\n";
    reportString += `${translationReport.original_text}\n\n`;

    reportString += "Translated Text:\n";
    reportString += "----------------\n";
    reportString += `${translationReport.translated_text}\n\n`;

    if (translationReport.context_notes && translationReport.context_notes.length > 0) {
      reportString += "Context Notes:\n";
      reportString += "--------------\n";
      translationReport.context_notes.forEach(note => {
        reportString += `- ${note}\n`;
      });
      reportString += "\n";
    }

    if (translationReport.alternative_translations && translationReport.alternative_translations.length > 0) {
      reportString += "Alternative Translations:\n";
      reportString += "------------------------\n";
      translationReport.alternative_translations.forEach(alt => {
        reportString += `- ${alt}\n`;
      });
      reportString += "\n";
    }

    reportString += "Disclaimer:\n";
    reportString += "-----------\n";
    reportString += translationReport.disclaimer + "\n\n";
    
    reportString += "\nIMPORTANT: This translation is AI-generated and for informational purposes only. For critical translations, always consult with professional translators.";

    const timestamp = new Date().toISOString().replace(/[:.-]/g, '').slice(0, 14);
    downloadTextFile(reportString, `KLUTZ_AITranslator_Report_${timestamp}.txt`);
  };

  const swapLanguages = () => {
    if (sourceLanguage === 'auto') return;
    const temp = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(temp);
    setTranslationReport(null);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="max-w-3xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary flex items-center">
            <Languages className="mr-3 h-8 w-8" />
            AI Translator
          </CardTitle>
          <CardDescription>
            Translate text from images or typed input using AI-powered translation with support for 60+ languages.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert variant="default" className="bg-blue-50 border-blue-400 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            <Info className="h-5 w-5 text-blue-500" />
            <AlertTitle className="font-semibold">Translation Features</AlertTitle>
            <AlertDescription>
              Upload images containing text or type directly. Supports 60+ languages with context-aware translations and cultural notes.
            </AlertDescription>
          </Alert>

          <Tabs value={inputType} onValueChange={(value) => setInputType(value as 'image' | 'text')} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="text">Text Translation</TabsTrigger>
              <TabsTrigger value="image">Image Translation</TabsTrigger>
            </TabsList>
            <TabsContent value="text" className="mt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="text-input" className="text-lg font-medium flex items-center mb-2">
                    <Type className="mr-2 h-5 w-5 text-accent" />
                    Text to Translate
                  </Label>
                  <Textarea
                    id="text-input"
                    placeholder="Enter text to translate..."
                    value={textInput}
                    onChange={handleTextInputChange}
                    rows={6}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="image" className="mt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="image-upload" className="text-lg font-medium flex items-center mb-2">
                    <ImageUp className="mr-2 h-5 w-5 text-accent" />
                    Upload Image with Text
                  </Label>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleImageFileChange}
                    className="file:text-primary file:font-semibold file:bg-primary/10 hover:file:bg-primary/20"
                    disabled={isLoading}
                  />
                  <p className="text-sm text-muted-foreground mt-1">Upload an image containing text to translate.</p>
                </div>
                {imageDataUrl && <ImagePreview imageDataUrl={imageDataUrl} dataAiHint="image with text to translate"/>}
              </div>
            </TabsContent>
          </Tabs>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <Label htmlFor="source-language" className="text-lg font-medium">From</Label>
              <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                <SelectTrigger id="source-language" className="w-full">
                  <SelectValue placeholder="Source language" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-center">
              <Button
                variant="outline"
                size="icon"
                onClick={swapLanguages}
                disabled={sourceLanguage === 'auto' || isLoading}
                className="h-10 w-10"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div>
              <Label htmlFor="target-language" className="text-lg font-medium">To</Label>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger id="target-language" className="w-full">
                  <SelectValue placeholder="Target language" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {LANGUAGES.filter(lang => lang.code !== 'auto').map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={performTranslation} 
            disabled={isLoading || (inputType === 'image' && !imageFile) || (inputType === 'text' && !textInput.trim()) || !targetLanguage || targetLanguage === 'auto'} 
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Translating...
              </>
            ) : (
              <>
                <Languages className="mr-2 h-4 w-4" />
                Translate Text
              </>
            )}
          </Button>

          {error && !isLoading && (
            <Alert variant="destructive" className="mt-6">
              <AlertTriangle className="h-5 w-5" />
              <AlertTitle>Translation Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {translationReport && !isLoading && !error && (
            <Card className="mt-6 shadow-md">
              <CardHeader>
                <CardTitle className="font-headline text-xl flex items-center">
                  <Languages className="mr-2 h-6 w-6 text-primary" />
                  Translation Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {translationReport.image_description && (
                  <div>
                    <h4 className="font-semibold text-md mb-1">Image Description:</h4>
                    <p className="bg-muted/30 p-3 rounded-md">{translationReport.image_description}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md text-center">
                    <p className="text-sm text-muted-foreground">Source Language</p>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{translationReport.source_language_detected || 'Unknown'}</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md text-center">
                    <p className="text-sm text-muted-foreground">Target Language</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">{translationReport.target_language}</p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-md text-center">
                    <p className="text-sm text-muted-foreground">Confidence</p>
                    <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{translationReport.translation_confidence}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-md mb-1">Original Text:</h4>
                  <div className="bg-muted/30 p-4 rounded-md">
                    <p className="text-sm">{translationReport.original_text}</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-md">Translation:</h4>
                    <Button onClick={handleCopyTranslation} variant="outline" size="sm">
                      <Copy className="mr-1 h-3 w-3" />
                      Copy
                    </Button>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md border-l-4 border-green-500">
                    <p className="text-sm font-medium">{translationReport.translated_text}</p>
                  </div>
                </div>

                {translationReport.context_notes && translationReport.context_notes.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-md mb-1">Context Notes:</h4>
                    <ul className="list-disc pl-5 space-y-1 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md">
                      {translationReport.context_notes.map((note, index) => (
                        <li key={index} className="text-yellow-700 dark:text-yellow-300">{note}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {translationReport.alternative_translations && translationReport.alternative_translations.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-md mb-1">Alternative Translations:</h4>
                    <ul className="list-disc pl-5 space-y-1 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                      {translationReport.alternative_translations.map((alt, index) => (
                        <li key={index} className="text-blue-700 dark:text-blue-300">{alt}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {translationReport.text_extraction_quality && (
                  <div>
                    <h4 className="font-semibold text-md mb-1">Text Extraction Quality:</h4>
                    <p className="bg-muted/30 p-3 rounded-md">{translationReport.text_extraction_quality}</p>
                  </div>
                )}

                <Alert variant="default" className="text-xs bg-blue-50 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300">
                  <Info className="h-4 w-4 text-blue-500" />
                  <AlertTitle className="font-medium">Disclaimer</AlertTitle>
                  <AlertDescription>{translationReport.disclaimer}</AlertDescription>
                </Alert>

                <Button onClick={handleDownloadReport} variant="outline" className="w-full mt-4">
                  <Download className="mr-2 h-4 w-4" />
                  Download Translation Report
                </Button>
              </CardContent>
            </Card>
          )}

          {!translationReport && !isLoading && !error && (
            <div className="mt-6 p-4 border border-dashed rounded-md text-center text-muted-foreground">
              <Info className="mx-auto h-8 w-8 mb-2"/>
              <p>Select input method, choose languages, and provide text to get AI-powered translation with cultural context.</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground w-full text-center">
            This tool uses AI for translation. For critical translations, always consult with professional translators.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}