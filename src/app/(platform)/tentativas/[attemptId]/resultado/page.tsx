"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  ListChecks,
  Target,
  TrendingUp,
  XCircle
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { MetricTile } from "@/components/ui/metric-tile";
import { Skeleton } from "@/components/ui/skeleton";
import { useApp } from "@/hooks/use-app";
import { formatDuration } from "@/lib/utils";

const ErrorPieChart = dynamic(
  () => import("@/components/charts/error-pie-chart").then((module) => module.ErrorPieChart),
  {
    ssr: false,
    loading: () => <Skeleton className="h-72 w-full rounded-xl" />
  }
);

const SubjectBarChart = dynamic(
  () => import("@/components/charts/subject-bar-chart").then((module) => module.SubjectBarChart),
  {
    ssr: false,
    loading: () => <Skeleton className="h-72 w-full rounded-xl" />
  }
);

const TimeBarChart = dynamic(
  () => import("@/components/charts/time-bar-chart").then((module) => module.TimeBarChart),
  {
    ssr: false,
    loading: () => <Skeleton className="h-72 w-full rounded-xl" />
  }
);

function priorityText(priority: "alta" | "media" | "baixa"): {
  label: string;
  variant: "destructive" | "secondary" | "outline";
} {
  if (priority === "alta") return { label: "Urgente", variant: "destructive" };
  if (priority === "media") return { label: "Importante", variant: "secondary" };
  return { label: "Manter no radar", variant: "outline" };
}

const priorityOrder: Record<"alta" | "media" | "baixa", number> = {
  alta: 0,
  media: 1,
  baixa: 2
};

export default function AttemptResultPage(): JSX.Element {
  const params = useParams<{ attemptId: string }>();
  const { getAttemptById, getSummaryByAttemptId, getQuizById, getQuestionsByQuiz, errorTags } =
    useApp();

  const attempt = getAttemptById(params.attemptId);
  const summary = getSummaryByAttemptId(params.attemptId);
  const quiz = attempt ? getQuizById(attempt.quizId) : undefined;
  const questions = useMemo(
    () => (quiz ? getQuestionsByQuiz(quiz.id) : []),
    [getQuestionsByQuiz, quiz]
  );

  const questionMap = useMemo(
    () => new Map(questions.map((question) => [question.id, question])),
    [questions]
  );

  if (!attempt || !summary || !quiz) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Resultado não encontrado"
        description="A tentativa pode ter sido removida ou ainda não foi finalizada corretamente."
        action={
          <Button asChild variant="outline">
            <Link href="/historico">Ir para histórico</Link>
          </Button>
        }
      />
    );
  }

  const wrongFeedback = summary.feedbackByQuestion.filter(
    (feedback) => feedback.isCorrect === false
  );

  const sortedRecommendations = [...summary.recommendations].sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  const timeChartData = summary.feedbackByQuestion
    .slice()
    .sort((a, b) => b.timeSpentSeconds - a.timeSpentSeconds)
    .slice(0, 7)
    .map((feedback) => ({
      question: `Q${questionMap.get(feedback.questionId)?.index ?? "?"}`,
      timeSeconds: feedback.timeSpentSeconds
    }));

  const accuracyPercent = Math.round(summary.accuracy * 100);

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardContent className="p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Resultado do simulado
          </p>
          <h3 className="mt-2 text-2xl font-semibold sm:text-3xl">{quiz.title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Correção automática, padrões de erro e próximos passos personalizados.
          </p>
        </CardContent>
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricTile
          label="Nota objetiva"
          value={`${summary.score}/${summary.objectiveQuestions}`}
          helper="Questões objetivas"
          icon={TrendingUp}
          status={accuracyPercent >= 75 ? "bom" : accuracyPercent >= 55 ? "atencao" : "critico"}
        />
        <MetricTile
          label="Acertos"
          value={summary.correctAnswers}
          helper="Respostas corretas"
          icon={CheckCircle2}
          status="bom"
        />
        <MetricTile
          label="Erros"
          value={summary.wrongAnswers}
          helper="Pontos de revisão"
          icon={XCircle}
          status={summary.wrongAnswers > 0 ? "atencao" : "bom"}
        />
        <MetricTile
          label="Aproveitamento"
          value={`${accuracyPercent}%`}
          helper="Índice geral"
          icon={Target}
          status={accuracyPercent >= 75 ? "bom" : accuracyPercent >= 55 ? "atencao" : "critico"}
        />
        <MetricTile
          label="Tempo total"
          value={formatDuration(summary.totalTimeSeconds)}
          helper="Duração da tentativa"
          icon={Clock3}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Leitura inteligente da tentativa</CardTitle>
            <CardDescription>
              Resumo interpretativo para guiar seu próximo ciclo de estudo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {summary.insights.map((insight, index) => (
              <p
                key={index}
                className="rounded-xl border border-border/70 bg-background/70 p-3 text-sm"
              >
                {insight}
              </p>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Padrões de erro detectados</CardTitle>
            <CardDescription>Onde você mais desperdiçou pontos nesta tentativa.</CardDescription>
          </CardHeader>
          <CardContent>
            {summary.errorPatterns.length > 0 ? (
              <ErrorPieChart
                data={summary.errorPatterns.map((pattern) => ({
                  label: pattern.label,
                  value: pattern.count
                }))}
              />
            ) : (
              <EmptyState
                icon={CheckCircle2}
                title="Sem erros objetivos"
                description="Excelente desempenho. Continue praticando para manter consistência."
              />
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Desempenho por matéria</CardTitle>
            <CardDescription>Acurácia consolidada por disciplina.</CardDescription>
          </CardHeader>
          <CardContent>
            <SubjectBarChart
              data={summary.subjectBreakdown.map((subject) => ({
                subject: subject.subject,
                accuracy: Number((subject.accuracy * 100).toFixed(1)),
                correct: subject.correct,
                wrong: subject.wrong
              }))}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tempo gasto por questão</CardTitle>
            <CardDescription>As questões que mais impactaram seu ritmo.</CardDescription>
          </CardHeader>
          <CardContent>
            {timeChartData.length > 0 ? (
              <TimeBarChart data={timeChartData} />
            ) : (
              <EmptyState
                icon={Clock3}
                title="Sem dados de tempo"
                description="Registre mais resoluções para analisar ritmo por questão."
              />
            )}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-primary" />
            Feedback por questão
          </CardTitle>
          <CardDescription>Correções, status e explicações em um único lugar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {summary.feedbackByQuestion.map((feedback) => {
            const question = questionMap.get(feedback.questionId);
            const status =
              feedback.manualReviewRequired || question?.type === "essay"
                ? "manual"
                : feedback.isCorrect
                  ? "correct"
                  : feedback.isCorrect === false
                    ? "wrong"
                    : "unanswered";

            return (
              <div
                key={feedback.questionId}
                className="rounded-xl border border-border/70 bg-background/70 p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="line-clamp-2 text-sm font-semibold">{question?.statement}</p>
                  <div className="flex items-center gap-2">
                    {status === "correct" ? (
                      <Badge className="bg-[hsl(var(--chart-2))] text-white">
                        <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                        Correta
                      </Badge>
                    ) : null}
                    {status === "wrong" ? (
                      <Badge variant="destructive">
                        <XCircle className="mr-1 h-3.5 w-3.5" />
                        Errada
                      </Badge>
                    ) : null}
                    {status === "manual" ? (
                      <Badge variant="outline">
                        <AlertTriangle className="mr-1 h-3.5 w-3.5" />
                        Revisar manualmente
                      </Badge>
                    ) : null}
                    {status === "unanswered" ? <Badge variant="secondary">Sem resposta</Badge> : null}
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Tempo: {formatDuration(feedback.timeSpentSeconds)} - Matéria: {feedback.subject}
                </p>
                {status === "wrong" ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Alternativa correta:{" "}
                    <strong>
                      {question?.options?.find((option) => option.id === feedback.correctOptionId)
                        ?.label ?? "-"}
                    </strong>
                    . {feedback.explanation}
                  </p>
                ) : null}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Recomendações de estudo
          </CardTitle>
          <CardDescription>Transforme o diagnóstico em ações práticas imediatas.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {sortedRecommendations.map((recommendation) => {
            const priority = priorityText(recommendation.priority);
            return (
              <div
                key={recommendation.id}
                className="rounded-xl border border-border/75 bg-background/70 p-4"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="font-semibold">{recommendation.title}</p>
                  <Badge variant={priority.variant}>{priority.label}</Badge>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>
                    <strong className="text-foreground">Problema:</strong> {recommendation.title}
                  </p>
                  <p>
                    <strong className="text-foreground">Por que importa:</strong> esse padrão
                    afeta sua nota final.
                  </p>
                  <p>
                    <strong className="text-foreground">O que fazer agora:</strong>{" "}
                    {recommendation.description}
                  </p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {wrongFeedback.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Questões críticas para revisão ativa</CardTitle>
            <CardDescription>
              Comece por estas questões para gerar ganho rápido de desempenho.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {wrongFeedback.map((feedback) => {
              const question = questionMap.get(feedback.questionId);
              const answer = attempt.answers.find((item) => item.questionId === feedback.questionId);
              const tag = errorTags.find((item) => item.id === answer?.errorTagId);
              return (
                <div
                  key={feedback.questionId}
                  className="rounded-xl border border-border/70 bg-background/70 p-3"
                >
                  <p className="text-sm font-medium">{question?.statement}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Tema: {feedback.topic} - Erro dominante: {tag?.label ?? "Não classificado"}
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button asChild size="lg">
          <Link href="/dashboard">
            Ir para dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href={`/simulados/${quiz.id}`}>Fazer nova tentativa</Link>
        </Button>
      </div>
    </div>
  );
}
