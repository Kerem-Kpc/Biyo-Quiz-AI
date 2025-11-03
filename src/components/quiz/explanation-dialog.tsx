"use client";

import { useEffect, useState } from 'react';
import { explainAnswer } from '@/ai/flows/explain-answer';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { QuizQuestion } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Terminal } from 'lucide-react';

interface ExplanationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  question: QuizQuestion;
  userAnswer: string;
}

export default function ExplanationDialog({
  isOpen,
  onClose,
  question,
  userAnswer,
}: ExplanationDialogProps) {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      const fetchExplanation = async () => {
        setIsLoading(true);
        setExplanation(null);
        try {
          const result = await explainAnswer({
            question: question.question,
            answer: userAnswer,
            correctAnswer: question.options[question.correctAnswerIndex],
            isCorrect: userAnswer === question.options[question.correctAnswerIndex],
            context: `Çalışma materyaline göre, soru şuydu: "${question.question}"`,
          });
          setExplanation(result.explanation);
        } catch (error) {
          console.error('Açıklama alınırken hata:', error);
          toast({
            title: 'Hata',
            description: 'Şu anda bir açıklama alınamadı.',
            variant: 'destructive',
          });
          onClose();
        } finally {
          setIsLoading(false);
        }
      };

      fetchExplanation();
    }
  }, [isOpen, question, userAnswer, onClose, toast]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cevap Açıklaması</DialogTitle>
          <DialogDescription>
            İşte cevabın ayrıntılı bir dökümü.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <p className="font-semibold">{question.question}</p>
          {isLoading && (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          )}
          {explanation && (
             <Alert>
              <Terminal className="h-4 w-4" />
              <AlertTitle>Açıklama</AlertTitle>
              <AlertDescription>
                {explanation}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
