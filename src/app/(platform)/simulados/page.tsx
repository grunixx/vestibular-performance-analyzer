"use client";

import { ClipboardList } from "lucide-react";

import { QuizCard } from "@/components/quiz-card";
import { useApp } from "@/hooks/use-app";
import { Card, CardContent } from "@/components/ui/card";

export default function SimuladosPage(): JSX.Element {
  const { quizzes, loadingCatalog } = useApp();

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          Catalogo de simulados
        </p>
        <h1 className="mt-1 text-3xl font-semibold">Escolha sua proxima prova</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Selecione um simulado e acompanhe desempenho por tempo, acertos e padroes de erro.
        </p>
      </header>

      {loadingCatalog ? (
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">
            Carregando simulados...
          </CardContent>
        </Card>
      ) : quizzes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 p-10 text-center">
            <ClipboardList className="h-6 w-6 text-muted-foreground" />
            <p className="font-medium">Nenhum simulado cadastrado.</p>
            <p className="max-w-md text-sm text-muted-foreground">
              Adicione simulados no Supabase ou mantenha o modo demo para usar os dados de exemplo.
            </p>
          </CardContent>
        </Card>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {quizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </section>
      )}
    </div>
  );
}
