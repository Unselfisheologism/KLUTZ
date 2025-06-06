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
          
          CRITICAL: You MUST respond with ONLY a valid JSON object. Do not include any explanatory text before or after the JSON.
          
          Provide a comprehensive solution in JSON format with these exact keys:
          {
            "problem_description": "Clear description of the problem from the image",
            "problem_type": "The type/category of problem",
            "solution_steps": [
              {
                "step_number": 1,
                "description": "What is being done in this step",
                "explanation": "Why this step is necessary",
                "formula_used": "Any formula or theorem used (optional)"
              }
            ],
            "final_answer": "The final answer with appropriate units/format",
            "key_concepts": ["Important concepts used in the solution"],
            "difficulty_level": "Beginner|Intermediate|Advanced|Expert",
            "alternative_methods": ["Other ways to solve this problem (optional)"],
            "common_mistakes": ["Common errors students make (optional)"],
            "related_topics": ["Related topics to study (optional)"],
            "image_description": "Brief description of what you see in the image",
            "confidence": "High|Medium|Low|Not Applicable",
            "disclaimer": "Standard disclaimer about AI problem-solving limitations"
          }
        `;
      } else if (inputType === 'text' && textInput.trim()) {
        prompt = `
          You are an AI assistant specialized in solving academic problems across mathematics, science, and other subjects.
          
          Solve this ${problemTypeName} problem: "${textInput}"
          Additional context: "${additionalContext || 'None provided'}"
          
          CRITICAL: You MUST respond with ONLY a valid JSON object. Do not include any explanatory text before or after the JSON.
          
          Provide a comprehensive solution in JSON format with these exact keys:
          {
            "problem_description": "Restatement of the problem",
            "problem_type": "The type/category of problem",
            "solution_steps": [
              {
                "step_number": 1,
                "description": "What is being done in this step",
                "explanation": "Why this step is necessary",
                "formula_used": "Any formula or theorem used (optional)"
              }
            ],
            "final_answer": "The final answer with appropriate units/format",
            "key_concepts": ["Important concepts used in the solution"],
            "difficulty_level": "Beginner|Intermediate|Advanced|Expert",
            "alternative_methods": ["Other ways to solve this problem (optional)"],
            "common_mistakes": ["Common errors students make (optional)"],
            "related_topics": ["Related topics to study (optional)"],
            "confidence": "High|Medium|Low|Not Applicable",
            "disclaimer": "Standard disclaimer about AI problem-solving limitations"
          }
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

      let parsedResponse: ProblemSolverReport;
      try {
        const cleanedContent = cleanJsonString(response.message.content);
        parsedResponse = JSON.parse(cleanedContent);
      } catch (parseError) {
        console.error("JSON parsing failed. Raw response:", response.message.content);
        
        // If JSON parsing fails, create a fallback response
        const fallbackResponse: ProblemSolverReport = {
          problem_description: inputType === 'image' ? "Problem extracted from uploaded image" : textInput,
          problem_type: problemTypeName,
          solution_steps: [
            {
              step_number: 1,
              description: "AI Analysis",
              explanation: "The AI provided a detailed solution but in an unexpected format.",
              formula_used: undefined
            }
          ],
          final_answer: "Please see the detailed explanation below.",
          key_concepts: [problemTypeName],
          difficulty_level: 'Intermediate',
          alternative_methods: [],
          common_mistakes: [],
          related_topics: [],
          image_description: inputType === 'image' ? "Image analysis completed" : undefined,
          confidence: 'Medium',
          disclaimer: "AI-generated solution. Please verify with teachers or textbooks."
        };
        
        // Store the raw response for display
        (fallbackResponse as any).raw_response = response.message.content;
        parsedResponse = fallbackResponse;
      }

      setSolutionReport(parsedResponse);
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
    if (!solutionReport) return;
    
    let solutionText = `Problem: ${solutionReport.problem_description}\n\n`;
    solutionText += `Solution:\n`;
    solutionReport.solution_steps.forEach(step => {
      solutionText += `${step.step_number}. ${step.description}\n`;
    });
    solutionText += `\nFinal Answer: ${solutionReport.final_answer}`;
    
    navigator.clipboard.writeText(solutionText).then(() => {
      toast({ title: "Solution Copied", description: "Problem solution has been copied to clipboard." });
    }).catch(() => {
      toast({ variant: "destructive", title: "Copy Failed", description: "Could not copy solution to clipboard." });
    });
  };

  const handleDownloadReport = () => {
    if (!solutionReport) return;

    let reportString = "KLUTZ AI Problem Solver Report\n";
    reportString += "==============================\n\n";

    reportString += "Problem Details:\n";
    reportString += "----------------\n";
    reportString += `Problem Type: ${solutionReport.problem_type}\n`;
    reportString += `Difficulty Level: ${solutionReport.difficulty_level}\n`;
    reportString += `AI Confidence: ${solutionReport.confidence}\n\n`;

    if (solutionReport.image_description) {
      reportString += "Image Description:\n";
      reportString += "------------------\n";
      reportString += `${solutionReport.image_description}\n\n`;
    }

    reportString += "Problem Statement:\n";
    reportString += "------------------\n";
    reportString += `${solutionReport.problem_description}\n\n`;

    reportString += "Solution Steps:\n";
    reportString += "---------------\n";
    solutionReport.solution_steps.forEach(step => {
      reportString += `Step ${step.step_number}: ${step.description}\n`;
      reportString += `Explanation: ${step.explanation}\n`;
      if (step.formula_used) {
        reportString += `Formula: ${step.formula_used}\n`;
      }
      reportString += "\n";
    });

    reportString += "Final Answer:\n";
    reportString += "-------------\n";
    reportString += `${solutionReport.final_answer}\n\n`;

    reportString += "Key Concepts:\n";
    reportString += "-------------\n";
    solutionReport.key_concepts.forEach(concept => {
      reportString += `- ${concept}\n`;
    });
    reportString += "\n";

    if (solutionReport.alternative_methods && solutionReport.alternative_methods.length > 0) {
      reportString += "Alternative Methods:\n";
      reportString += "-------------------\n";
      solutionReport.alternative_methods.forEach(method => {
        reportString += `- ${method}\n`;
      });
      reportString += "\n";
    }

    if (solutionReport.common_mistakes && solutionReport.common_mistakes.length > 0) {
      reportString += "Common Mistakes to Avoid:\n";
      reportString += "-------------------------\n";
      solutionReport.common_mistakes.forEach(mistake => {
        reportString += `- ${mistake}\n`;
      });
      reportString += "\n";
    }

    if (solutionReport.related_topics && solutionReport.related_topics.length > 0) {
      reportString += "Related Topics:\n";
      reportString += "---------------\n";
      solutionReport.related_topics.forEach(topic => {
        reportString += `- ${topic}\n`;
      });
      reportString += "\n";
    }

    // Include raw response if available (for fallback cases)
    if ((solutionReport as any).raw_response) {
      reportString += "Detailed AI Response:\n";
      reportString += "--------------------\n";
      reportString += `${(solutionReport as any).raw_response}\n\n`;
    }

    reportString += "Disclaimer:\n";
    reportString += "-----------\n";
    reportString += solutionReport.disclaimer + "\n\n";
    
    reportString += "\nIMPORTANT: This solution is AI-generated and for educational purposes only. Always verify solutions and consult with teachers or tutors for complex problems.";

    const timestamp = new Date().toISOString().replace(/[:.-]/g, '').slice(0, 14);
    downloadTextFile(reportString, `KLUTZ_AIProblemSolver_Report_${timestamp}.txt`);
  };

  const getDifficultyColor = (level: string) => {
    switch (level.toLowerCase()) {
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

          {solutionReport && !isLoading && !error && (
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
                    <p className="bg-muted/30 p-3 rounded-md">{solutionReport.image_description}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md text-center">
                    <p className="text-sm text-muted-foreground">Problem Type</p>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{solutionReport.problem_type}</p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-md text-center">
                    <p className="text-sm text-muted-foreground">Difficulty</p>
                    <p className={`text-lg font-bold ${getDifficultyColor(solutionReport.difficulty_level)}`}>
                      {solutionReport.difficulty_level}
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md text-center">
                    <p className="text-sm text-muted-foreground">AI Confidence</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">{solutionReport.confidence}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-md mb-1">Problem:</h4>
                  <div className="bg-muted/30 p-4 rounded-md">
                    <p className="text-sm">{solutionReport.problem_description}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-md mb-2">Solution Steps:</h4>
                  <div className="space-y-3">
                    {solutionReport.solution_steps.map((step, index) => (
                      <div key={index} className="border rounded-md p-4 bg-blue-50 dark:bg-blue-900/20">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                            {step.step_number}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-blue-700 dark:text-blue-300 mb-1">{step.description}</h5>
                            <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">{step.explanation}</p>
                            {step.formula_used && (
                              <div className="bg-white dark:bg-gray-800 p-2 rounded border">
                                <p className="text-xs text-muted-foreground">Formula:</p>
                                <code className="text-sm font-mono">{step.formula_used}</code>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-md">Final Answer:</h4>
                    <Button onClick={handleCopySolution} variant="outline" size="sm">
                      <Copy className="mr-1 h-3 w-3" />
                      Copy Solution
                    </Button>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md border-l-4 border-green-500">
                    <p className="text-lg font-bold text-green-700 dark:text-green-300">{solutionReport.final_answer}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-md mb-1 flex items-center">
                    <BookOpen className="mr-2 h-4 w-4 text-accent" />
                    Key Concepts:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {solutionReport.key_concepts.map((concept, index) => (
                      <span key={index} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                        {concept}
                      </span>
                    ))}
                  </div>
                </div>

                {solutionReport.alternative_methods && solutionReport.alternative_methods.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-md mb-1 flex items-center">
                      <Lightbulb className="mr-2 h-4 w-4 text-accent" />
                      Alternative Methods:
                    </h4>
                    <ul className="list-disc pl-5 space-y-1 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md">
                      {solutionReport.alternative_methods.map((method, index) => (
                        <li key={index} className="text-yellow-700 dark:text-yellow-300">{method}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {solutionReport.common_mistakes && solutionReport.common_mistakes.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-md mb-1 text-red-600 dark:text-red-400">⚠️ Common Mistakes:</h4>
                    <ul className="list-disc pl-5 space-y-1 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                      {solutionReport.common_mistakes.map((mistake, index) => (
                        <li key={index} className="text-red-700 dark:text-red-300">{mistake}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {solutionReport.related_topics && solutionReport.related_topics.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-md mb-1">Related Topics to Study:</h4>
                    <div className="flex flex-wrap gap-2">
                      {solutionReport.related_topics.map((topic, index) => (
                        <span key={index} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Show raw response if it's a fallback case */}
                {(solutionReport as any).raw_response && (
                  <div>
                    <h4 className="font-semibold text-md mb-1">Detailed AI Analysis:</h4>
                    <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-md max-h-64 overflow-y-auto">
                      <pre className="text-sm whitespace-pre-wrap">{(solutionReport as any).raw_response}</pre>
                    </div>
                  </div>
                )}

                <Alert variant="default" className="text-xs bg-blue-50 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300">
                  <Info className="h-4 w-4 text-blue-500" />
                  <AlertTitle className="font-medium">Disclaimer</AlertTitle>
                  <AlertDescription>{solutionReport.disclaimer}</AlertDescription>
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