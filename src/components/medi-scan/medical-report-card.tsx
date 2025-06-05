import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { FileText, Lightbulb, ClipboardCheck } from 'lucide-react';
import type { MedicalReport } from '@/types/mediscan';

interface MedicalReportCardProps {
  report: MedicalReport;
}

export default function MedicalReportCard({ report }: MedicalReportCardProps) {
  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">AI Medical Report</CardTitle>
        <CardDescription>Automated analysis based on the uploaded image.</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" defaultValue={['findings', 'diagnoses', 'recommendations']} className="w-full">
          <AccordionItem value="findings">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
              <div className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-primary" />
                Findings
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-base prose prose-sm max-w-none">
              <p>{report.findings || "No findings information available."}</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="diagnoses">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
              <div className="flex items-center">
                <Lightbulb className="mr-2 h-5 w-5 text-primary" />
                Possible Diagnoses
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-base prose prose-sm max-w-none">
              {report.possibleDiagnoses && report.possibleDiagnoses.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1">
                  {report.possibleDiagnoses.map((diagnosis, index) => (
                    <li key={index}>{diagnosis}</li>
                  ))}
                </ul>
              ) : (
                <p>No specific diagnoses identified by the AI.</p>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="recommendations">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
              <div className="flex items-center">
                <ClipboardCheck className="mr-2 h-5 w-5 text-primary" />
                Recommendations
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-base prose prose-sm max-w-none">
              <p>{report.recommendations || "No recommendations available."}</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
