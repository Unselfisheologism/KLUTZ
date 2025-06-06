import type { ChangeEvent } from 'react';
import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { preprocessImage } from '@/lib/image-utils';
import { getLaymanErrorMessage } from '@/lib/error-utils';
import { UploadCloud, Loader2 } from 'lucide-react';
import ImagePreview from './image-preview';
import type { MedicalReport, NextSteps, AnalysisResult } from '@/types/mediscan';
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  image: z.custom<FileList>((val) => val instanceof FileList && val.length > 0, {
    message: 'Medical image is required.',
  }),
  modality: z.string().min(1, { message: 'Modality is required.' }),
  patientDetails: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ImageUploadSectionProps {
  onAnalysisStart: () => void;
  onAnalysisComplete: (results: AnalysisResult | null, error?: string) => void;
  isLoading: boolean;
}

const cleanJsonString = (rawString: string): string => {
  let cleanedString = rawString.trim();
  if (cleanedString.startsWith("```json") && cleanedString.endsWith("```")) {
    cleanedString = cleanedString.substring(7, cleanedString.length - 3).trim();
  } else if (cleanedString.startsWith("```") && cleanedString.endsWith("```")) {
    cleanedString = cleanedString.substring(3, cleanedString.length - 3).trim();
  }
  return cleanedString;
};

export default function ImageUploadSection({ onAnalysisStart, onAnalysisComplete, isLoading }: ImageUploadSectionProps) {
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientDetails: '',
      modality: '',
    },
  });

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue('image', event.target.files as FileList);
      try {
        const previewDataUrl = URL.createObjectURL(file);
        setImageDataUrl(previewDataUrl);
      } catch (error) {
        console.error("Error creating object URL for preview:", error);
        toast({
          variant: "destructive",
          title: "Preview Error",
          description: "Could not generate image preview.",
        });
        setImageDataUrl(null);
      }
    } else {
      setImageDataUrl(null);
      form.resetField('image');
    }
  };
  
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    onAnalysisStart();
    const file = data.image[0];

    try {
      if (typeof window.puter === 'undefined' ||
          typeof window.puter.auth === 'undefined' ||
          typeof window.puter.ai === 'undefined') {
        onAnalysisComplete(null, "Puter.js SDK is not fully loaded or initialized. Please refresh the page or try again later.");
        return;
      }
      const puter = window.puter;

      let isSignedIn = await puter.auth.isSignedIn();
      if (!isSignedIn) {
        try {
          await puter.auth.signIn();
          isSignedIn = await puter.auth.isSignedIn();
          if (!isSignedIn) {
            onAnalysisComplete(null, "Authentication is required to proceed. The login process was not completed or was cancelled by the user.");
            return;
          }
        } catch (authError) {
          console.error("Puter sign-in attempt error:", authError);
          const friendlyAuthError = getLaymanErrorMessage(authError);
          onAnalysisComplete(null, friendlyAuthError);
          return;
        }
      }
      
      const isStillAuthedForAICalls = await puter.auth.isSignedIn();
      if (!isStillAuthedForAICalls) {
        onAnalysisComplete(null, "Your session seems to have expired or is invalid. Please try logging out and logging back in, then attempt the analysis again.");
        return;
      }

      const preprocessedDataUrl = await preprocessImage(file, 1024);

      const reportPrompt = `
        You are an AI assistant specialized in analyzing medical images.
        The user has uploaded what they assert is a ${data.modality} image.
        Patient details: ${data.patientDetails || 'Not provided'}.
        
        Your task is to perform a comprehensive analysis of the provided image, including:

        1. General Analysis:
        - Provide a detailed description of key findings
        - Identify any abnormalities or notable anatomical features
        - Note image quality and any limitations

        2. Specialized Detection:
        - Tumor Analysis: Identify and describe any potential tumorous masses, their boundaries, and characteristics
        - Fracture Detection: Look for and describe any bone fractures, including type and severity
        - Diabetic Retinopathy: For eye-related images, check for signs of diabetes-related vision issues
        - Cell Analysis: For histopathology images, identify any abnormal cell patterns
        - Wound Assessment: For wound images, evaluate healing progress and potential complications

        3. Measurements and Mapping:
        - Provide approximate measurements of any abnormalities
        - Describe the location and extent of findings
        - Note any anatomical landmarks for surgical planning

        Even if the image quality is suboptimal or presents challenges, attempt to extract as much information as possible.
        
        The report MUST be in JSON format with the following keys:
        - "findings": (string) A detailed description of key findings, any abnormalities, or notable anatomical features
        - "possibleDiagnoses": (array of strings) A list of possible differential diagnoses based on the findings
        - "recommendations": (string) Relevant recommendations for further investigation or treatment

        If, after attempting analysis, you genuinely cannot provide any meaningful medical interpretation (e.g., it's clearly not a medical image, or completely uninterpretable), then provide a concise error message within the JSON structure under a key "error". Example: {"error": "Image is not a recognizable medical scan."}
      `;
      
      const reportResponse = await puter.ai.chat(reportPrompt, preprocessedDataUrl);

      if (!reportResponse || !reportResponse.message || !reportResponse.message.content) {
        throw new Error('Failed to get a valid response from AI for medical report. The response was empty or malformed.');
      }

      let parsedReportData;
      const rawReportContent = reportResponse.message.content;
      try {
        const cleanedReportContent = cleanJsonString(rawReportContent);
        parsedReportData = JSON.parse(cleanedReportContent);
      } catch (parseError) {
        console.error("Failed to parse AI report response:", rawReportContent, parseError);
        throw new Error(`AI response for report was not valid JSON. Raw response: ${rawReportContent}`);
      }

      if (parsedReportData.error) {
        throw new Error(`AI analysis error: ${parsedReportData.error}`);
      }

      const typedReport: MedicalReport = {
        findings: parsedReportData.findings || "No specific findings provided by AI.",
        possibleDiagnoses: Array.isArray(parsedReportData.possibleDiagnoses) ? parsedReportData.possibleDiagnoses : [],
        recommendations: parsedReportData.recommendations || "No specific recommendations provided by AI."
      };

      const nextStepsPrompt = `
        Based on the following medical findings: "${typedReport.findings}",
        and possible diagnoses: "${typedReport.possibleDiagnoses.join(', ')}",
        suggest a list of actionable next steps for the medical professional.
        Return the next steps as a JSON object with a single key "nextSteps" (string).
        The "nextSteps" string can contain newline characters for list formatting (e.g., "1. Step one\\n2. Step two").
      `;

      const nextStepsResponse = await puter.ai.chat(nextStepsPrompt, { model: 'gpt-4o' });

      if (!nextStepsResponse || !nextStepsResponse.message || !nextStepsResponse.message.content) {
        throw new Error('Failed to get a valid response from AI for next steps. The response was empty or malformed.');
      }
      
      let parsedNextStepsData;
      const rawNextStepsContent = nextStepsResponse.message.content;
      try {
        const cleanedNextStepsContent = cleanJsonString(rawNextStepsContent);
        parsedNextStepsData = JSON.parse(cleanedNextStepsContent);
      } catch (parseError) {
        console.error("Failed to parse AI next steps response:", rawNextStepsContent, parseError);
        throw new Error(`AI response for next steps was not valid JSON. Raw response: ${rawNextStepsContent}`);
      }

      const typedNextSteps: NextSteps = {
        nextSteps: parsedNextStepsData.nextSteps || "No specific next steps provided by AI."
      };

      onAnalysisComplete({ report: typedReport, nextSteps: typedNextSteps });

    } catch (error) {
      console.error('Error during analysis:', error);
      const friendlyErrorMessage = getLaymanErrorMessage(error);
      onAnalysisComplete(null, friendlyErrorMessage);
    }
  };

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center">
          <UploadCloud className="mr-2 h-6 w-6 text-primary" />
          Upload Medical Image
        </CardTitle>
        <CardDescription>
          Securely upload an X-ray, MRI, or CT scan for AI analysis using Puter.js.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="image"
              render={() => (
                <FormItem>
                  <FormLabel htmlFor="image-upload">Medical Image File</FormLabel>
                  <FormControl>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/png, image/jpeg, image/dicom, .dcm"
                      onChange={handleFileChange}
                      className="file:text-primary file:font-semibold file:bg-primary/10 hover:file:bg-primary/20"
                    />
                  </FormControl>
                  <FormDescription>
                    Max Size: 10MB
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {imageDataUrl && <ImagePreview imageDataUrl={imageDataUrl} />}
            
            <FormField
              control={form.control}
              name="modality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image Modality</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select modality (e.g., X-ray, MRI)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="X-ray">X-ray</SelectItem>
                      <SelectItem value="MRI">MRI</SelectItem>
                      <SelectItem value="CT scan">CT Scan</SelectItem>
                      <SelectItem value="Ultrasound">Ultrasound</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="patientDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient Details (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Age: 45, Sex: Male, Relevant medical history..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide any relevant patient information for more accurate analysis.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UploadCloud className="mr-2 h-4 w-4" />
              )}
              Analyze Image
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}