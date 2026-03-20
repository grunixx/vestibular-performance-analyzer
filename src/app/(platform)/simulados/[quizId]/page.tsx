"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import { AlertCircle, ArrowRight, Clock3, FileQuestion, RotateCw } from "lucide-react";

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
import { Separator } from "@/components/ui/separator";

export default function QuizDetailPage(): JSX.Element {
  const params = useParams<{ quizId: string }>();
  const { getQuizById, getQuestionsByQuiz, attempts } = useApp();

  const quiz = getQuizById(params.quizId);
  const questions = getQuestionsByQuiz(params.quizId);

  const inProgressAttempt = useMemo(
    () =>
      attempts
        .filter(
          (attempt) => attempt.quizId === params.quizId && attempt.status === "in_progress"
        )
        .sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0],
    [attempts, params.quizId]
  );

  if (!quiz) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="font-medium">Simulado nao encontrado.</p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/simulados">Voltar ao catalogo</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const subjects = Array.from(new Set(questions.map((question) => question.subject)));
  const essayCount = questions.filter((question) => question.type === "essay").length;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          {quiz.examBoard} {quiz.year}
        </p>
        <h1 className="text-3xl font-semibold">{quiz.title}</h1>
        <p className="max-w-3xl text-muted-foreground">{quiz.description}</p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <FileQuestion className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Questoes</p>
              <p className="font-semibold">{questions.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Clock3 className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Duracao estimada</p>
              <p className="font-semibold">{quiz.durationMinutes} min</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <AlertCircle className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Dissertativas</p>
              <p className="font-semibold">{essayCount}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Conteudos cobrados</CardTitle>
          <CardDescription>
            Utilize os temas para alinhar revisao antes de iniciar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {subjects.map((subject) => (
              <Badge key={subject} variant="secondary">
                {subject}
              </Badge>
            ))}
          </div>
          <Separator />
          <ul className="space-y-2 text-sm text-muted-foreground">
            {questions.map((question) => (
              <li key={question.id}>
                Q{question.index}. {question.topic} ({question.subject})
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href={`/simulados/${quiz.id}/tentar`}>
              Iniciar simulado
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          {inProgressAttempt ? (
            <Button asChild variant="outline">
              <Link
                href={`/simulados/${quiz.id}/tentar?attemptId=${inProgressAttempt.id}`}
              >
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
