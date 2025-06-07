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
import { Loader2, ImageUp, Type, Calculator, AlertTriangle, Info, Copy, Download, BookOpen, Lightbulb, CheckCircle, Star } from 'lucide-react';
import { preprocessImage } from '@/lib/image-utils';
import { getLaymanErrorMessage } from '@/lib/error-utils';
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

// Helper function to parse AI response into sections
const parseAIResponse = (response: string) => {
  const sections = {
    problemAnalysis: '',
    solutionSteps: '',
    finalAnswer: '',
    keyConcepts: '',
    explanation: '',
    fullResponse: response
  };

  // Split by common section headers
  const lines = response.split('\n');
  let currentSection = 'explanation';
  let sectionContent: string[] = [];

  for (const line of lines) {
    const lowerLine = line.toLowerCase().trim();
    
    if (lowerLine.includes('problem') && (lowerLine.includes('analysis') || lowerLine.includes('description'))) {
      if (sectionContent.length > 0) {
        sections[currentSection as keyof typeof sections] = sectionContent.join('\n').trim();
        sectionContent = [];
      }
      currentSection = 'problemAnalysis';
    } else if (lowerLine.includes('solution') || lowerLine.includes('step')) {
      if (sectionContent.length > 0) {
        sections[currentSection as keyof typeof sections] = sectionContent.join('\n').trim();
        sectionContent = [];
      }
      currentSection = 'solutionSteps';
    } else if (lowerLine.includes('final') && lowerLine.includes('answer')) {
      if (sectionContent.length > 0) {
        sections[currentSection as keyof typeof sections] = sectionContent.join('\n').trim();
        sectionContent = [];
      }
      currentSection = 'finalAnswer';
    } else if (lowerLine.includes('key') && lowerLine.includes('concept')) {
      if (sectionContent.length > 0) {
        sections[currentSection as keyof typeof sections] = sectionContent.join('\n').trim();
        sectionContent = [];
      }
      currentSection = 'keyConcepts';
    } else {
      sectionContent.push(line);
    }
  }

  // Add remaining content to current section
  if (sectionContent.length > 0) {
    sections[currentSection as keyof typeof sections] = sectionContent.join('\n').trim();
  }

  // If no specific sections were found, put everything in explanation
  if (!sections.problemAnalysis && !sections.solutionSteps && !sections.finalAnswer) {
    sections.explanation = response;
  }

  return sections;
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
  const [parsedSections, setParsedSections] = useState<any>(null);
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
        setParsedSections(null);
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
    setParsedSections(null);
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
    setParsedSections(null);
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
          
          Please structure your response with clear sections:
          
          ## Problem Analysis
          [Describe what the problem is asking and identify key information]
          
          ## Solution Steps
          [Provide detailed step-by-step solution with explanations]
          
          ## Final Answer
          [State the final answer clearly]
          
          ## Key Concepts
          [List the main concepts used in solving this problem]
          
          Make sure to explain each step clearly and provide the reasoning behind each calculation or decision.
        `;
      } else if (inputType === 'text' && textInput.trim()) {
        prompt = `
          You are an AI assistant specialized in solving academic problems across mathematics, science, and other subjects.
          
          Solve this ${problemTypeName} problem: "${textInput}"
          Additional context: "${additionalContext || 'None provided'}"
          
          Please structure your response with clear sections:
          
          ## Problem Analysis
          [Describe what the problem is asking and identify key information]
          
          ## Solution Steps
          [Provide detailed step-by-step solution with explanations]
          
          ## Final Answer
          [State the final answer clearly]
          
          ## Key Concepts
          [List the main concepts used in solving this problem]
          
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

      // Parse the response into sections
      const sections = parseAIResponse(rawContent);
      setParsedSections(sections);

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
        final_answer: sections.finalAnswer || "Please see the detailed solution above.",
        key_concepts: sections.keyConcepts ? [sections.keyConcepts] : [problemTypeName],
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
      const friendlyErrorMessage = getLaymanErrorMessage(err);
      setError(friendlyErrorMessage);
      toast({ variant: "destructive", title: "Problem Solving Failed", description: friendlyErrorMessage });
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
              <div className="mt-2 p-2 bg-green-100 dark:bg-green-900/30 rounded-md border border-green-300 dark:border-green-700">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-green-600 dark:text-green-400 mr-2 flex-shrink-0" />
                  <span className="text-green-700 dark:text-green-300 font-medium text-sm">
                    <strong>Note:</strong> Text analysis is much more reliable and accurate than image analysis for complex problems.
                  </span>
                </div>
              </div>
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

          {solutionReport && parsedSections && !isLoading && !error && (
            <Card className="mt-6 shadow-md">
              <CardHeader>
                <CardTitle className="font-headline text-xl flex items-center">
                  <Calculator className="mr-2 h-6 w-6 text-primary" />
                  Problem Solution
                </CardTitle>
                <div className="flex items-center justify-between">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
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
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {solutionReport.image_description && (
                  <div>
                    <h4 className="font-semibold text-md mb-2 flex items-center">
                      <Info className="mr-2 h-4 w-4 text-accent" />
                      Image Analysis:
                    </h4>
                    <div className="bg-muted/30 p-4 rounded-md">
                      <p className="text-sm">{safeStringify(solutionReport.image_description)}</p>
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-md mb-2 flex items-center">
                    <BookOpen className="mr-2 h-4 w-4 text-accent" />
                    Problem Statement:
                  </h4>
                  <div className="bg-muted/30 p-4 rounded-md">
                    <p className="text-sm">{safeStringify(solutionReport.problem_description)}</p>
                  </div>
                </div>

                {parsedSections.problemAnalysis && (
                  <div>
                    <h4 className="font-semibold text-md mb-2 flex items-center">
                      <Lightbulb className="mr-2 h-4 w-4 text-yellow-500" />
                      Problem Analysis:
                    </h4>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md border-l-4 border-yellow-500">
                      <pre className="text-sm whitespace-pre-wrap font-sans">{parsedSections.problemAnalysis}</pre>
                    </div>
                  </div>
                )}

                {parsedSections.solutionSteps && (
                  <div>
                    <h4 className="font-semibold text-md mb-2 flex items-center">
                      <Calculator className="mr-2 h-4 w-4 text-blue-500" />
                      Solution Steps:
                    </h4>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md border-l-4 border-blue-500">
                      <pre className="text-sm whitespace-pre-wrap font-sans">{parsedSections.solutionSteps}</pre>
                    </div>
                  </div>
                )}

                {parsedSections.finalAnswer && (
                  <div>
                    <h4 className="font-semibold text-md mb-2 flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                      Final Answer:
                    </h4>
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md border-l-4 border-green-500">
                      <pre className="text-sm whitespace-pre-wrap font-sans font-medium">{parsedSections.finalAnswer}</pre>
                    </div>
                  </div>
                )}

                {parsedSections.keyConcepts && (
                  <div>
                    <h4 className="font-semibold text-md mb-2 flex items-center">
                      <BookOpen className="mr-2 h-4 w-4 text-purple-500" />
                      Key Concepts:
                    </h4>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-md border-l-4 border-purple-500">
                      <pre className="text-sm whitespace-pre-wrap font-sans">{parsedSections.keyConcepts}</pre>
                    </div>
                  </div>
                )}

                {parsedSections.explanation && !parsedSections.problemAnalysis && !parsedSections.solutionSteps && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-md">Complete Solution:</h4>
                      <Button onClick={handleCopySolution} variant="outline" size="sm">
                        <Copy className="mr-1 h-3 w-3" />
                        Copy Solution
                      </Button>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md border-l-4 border-green-500 max-h-96 overflow-y-auto">
                      <pre className="text-sm whitespace-pre-wrap font-sans">{parsedSections.explanation}</pre>
                    </div>
                  </div>
                )}

                <Alert variant="default" className="text-xs bg-blue-50 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300">
                  <Info className="h-4 w-4 text-blue-500" />
                  <AlertTitle className="font-medium">Disclaimer</AlertTitle>
                  <AlertDescription>{safeStringify(solutionReport.disclaimer)}</AlertDescription>
                </Alert>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button onClick={handleCopySolution} variant="outline" className="flex-1">
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Complete Solution
                  </Button>
                  <Button onClick={handleDownloadReport} variant="outline" className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    Download Report
                  </Button>
                </div>
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

 {/* Blog Section */}
 <div className="mt-12 max-w-3xl mx-auto">
 <h2 className="text-2xl font-bold mb-4 font-headline"># The Ultimate Guide to AI Problem Solvers: Quick Solutions at Your Fingertips</h2>
 <p className="text-muted-foreground mb-6">
 In today's fast-paced world, finding quick answers to complex problems shouldn't be overwhelming. Whether you're a student tackling tricky assignments, a professional dealing with coding errors, or someone facing life decisions, AI problem solvers have revolutionized how we approach challenges. These versatile tools are designed to provide accurate, practical solutions in moments, eliminating guesswork and delays that traditionally come with problem-solving.
 </p>

 <h3 className="text-xl font-semibold mb-3 font-headline">## What is an AI Problem Solver?</h3>
 <p className="text-muted-foreground mb-6">
 An AI problem solver is an intelligent tool that empowers users to overcome obstacles and move forward with confidence. These solutions instantly analyze any issue you present, whether it's math equations, technical problems, or real-life situations, and generate step-by-step explanations that break complex problems into simple, manageable steps. The tool streamlines the process of finding answers, saving time and frustration while providing reliable, actionable solutions.
 </p>
 <p className="text-muted-foreground mb-6">
 Modern problem solvers offer multi-category support, covering a wide range of topics from academics to practical everyday challenges. With customizable outputs and adjustments that fit your personal context and preferences, these tools create content in minutes rather than weeks, making problem-solving a breeze.
 </p>

 <h3 className="text-xl font-semibold mb-3 font-headline">## Key Features to Check When Searching for the Best AI Problem Solver</h3>
 <p className="text-muted-foreground mb-4">
 When evaluating the ideal problem solver, students and professionals should look for these essential features:
 </p>
 <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
 <li><strong>Input Flexibility:</strong> The best tools accept multiple input types - text, images, voice, and even handwritten problems</li>
 <li><strong>Solution Category Selection:</strong> Look for tools that let you select the problem type or category to receive tailored responses</li>
 <li><strong>Step-by-Step Solutions:</strong> Clear, detailed instructions that provide understanding, not just answers</li>
 <li><strong>Accuracy and Reliability:</strong> Tools that generate accurate solutions you can trust</li>
 <li><strong>Device Accessibility:</strong> Solutions accessible across any device without installations or sign-ups</li>
 <li><strong>Customization Options:</strong> Ability to tweak and refine solutions to suit your specific needs</li>
 <li><strong>Speed:</strong> Quick response times that deliver solutions in seconds</li>
 </ul>

 <h3 className="text-xl font-semibold mb-3 font-headline">## Best FREE AI Problem Solvers</h3>

 <div className="space-y-8">
 <div>
 <h4 className="text-lg font-semibold mb-2">### Klutz AI Problem Solver</h4>
 <p className="text-muted-foreground mb-2">
 **Price:** Completely free
 </p>
 <p className="text-muted-foreground mb-3">
 **How it works:** Simply enter your problem, select the appropriate category, and click generate to receive clear step-by-step solutions.
 </p>
 <p className="font-semibold mb-2">Pros:</p>
 <ul className="list-disc list-inside text-muted-foreground mb-3 space-y-1">
 <li>Start solving problems instantly with no email sign-ups or installations required</li>
 <li>Versatile tool that effortlessly tackles challenges across multiple categories</li>
 <li>Provides detailed step-by-step instructions for better understanding</li>
 <li>Simple interface - just type your problem and start problem-solving</li>
 <li>Reliable text analysis that's more accurate than image processing for complex issues</li>
 <li>Designed to provide quick, effective solutions without overwhelming users</li>
 <li>Takes the pressure off by analyzing each issue and presenting actionable solutions</li>
 </ul>
 <p className="font-semibold mb-2">Cons:</p>
 <ul className="list-disc list-inside text-muted-foreground space-y-1">
 <li>Image analysis may be less reliable for very complex mathematical problems</li>
 <li>Limited to web-based access</li>
 </ul>
 <p className="text-muted-foreground italic mt-3">
 Klutz's problem solver today stands out as an ideal tool for anyone looking to find solutions moments after entering their question or dilemma. The solver takes a straightforward approach, making problem-solving accessible to everyone.
 </p>
 </div>

 <div>
 <h4 className="text-lg font-semibold mb-2">### WriteCream Problem Solver</h4>
 <p className="text-muted-foreground mb-2">
 **Price:** Free tier with premium options
 </p>
 <p className="text-muted-foreground mb-3">
 **Features:** Offers problem-solving as part of their content creation suite, with solutions for various problem types.
 </p>
 <p className="font-semibold mb-2">Pros:</p>
 <ul className="list-disc list-inside text-muted-foreground mb-3 space-y-1">
 <li>Multi-purpose platform for content creation and problem-solving</li>
 <li>Free tier available for basic problem-solving needs</li>
 <li>Quick generation of solutions</li>
 </ul>
 <p className="font-semibold mb-2">Cons:</p>
 <ul className="list-disc list-inside text-muted-foreground space-y-1">
 <li>Limited words per month on free tier</li>
 <li>Requires sign-up and email registration</li>
 <li>Less specialized than dedicated problem solvers</li>
 <li>Wait times during peak usage</li>
 </ul>
 <p className="text-muted-foreground italic mt-3">
 **Copyright:** All rights reserved by WriteCream
 </p>
 </div>

 <div>
 <h4 className="text-lg font-semibold mb-2">### BoredHumans Problem Solver</h4>
 <p className="text-muted-foreground mb-2">
 **Price:** Free
 </p>
 <p className="font-semibold mb-2">Pros:</p>
 <ul className="list-disc list-inside text-muted-foreground mb-3 space-y-1">
 <li>Part of 100+ free AI tools suite</li>
 <li>Simple text input system</li>
 <li>No registration required</li>
 <li>Covers general problem-solving scenarios</li>
 </ul>
 <p className="font-semibold mb-2">Cons:</p>
 <ul className="list-disc list-inside text-muted-foreground space-y-1">
 <li>Less specialized approach to specific problem types</li>
 <li>No image upload capability for visual problems</li>
 <li>Interface can feel cluttered with many other tools</li>
 <li>Limited step-by-step explanations compared to dedicated solvers</li>
 </ul>
 </div>

 <div>
 <h4 className="text-lg font-semibold mb-2">### Mathos AI (MathGPT Pro)</h4>
 <p className="text-muted-foreground mb-2">
 **Price:** Free tier with premium features
 </p>
 <p className="text-muted-foreground mb-3">
 **Specialization:** Mathematical and technical problem-solving
 </p>
 <p className="font-semibold mb-2">Pros:</p>
 <ul className="list-disc list-inside text-muted-foreground mb-3 space-y-1">
 <li>Specialized for math equations with high accuracy</li>
 <li>Multiple input methods including voice and drawing</li>
 <li>Advanced graphing calculator included</li>
 <li>Multi-device synchronization</li>
 <li>Trusted by millions of students worldwide</li>
 </ul>
 <p className="font-semibold mb-2">Cons:</p>
 <ul className="list-disc list-inside text-muted-foreground space-y-1">
 <li>Primarily focused on mathematical problems only</li>
 <li>Premium features require subscription</li>
 <li>May be overwhelming for simple calculations</li>
 <li>Limited coverage of non-mathematical issues</li>
 </ul>
 </div>

 <div>
 <h4 className="text-lg font-semibold mb-2">### YesChat Problem Solver</h4>
 <p className="text-muted-foreground mb-2">
 **Price:** Free tier available
 </p>
 <p className="font-semibold mb-2">Pros:</p>
 <ul className="list-disc list-inside text-muted-foreground mb-3 space-y-1">
 <li>Advanced AI reasoning for complex problems</li>
 <li>Handles both technical and personal advice scenarios</li>
 <li>No sign-up required for basic use</li>
 <li>Covers professional and academic topics</li>
 </ul>
 <p className="font-semibold mb-2">Cons:</p>
 <ul className="list-disc list-inside text-muted-foreground space-y-1">
 <li>Usage limitations on free tier</li>
 <li>Less focused on specific problem categories</li>
 <li>Primarily text-based interaction</li>
 </ul>
 </div>
 </div>

 <h3 className="text-xl font-semibold mt-8 mb-3 font-headline">## TLDR</h3>
 <p className="text-muted-foreground mb-4">
 AI problem solvers have transformed how we tackle challenges, whether big or small. These tools eliminate the overwhelming process of finding solutions by providing quick, reliable answers in moments.
 </p>
 <p className="font-semibold mb-2">Quick Recommendations:</p>
 <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
 <li><strong>For versatile problem-solving:</strong> Klutz AI Problem Solver offers the best balance - completely free, simple steps to solve any problem, and no frustrating sign-ups</li>
 <li><strong>For math-specific needs:</strong> Mathos AI provides specialized mathematical tools with step-by-step solutions</li>
 <li><strong>For content creators:</strong> WriteCream combines problem-solving with content generation (limited free words per month)</li>
 <li><strong>For variety:</strong> BoredHumans offers diverse tools but with less depth per problem type</li>
 </ul>
 <p className="text-muted-foreground">
 The key is finding a problem solver that fits your needs while providing accurate, practical solutions. Start solving your problems today - find the right tool and move forward with confidence, knowing you can overcome any obstacle that comes your way.
 </p>
 </div>
    </div>
  );
}