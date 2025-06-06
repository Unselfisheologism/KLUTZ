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
import { Loader2, ImageUp, Type, Sparkles, AlertTriangle, Info, CheckCircle, XCircle, FileText, Download } from 'lucide-react';
import { preprocessImage } from '@/lib/image-utils';
import { downloadTextFile } from '@/lib/utils';
import ImagePreview from '@/components/medi-scan/image-preview';
import type { IngredientsAnalysisReport } from '@/types/ingredients-checker';

const cleanJsonString = (rawString: string): string => {
  let cleanedString = rawString.trim();
  if (cleanedString.startsWith("```json") && cleanedString.endsWith("```")) {
    cleanedString = cleanedString.substring(7, cleanedString.length - 3).trim();
  } else if (cleanedString.startsWith("```") && cleanedString.endsWith("```")) {
    cleanedString = cleanedString.substring(3, cleanedString.length - 3).trim();
  }
  return cleanedString;
};

// Helper function to ensure arrays are properly formatted
const ensureArray = (value: any): string[] => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return [value];
  return [];
};

export default function IngredientsCheckerPage() {
  const [inputType, setInputType] = useState<'image' | 'text'>('image');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [textInput, setTextInput] = useState<string>('');
  const [manufacturer, setManufacturer] = useState<string>('');
  
  const [analysisReport, setAnalysisReport] = useState<IngredientsAnalysisReport | null>(null);
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

  const handleTextInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextInput(event.target.value);
    setAnalysisReport(null);
    setError(null);
  };

  const performAnalysis = async () => {
    if (inputType === 'image' && !imageFile) {
      toast({ variant: "destructive", title: "Missing Input", description: "Please upload an image of the food item or ingredients label." });
      return;
    }
    if (inputType === 'text' && !textInput.trim()) {
      toast({ variant: "destructive", title: "Missing Input", description: "Please provide the ingredients text." });
      return;
    }

    setIsLoading(true);
    setAnalysisReport(null);
    setError(null);
    toast({ title: "Analysis Started", description: "AI is analyzing the ingredients..." });

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

      if (inputType === 'image' && imageFile) {
        aiInput = await preprocessImage(imageFile, 1024);
        prompt = `
          You are an AI assistant specialized in analyzing food ingredients.
          
          Analyze this image which could be either:
          1. An ingredients label/nutrition facts panel on food packaging
          2. An actual food item (prepared dish, snack, beverage, etc.)
          3. Raw ingredients or food components
          
          ${manufacturer ? `Manufacturer: ${manufacturer}` : ''}

          For INGREDIENTS LABELS: Extract and analyze the listed ingredients.
          For ACTUAL FOOD ITEMS: Identify the food item and determine its likely ingredients based on:
          - Visual appearance and components you can see
          - Common recipes and preparation methods for this type of food
          - Typical ingredients used in commercial versions of this food
          - Any visible additives, preservatives, or processing indicators

          Provide a comprehensive analysis including:
          1. Identify what type of food/product this is
          2. List all visible or likely ingredients and their properties
          3. Safety assessment for each ingredient
          4. Overall product safety evaluation
          5. Dietary considerations and allergen information
          6. Note if analysis is based on visible ingredients vs. typical recipe ingredients

          IMPORTANT: Return ONLY a valid JSON object with these exact keys and data types:
          {
            "product_name": "string or null",
            "manufacturer": "string or null", 
            "analysis_type": "ingredients_label|food_item|raw_ingredients",
            "ingredients_list": [
              {
                "name": "string",
                "description": "string",
                "safety_rating": "Safe|Caution|Warning|Unknown",
                "common_uses": ["array", "of", "strings"],
                "potential_concerns": ["array", "of", "strings"],
                "alternatives": ["array", "of", "strings"],
                "source": "visible|typical_recipe|likely_additive"
              }
            ],
            "overall_assessment": {
              "safety_rating": "Safe|Moderate Concern|High Concern|Insufficient Data",
              "summary": "string",
              "key_concerns": ["array", "of", "strings"],
              "recommendations": ["array", "of", "strings"]
            },
            "dietary_flags": {
              "vegan": true,
              "vegetarian": true,
              "gluten_free": true,
              "common_allergens": ["array", "of", "strings"]
            },
            "confidence": "High|Medium|Low|Not Applicable",
            "disclaimer": "string"
          }
        `;
      } else if (inputType === 'text' && textInput.trim()) {
        prompt = `
          You are an AI assistant specialized in analyzing food ingredients.
          Analyze these ingredients: "${textInput}"
          ${manufacturer ? `Manufacturer: ${manufacturer}` : ''}

          Provide a comprehensive analysis including:
          1. List all ingredients and their properties
          2. Safety assessment for each ingredient
          3. Overall product safety evaluation
          4. Dietary considerations
          5. Potential concerns or allergens

          IMPORTANT: Return ONLY a valid JSON object with these exact keys and data types:
          {
            "product_name": "string or null",
            "manufacturer": "string or null",
            "analysis_type": "text_input",
            "ingredients_list": [
              {
                "name": "string",
                "description": "string",
                "safety_rating": "Safe|Caution|Warning|Unknown",
                "common_uses": ["array", "of", "strings"],
                "potential_concerns": ["array", "of", "strings"],
                "alternatives": ["array", "of", "strings"],
                "source": "provided"
              }
            ],
            "overall_assessment": {
              "safety_rating": "Safe|Moderate Concern|High Concern|Insufficient Data",
              "summary": "string",
              "key_concerns": ["array", "of", "strings"],
              "recommendations": ["array", "of", "strings"]
            },
            "dietary_flags": {
              "vegan": true,
              "vegetarian": true,
              "gluten_free": true,
              "common_allergens": ["array", "of", "strings"]
            },
            "confidence": "High|Medium|Low|Not Applicable",
            "disclaimer": "string"
          }
        `;
      } else {
        throw new Error("No valid input provided for analysis.");
      }

      const response = inputType === 'image' 
        ? await puter.ai.chat(prompt, aiInput) 
        : await puter.ai.chat(prompt, { model: 'gpt-4o' });

      if (!response?.message?.content) {
        throw new Error("AI analysis did not return content.");
      }

      const rawResponse = JSON.parse(cleanJsonString(response.message.content));
      
      // Normalize the response to ensure all arrays are properly formatted
      const normalizedResponse: IngredientsAnalysisReport = {
        product_name: rawResponse.product_name || null,
        manufacturer: rawResponse.manufacturer || manufacturer || null,
        analysis_type: rawResponse.analysis_type || 'unknown',
        ingredients_list: (rawResponse.ingredients_list || []).map((ingredient: any) => ({
          name: ingredient.name || 'Unknown',
          description: ingredient.description || 'No description available',
          safety_rating: ingredient.safety_rating || 'Unknown',
          common_uses: ensureArray(ingredient.common_uses),
          potential_concerns: ensureArray(ingredient.potential_concerns),
          alternatives: ensureArray(ingredient.alternatives),
          source: ingredient.source || 'unknown'
        })),
        overall_assessment: {
          safety_rating: rawResponse.overall_assessment?.safety_rating || 'Insufficient Data',
          summary: rawResponse.overall_assessment?.summary || 'No summary available',
          key_concerns: ensureArray(rawResponse.overall_assessment?.key_concerns),
          recommendations: ensureArray(rawResponse.overall_assessment?.recommendations)
        },
        dietary_flags: rawResponse.dietary_flags ? {
          vegan: Boolean(rawResponse.dietary_flags.vegan),
          vegetarian: Boolean(rawResponse.dietary_flags.vegetarian),
          gluten_free: Boolean(rawResponse.dietary_flags.gluten_free),
          common_allergens: ensureArray(rawResponse.dietary_flags.common_allergens)
        } : {
          vegan: false,
          vegetarian: false,
          gluten_free: false,
          common_allergens: []
        },
        confidence: rawResponse.confidence || 'Low',
        disclaimer: rawResponse.disclaimer || 'AI-generated analysis. Verify with manufacturers and consult healthcare professionals.'
      };

      setAnalysisReport(normalizedResponse);
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

    let reportString = "KLUTZ Ingredients Analysis Report\n";
    reportString += "================================\n\n";

    if (analysisReport.product_name) {
      reportString += `Product Name: ${analysisReport.product_name}\n`;
    }
    if (analysisReport.manufacturer) {
      reportString += `Manufacturer: ${analysisReport.manufacturer}\n`;
    }
    if (analysisReport.analysis_type) {
      reportString += `Analysis Type: ${analysisReport.analysis_type.replace('_', ' ').toUpperCase()}\n`;
    }
    reportString += "\n";

    reportString += "Overall Assessment:\n";
    reportString += "------------------\n";
    reportString += `Safety Rating: ${analysisReport.overall_assessment.safety_rating}\n`;
    reportString += `Summary: ${analysisReport.overall_assessment.summary}\n\n`;

    reportString += "Key Concerns:\n";
    reportString += "-------------\n";
    analysisReport.overall_assessment.key_concerns.forEach(concern => {
      reportString += `- ${concern}\n`;
    });
    reportString += "\n";

    reportString += "Recommendations:\n";
    reportString += "----------------\n";
    analysisReport.overall_assessment.recommendations.forEach(rec => {
      reportString += `- ${rec}\n`;
    });
    reportString += "\n";

    reportString += "Ingredients Analysis:\n";
    reportString += "--------------------\n";
    analysisReport.ingredients_list.forEach(ingredient => {
      reportString += `\n${ingredient.name.toUpperCase()}\n`;
      reportString += `Safety Rating: ${ingredient.safety_rating}\n`;
      reportString += `Description: ${ingredient.description}\n`;
      if (ingredient.source) {
        reportString += `Source: ${ingredient.source.replace('_', ' ')}\n`;
      }
      reportString += "Common Uses:\n";
      ingredient.common_uses.forEach(use => reportString += `- ${use}\n`);
      if (ingredient.potential_concerns.length > 0) {
        reportString += "Potential Concerns:\n";
        ingredient.potential_concerns.forEach(concern => reportString += `! ${concern}\n`);
      }
      if (ingredient.alternatives?.length) {
        reportString += "Alternatives:\n";
        ingredient.alternatives.forEach(alt => reportString += `* ${alt}\n`);
      }
      reportString += "\n";
    });

    reportString += "Dietary Information:\n";
    reportString += "-------------------\n";
    if (analysisReport.dietary_flags) {
      reportString += `Vegan: ${analysisReport.dietary_flags.vegan ? 'Yes' : 'No'}\n`;
      reportString += `Vegetarian: ${analysisReport.dietary_flags.vegetarian ? 'Yes' : 'No'}\n`;
      reportString += `Gluten-Free: ${analysisReport.dietary_flags.gluten_free ? 'Yes' : 'No'}\n`;
      if (analysisReport.dietary_flags.common_allergens.length > 0) {
        reportString += "\nCommon Allergens Present:\n";
        analysisReport.dietary_flags.common_allergens.forEach(allergen => {
          reportString += `- ${allergen}\n`;
        });
      }
    }
    reportString += "\n";

    reportString += "AI Analysis Confidence: " + analysisReport.confidence + "\n\n";
    reportString += "Disclaimer:\n";
    reportString += "-----------\n";
    reportString += analysisReport.disclaimer + "\n\n";
    
    reportString += "\nIMPORTANT: This report is AI-generated and for informational purposes only. Always verify ingredients with the manufacturer and consult healthcare professionals for specific dietary needs or concerns.";

    const timestamp = new Date().toISOString().replace(/[:.-]/g, '').slice(0, 14);
    downloadTextFile(reportString, `KLUTZ_IngredientsChecker_Report_${timestamp}.txt`);
  };

  const getSafetyColor = (rating: string) => {
    switch (rating.toLowerCase()) {
      case 'safe': return 'text-green-600 dark:text-green-400';
      case 'caution': return 'text-yellow-600 dark:text-yellow-400';
      case 'warning': return 'text-red-600 dark:text-red-400';
      case 'high concern': return 'text-red-700 dark:text-red-300 font-bold';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case 'visible': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'typical_recipe': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'likely_additive': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="max-w-3xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary flex items-center">
            <Sparkles className="mr-3 h-8 w-8" />
            AI Ingredients Checker
          </CardTitle>
          <CardDescription>
            Analyze food ingredients from labels, actual food items, or text for safety, dietary considerations, and potential concerns.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert variant="default" className="bg-yellow-50 border-yellow-400 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <AlertTitle className="font-semibold">Important Note</AlertTitle>
            <AlertDescription>
              This tool can analyze both ingredient labels and actual food items. For food items, the AI will identify likely ingredients based on visual analysis and common recipes. Always verify with manufacturers and consult healthcare professionals for specific dietary needs or concerns.
            </AlertDescription>
          </Alert>

          <Tabs value={inputType} onValueChange={(value) => setInputType(value as 'image' | 'text')} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="image">Image Analysis</TabsTrigger>
              <TabsTrigger value="text">Text Analysis</TabsTrigger>
            </TabsList>
            <TabsContent value="image" className="mt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="image-upload" className="text-lg font-medium flex items-center mb-2">
                    <ImageUp className="mr-2 h-5 w-5 text-accent" />
                    Upload Food Image or Ingredients Label
                  </Label>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleImageFileChange}
                    className="file:text-primary file:font-semibold file:bg-primary/10 hover:file:bg-primary/20"
                    disabled={isLoading}
                  />
                  <p className="text-sm text-muted-foreground mt-1">Upload an image of a food item, ingredients label, or nutrition facts panel.</p>
                </div>
                {imageDataUrl && <ImagePreview imageDataUrl={imageDataUrl} dataAiHint="food item or ingredients label"/>}
              </div>
            </TabsContent>
            <TabsContent value="text" className="mt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="text-input" className="text-lg font-medium flex items-center mb-2">
                    <Type className="mr-2 h-5 w-5 text-accent" />
                    Ingredients Text
                  </Label>
                  <Textarea
                    id="text-input"
                    placeholder="Paste ingredients list here..."
                    value={textInput}
                    onChange={handleTextInputChange}
                    rows={8}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div>
            <Label htmlFor="manufacturer" className="text-lg font-medium">Manufacturer (Optional)</Label>
            <Input
              id="manufacturer"
              placeholder="Enter manufacturer name..."
              value={manufacturer}
              onChange={(e) => setManufacturer(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <Button 
            onClick={performAnalysis} 
            disabled={isLoading || (inputType === 'image' && !imageFile) || (inputType === 'text' && !textInput.trim())} 
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Ingredients...
              </>
            ) : (
              'Analyze Ingredients'
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
                  Ingredients Analysis Report
                  {analysisReport.analysis_type && (
                    <span className="ml-2 text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {analysisReport.analysis_type.replace('_', ' ').toUpperCase()}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-md">Overall Safety Rating:</h4>
                  <span className={`font-bold ${getSafetyColor(analysisReport.overall_assessment.safety_rating)}`}>
                    {analysisReport.overall_assessment.safety_rating}
                  </span>
                </div>

                <div>
                  <h4 className="font-semibold text-md mb-1">Summary:</h4>
                  <p className="bg-muted/30 p-3 rounded-md">{analysisReport.overall_assessment.summary}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-md mb-1">Key Concerns:</h4>
                  <ul className="list-disc pl-5 space-y-1 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                    {analysisReport.overall_assessment.key_concerns.map((concern, index) => (
                      <li key={index} className="text-red-700 dark:text-red-300">{concern}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-md mb-1">Recommendations:</h4>
                  <ul className="list-disc pl-5 space-y-1 bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                    {analysisReport.overall_assessment.recommendations.map((rec, index) => (
                      <li key={index} className="text-green-700 dark:text-green-300">{rec}</li>
                    ))}
                  </ul>
                </div>

                {analysisReport.dietary_flags && (
                  <div>
                    <h4 className="font-semibold text-md mb-2">Dietary Information:</h4>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <div className={`p-2 rounded-md text-center ${analysisReport.dietary_flags.vegan ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        Vegan: {analysisReport.dietary_flags.vegan ? 'Yes' : 'No'}
                      </div>
                      <div className={`p-2 rounded-md text-center ${analysisReport.dietary_flags.vegetarian ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        Vegetarian: {analysisReport.dietary_flags.vegetarian ? 'Yes' : 'No'}
                      </div>
                      <div className={`p-2 rounded-md text-center ${analysisReport.dietary_flags.gluten_free ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        Gluten-Free: {analysisReport.dietary_flags.gluten_free ? 'Yes' : 'No'}
                      </div>
                    </div>
                    {analysisReport.dietary_flags.common_allergens.length > 0 && (
                      <div className="bg-yellow-50 p-3 rounded-md">
                        <h5 className="font-medium text-yellow-700 mb-1">Common Allergens Present:</h5>
                        <ul className="list-disc pl-5 text-yellow-600">
                          {analysisReport.dietary_flags.common_allergens.map((allergen, index) => (
                            <li key={index}>{allergen}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-md mb-2">Detailed Ingredients Analysis:</h4>
                  <div className="space-y-3">
                    {analysisReport.ingredients_list.map((ingredient, index) => (
                      <div key={index} className="border rounded-md p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <h5 className="font-medium">{ingredient.name}</h5>
                            {ingredient.source && (
                              <span className={`px-2 py-1 rounded text-xs ${getSourceBadgeColor(ingredient.source)}`}>
                                {ingredient.source.replace('_', ' ')}
                              </span>
                            )}
                          </div>
                          <span className={`px-2 py-1 rounded text-sm ${getSafetyColor(ingredient.safety_rating)}`}>
                            {ingredient.safety_rating}
                          </span>
                        </div>
                        <p className="text-sm mb-2">{ingredient.description}</p>
                        <div className="text-sm">
                          <strong>Common Uses:</strong>
                          <ul className="list-disc pl-5 mt-1">
                            {ingredient.common_uses.map((use, useIndex) => (
                              <li key={useIndex}>{use}</li>
                            ))}
                          </ul>
                        </div>
                        {ingredient.potential_concerns.length > 0 && (
                          <div className="text-sm mt-2">
                            <strong>Potential Concerns:</strong>
                            <ul className="list-disc pl-5 mt-1 text-red-600">
                              {ingredient.potential_concerns.map((concern, concernIndex) => (
                                <li key={concernIndex}>{concern}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {ingredient.alternatives && ingredient.alternatives.length > 0 && (
                          <div className="text-sm mt-2">
                            <strong>Alternatives:</strong>
                            <ul className="list-disc pl-5 mt-1 text-green-600">
                              {ingredient.alternatives.map((alt, altIndex) => (
                                <li key={altIndex}>{alt}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
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
              <p>Upload an image of a food item or ingredients label, or paste ingredients text to get AI-powered analysis.</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground w-full text-center">
            This tool uses AI for ingredients analysis. Always verify information with manufacturers and consult healthcare professionals.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}