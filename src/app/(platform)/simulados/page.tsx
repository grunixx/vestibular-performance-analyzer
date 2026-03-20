"use client";

import { ClipboardList, SearchCheck } from "lucide-react";

import { QuizCard } from "@/components/quiz-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useApp } from "@/hooks/use-app";

export default function SimuladosPage(): JSX.Element {
  const { quizzes, loadingCatalog } = useApp();

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Explore simulados por banca e ano. Cada tentativa gera análise, recomendações e
        histórico de evolução.
      </p>

      {loadingCatalog ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={`quiz-skeleton-${index}`}
              className="rounded-2xl border border-border/70 bg-card/75 p-4"
            >
              <Skeleton className="h-5 w-24" />
              <Skeleton className="mt-4 h-7 w-3/4" />
              <Skeleton className="mt-2 h-4 w-full" />
              <Skeleton className="mt-1.5 h-4 w-5/6" />
              <Skeleton className="mt-6 h-10 w-full" />
            </div>
          ))}
        </section>
      ) : quizzes.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Nenhum simulado disponível"
          description="Cadastre simulados no Supabase ou mantenha o modo demo para usar os simulados de exemplo."
        />
      ) : (
        <>
          <div className="inline-flex items-center gap-2 rounded-full border border-border/75 bg-background/70 px-3 py-1 text-xs text-muted-foreground">
            <SearchCheck className="h-3.5 w-3.5 text-primary" />
            {quizzes.length} simulados disponíveis para treino
          </div>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {quizzes.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} />
            ))}
          </section>
        </>
      )}
    </div>
  );
}
