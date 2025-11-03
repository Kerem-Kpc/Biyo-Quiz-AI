export type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswerIndex: number;
};

export type Quiz = QuizQuestion[];
