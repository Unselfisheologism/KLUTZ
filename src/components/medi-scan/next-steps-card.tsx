import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ListChecks } from 'lucide-react';
import type { NextSteps } from '@/types/mediscan';

interface NextStepsCardProps {
  nextSteps: NextSteps;
}

export default function NextStepsCard({ nextSteps }: NextStepsCardProps) {
  const rawSteps = nextSteps.nextSteps || "";
  const formattedSteps = rawSteps
    .split('\n')
    .map(step => step.trim())
    .filter(step => step.length > 0 && !step.match(/^(Actionable Next Steps:?|Next Steps:?)$/i)) 
    .map(step => step.replace(/^[-*]\s*/, '').replace(/^\d+\.\s*/, '')); // Remove leading list markers

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center">
          <ListChecks className="mr-2 h-6 w-6 text-primary" />
          Actionable Next Steps
        </CardTitle>
        <CardDescription>AI-suggested insights for further action.</CardDescription>
      </CardHeader>
      <CardContent>
        {formattedSteps.length > 0 ? (
          <ul className="space-y-3">
            {formattedSteps.map((step, index) => (
              <li key={index} className="flex items-start">
                <span className="flex-shrink-0 h-6 w-6 rounded-full bg-accent/20 text-accent flex items-center justify-center mr-3 mt-0.5">
                  <ListChecks className="h-4 w-4" />
                </span>
                <span className="text-base">{step}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">No specific next steps provided by the AI, or the format was not recognized.</p>
        )}
      </CardContent>
    </Card>
  );
}
