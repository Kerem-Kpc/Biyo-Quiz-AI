"use client";

import { useState } from 'react';
import type { GradeQuizAndProvideFeedbackOutput } from '@/ai/flows/grade-quiz-and-provide-feedback';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { QuizQuestion } from '@/lib/types';
import { CheckCircle2, XCircle, Lightbulb } from 'lucide-react';
import ExplanationDialog from './explanation-dialog';

interface QuizResultsProps {
  quiz: QuizQuestion[];
  results: GradeQuizAndProvideFeedbackOutput;
  userAnswers: number[];
  onRestart: () => void;
}

export default function QuizResults({
  quiz,
  results,
  userAnswers,
  onRestart,
}: QuizResultsProps) {
  const [explainingQuestion, setExplainingQuestion] = useState<QuizQuestion | null>(null);
  const [explainingAnswer, setExplainingAnswer] = useState<string | null>(null);

  const scorePercentage = (results.score / quiz.length) * 100;

  const handleExplain = (question: QuizQuestion, userAnswerIndex: number) => {
    setExplainingQuestion(question);
    setExplainingAnswer(question.options[userAnswerIndex]);
  };

  return (
    <>
      <Card className="shadow-lg w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl md:text-3xl font-bold">Quiz Sonuçları</CardTitle>
          <p className="text-lg md:text-xl text-muted-foreground mt-2">
            {quiz.length} sorudan {results.score} doğru yaptınız
          </p>
          <Progress value={scorePercentage} className="w-full mt-4" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Accordion type="single" collapsible className="w-full">
            {quiz.map((question, index) => {
              const userAnswerIndex = userAnswers[index];
              const isCorrect =
                question.correctAnswerIndex === userAnswerIndex;

              return (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border-b"
                >
                  <AccordionTrigger className="hover:no-underline text-left text-sm md:text-base">
                    <div className="flex items-center gap-3 w-full">
                      {isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                      )}
                      <span className="flex-1 font-medium">{question.question}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4 px-4 space-y-4 text-sm md:text-base">
                    <p>
                      <span className="font-semibold">Sizin cevabınız: </span>
                      <span
                        className={isCorrect ? 'text-green-700' : 'text-red-700'}
                      >
                        {question.options[userAnswerIndex]}
                      </span>
                    </p>
                    {!isCorrect && (
                      <p>
                        <span className="font-semibold">Doğru cevap: </span>
                        <span className="text-green-700">
                          {question.options[question.correctAnswerIndex]}
                        </span>
                      </p>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExplain(question, userAnswerIndex)}
                    >
                      <Lightbulb className="mr-2 h-4 w-4" />
                      Cevabı Açıkla
                    </Button>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>

          <Button onClick={onRestart} className="w-full text-base md:text-lg py-6" size="lg">
            Yeni Bir Quiz Oluştur
          </Button>
        </CardContent>
      </Card>

      {explainingQuestion && explainingAnswer !== null && (
        <ExplanationDialog
          isOpen={!!explainingQuestion}
          onClose={() => setExplainingQuestion(null)}
          question={explainingQuestion}
          userAnswer={explainingAnswer}
        />
      )}
    </>
  );
}
