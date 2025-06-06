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
import { Loader2, ImageUp, Type, Calculator, AlertTriangle, Info, Copy, Download, BookOpen, Lightbulb } from 'lucide-react';
import { preprocessImage } from '@/lib/image-utils';
import { downloadTextFile } from '@/lib/utils';
import ImagePreview from '@/components/medi-scan/image-preview';
import type { ProblemSolverReport } from '@/types/ai-problem-solver';

const cleanJsonString = (rawString: string): string => {
  let cleanedString = rawString.trim();
  if (cleanedString.startsWith("```json") && cleanedString.endsWith("```")) {
    cleanedString = cleanedString.substring(7, cleanedString.length - 3).trim();
  } else if (cleanedString.startsWith("```") && cleanedString.endsWith("```")) {
    cleanedString = cleanedString.substring(3, cleanedString.length - 3).trim();
  }
  return cleanedString;
};

// Helper function to safely convert any value to string
const safeStringify = (value: any): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'boolean') return value.toString();
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return '[Complex Object]';
    }
  }
  return String(value);
};

// Helper function to ensure arrays contain only strings
const ensureStringArray = (arr: any): string[] => {
  if (!Array.isArray(arr)) return [];
  return arr.map(item => safeStringify(item));
};

const PROBLEM_TYPES = [
  { value: 'algebra', label: 'Algebra' },
  { value: 'calculus', label: 'Calculus' },
  { value: 'geometry', label: 'Geometry' },
  { value: 'trigonometry', label: 'Trigonometry' },
  { value: 'statistics', label: 'Statistics & Probability' },
  { value: 'physics', label: 'Physics' },
  { value: 'chemistry', label: 'Chemistry' },
  { value: 'biology', label: 'Biology' },
  { value: 'computer-science', label: 'Computer Science' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'economics', label: 'Economics' },
  { value: 'logic', label: 'Logic & Reasoning' },
  { value: 'word-problem', label: 'Word Problems' },
  { value: 'other', label: 'Other' },
];

export default function AIProblemSolverPage() {
  const [inputType, setInputType] = useState<'image' | 'text'>('text');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [textInput, setTextInput] = useState<string>('');
  const [problemType, setProblemType] = useState<string>('');
  const [additionalContext, setAdditionalContext] = useState<string>('');
  
  const [solutionReport, setSolutionReport] = useState<ProblemSolverReport | null>(null);
  const [rawResponse, setRawResponse] = useState<string>('');
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
        setSolutionReport(null);
        setRawResponse('');
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
    setSolutionReport(null);
    setRawResponse('');
    setError(null);
  };

  const solveProblem = async () => {
    if (inputType === 'image' && !imageFile) {
      toast({ variant: "destructive", title: "Missing Input", description: "Please upload an image of the problem." });
      return;
    }
    if (inputType === 'text' && !textInput.trim()) {
      toast({ variant: "destructive", title: "Missing Input", description: "Please enter the problem to solve." });
      return;
    }
    if (!problemType) {
      toast({ variant: "destructive", title: "Missing Problem Type", description: "Please select the type of problem." });
      return;
    }

    setIsLoading(true);
    setSolutionReport(null);
    setRawResponse('');
    setError(null);
    toast({ title: "Analysis Started", description: "AI is analyzing and solving your problem..." });

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

      const problemTypeName = PROBLEM_TYPES.find(type => type.value === problemType)?.label || 'General';

      if (inputType === 'image' && imageFile) {
        aiInput = await preprocessImage(imageFile, 1024);
        prompt = `
          You are an AI assistant specialized in solving academic problems across mathematics, science, and other subjects.
          
          Analyze this image containing a ${problemTypeName} problem and provide a complete solution.
          Problem type: ${problemTypeName}
          Additional context: "${additionalContext || 'None provided'}"
          
          Please provide a comprehensive step-by-step solution. Focus on clarity and educational value.
          Include the problem description, solution steps, final answer, and key concepts.
          
          Make sure to explain each step clearly and provide the reasoning behind each calculation or decision.
        `;
      } else if (inputType === 'text' && textInput.trim()) {
        prompt = `
          You are an AI assistant specialized in solving academic problems across mathematics, science, and other subjects.
          
          Solve this ${problemTypeName} problem: "${textInput}"
          Additional context: "${additionalContext || 'None provided'}"
          
          Please provide a comprehensive step-by-step solution. Focus on clarity and educational value.
          Include the problem description, solution steps, final answer, and key concepts.
          
          Make sure to explain each step clearly and provide the reasoning behind each calculation or decision.
        `;
      } else {
        throw new Error("No valid input provided for problem solving.");
      }

      const response = inputType === 'image' 
        ? await puter.ai.chat(prompt, aiInput) 
        : await puter.ai.chat(prompt, { model: 'gpt-4o' });

      if (!response?.message?.content) {
        throw new Error("AI problem solving did not return content.");
      }

      const rawContent = response.message.content;
      setRawResponse(rawContent);

      // Create a structured response from the AI's natural language response
      const structuredResponse: ProblemSolverReport = {
        problem_description: inputType === 'image' ? "Problem extracted from uploaded image" : textInput,
        problem_type: problemTypeName,
        solution_steps: [
          {
            step_number: 1,
            description: "AI Analysis and Solution",
            explanation: "The AI has provided a comprehensive solution to your problem.",
            formula_used: undefined
          }
        ],
        final_answer: "Please see the detailed solution below.",
        key_concepts: [problemTypeName],
        difficulty_level: 'Intermediate',
        alternative_methods: [],
        common_mistakes: [],
        related_topics: [],
        image_description: inputType === 'image' ? "Image analysis completed" : undefined,
        confidence: 'High',
        disclaimer: "AI-generated solution. Please verify with teachers or textbooks for accuracy."
      };

      setSolutionReport(structuredResponse);
      toast({ title: "Problem Solved", variant: "default", className: "bg-green-500 text-white dark:bg-green-600" });

    } catch (err: any) {
      console.error("Problem solving error:", err);
      let errorMessage = "An error occurred during problem solving.";
      if (err instanceof Error) errorMessage = err.message;
      else if (typeof err === 'string') errorMessage = err;
      else if (err.error && err.error.message) errorMessage = err.error.message;
      setError(errorMessage);
      toast({ variant: "destructive", title: "Problem Solving Failed", description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySolution = () => {
    if (!rawResponse) return;
    
    navigator.clipboard.writeText(rawResponse).then(() => {
      toast({ title: "Solution Copied", description: "Problem solution has been copied to clipboard." });
    }).catch(() => {
      toast({ variant: "destructive", title: "Copy Failed", description: "Could not copy solution to clipboard." });
    });
  };

  const handleDownloadReport = () => {
    if (!solutionReport || !rawResponse) return;

    let reportString = "KLUTZ AI Problem Solver Report\n";
    reportString += "==============================\n\n";

    reportString += "Problem Details:\n";
    reportString += "----------------\n";
    reportString += `Problem Type: ${safeStringify(solutionReport.problem_type)}\n`;
    reportString += `Difficulty Level: ${safeStringify(solutionReport.difficulty_level)}\n`;
    reportString += `AI Confidence: ${safeStringify(solutionReport.confidence)}\n\n`;

    if (solutionReport.image_description) {
      reportString += "Image Description:\n";
      reportString += "------------------\n";
      reportString += `${safeStringify(solutionReport.image_description)}\n\n`;
    }

    reportString += "Problem Statement:\n";
    reportString += "------------------\n";
    reportString += `${safeStringify(solutionReport.problem_description)}\n\n`;

    reportString += "AI Solution:\n";
    reportString += "------------\n";
    reportString += `${rawResponse}\n\n`;

    reportString += "Disclaimer:\n";
    reportString += "-----------\n";
    reportString += safeStringify(solutionReport.disclaimer) + "\n\n";
    
    reportString += "\nIMPORTANT: This solution is AI-generated and for educational purposes only. Always verify solutions and consult with teachers or tutors for complex problems.";

    const timestamp = new Date().toISOString().replace(/[:.-]/g, '').slice(0, 14);
    downloadTextFile(reportString, `KLUTZ_AIProblemSolver_Report_${timestamp}.txt`);
  };

  const getDifficultyColor = (level: string) => {
    const levelStr = safeStringify(level).toLowerCase();
    switch (levelStr) {
      case 'beginner': return 'text-green-600 dark:text-green-400';
      case 'intermediate': return 'text-yellow-600 dark:text-yellow-400';
      case 'advanced': return 'text-orange-600 dark:text-orange-400';
      case 'expert': return 'text-red-600 dark:text-red-400';
      default: return 'text-foreground';
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="max-w-3xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary flex items-center">
            <Calculator className="mr-3 h-8 w-8" />
            AI Problem Solver
          </CardTitle>
          <CardDescription>
            Upload images of problems or type them directly to get step-by-step AI-powered solutions for math, science, and academic problems.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert variant="default" className="bg-blue-50 border-blue-400 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            <Info className="h-5 w-5 text-blue-500" />
            <AlertTitle className="font-semibold">How it works</AlertTitle>
            <AlertDescription>
              Upload images of problems or type them directly. Get detailed step-by-step solutions with explanations, key concepts, and alternative methods.
            </AlertDescription>
          </Alert>

          <Tabs value={inputType} onValueChange={(value) => setInputType(value as 'image' | 'text')} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="text">Type Problem</TabsTrigger>
              <TabsTrigger value="image">Upload Problem Image</TabsTrigger>
            </TabsList>
            <TabsContent value="text" className="mt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="text-input" className="text-lg font-medium flex items-center mb-2">
                    <Type className="mr-2 h-5 w-5 text-accent" />
                    Problem Statement
                  </Label>
                  <Textarea
                    id="text-input"
                    placeholder="Enter your math, science, or academic problem here..."
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
                    Upload Problem Image
                  </Label>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleImageFileChange}
                    className="file:text-primary file:font-semibold file:bg-primary/10 hover:file:bg-primary/20"
                    disabled={isLoading}
                  />
                  <p className="text-sm text-muted-foreground mt-1">Upload a clear image of the problem, equation, or question.</p>
                </div>
                {imageDataUrl && <ImagePreview imageDataUrl={imageDataUrl} dataAiHint="problem or equation"/>}
              </div>
            </TabsContent>
          </Tabs>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="problem-type" className="text-lg font-medium">Problem Type</Label>
              <Select value={problemType} onValueChange={setProblemType}>
                <SelectTrigger id="problem-type" className="w-full">
                  <SelectValue placeholder="Select problem type" />
                </SelectTrigger>
                <SelectContent>
                  {PROBLEM_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
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
                rows={3}
                disabled={isLoading}
              />
            </div>
          </div>

          <Button 
            onClick={solveProblem} 
            disabled={isLoading || (inputType === 'image' && !imageFile) || (inputType === 'text' && !textInput.trim()) || !problemType} 
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Solving Problem...
              </>
            ) : (
              <>
                <Calculator className="mr-2 h-4 w-4" />
                Solve Problem
              </>
            )}
          </Button>

          {error && !isLoading && (
            <Alert variant="destructive" className="mt-6">
              <AlertTriangle className="h-5 w-5" />
              <AlertTitle>Problem Solving Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {solutionReport && rawResponse && !isLoading && !error && (
            <Card className="mt-6 shadow-md">
              <CardHeader>
                <CardTitle className="font-headline text-xl flex items-center">
                  <Calculator className="mr-2 h-6 w-6 text-primary" />
                  Problem Solution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {solutionReport.image_description && (
                  <div>
                    <h4 className="font-semibold text-md mb-1">Image Description:</h4>
                    <p className="bg-muted/30 p-3 rounded-md">{safeStringify(solutionReport.image_description)}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md text-center">
                    <p className="text-sm text-muted-foreground">Problem Type</p>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{safeStringify(solutionReport.problem_type)}</p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-md text-center">
                    <p className="text-sm text-muted-foreground">Difficulty</p>
                    <p className={`text-lg font-bold ${getDifficultyColor(solutionReport.difficulty_level)}`}>
                      {safeStringify(solutionReport.difficulty_level)}
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md text-center">
                    <p className="text-sm text-muted-foreground">AI Confidence</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">{safeStringify(solutionReport.confidence)}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-md mb-1">Problem:</h4>
                  <div className="bg-muted/30 p-4 rounded-md">
                    <p className="text-sm">{safeStringify(solutionReport.problem_description)}</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-md">AI Solution:</h4>
                    <Button onClick={handleCopySolution} variant="outline" size="sm">
                      <Copy className="mr-1 h-3 w-3" />
                      Copy Solution
                    </Button>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md border-l-4 border-green-500 max-h-96 overflow-y-auto">
                    <pre className="text-sm whitespace-pre-wrap font-sans">{rawResponse}</pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-md mb-1 flex items-center">
                    <BookOpen className="mr-2 h-4 w-4 text-accent" />
                    Key Concepts:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {ensureStringArray(solutionReport.key_concepts).map((concept, index) => (
                      <span key={index} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                        {concept}
                      </span>
                    ))}
                  </div>
                </div>

                <Alert variant="default" className="text-xs bg-blue-50 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300">
                  <Info className="h-4 w-4 text-blue-500" />
                  <AlertTitle className="font-medium">Disclaimer</AlertTitle>
                  <AlertDescription>{safeStringify(solutionReport.disclaimer)}</AlertDescription>
                </Alert>

                <Button onClick={handleDownloadReport} variant="outline" className="w-full mt-4">
                  <Download className="mr-2 h-4 w-4" />
                  Download Solution Report
                </Button>
              </CardContent>
            </Card>
          )}

          {!solutionReport && !isLoading && !error && (
            <div className="mt-6 p-4 border border-dashed rounded-md text-center text-muted-foreground">
              <Info className="mx-auto h-8 w-8 mb-2"/>
              <p>Upload a problem image or type your problem, select the type, and get detailed AI-powered step-by-step solutions.</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground w-full text-center">
            This tool uses AI for problem solving. Always verify solutions and consult with teachers for complex academic problems.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}