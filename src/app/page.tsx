"use client";

import { useState } from 'react';
import type { GradeQuizAndProvideFeedbackOutput } from '@/ai/flows/grade-quiz-and-provide-feedback';
import { generateQuizFromPdf } from '@/ai/flows/generate-quiz-from-pdf';
import { gradeQuizAndProvideFeedback } from '@/ai/flows/grade-quiz-and-provide-feedback';
import PdfUploader from '@/components/quiz/pdf-uploader';
import QuizForm from '@/components/quiz/quiz-form';
import QuizResults from '@/components/quiz/quiz-results';
import { useToast } from '@/hooks/use-toast';
import type { QuizQuestion } from '@/lib/types';
import { fileToBase64 } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type Step = 'upload' | 'quiz' | 'results';

export default function Home() {
  const [step, setStep] = useState<Step>('upload');
  const [isLoading, setIsLoading] = useState(false);
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [quizResults, setQuizResults] =
    useState<GradeQuizAndProvideFeedbackOutput | null>(null);
  const [userAnswers, setUserAnswers] = useState<number[] | null>(null);
  const { toast } = useToast();

  const handleGenerateQuiz = async (pdfFile: File) => {
    setIsLoading(true);
    try {
      const pdfContent = await fileToBase64(pdfFile);
      const result = await generateQuizFromPdf({
        pdfContent,
        numberOfQuestions: 5,
      });

      if (!result.quiz || result.quiz.length === 0) {
        throw new Error("Sağlanan PDF'den quiz oluşturulamadı.");
      }

      setQuiz(result.quiz);
      setStep('quiz');
    } catch (error) {
      console.error(error);
      toast({
        title: 'Quiz Oluşturulurken Hata',
        description:
          error instanceof Error
            ? error.message
            : 'Beklenmedik bir hata oluştu.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuizSubmit = async (answers: number[]) => {
    if (!quiz) return;
    setIsLoading(true);
    setUserAnswers(answers);
    try {
      const results = await gradeQuizAndProvideFeedback({
        questions: quiz,
        userAnswers: answers,
      });
      setQuizResults(results);
      setStep('results');
    } catch (error) {
      console.error(error);
      toast({
        title: 'Quiz Değerlendirilirken Hata',
        description: 'Cevaplarınız değerlendirilirken beklenmedik bir hata oluştu.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestart = () => {
    setStep('upload');
    setQuiz(null);
    setQuizResults(null);
    setUserAnswers(null);
    setIsLoading(false);
  };

  const renderStep = () => {
    switch (step) {
      case 'upload':
        return (
          <PdfUploader
            onGenerateQuiz={handleGenerateQuiz}
            isLoading={isLoading}
          />
        );
      case 'quiz':
        return (
          quiz && (
            <QuizForm
              quiz={quiz}
              onSubmit={handleQuizSubmit}
              isLoading={isLoading}
            />
          )
        );
      case 'results':
        return (
          quiz &&
          quizResults &&
          userAnswers && (
            <QuizResults
              quiz={quiz}
              results={quizResults}
              userAnswers={userAnswers}
              onRestart={handleRestart}
            />
          )
        );
      default:
        return (
          <div className="text-center">
            <p>Bir şeyler yanlış gitti.</p>
            <Button onClick={handleRestart}>Baştan Başla</Button>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-4 md:py-8 px-4">
      {renderStep()}
    </div>
  );
}
