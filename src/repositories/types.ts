import { Question, Quiz } from "@/types/domain";

export interface QuizRepository {
  listQuizzes(): Promise<Quiz[]>;
  getQuizById(quizId: string): Promise<Quiz | undefined>;
  listQuestionsByQuiz(quizId: string): Promise<Question[]>;
}
