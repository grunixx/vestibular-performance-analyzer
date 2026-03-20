"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo } from "react";
import {
  ArrowRight,
  BookOpenCheck,
  BrainCircuit,
  ChartNoAxesCombined,
  Clock3,
  GraduationCap,
  ShieldAlert,
  Target,
  TrendingUp
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { MetricTile } from "@/components/ui/metric-tile";
import { Skeleton } from "@/components/ui/skeleton";
import { useApp } from "@/hooks/use-app";
import { formatDuration } from "@/lib/utils";

function ChartSkeleton({ compact = false }: { compact?: boolean }): JSX.Element {
  return <Skeleton className={compact ? "h-64 w-full rounded-xl" : "h-72 w-full rounded-xl"} />;
}

const PerformanceLineChart = dynamic(
  () =>
    import("@/components/charts/performance-line-chart").then(
      (module) => module.PerformanceLineChart
    ),
  {
    ssr: false,
    loading: () => <ChartSkeleton />
  }
);

const SubjectBarChart = dynamic(
  () => import("@/components/charts/subject-bar-chart").then((module) => module.SubjectBarChart),
  {
    ssr: false,
    loading: () => <ChartSkeleton />
  }
);

const ErrorPieChart = dynamic(
  () => import("@/components/charts/error-pie-chart").then((module) => module.ErrorPieChart),
  {
    ssr: false,
    loading: () => <ChartSkeleton />
  }
);

const TimeBarChart = dynamic(
  () => import("@/components/charts/time-bar-chart").then((module) => module.TimeBarChart),
  {
    ssr: false,
    loading: () => <ChartSkeleton />
  }
);

export default function DashboardPage(): JSX.Element {
  const { dashboardMetrics, summaries, quizzes, attempts, getQuizById, getQuestionsByQuiz } =
    useApp();

  const latestSummary = useMemo(
    () => [...summaries].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0],
    [summaries]
  );

  const latestAttempt = useMemo(
    () => (latestSummary ? attempts.find((attempt) => attempt.id === latestSummary.attemptId) : undefined),
    [attempts, latestSummary]
  );

  const latestQuiz = useMemo(
    () => (latestAttempt ? getQuizById(latestAttempt.quizId) : undefined),
    [getQuizById, latestAttempt]
  );

  const latestQuestions = useMemo(
    () => (latestQuiz ? getQuestionsByQuiz(latestQuiz.id) : []),
    [getQuestionsByQuiz, latestQuiz]
  );

  const questionMap = useMemo(
    () => new Map(latestQuestions.map((question) => [question.id, question])),
    [latestQuestions]
  );

  const weakestSubject = dashboardMetrics.subjectAccuracy[0];
  const latestTrendPoint = dashboardMetrics.trend[dashboardMetrics.trend.length - 1];

  const topError = useMemo(
    () =>
      [...dashboardMetrics.errorTypeDistribution].sort((a, b) => b.value - a.value)[0],
    [dashboardMetrics.errorTypeDistribution]
  );

  const practicalSummary = useMemo(() => {
    if (!latestSummary) {
      return "Conclua o primeiro simulado para liberar o resumo de desempenho.";
    }

    return `Última tentativa: ${latestSummary.correctAnswers} acertos, ${latestSummary.wrongAnswers} erros e tempo total de ${formatDuration(latestSummary.totalTimeSeconds)}.`;
  }, [latestSummary]);

  const statusByAccuracy: "bom" | "atencao" | "critico" =
    dashboardMetrics.averageAccuracy >= 75
      ? "bom"
      : dashboardMetrics.averageAccuracy >= 55
        ? "atencao"
        : "critico";

  const timeChartData = useMemo(
    () =>
      latestSummary?.feedbackByQuestion
        .slice()
        .sort((a, b) => b.timeSpentSeconds - a.timeSpentSeconds)
        .slice(0, 6)
        .map((feedback) => ({
          question: `Q${questionMap.get(feedback.questionId)?.index ?? "?"}`,
          timeSeconds: feedback.timeSpentSeconds
        })) ?? [],
    [latestSummary, questionMap]
  );

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden border-primary/25">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/18 via-[hsl(var(--chart-3)/0.15)] to-[hsl(var(--chart-2)/0.1)]" />
        <CardContent className="relative p-5 sm:p-6">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground">
            <BrainCircuit className="h-3.5 w-3.5 text-primary" />
            Resumo da semana
          </div>
          <p className="text-base font-medium leading-relaxed sm:text-lg">{practicalSummary}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {latestTrendPoint
              ? `Aproveitamento atual: ${latestTrendPoint.accuracy}%.`
              : "Sem histórico de tendência ainda."}{" "}
            {weakestSubject
              ? `Matéria de atenção: ${weakestSubject.subject}.`
              : "Sem matéria crítica definida."}{" "}
            {topError
              ? `Erro mais frequente: ${topError.label}.`
              : "Sem erro recorrente mapeado."}
          </p>
        </CardContent>
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile
          label="Tentativas concluídas"
          value={dashboardMetrics.completedAttempts}
          helper="Volume de treino acumulado"
          icon={ChartNoAxesCombined}
          status={dashboardMetrics.completedAttempts >= 3 ? "bom" : "atencao"}
        />
        <MetricTile
          label="Aproveitamento médio"
          value={`${dashboardMetrics.averageAccuracy}%`}
          helper="Média das últimas provas"
          icon={Target}
          status={statusByAccuracy}
        />
        <MetricTile
          label="Melhor nota"
          value={dashboardMetrics.bestScore}
          helper="Recorde pessoal"
          icon={TrendingUp}
          status={dashboardMetrics.bestScore >= 7 ? "bom" : "atencao"}
        />
        <MetricTile
          label="Simulados no catálogo"
          value={quizzes.length}
          helper="Treinos disponíveis"
          icon={GraduationCap}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Evolução por tentativa
            </CardTitle>
            <CardDescription>Consistência e tendência de melhora ao longo do tempo.</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardMetrics.trend.length > 0 ? (
              <PerformanceLineChart data={dashboardMetrics.trend} />
            ) : (
              <EmptyState
                icon={TrendingUp}
                title="Sem dados de evolução"
                description="Finalize um simulado para visualizar a curva de progresso."
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acertos por matéria</CardTitle>
            <CardDescription>Identifique rapidamente onde priorizar revisão.</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardMetrics.subjectAccuracy.length > 0 ? (
              <SubjectBarChart data={dashboardMetrics.subjectAccuracy} />
            ) : (
              <EmptyState
                icon={ShieldAlert}
                title="Sem dados por matéria"
                description="Com mais tentativas, o sistema vai mapear sua acurácia por disciplina."
              />
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Erros por tipo</CardTitle>
            <CardDescription>Seu padrão de falhas para agir de forma estratégica.</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardMetrics.errorTypeDistribution.length > 0 ? (
              <ErrorPieChart data={dashboardMetrics.errorTypeDistribution} />
            ) : (
              <EmptyState
                icon={ShieldAlert}
                title="Sem erro recorrente"
                description="Excelente sinal. Continue treinando para manter consistência."
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tempo gasto por questão</CardTitle>
            <CardDescription>Questões que mais consumiram tempo na última tentativa.</CardDescription>
          </CardHeader>
          <CardContent>
            {timeChartData.length > 0 ? (
              <TimeBarChart data={timeChartData} />
            ) : (
              <EmptyState
                icon={Clock3}
                title="Tempo por questão indisponível"
                description="Finalize uma tentativa para entender onde o ritmo caiu."
              />
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Questões-chave</CardTitle>
            <CardDescription>Pontos de maior risco e maior consumo de tempo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-xl border border-border/75 bg-background/70 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Mais difícil</p>
              {dashboardMetrics.hardestQuestion ? (
                <>
                  <p className="mt-1 line-clamp-2 text-sm font-medium">
                    {dashboardMetrics.hardestQuestion.statement}
                  </p>
                  <Badge variant="destructive" className="mt-2">
                    Taxa de erro {dashboardMetrics.hardestQuestion.wrongRate}%
                  </Badge>
                </>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">Aguardando dados.</p>
              )}
            </div>
            <div className="rounded-xl border border-border/75 bg-background/70 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Mais demorada</p>
              {dashboardMetrics.slowestQuestion ? (
                <>
                  <p className="mt-1 line-clamp-2 text-sm font-medium">
                    {dashboardMetrics.slowestQuestion.statement}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Tempo médio{" "}
                    {formatDuration(dashboardMetrics.slowestQuestion.averageTimeSeconds)}
                  </p>
                </>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">Aguardando dados.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Próximos passos recomendados
            </CardTitle>
            <CardDescription>Ações objetivas para ganhar pontos nas próximas provas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {latestSummary?.recommendations?.length ? (
              latestSummary.recommendations.map((recommendation) => (
                <div
                  key={recommendation.id}
                  className="rounded-xl border border-border/75 bg-background/70 p-4"
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{recommendation.title}</p>
                    <Badge
                      variant={
                        recommendation.priority === "alta"
                          ? "destructive"
                          : recommendation.priority === "media"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {recommendation.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{recommendation.description}</p>
                </div>
              ))
            ) : (
              <EmptyState
                icon={BookOpenCheck}
                title="Sem recomendações ainda"
                description="Conclua um simulado para receber plano de estudo personalizado."
              />
            )}
          </CardContent>
        </Card>
      </section>

      <div className="flex flex-wrap gap-2">
        <Button asChild size="lg">
          <Link href="/simulados">
            Novo simulado
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        {latestSummary && latestQuiz ? (
          <Button asChild variant="outline" size="lg">
            <Link href={`/tentativas/${latestSummary.attemptId}/resultado`}>
              <BookOpenCheck className="mr-2 h-4 w-4" />
              Revisar último resultado ({latestQuiz.examBoard})
            </Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
