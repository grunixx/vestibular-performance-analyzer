import { DemoRepository } from "@/repositories/demo-repository";
import { SupabaseRepository } from "@/repositories/supabase-repository";
import { QuizRepository } from "@/repositories/types";

export function createQuizRepository(useSupabase: boolean): QuizRepository {
  if (useSupabase) {
    return new SupabaseRepository();
  }

  return new DemoRepository();
}
