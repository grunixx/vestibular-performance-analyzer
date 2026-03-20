"use client";

import Link from "next/link";
import { ArrowRightLeft, FileClock, History } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from "@/hooks/use-app";
import { formatDateTime, formatDuration } from "@/lib/utils";

export default function HistoryPage(): JSX.Element {
  const { attempts, summaries, getQuizById } = useApp();

  const completedAttempts = [...attempts]
    .filter((attempt) => attempt.status === "completed")
    .sort((a, b) => (b.finishedAt ?? "").localeCompare(a.finishedAt ?? ""));

  const summaryMap = new Map(summaries.map((summary) => [summary.attemptId, summary]));

  const attemptGroupsByQuiz = completedAttempts.reduce<Record<string, typeof completedAttempts>>(
    (groups, attempt) => {
      groups[attempt.quizId] = groups[attempt.quizId] ?? [];
      groups[attempt.quizId].push(attempt);
      return groups;
    },
    {}
  );

  const comparison = Object.entries(attemptGroupsByQuiz)
    .map(([quizId, groupedAttempts]) => {
      if (groupedAttempts.length < 2) return null;
      const [current, previous] = groupedAttempts;
      const currentSummary = summaryMap.get(current.id);
      const previousSummary = summaryMap.get(previous.id);
      if (!currentSummary || !previousSummary) return null;
      return {
        quizId,
        currentAttemptId: current.id,
        previousAttemptId: previous.id,
        currentAccuracy: currentSummary.accuracy,
        previousAccuracy: previousSummary.accuracy,
        deltaAccuracy: currentSummary.accuracy - previousSummary.accuracy,
        deltaTimeSeconds: current.totalTimeSeconds - previous.totalTimeSeconds
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Historico</p>
        <h1 className="text-3xl font-semibold">Tentativas anteriores</h1>
        <p className="mt-2 text-muted-foreground">
          Acompanhe evolucao, compare tentativas e abra resultados em detalhe.
        </p>
      </header>

      {completedAttempts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
            <History className="h-6 w-6 text-muted-foreground" />
            <p className="font-medium">Nenhuma tentativa concluida ainda.</p>
            <p className="text-sm text-muted-foreground">
              Conclua seu primeiro simulado para construir historico.
            </p>
            <Button asChild>
              <Link href="/simulados">Ir para simulados</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <section className="grid gap-4 md:grid-cols-2">
          {completedAttempts.map((attempt) => {
            const summary = summaryMap.get(attempt.id);
            const quiz = getQuizById(attempt.quizId);
            return (
              <Card key={attempt.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{quiz?.title ?? "Simulado"}</CardTitle>
                  <CardDescription>
                    {quiz?.examBoard} {quiz?.year} - concluido em {formatDateTime(attempt.finishedAt)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      Aproveitamento {Math.round((summary?.accuracy ?? 0) * 100)}%
                    </Badge>
                    <Badge variant="outline">
                      Nota {summary?.score ?? 0}/{summary?.objectiveQuestions ?? 0}
                    </Badge>
                    <Badge variant="outline">Tempo {formatDuration(attempt.totalTimeSeconds)}</Badge>
                  </div>
                  <Button asChild className="w-full">
                    <Link href={`/tentativas/${attempt.id}/resultado`}>Abrir resultado</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </section>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-primary" />
            Comparacao entre tentativas
          </CardTitle>
          <CardDescription>
            Evolucao por simulado quando existem duas ou mais tentativas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {comparison.length > 0 ? (
            comparison.map((item) => {
              const quiz = getQuizById(item.quizId);
              const improved = item.deltaAccuracy >= 0;
              return (
                <div key={item.currentAttemptId} className="rounded-md border p-3">
                  <p className="font-medium">{quiz?.title ?? item.quizId}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Variacao de aproveitamento:{" "}
                    <strong className={improved ? "text-emerald-700" : "text-red-600"}>
                      {(item.deltaAccuracy * 100).toFixed(1)}%
                    </strong>{" "}
                    - variacao de tempo: {formatDuration(Math.abs(item.deltaTimeSeconds))}{" "}
                    {item.deltaTimeSeconds < 0 ? "mais rapido" : "mais lento"}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/tentativas/${item.previousAttemptId}/resultado`}>
                        Tentativa anterior
                      </Link>
                    </Button>
                    <Button asChild size="sm">
                      <Link href={`/tentativas/${item.currentAttemptId}/resultado`}>
                        Tentativa atual
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="flex items-center text-sm text-muted-foreground">
              <FileClock className="mr-2 h-4 w-4" />
              Ainda nao ha duas tentativas do mesmo simulado para comparar.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
