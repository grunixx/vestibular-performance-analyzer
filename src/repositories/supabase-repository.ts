import { getSupabaseClient } from "@/lib/supabase/client";
import { QuizRepository } from "@/repositories/types";
import { Question, Quiz } from "@/types/domain";

export class SupabaseRepository implements QuizRepository {
  async listQuizzes(): Promise<Quiz[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("quizzes")
      .select("id,title,exam_board,year,description,duration_minutes");

    if (error || !data) return [];

    return data.map((row) => ({
      id: row.id,
      title: row.title,
      examBoard: row.exam_board,
      year: row.year,
      description: row.description,
      durationMinutes: row.duration_minutes,
      questionIds: []
    }));
  }

  async getQuizById(quizId: string): Promise<Quiz | undefined> {
    const supabase = getSupabaseClient();
    if (!supabase) return undefined;

    const { data, error } = await supabase
      .from("quizzes")
      .select("id,title,exam_board,year,description,duration_minutes")
      .eq("id", quizId)
      .single();

    if (error || !data) return undefined;

    const questions = await this.listQuestionsByQuiz(quizId);

    return {
      id: data.id,
      title: data.title,
      examBoard: data.exam_board,
      year: data.year,
      description: data.description,
      durationMinutes: data.duration_minutes,
      questionIds: questions.map((question) => question.id)
    };
  }

  async listQuestionsByQuiz(quizId: string): Promise<Question[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("questions")
      .select(
        "id,quiz_id,position,statement,subject,topic,type,options,correct_option_id,explanation,default_error_tag_id"
      )
      .eq("quiz_id", quizId)
      .order("position", { ascending: true });

    if (error || !data) return [];

    return data.map((row) => ({
      id: row.id,
      quizId: row.quiz_id,
      index: row.position,
      statement: row.statement,
      subject: row.subject,
      topic: row.topic,
      type: row.type,
      options: (row.options as Question["options"]) ?? [],
      correctOptionId: row.correct_option_id ?? undefined,
      explanation: row.explanation,
      defaultErrorTagId: row.default_error_tag_id
    }));
  }
}
