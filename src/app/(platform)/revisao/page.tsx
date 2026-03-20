"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { BookMarked, Brush, Clock3, Flag, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useApp } from "@/hooks/use-app";
import { formatDateTime, formatDuration } from "@/lib/utils";

export default function ReviewPage(): JSX.Element {
  const { attempts, summaries, sketches, getQuizById, getQuestionsByQuiz } = useApp();

  const wrongQuestions = useMemo(
    () =>
      summaries.flatMap((summary) => {
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
              questionText: question?.statement ?? "Questão",
              topic: feedback.topic,
              timeSpentSeconds: feedback.timeSpentSeconds
            };
          });
      }),
    [attempts, summaries, getQuizById, getQuestionsByQuiz]
  );

  const flaggedQuestions = useMemo(
    () =>
      attempts.flatMap((attempt) => {
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
              questionText: question?.statement ?? "Questão",
              status: attempt.status
            };
          });
      }),
    [attempts, getQuizById, getQuestionsByQuiz]
  );

  const sketchesWithContext = useMemo(
    () =>
      sketches
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
            questionText: question?.statement ?? "Questão"
          };
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [attempts, getQuizById, getQuestionsByQuiz, sketches]
  );

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              Questões erradas
            </CardTitle>
            <CardDescription>Priorize estes itens para recuperar pontos rapidamente.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {wrongQuestions.length > 0 ? (
              wrongQuestions.slice(0, 20).map((item, index) => (
                <div
                  key={`${item.attemptId}-${index}`}
                  className="rounded-xl border border-border/75 bg-background/70 p-3"
                >
                  <p className="line-clamp-2 text-sm font-medium">{item.questionText}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.quizTitle} - Tema: {item.topic}
                  </p>
                  <p className="mt-1 flex items-center text-xs text-muted-foreground">
                    <Clock3 className="mr-1 h-3.5 w-3.5 text-primary" />
                    {formatDuration(item.timeSpentSeconds)} de resolução
                  </p>
                  <Button asChild size="sm" variant="outline" className="mt-2">
                    <Link href={`/tentativas/${item.attemptId}/resultado`}>Abrir resultado</Link>
                  </Button>
                </div>
              ))
            ) : (
              <EmptyState
                icon={XCircle}
                title="Sem erros registrados"
                description="Continue praticando para manter essa consistência."
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-amber-500" />
              Marcadas para revisão
            </CardTitle>
            <CardDescription>Itens que você sinalizou durante a resolução.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {flaggedQuestions.length > 0 ? (
              flaggedQuestions.slice(0, 20).map((item, index) => (
                <div
                  key={`${item.attemptId}-flag-${index}`}
                  className="rounded-xl border border-border/75 bg-background/70 p-3"
                >
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
              <EmptyState
                icon={Flag}
                title="Sem questões marcadas"
                description="Marque questões durante o simulado para facilitar revisão ativa."
              />
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
          <CardDescription>Recupere seu raciocínio manual em segundos.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {sketchesWithContext.length > 0 ? (
            sketchesWithContext.map((item) => (
              <div key={item.id} className="rounded-xl border border-border/75 bg-background/70 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg border border-border/70 bg-card p-1">
                      <Image
                        src={item.imageDataUrl}
                        alt="Prévia do rascunho"
                        width={96}
                        height={64}
                        className="h-16 w-24 rounded object-cover"
                        unoptimized
                      />
                    </div>
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
            <EmptyState
              icon={Brush}
              title="Sem rascunhos salvos"
              description="Use o canvas durante a resolução para registrar fórmulas e raciocínios."
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookMarked className="h-5 w-5 text-primary" />
            Rotina sugerida de revisão
          </CardTitle>
          <CardDescription>Plano curto e prático para fixar aprendizado.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          <p className="rounded-lg border border-border/70 bg-background/70 p-3">
            1. Revisar 5 questões erradas do último simulado (25 min).
          </p>
          <p className="rounded-lg border border-border/70 bg-background/70 p-3">
            2. Refazer sem consultar resposta e comparar com rascunho salvo (20 min).
          </p>
          <p className="rounded-lg border border-border/70 bg-background/70 p-3">
            3. Registrar em caderno de erros o motivo principal da falha (10 min).
          </p>
          <p className="rounded-lg border border-border/70 bg-background/70 p-3">
            4. Fechar com 5 questões do mesmo tema para fixação imediata (20 min).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
