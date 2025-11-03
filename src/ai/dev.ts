import { config } from 'dotenv';
config();

import '@/ai/flows/grade-quiz-and-provide-feedback.ts';
import '@/ai/flows/generate-quiz-from-pdf.ts';
import '@/ai/flows/explain-answer.ts';