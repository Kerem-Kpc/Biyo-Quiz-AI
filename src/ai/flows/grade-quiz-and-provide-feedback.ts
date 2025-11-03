'use server';
/**
 * @fileOverview Grades a quiz and provides feedback to the user.
 *
 * - gradeQuizAndProvideFeedback - A function that grades the quiz and provides feedback.
 * - GradeQuizAndProvideFeedbackInput - The input type for the gradeQuizAndProvideFeedback function.
 * - GradeQuizAndProvideFeedbackOutput - The return type for the gradeQuizAndProvideFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GradeQuizAndProvideFeedbackInputSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string(),
      options: z.array(z.string()),
      correctAnswerIndex: z.number().min(0),
    })
  ),
  userAnswers: z.array(z.number().min(0)),
});
export type GradeQuizAndProvideFeedbackInput = z.infer<
  typeof GradeQuizAndProvideFeedbackInputSchema
>;

const GradeQuizAndProvideFeedbackOutputSchema = z.object({
  score: z.number(),
  feedback: z.array(z.string()),
});
export type GradeQuizAndProvideFeedbackOutput = z.infer<
  typeof GradeQuizAndProvideFeedbackOutputSchema
>;

export async function gradeQuizAndProvideFeedback(
  input: GradeQuizAndProvideFeedbackInput
): Promise<GradeQuizAndProvideFeedbackOutput> {
  return gradeQuizAndProvideFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'gradeQuizAndProvideFeedbackPrompt',
  input: {schema: GradeQuizAndProvideFeedbackInputSchema},
  output: {schema: GradeQuizAndProvideFeedbackOutputSchema},
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
  prompt: `Sen uzman bir quiz notlandırıcısısın. Lütfen aşağıdaki quizi notlandır ve kullanıcıya geri bildirimde bulun. Geri bildirimlerin Türkçe olmalı.

Quiz Soruları:
{{#each questions}}
  Soru {{@index + 1}}: {{this.question}}
  Seçenekler:
  {{#each this.options}}
    {{@index + 1}}: {{this}}
  {{/each}}
  Doğru Cevap Dizini: {{this.correctAnswerIndex}}
{{/each}}

Kullanıcı Cevapları: {{userAnswers}}


Quizi notlandır ve {{questions.length}} üzerinden bir puan ver. Ayrıca, her soru için geri bildirimde bulunarak cevabın doğru mu yanlış mı olduğunu belirt ve doğru cevap için kısa bir açıklama yap.

Puanın bir sayı ve geri bildirimin bir dizi dize olduğundan emin ol.

Çıktı formatı: 
{
  "score": number,
  "feedback": string[]
}
`,
});

const gradeQuizAndProvideFeedbackFlow = ai.defineFlow(
  {
    name: 'gradeQuizAndProvideFeedbackFlow',
    inputSchema: GradeQuizAndProvideFeedbackInputSchema,
    outputSchema: GradeQuizAndProvideFeedbackOutputSchema,
  },
  async input => {
    const {questions, userAnswers} = input;
    let score = 0;
    const feedback: string[] = [];

    for (let i = 0; i < questions.length; i++) {
      if (questions[i].correctAnswerIndex === userAnswers[i]) {
        score++;
        feedback.push(`Soru ${i + 1}: Doğru!`);
      } else {
        feedback.push(
          `Soru ${i + 1}: Yanlış. Doğru cevap ${questions[i].correctAnswerIndex + 1}. seçenekti.`
        );
      }
    }

    return {
      score: score,
      feedback: feedback,
    };
  }
);
