// This file implements the Genkit flow for providing AI-powered explanations for quiz answers.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

/**
 * @fileOverview AI-powered explanation generator for quiz answers.
 *
 * - explainAnswer - A function that generates explanations for quiz answers.
 * - ExplainAnswerInput - The input type for the explainAnswer function.
 * - ExplainAnswerOutput - The return type for the explainAnswer function.
 */

const ExplainAnswerInputSchema = z.object({
  question: z.string().describe('The quiz question.'),
  answer: z.string().describe('The user\u2019s answer to the question.'),
  correctAnswer: z.string().describe('The correct answer to the question.'),
  isCorrect: z.boolean().describe('Whether the user\u2019s answer is correct.'),
  context: z.string().describe('Relevant context from the PDF content.'),
});
export type ExplainAnswerInput = z.infer<typeof ExplainAnswerInputSchema>;

const ExplainAnswerOutputSchema = z.object({
  explanation: z.string().describe('The AI-generated explanation for the answer.'),
});
export type ExplainAnswerOutput = z.infer<typeof ExplainAnswerOutputSchema>;

export async function explainAnswer(input: ExplainAnswerInput): Promise<ExplainAnswerOutput> {
  return explainAnswerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainAnswerPrompt',
  input: {schema: ExplainAnswerInputSchema},
  output: {schema: ExplainAnswerOutputSchema},
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
    ],
  },
  prompt: `Sen quiz cevapları için yardımcı açıklamalar sağlayan bir yapay zeka asistanısın. Açıklamaların Türkçe olmalı.

  Soru: {{{question}}}
  Kullanıcının Cevabı: {{{answer}}}
  Doğru Cevap: {{{correctAnswer}}}
  Doğru mu: {{{isCorrect}}}
  Bağlam: {{{context}}}

  Cevap için açık ve öz bir açıklama yap. Eğer kullanıcının cevabı doğruysa, bağlama dayanarak neden doğru olduğunu açıkla. Eğer kullanıcının cevabı yanlışsa, neden yanlış olduğunu açıkla ve bağlama dayanarak doğru mantığı sun.
  `,
});

const explainAnswerFlow = ai.defineFlow(
  {
    name: 'explainAnswerFlow',
    inputSchema: ExplainAnswerInputSchema,
    outputSchema: ExplainAnswerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
