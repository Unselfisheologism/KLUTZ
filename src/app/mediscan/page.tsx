
'use client';

import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ImageUploadSection from '@/components/medi-scan/image-upload-section';
import ResultsSection from '@/components/medi-scan/results-section';
import type { MedicalReport, NextSteps, AnalysisResult } from '@/types/mediscan';
import { useToast } from "@/hooks/use-toast";
// Loader2 is removed as authLoading is removed. It might be needed if other loading states are introduced.

export default function MediScanPage() {
  const [report, setReport] = useState<MedicalReport | null>(null);
  const [nextSteps, setNextSteps] = useState<NextSteps | null>(null);
  const [isLoading, setIsLoading] = useState(false); // This is for AI analysis loading
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter(); // Keep router if other navigation is needed

  // Removed useEffect for initial auth check.
  // Authentication will be handled by ImageUploadSection or LoginButton.

  const handleAnalysisStart = () => {
    setIsLoading(true);
    setError(null);
    setReport(null);
    setNextSteps(null);
    toast({
      title: "Analysis Started",
      description: "The AI is processing your image. This may take a moment.",
    });
  };

  const handleAnalysisComplete = (
    results: AnalysisResult | null, 
    errorMessage?: string
  ) => {
    setIsLoading(false);
    if (errorMessage) {
      setError(errorMessage);
      setReport(null);
      setNextSteps(null);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: errorMessage,
      });
    } else if (results) {
      setReport(results.report);
      setNextSteps(results.nextSteps);
      setError(null);
       toast({
        variant: "default",
        title: "Analysis Successful",
        description: "Medical report and next steps are ready.",
        className: "bg-green-500 text-white dark:bg-green-600",
      });
    }
  };
  
  // Removed authLoading condition and its UI. Page renders directly.
  return (
    <>
      <Head>
        <link rel="canonical" href="https://klutz.netlify.app/mediscan" />
      </Head>
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="lg:sticky lg:top-24">
          <ImageUploadSection 
            onAnalysisStart={handleAnalysisStart}
            onAnalysisComplete={handleAnalysisComplete}
            isLoading={isLoading} // This isLoading is for the AI analysis
          />
        </div>
        <ResultsSection 
          report={report} 
          nextSteps={nextSteps} 
          isLoading={isLoading} // This isLoading is for the AI analysis
          error={error} 
        />
      </div>

      <div className="mt-16">
        <h2 className="text-3xl font-bold mb-6">The Complete Guide to MediScan: Revolutionizing Medical Image Analysis</h2>

        <p className="mb-4">In the rapidly evolving landscape of healthcare technology, tools that enhance diagnostic capabilities and streamline workflows are invaluable. MediScan is at the forefront of this revolution, offering a powerful AI-driven platform designed to assist medical professionals in analyzing medical images with unprecedented speed and accuracy.</p>

        <h3 className="text-2xl font-semibold mb-4">What is MediScan?</h3>

        <p className="mb-4">MediScan is an advanced medical image analysis tool that utilizes artificial intelligence to interpret medical scans, such as X-rays, CT scans, and MRIs. By processing these images through sophisticated algorithms, MediScan can help identify potential anomalies, generate detailed reports, and suggest next steps for diagnosis and treatment. It acts as an intelligent assistant, augmenting the expertise of healthcare providers.</p>

        <h3 className="text-2xl font-semibold mb-4">How MediScan Works</h3>

        <p className="mb-4">The core of MediScan lies in its AI engine, trained on vast datasets of medical images. When a medical image is uploaded, the AI analyzes it, looking for patterns and indicators of various conditions. The process involves:</p>

        <ul className="list-disc list-inside mb-4">
          <li><strong>Image Processing:</strong> Enhancing image quality and preparing it for analysis.</li>
          <li><strong>Feature Extraction:</strong> Identifying key visual features within the image.</li>
          <li><strong>Pattern Recognition:</strong> Comparing identified features against learned patterns of medical conditions.</li>
          <li><strong>Report Generation:</strong> Compiling findings into a structured medical report.</li>
          <li><strong>Suggestion of Next Steps:</strong> Proposing potential follow-up actions based on the analysis.</li>
        </ul>

        <h3 className="text-2xl font-semibold mb-4">Key Features and Benefits</h3>

        <ul className="list-disc list-inside mb-4">
          <li><strong>Enhanced Accuracy:</strong> AI analysis can identify subtle details that might be missed by the human eye.</li>
          <li><strong>Increased Efficiency:</strong> Rapid processing of images saves valuable time for medical professionals.</li>
          <li><strong>Detailed Reporting:</strong> Automatically generated reports provide comprehensive summaries of findings.</li>
          <li><strong>Consistent Analysis:</strong> AI applies consistent criteria, reducing variability in interpretations.</li>
          <li><strong>Assistive Tool:</strong> MediScan is designed to support, not replace, the expertise of medical practitioners.</li>
          <li><strong>Accessibility:</strong> Cloud-based platforms can make advanced analysis more accessible.</li>
        </ul>

        <h3 className="text-2xl font-semibold mb-4">Applications of MediScan</h3>

        <p className="mb-4">MediScan has a wide range of applications across various medical specialties:</p>

        <ul className="list-disc list-inside mb-4">
          <li><strong>Radiology:</strong> Assisting in the detection of fractures, tumors, and other abnormalities in X-rays, CTs, and MRIs.</li>
          <li><strong>Dermatology:</strong> Analyzing skin images for potential signs of melanoma and other skin conditions.</li>
          <li><strong>Pathology:</strong> Assisting in the analysis of tissue samples.</li>
          <li><strong>Cardiology:</strong> Identifying issues in cardiac imaging.</li>
          <li><strong>Preventative Medicine:</strong> Aiding in early detection of diseases.</li>
        </ul>

        <h3 className="text-2xl font-semibold mb-4">Limitations and Ethical Considerations</h3>

        <p className="mb-4">While powerful, it's crucial to acknowledge the limitations of AI in healthcare. MediScan is a tool to aid diagnosis, and the final medical interpretation and decision-making always rest with qualified healthcare professionals. Ethical considerations, such as data privacy, algorithmic bias, and the responsible use of AI in clinical settings, are paramount and continuously addressed in the development and deployment of such tools.</p>

        <h3 className="text-2xl font-semibold mb-4">The Future of Medical Image Analysis with AI</h3>

        <p className="mb-4">The field of AI in medical image analysis is rapidly advancing. Future iterations of tools like MediScan are expected to offer even greater precision, integrate with electronic health records more seamlessly, and potentially contribute to personalized medicine by identifying subtle markers linked to individual patient characteristics.</p>

        <h3 className="text-2xl font-semibold mb-4">Conclusion</h3>

        <p className="mb-4">MediScan represents a significant step forward in leveraging artificial intelligence to enhance medical image analysis. By providing rapid, detailed, and consistent interpretations, it empowers healthcare professionals to make more informed decisions, potentially leading to earlier diagnoses and improved patient outcomes. As the technology continues to evolve, tools like MediScan will play an increasingly vital role in the future of healthcare.</p>

        <h3 className="text-2xl font-semibold mb-4">TLDR: Quick Summary</h3>

        <p className="mb-4">MediScan is an AI tool that analyzes medical images to help detect anomalies, generate reports, and suggest next steps. It enhances accuracy and efficiency for medical professionals but does not replace their judgment. It has various applications in radiology, dermatology, and more. While powerful, it's important to consider its limitations and ethical implications. AI in medical imaging is a growing field with the potential for significant future impact.</p>

      </div>
    </div>
  );
    </>
)}