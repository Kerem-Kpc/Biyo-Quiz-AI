"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { QuizQuestion } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface QuizFormProps {
  quiz: QuizQuestion[];
  onSubmit: (answers: number[]) => void;
  isLoading: boolean;
}

export default function QuizForm({ quiz, onSubmit, isLoading }: QuizFormProps) {
  const formSchema = z.object(
    Object.fromEntries(
      quiz.map((_, index) => [
        `q${index}`,
        z.string().min(1, { message: 'Lütfen bir cevap seçin.' }),
      ])
    )
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  function handleSubmit(data: z.infer<typeof formSchema>) {
    const answers = quiz.map((_, index) => parseInt(data[`q${index}`], 10));
    onSubmit(answers);
  }

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <CardTitle className="text-2xl md:text-3xl text-center font-bold">Biyoloji Quizi</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            {quiz.map((q, index) => (
              <FormField
                key={index}
                control={form.control}
                name={`q${index}`}
                render={({ field }) => (
                  <FormItem className="space-y-3 p-4 md:p-6 rounded-lg border bg-card">
                    <FormLabel className="text-base md:text-lg font-semibold">
                      {index + 1}. {q.question}
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-2"
                      >
                        {q.options.map((option, optionIndex) => (
                          <FormItem
                            key={optionIndex}
                            className="flex items-center space-x-3 space-y-0"
                          >
                            <FormControl>
                              <RadioGroupItem value={String(optionIndex)} />
                            </FormControl>
                            <FormLabel className="font-normal text-sm md:text-base">
                              {option}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <Button type="submit" className="w-full text-base md:text-lg py-6" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Gönderiliyor...
                </>
              ) : (
                'Cevapları Gönder'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
