"use client";

import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, BookMarked, Brush, Clock3, Flag, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from "@/hooks/use-app";
import { formatDateTime, formatDuration } from "@/lib/utils";

export default function ReviewPage(): JSX.Element {
  const { attempts, summaries, sketches, getQuizById, getQuestionsByQuiz } = useApp();

  const summaryMap = new Map(summaries.map((summary) => [summary.attemptId, summary]));

  const wrongQuestions = summaries.flatMap((summary) => {
    const attempt = attempts.find((item) => item.id === summary.attemptId);
    if (!attempt) return [];
    const quiz = getQuizById(attempt.quizId);
    const questions = getQuestionsByQuiz(attempt.quizId);
    return summary.feedbackByQuestion
      .filter((feedback) => feedback.isCorrect === false)
      .map((feedback) => {
        const question = questions.find((item) => item.id === feedback.questionId);
        return {
          attemptId: attempt.id,
          quizTitle: quiz?.title ?? "Simulado",
          questionText: question?.statement ?? "Questao",
          topic: feedback.topic,
          timeSpentSeconds: feedback.timeSpentSeconds
        };
      });
  });

  const flaggedQuestions = attempts.flatMap((attempt) => {
    const quiz = getQuizById(attempt.quizId);
    const questions = getQuestionsByQuiz(attempt.quizId);
    return attempt.answers
      .filter((answer) => answer.markedForReview)
      .map((answer) => {
        const question = questions.find((item) => item.id === answer.questionId);
        return {
          attemptId: attempt.id,
          quizId: attempt.quizId,
          quizTitle: quiz?.title ?? "Simulado",
          questionText: question?.statement ?? "Questao",
          status: attempt.status
        };
      });
  });

  const sketchesWithContext = sketches
    .map((sketch) => {
      const attempt = attempts.find((item) => item.id === sketch.attemptId);
      if (!attempt) return null;
      const quiz = getQuizById(attempt.quizId);
      const question = getQuestionsByQuiz(attempt.quizId).find(
        (item) => item.id === sketch.questionId
      );
      return {
        ...sketch,
        attemptStatus: attempt.status,
        quizId: attempt.quizId,
        quizTitle: quiz?.title ?? "Simulado",
        questionText: question?.statement ?? "Questao"
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          Area de revisao
        </p>
        <h1 className="text-3xl font-semibold">Revisao ativa e consolidacao</h1>
        <p className="mt-2 text-muted-foreground">
          Reunimos suas questoes erradas, marcadas e rascunhos para facilitar o estudo.
        </p>
      </header>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              Questoes erradas
            </CardTitle>
            <CardDescription>
              Priorize estas questoes para recuperar pontos rapidamente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {wrongQuestions.length > 0 ? (
              wrongQuestions.slice(0, 20).map((item, index) => (
                <div key={`${item.attemptId}-${index}`} className="rounded-md border p-3">
                  <p className="line-clamp-2 text-sm font-medium">{item.questionText}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.quizTitle} - Tema: {item.topic}
                  </p>
                  <p className="mt-1 flex items-center text-xs text-muted-foreground">
                    <Clock3 className="mr-1 h-3.5 w-3.5" />
                    {formatDuration(item.timeSpentSeconds)} de resolucao
                  </p>
                  <Button asChild size="sm" variant="outline" className="mt-2">
                    <Link href={`/tentativas/${item.attemptId}/resultado`}>Abrir resultado</Link>
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhuma questao errada registrada por enquanto.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-amber-500" />
              Marcadas para revisao
            </CardTitle>
            <CardDescription>
              Lista de questoes que voce sinalizou durante os simulados.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {flaggedQuestions.length > 0 ? (
              flaggedQuestions.slice(0, 20).map((item, index) => (
                <div key={`${item.attemptId}-flag-${index}`} className="rounded-md border p-3">
                  <p className="line-clamp-2 text-sm font-medium">{item.questionText}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.quizTitle}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant={item.status === "completed" ? "secondary" : "outline"}>
                      {item.status === "completed" ? "Tentativa finalizada" : "Em andamento"}
                    </Badge>
                    <Button asChild size="sm" variant="outline">
                      <Link
                        href={
                          item.status === "completed"
                            ? `/tentativas/${item.attemptId}/resultado`
                            : `/simulados/${item.quizId}/tentar?attemptId=${item.attemptId}`
                        }
                      >
                        Abrir contexto
                      </Link>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhuma questao marcada para revisao.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brush className="h-5 w-5 text-primary" />
            Rascunhos salvos
          </CardTitle>
          <CardDescription>
            Acesse e compare raciocinios de tentativas anteriores.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {sketchesWithContext.length > 0 ? (
            sketchesWithContext.map((item) => (
              <div key={item.id} className="rounded-md border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <Image
                      src={item.imageDataUrl}
                      alt="Preview do rascunho"
                      width={80}
                      height={56}
                      className="h-14 w-20 rounded border object-cover"
                      unoptimized
                    />
                    <div>
                    <p className="line-clamp-2 text-sm font-medium">{item.questionText}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.quizTitle} - salvo em {formatDateTime(item.updatedAt)}
                    </p>
                    </div>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link
                      href={
                        item.attemptStatus === "completed"
                          ? `/tentativas/${item.attemptId}/resultado`
                          : `/simulados/${item.quizId}/tentar?attemptId=${item.attemptId}`
                      }
                    >
                      Abrir tentativa
                    </Link>
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhum rascunho salvo ate agora.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookMarked className="h-5 w-5 text-primary" />
            Rotina sugerida de revisao
          </CardTitle>
          <CardDescription>Modelo simples e eficiente para consolidar aprendizado.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>1. Revisar 5 questoes erradas do ultimo simulado (25 min).</p>
          <p>2. Refazer sem consultar resposta e comparar com o rascunho salvo (20 min).</p>
          <p>3. Registrar em caderno de erros o motivo principal de cada falha (10 min).</p>
          <p>4. Fechar com 5 questoes do mesmo tema para fixacao imediata (20 min).</p>
        </CardContent>
      </Card>
    </div>
  );
}
