'use server';

/**
 * @fileOverview AI flow for generating medical reports from medical images.
 *
 * - generateMedicalReport - A function that generates medical reports.
 * - GenerateMedicalReportInput - The input type for the generateMedicalReport function.
 * - GenerateMedicalReportOutput - The return type for the generateMedicalReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMedicalReportInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A medical image (X-ray, MRI, CT scan) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  modality: z
    .string()
    .describe('The modality of the medical image (e.g., X-ray, MRI, CT scan).'),
  patientDetails: z
    .string()
    .optional()
    .describe('Optional details about the patient (age, sex, medical history).'),
});
export type GenerateMedicalReportInput = z.infer<typeof GenerateMedicalReportInputSchema>;

const GenerateMedicalReportOutputSchema = z.object({
  findings: z.string().describe('The findings from the medical image analysis.'),
  possibleDiagnoses: z
    .array(z.string())
    .describe('Possible differential diagnoses based on the findings.'),
  recommendations: z
    .string()
    .describe('Relevant recommendations for further investigation or treatment.'),
});
export type GenerateMedicalReportOutput = z.infer<typeof GenerateMedicalReportOutputSchema>;

export async function generateMedicalReport(
  input: GenerateMedicalReportInput
): Promise<GenerateMedicalReportOutput> {
  return generateMedicalReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMedicalReportPrompt',
  input: {schema: GenerateMedicalReportInputSchema},
  output: {schema: GenerateMedicalReportOutputSchema},
  prompt: `You are an AI assistant specializing in analyzing medical images and generating medical reports for doctors.

You will analyze the provided medical image and generate a structured medical report with the following sections:

1.  Findings: Describe the key findings from the medical image, including any abnormalities or notable anatomical features.
2.  Possible Diagnoses: Based on the findings, provide a list of possible differential diagnoses.
3.  Recommendations: Suggest relevant recommendations for further investigation or treatment.

Here is the medical image and related information:

Modality: {{{modality}}}
Patient Details: {{{patientDetails}}}
Image: {{media url=imageDataUri}}

Ensure the report is accurate, concise, and helpful for medical professionals in making informed decisions. Return the findings, possible diagnoses, and recommendations in the output schema format.`,
});

const generateMedicalReportFlow = ai.defineFlow(
  {
    name: 'generateMedicalReportFlow',
    inputSchema: GenerateMedicalReportInputSchema,
    outputSchema: GenerateMedicalReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
