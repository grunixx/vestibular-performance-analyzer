"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Target,
  XCircle
} from "lucide-react";

import { ErrorPieChart } from "@/components/charts/error-pie-chart";
import { SubjectBarChart } from "@/components/charts/subject-bar-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { useApp } from "@/hooks/use-app";
import { formatDuration } from "@/lib/utils";

export default function AttemptResultPage(): JSX.Element {
  const params = useParams<{ attemptId: string }>();
  const {
    getAttemptById,
    getSummaryByAttemptId,
    getQuizById,
    getQuestionsByQuiz,
    errorTags
  } = useApp();

  const attempt = getAttemptById(params.attemptId);
  const summary = getSummaryByAttemptId(params.attemptId);
  const quiz = attempt ? getQuizById(attempt.quizId) : undefined;
  const questions = quiz ? getQuestionsByQuiz(quiz.id) : [];
  const questionMap = new Map(questions.map((question) => [question.id, question]));

  if (!attempt || !summary || !quiz) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="font-medium">Resultado nao encontrado.</p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/historico">Ir para historico</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const wrongFeedback = summary.feedbackByQuestion.filter(
    (feedback) => feedback.isCorrect === false
  );
  const mostTimeQuestions = summary.mostTimeConsumingQuestionIds.map((questionId) =>
    summary.feedbackByQuestion.find((feedback) => feedback.questionId === questionId)
  );

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          Resultado do simulado
        </p>
        <h1 className="text-3xl font-semibold">{quiz.title}</h1>
        <p className="text-muted-foreground">
          Tentativa concluida com foco em diagnostico de desempenho e plano de estudo.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Nota (objetivas)</p>
            <p className="text-2xl font-semibold">
              {summary.score}/{summary.objectiveQuestions}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Acertos</p>
            <p className="text-2xl font-semibold text-emerald-700">{summary.correctAnswers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Erros</p>
            <p className="text-2xl font-semibold text-red-600">{summary.wrongAnswers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Aproveitamento</p>
            <p className="text-2xl font-semibold">{Math.round(summary.accuracy * 100)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Tempo total</p>
            <p className="text-2xl font-semibold">{formatDuration(summary.totalTimeSeconds)}</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Insights interpretativos</CardTitle>
            <CardDescription>Leitura resumida para orientar os proximos estudos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {summary.insights.map((insight, index) => (
              <p key={index} className="rounded-md bg-muted/70 p-3 text-sm">
                {insight}
              </p>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Padroes de erro</CardTitle>
            <CardDescription>
              Distribuicao por tipo para entender o que mais prejudica seu resultado.
            </CardDescription>
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
              <p className="text-sm text-muted-foreground">
                Sem erros objetivos nesta tentativa.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Desempenho por materia</CardTitle>
            <CardDescription>Acuracia consolidada por disciplina.</CardDescription>
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
            <CardTitle>Questoes mais demoradas</CardTitle>
            <CardDescription>
              Foco ideal para ganho de velocidade e estrategia.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {mostTimeQuestions.map((feedback) => {
              if (!feedback) return null;
              const question = questionMap.get(feedback.questionId);
              return (
                <div key={feedback.questionId} className="rounded-md border p-3">
                  <p className="line-clamp-2 text-sm font-medium">{question?.statement}</p>
                  <p className="mt-1 flex items-center text-xs text-muted-foreground">
                    <Clock3 className="mr-1 h-3.5 w-3.5" />
                    {formatDuration(feedback.timeSpentSeconds)} nesta questao
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Feedback por questao</CardTitle>
          <CardDescription>
            Veja exatamente onde acertou, errou e onde precisa revisar manualmente.
          </CardDescription>
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
              <div key={feedback.questionId} className="rounded-md border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="line-clamp-2 text-sm font-medium">{question?.statement}</p>
                  <div className="flex items-center gap-2">
                    {status === "correct" ? (
                      <Badge className="bg-emerald-600 text-white">
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
                  Tempo: {formatDuration(feedback.timeSpentSeconds)} - Materia: {feedback.subject}
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
            Recomendacoes de estudo
          </CardTitle>
          <CardDescription>
            Proximos passos priorizados para atacar suas maiores perdas de ponto.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {summary.recommendations.map((recommendation) => (
            <div key={recommendation.id} className="rounded-lg border border-border/70 bg-muted/40 p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="font-medium">{recommendation.title}</p>
                <Badge
                  variant={
                    recommendation.priority === "alta"
                      ? "destructive"
                      : recommendation.priority === "media"
                        ? "secondary"
                        : "outline"
                  }
                >
                  Prioridade {recommendation.priority}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{recommendation.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {wrongFeedback.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Questoes erradas para revisao ativa</CardTitle>
            <CardDescription>
              Leve estas questoes para sua rotina de revisao no proximo ciclo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {wrongFeedback.map((feedback) => {
              const question = questionMap.get(feedback.questionId);
              const answer = attempt.answers.find((item) => item.questionId === feedback.questionId);
              const tag = errorTags.find((item) => item.id === answer?.errorTagId);
              return (
                <div key={feedback.questionId} className="rounded-md border p-3">
                  <p className="text-sm font-medium">{question?.statement}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Tema: {feedback.topic} - Erro dominante: {tag?.label ?? "Nao classificado"}
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <Link href="/dashboard">
            Ir para dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={`/simulados/${quiz.id}`}>Fazer nova tentativa</Link>
        </Button>
      </div>
    </div>
  );
}
