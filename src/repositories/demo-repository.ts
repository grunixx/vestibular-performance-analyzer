import { seedQuestions, seedQuizzes } from "@/data/seed";
import { QuizRepository } from "@/repositories/types";
import { Question, Quiz } from "@/types/domain";

export class DemoRepository implements QuizRepository {
  async listQuizzes(): Promise<Quiz[]> {
    return seedQuizzes;
  }

  async getQuizById(quizId: string): Promise<Quiz | undefined> {
    return seedQuizzes.find((quiz) => quiz.id === quizId);
  }

  async listQuestionsByQuiz(quizId: string): Promise<Question[]> {
    return seedQuestions
      .filter((question) => question.quizId === quizId)
      .sort((a, b) => a.index - b.index);
  }
}
