export interface ProblemSolverRequest {
  inputType: 'image' | 'text';
  imageFile?: File;
  textInput?: string;
  problemType: string;
  additionalContext?: string;
}

export interface ProblemStep {
  step_number: number;
  description: string;
  explanation: string;
  formula_used?: string;
}

export interface ProblemSolverReport {
  problem_description: string;
  problem_type: string;
  solution_steps: ProblemStep[];
  final_answer: string;
  key_concepts: string[];
  difficulty_level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  alternative_methods?: string[];
  common_mistakes?: string[];
  related_topics?: string[];
  image_description?: string; // For image input
  confidence: 'High' | 'Medium' | 'Low' | 'Not Applicable';
  disclaimer: string;
}

export interface AIProblemSolverFormValues {
  inputType: 'image' | 'text';
  imageFile?: FileList;
  textInput?: string;
  problemType: string;
  additionalContext?: string;
}