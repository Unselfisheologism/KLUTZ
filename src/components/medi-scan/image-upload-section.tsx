'use client';

import type { ChangeEvent } from 'react';
import { useState } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { preprocessImage } from '@/lib/image-utils';
import { UploadCloud, Loader2 } from 'lucide-react';
import ImagePreview from './image-preview';
import type { GenerateMedicalReportOutput } from '@/ai/flows/generate-medical-report';
import type { SuggestNextStepsOutput } from '@/ai/flows/suggest-next-steps';
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
  onAnalysisComplete: (results: { report: GenerateMedicalReportOutput | null, nextSteps: SuggestNextStepsOutput | null } | null, error?: string) => void;
  isLoading: boolean;
}

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
        // Show a lower-quality preview quickly
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
      const preprocessedDataUrl = await preprocessImage(file, 1024); // Resize to 1024px width

      // This dynamic import is required by Genkit for server actions.
      const { handleImageAnalysis } = await import('@/app/actions');
      const result = await handleImageAnalysis(
        preprocessedDataUrl,
        data.modality,
        data.patientDetails
      );

      if (result.error) {
        onAnalysisComplete(null, result.error);
      } else {
        onAnalysisComplete({ report: result.report, nextSteps: result.nextSteps });
      }
    } catch (error) {
      console.error('Error processing image or calling AI:', error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      onAnalysisComplete(null, `Image processing or AI analysis failed: ${errorMessage}`);
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
          Securely upload an X-ray, MRI, or CT scan for AI analysis.
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
                    Supported formats: PNG, JPG, DICOM. Max size: 10MB.
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
