import { config } from 'dotenv';
config();

import '@/ai/flows/generate-medical-report.ts';
import '@/ai/flows/suggest-next-steps.ts';
import '@/ai/flows/detect-image-anomalies.ts';