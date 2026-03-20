"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo } from "react";
import { ArrowRightLeft, Clock3, History, Trophy, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useApp } from "@/hooks/use-app";
import { formatDateTime, formatDuration } from "@/lib/utils";

const AttemptComparisonChart = dynamic(
  () =>
    import("@/components/charts/attempt-comparison-chart").then(
      (module) => module.AttemptComparisonChart
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-64 w-full rounded-xl" />
  }
);

export default function HistoryPage(): JSX.Element {
  const { attempts, summaries, getQuizById } = useApp();

  const completedAttempts = useMemo(
    () =>
      [...attempts]
        .filter((attempt) => attempt.status === "completed")
        .sort((a, b) => (b.finishedAt ?? "").localeCompare(a.finishedAt ?? "")),
    [attempts]
  );

  const summaryMap = useMemo(
    () => new Map(summaries.map((summary) => [summary.attemptId, summary])),
    [summaries]
  );

  const attemptGroupsByQuiz = useMemo(
    () =>
      completedAttempts.reduce<Record<string, typeof completedAttempts>>((groups, attempt) => {
        groups[attempt.quizId] = groups[attempt.quizId] ?? [];
        groups[attempt.quizId].push(attempt);
        return groups;
      }, {}),
    [completedAttempts]
  );

  const comparison = useMemo(
    () =>
      Object.entries(attemptGroupsByQuiz)
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
        .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    [attemptGroupsByQuiz, summaryMap]
  );

  return (
    <div className="space-y-6">
      {completedAttempts.length === 0 ? (
        <EmptyState
          icon={History}
          title="Nenhuma tentativa concluída"
          description="Conclua seu primeiro simulado para liberar comparações de evolução e revisar resultados."
          action={
            <Button asChild>
              <Link href="/simulados">Ir para simulados</Link>
            </Button>
          }
        />
      ) : (
        <section className="grid gap-4 md:grid-cols-2">
          {completedAttempts.map((attempt) => {
            const summary = summaryMap.get(attempt.id);
            const quiz = getQuizById(attempt.quizId);
            const accuracy = Math.round((summary?.accuracy ?? 0) * 100);
            const status = accuracy >= 75 ? "bom" : accuracy >= 55 ? "atencao" : "critico";

            return (
              <Card key={attempt.id} className="overflow-hidden">
                <div className="h-1.5 w-full bg-gradient-to-r from-primary via-[hsl(var(--chart-3))] to-[hsl(var(--chart-2))]" />
                <CardHeader>
                  <CardTitle className="text-xl">{quiz?.title ?? "Simulado"}</CardTitle>
                  <CardDescription>
                    {quiz?.examBoard} {quiz?.year} - concluído em{" "}
                    {formatDateTime(attempt.finishedAt)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg border border-border/70 bg-background/70 p-2">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        Aproveitamento
                      </p>
                      <p className="text-lg font-semibold">{accuracy}%</p>
                    </div>
                    <div className="rounded-lg border border-border/70 bg-background/70 p-2">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Nota</p>
                      <p className="text-lg font-semibold">
                        {summary?.score ?? 0}/{summary?.objectiveQuestions ?? 0}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border/70 bg-background/70 p-2">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Tempo</p>
                      <p className="text-lg font-semibold">
                        {formatDuration(attempt.totalTimeSeconds)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant={
                        status === "bom"
                          ? "secondary"
                          : status === "atencao"
                            ? "outline"
                            : "destructive"
                      }
                    >
                      {status === "bom" ? "Bom" : status === "atencao" ? "Atenção" : "Crítico"}
                    </Badge>
                    <Badge variant="outline">Tentativa #{attempt.id.slice(0, 6)}</Badge>
                  </div>

                  <Button asChild className="w-full">
                    <Link href={`/tentativas/${attempt.id}/resultado`}>Abrir resultado detalhado</Link>
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
            Comparação entre tentativas
          </CardTitle>
          <CardDescription>
            Evolução por simulado quando existem duas ou mais tentativas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {comparison.length > 0 ? (
            comparison.map((item) => {
              const quiz = getQuizById(item.quizId);
              const improved = item.deltaAccuracy >= 0;
              return (
                <div
                  key={item.currentAttemptId}
                  className="rounded-xl border border-border/70 bg-background/70 p-4"
                >
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">{quiz?.title ?? item.quizId}</p>
                      <p className="text-xs text-muted-foreground">
                        Comparando tentativa atual versus anterior
                      </p>
                    </div>
                    <Badge variant={improved ? "secondary" : "destructive"}>
                      {improved ? "Evolução positiva" : "Queda de desempenho"}
                    </Badge>
                  </div>

                  <AttemptComparisonChart
                    data={[
                      {
                        label: "Anterior",
                        accuracy: Number((item.previousAccuracy * 100).toFixed(1))
                      },
                      {
                        label: "Atual",
                        accuracy: Number((item.currentAccuracy * 100).toFixed(1))
                      }
                    ]}
                  />

                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <div className="rounded-lg border border-border/70 bg-card/70 p-2 text-xs">
                      <p className="text-muted-foreground">Variação de aproveitamento</p>
                      <p className="mt-1 flex items-center gap-1 font-semibold">
                        <TrendingUp className="h-3.5 w-3.5 text-primary" />
                        {(item.deltaAccuracy * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="rounded-lg border border-border/70 bg-card/70 p-2 text-xs">
                      <p className="text-muted-foreground">Variação de tempo</p>
                      <p className="mt-1 flex items-center gap-1 font-semibold">
                        <Clock3 className="h-3.5 w-3.5 text-primary" />
                        {formatDuration(Math.abs(item.deltaTimeSeconds))}{" "}
                        {item.deltaTimeSeconds < 0 ? "mais rápido" : "mais lento"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/tentativas/${item.previousAttemptId}/resultado`}>
                        Ver anterior
                      </Link>
                    </Button>
                    <Button asChild size="sm">
                      <Link href={`/tentativas/${item.currentAttemptId}/resultado`}>Ver atual</Link>
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <EmptyState
              icon={Trophy}
              title="Sem comparação disponível"
              description="Ainda não há duas tentativas do mesmo simulado para montar o comparativo."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
