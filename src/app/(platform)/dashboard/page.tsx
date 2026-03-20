"use client";

import Link from "next/link";
import { ArrowRight, BookOpenCheck, Clock3, Target, TrendingUp } from "lucide-react";

import { ErrorPieChart } from "@/components/charts/error-pie-chart";
import { PerformanceLineChart } from "@/components/charts/performance-line-chart";
import { SubjectBarChart } from "@/components/charts/subject-bar-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from "@/hooks/use-app";
import { formatDuration } from "@/lib/utils";

export default function DashboardPage(): JSX.Element {
  const { dashboardMetrics, summaries, quizzes, attempts, getQuizById } = useApp();

  const latestSummary = [...summaries].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  )[0];
  const latestAttempt = latestSummary
    ? attempts.find((attempt) => attempt.id === latestSummary.attemptId)
    : undefined;
  const latestQuiz = latestAttempt ? getQuizById(latestAttempt.quizId) : undefined;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          Dashboard do aluno
        </p>
        <h1 className="text-3xl font-semibold">Visao geral de desempenho</h1>
        <p className="mt-2 text-muted-foreground">
          Painel com evolucao, diagnostico de erros e proximos passos recomendados.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Tentativas concluidas</p>
            <p className="text-2xl font-semibold">{dashboardMetrics.completedAttempts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Aproveitamento medio</p>
            <p className="text-2xl font-semibold">{dashboardMetrics.averageAccuracy}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Melhor nota</p>
            <p className="text-2xl font-semibold">{dashboardMetrics.bestScore}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Simulados disponiveis</p>
            <p className="text-2xl font-semibold">{quizzes.length}</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Evolucao por tentativa
            </CardTitle>
            <CardDescription>Acompanhe consistencia ao longo do tempo.</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardMetrics.trend.length > 0 ? (
              <PerformanceLineChart data={dashboardMetrics.trend} />
            ) : (
              <p className="text-sm text-muted-foreground">
                Finalize seu primeiro simulado para ver o grafico de evolucao.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acertos por materia</CardTitle>
            <CardDescription>Priorize as materias com menor acuracia.</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardMetrics.subjectAccuracy.length > 0 ? (
              <SubjectBarChart data={dashboardMetrics.subjectAccuracy} />
            ) : (
              <p className="text-sm text-muted-foreground">
                Sem dados de materia ainda.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Erros por tipo</CardTitle>
            <CardDescription>Entenda o padrao dominante que trava sua nota.</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardMetrics.errorTypeDistribution.length > 0 ? (
              <ErrorPieChart data={dashboardMetrics.errorTypeDistribution} />
            ) : (
              <p className="text-sm text-muted-foreground">
                Sem erros registrados ate o momento.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Questoes-chave</CardTitle>
            <CardDescription>
              Itens com maior dificuldade e maior tempo medio de resolucao.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Questao mais dificil</p>
              {dashboardMetrics.hardestQuestion ? (
                <>
                  <p className="mt-1 line-clamp-2 text-sm font-medium">
                    {dashboardMetrics.hardestQuestion.statement}
                  </p>
                  <Badge variant="destructive" className="mt-2">
                    Taxa de erro: {dashboardMetrics.hardestQuestion.wrongRate}%
                  </Badge>
                </>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">Aguardando dados.</p>
              )}
            </div>
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Questao mais demorada</p>
              {dashboardMetrics.slowestQuestion ? (
                <>
                  <p className="mt-1 line-clamp-2 text-sm font-medium">
                    {dashboardMetrics.slowestQuestion.statement}
                  </p>
                  <p className="mt-2 flex items-center text-xs text-muted-foreground">
                    <Clock3 className="mr-1 h-3.5 w-3.5" />
                    Tempo medio: {formatDuration(dashboardMetrics.slowestQuestion.averageTimeSeconds)}
                  </p>
                </>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">Aguardando dados.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Proximos passos recomendados
          </CardTitle>
          <CardDescription>
            Recomendacoes com base no ultimo simulado finalizado.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {latestSummary?.recommendations?.length ? (
            latestSummary.recommendations.map((recommendation) => (
              <div key={recommendation.id} className="rounded-md border p-3">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{recommendation.title}</p>
                  <Badge variant={recommendation.priority === "alta" ? "destructive" : "secondary"}>
                    {recommendation.priority}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{recommendation.description}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              Termine um simulado para receber orientacoes personalizadas.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <Link href="/simulados">
            Novo simulado
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        {latestSummary && latestQuiz ? (
          <Button asChild variant="outline">
            <Link href={`/tentativas/${latestSummary.attemptId}/resultado`}>
              <BookOpenCheck className="mr-2 h-4 w-4" />
              Revisar ultimo resultado ({latestQuiz.examBoard})
            </Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
