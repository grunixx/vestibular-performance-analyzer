"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Clock3,
  FileQuestion,
  RotateCw,
  Sparkles
} from "lucide-react";

import { useApp } from "@/hooks/use-app";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { MetricTile } from "@/components/ui/metric-tile";

export default function QuizDetailPage(): JSX.Element {
  const params = useParams<{ quizId: string }>();
  const { getQuizById, getQuestionsByQuiz, attempts } = useApp();

  const quiz = getQuizById(params.quizId);
  const questions = getQuestionsByQuiz(params.quizId);

  const inProgressAttempt = useMemo(
    () =>
      attempts
        .filter((attempt) => attempt.quizId === params.quizId && attempt.status === "in_progress")
        .sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0],
    [attempts, params.quizId]
  );

  if (!quiz) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Simulado não encontrado"
        description="Esse simulado pode ter sido removido ou ainda não foi sincronizado."
        action={
          <Button asChild variant="outline">
            <Link href="/simulados">Voltar ao catálogo</Link>
          </Button>
        }
      />
    );
  }

  const subjects = Array.from(new Set(questions.map((question) => question.subject)));
  const essayCount = questions.filter((question) => question.type === "essay").length;

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">{quiz.description}</p>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricTile
          label="Questões"
          value={questions.length}
          helper="Total no simulado"
          icon={FileQuestion}
        />
        <MetricTile
          label="Duração estimada"
          value={`${quiz.durationMinutes} min`}
          helper="Ritmo recomendado"
          icon={Clock3}
        />
        <MetricTile
          label="Dissertativas"
          value={essayCount}
          helper="Revisão manual posterior"
          icon={AlertCircle}
          status={essayCount > 0 ? "atencao" : "bom"}
        />
      </section>

      <Card className="overflow-hidden">
        <CardHeader>
          <div className="mb-2 inline-flex w-fit items-center gap-2 rounded-full border border-border/80 bg-background/70 px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Conteúdos cobrados
          </div>
          <CardTitle className="text-2xl">Mapa rápido da prova</CardTitle>
          <CardDescription>
            Use este resumo para ajustar sua estratégia antes de iniciar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {subjects.map((subject) => (
              <Badge key={subject} variant="outline">
                {subject}
              </Badge>
            ))}
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            {questions.map((question) => (
              <div
                key={question.id}
                className="rounded-xl border border-border/70 bg-background/70 px-3 py-2"
              >
                <p className="text-xs text-muted-foreground">Q{question.index}</p>
                <p className="text-sm font-medium">{question.topic}</p>
                <p className="text-xs text-muted-foreground">{question.subject}</p>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          <Button asChild size="lg">
            <Link href={`/simulados/${quiz.id}/tentar`}>
              Iniciar simulado
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          {inProgressAttempt ? (
            <Button asChild variant="outline" size="lg">
              <Link href={`/simulados/${quiz.id}/tentar?attemptId=${inProgressAttempt.id}`}>
                <RotateCw className="mr-2 h-4 w-4" />
                Retomar tentativa em andamento
              </Link>
            </Button>
          ) : null}
        </CardFooter>
      </Card>
    </div>
  );
}
