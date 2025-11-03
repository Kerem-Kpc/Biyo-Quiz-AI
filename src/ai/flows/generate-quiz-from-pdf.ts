'use server';

/**
 * @fileOverview Generates a quiz from a given PDF content.
 *
 * - generateQuizFromPdf - A function that generates a quiz from a PDF.
 * - GenerateQuizFromPdfInput - The input type for the generateQuizFromPdf function.
 * - GenerateQuizFromPdfOutput - The return type for the generateQuizFromPdf function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuizFromPdfInputSchema = z.object({
  pdfContent: z
    .string()
    .describe(
      "The content of the PDF, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  numberOfQuestions: z
    .number()
    .min(1)
    .max(10)
    .default(5)
    .describe('The number of questions to generate for the quiz.'),
});
export type GenerateQuizFromPdfInput = z.infer<typeof GenerateQuizFromPdfInputSchema>;

const GenerateQuizFromPdfOutputSchema = z.object({
  quiz: z.array(
    z.object({
      question: z.string().describe('The quiz question.'),
      options: z.array(z.string()).describe('The possible answers.'),
      correctAnswerIndex: z
        .number()
        .describe('The index of the correct answer in the options array.'),
    })
  ).describe('The generated quiz questions, options and correct answers.'),
});

export type GenerateQuizFromPdfOutput = z.infer<typeof GenerateQuizFromPdfOutputSchema>;

export async function generateQuizFromPdf(input: GenerateQuizFromPdfInput): Promise<GenerateQuizFromPdfOutput> {
  return generateQuizFromPdfFlow(input);
}

const generateQuizFromPdfPrompt = ai.definePrompt({
  name: 'generateQuizFromPdfPrompt',
  input: {schema: GenerateQuizFromPdfInputSchema},
  output: {schema: GenerateQuizFromPdfOutputSchema},
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
  prompt: `Sen biyoloji öğrencileri için bir quiz hazırlayan bir yapay zekasın. Sana bir PDF içeriği veriliyor ve çoktan seçmeli sorularla bir quiz oluşturmalısın. Tüm sorular ve cevaplar Türkçe olmalı.

PDF İçeriği: {{media url=pdfContent}}

Soru Sayısı: {{numberOfQuestions}}

Belirtilen sayıda soru içeren bir quiz oluştur, her sorunun 4 olası cevabı olmalıdır. Cevaplardan biri doğru cevap olmalıdır. Quizi bir JSON nesne dizisi olarak döndür. Her nesnenin şu anahtarlara sahip olması gerekir:

- question: quiz sorusu
- options: 4 dizelik bir dizi, olası cevaplar
- correctAnswerIndex: seçenekler dizisindeki doğru cevabın dizini

Quizin PDF içeriğiyle ilgili olduğundan emin ol.

İşte quiz:
`,
});

const generateQuizFromPdfFlow = ai.defineFlow(
  {
    name: 'generateQuizFromPdfFlow',
    inputSchema: GenerateQuizFromPdfInputSchema,
    outputSchema: GenerateQuizFromPdfOutputSchema,
  },
  async input => {
    const {output} = await generateQuizFromPdfPrompt(input);
    return output!;
  }
);
