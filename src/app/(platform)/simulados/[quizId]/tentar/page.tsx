"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  Flag,
  FlagOff,
  Timer
} from "lucide-react";

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
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/hooks/use-app";
import { cn, formatDuration } from "@/lib/utils";

const SketchCanvas = dynamic(
  () => import("@/components/sketch/sketch-canvas").then((module) => module.SketchCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-[320px] w-full rounded-2xl" />
      </div>
    )
  }
);

export default function AttemptQuizPage(): JSX.Element {
  const params = useParams<{ quizId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    getQuizById,
    getQuestionsByQuiz,
    getAttemptById,
    startAttempt,
    updateAttemptAnswer,
    addQuestionTime,
    saveSketch,
    getSketch,
    finishAttempt
  } = useApp();

  const quiz = getQuizById(params.quizId);
  const questions = getQuestionsByQuiz(params.quizId);
  const [activeAttemptId, setActiveAttemptId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [, forceTick] = useState(0);
  const [finishing, setFinishing] = useState(false);
  const enteredQuestionAtRef = useRef<number>(Date.now());
  const initializedRef = useRef(false);

  const attempt = activeAttemptId ? getAttemptById(activeAttemptId) : undefined;

  useEffect(() => {
    const interval = window.setInterval(() => forceTick((value) => value + 1), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!quiz || initializedRef.current) return;

    const fromQuery = searchParams.get("attemptId");
    if (fromQuery) {
      setActiveAttemptId(fromQuery);
      initializedRef.current = true;
      return;
    }

    const createdAttemptId = startAttempt(params.quizId);
    setActiveAttemptId(createdAttemptId);
    initializedRef.current = true;
    router.replace(`/simulados/${params.quizId}/tentar?attemptId=${createdAttemptId}`);
  }, [params.quizId, quiz, router, searchParams, startAttempt]);

  useEffect(() => {
    if (!activeAttemptId || !quiz) return;

    if (!attempt) {
      const createdAttemptId = startAttempt(params.quizId);
      setActiveAttemptId(createdAttemptId);
      router.replace(`/simulados/${params.quizId}/tentar?attemptId=${createdAttemptId}`);
      return;
    }

    if (attempt.status === "completed") {
      router.replace(`/tentativas/${attempt.id}/resultado`);
    }
  }, [activeAttemptId, attempt, params.quizId, quiz, router, startAttempt]);

  const currentQuestion = questions[currentIndex];

  const answersByQuestion = useMemo(
    () => new Map(attempt?.answers.map((answer) => [answer.questionId, answer]) ?? []),
    [attempt?.answers]
  );

  const currentAnswer = currentQuestion ? answersByQuestion.get(currentQuestion.id) : undefined;

  const answeredCount = useMemo(() => {
    if (!attempt) return 0;
    return attempt.answers.filter((answer) =>
      answer.essayText?.trim()
        ? true
        : typeof answer.selectedOptionId === "string" && answer.selectedOptionId.length > 0
    ).length;
  }, [attempt]);

  const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;
  const dynamicDeltaSeconds = Math.max(
    0,
    Math.floor((Date.now() - enteredQuestionAtRef.current) / 1000)
  );

  const totalElapsedSeconds = useMemo(() => {
    if (!attempt) return 0;
    const persisted = attempt.answers.reduce((total, answer) => total + answer.timeSpentSeconds, 0);
    return persisted + (currentQuestion ? dynamicDeltaSeconds : 0);
  }, [attempt, currentQuestion, dynamicDeltaSeconds]);

  const currentQuestionElapsed = useMemo(
    () => (currentAnswer ? currentAnswer.timeSpentSeconds + dynamicDeltaSeconds : 0),
    [currentAnswer, dynamicDeltaSeconds]
  );

  const flushCurrentQuestionTime = useCallback(() => {
    if (!attempt || !currentQuestion) return;
    const delta = Math.floor((Date.now() - enteredQuestionAtRef.current) / 1000);
    if (delta > 0) {
      addQuestionTime(attempt.id, currentQuestion.id, delta);
    }
    enteredQuestionAtRef.current = Date.now();
  }, [addQuestionTime, attempt, currentQuestion]);

  useEffect(() => {
    enteredQuestionAtRef.current = Date.now();
  }, [currentIndex, activeAttemptId]);

  useEffect(() => () => flushCurrentQuestionTime(), [flushCurrentQuestionTime]);

  if (!quiz || questions.length === 0) {
    return (
      <EmptyState
        icon={FlagOff}
        title="Simulado indisponível"
        description="Esse simulado não foi encontrado ou ainda não possui questões."
        action={
          <Button asChild variant="outline">
            <Link href="/simulados">Voltar ao catálogo</Link>
          </Button>
        }
      />
    );
  }

  if (!attempt || !currentQuestion) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          Carregando tentativa...
        </CardContent>
      </Card>
    );
  }

  const safeAttempt = attempt;
  const safeCurrentQuestion = currentQuestion;
  const sketch = getSketch(safeAttempt.id, safeCurrentQuestion.id);

  function goToQuestion(index: number): void {
    flushCurrentQuestionTime();
    setCurrentIndex(index);
  }

  function handleSelectObjective(optionId: string): void {
    updateAttemptAnswer(safeAttempt.id, safeCurrentQuestion.id, {
      selectedOptionId: optionId
    });
  }

  function toggleReviewFlag(): void {
    updateAttemptAnswer(safeAttempt.id, safeCurrentQuestion.id, {
      markedForReview: !currentAnswer?.markedForReview
    });
  }

  function handleEssayChange(value: string): void {
    updateAttemptAnswer(safeAttempt.id, safeCurrentQuestion.id, {
      essayText: value
    });
  }

  function handleSketchSave(imageDataUrl: string): void {
    saveSketch(safeAttempt.id, safeCurrentQuestion.id, imageDataUrl);
    setSavedMessage("Rascunho salvo com sucesso.");
    window.setTimeout(() => setSavedMessage(null), 1800);
  }

  function navigateNext(): void {
    if (currentIndex < questions.length - 1) {
      goToQuestion(currentIndex + 1);
    }
  }

  function navigateBack(): void {
    if (currentIndex > 0) {
      goToQuestion(currentIndex - 1);
    }
  }

  function handleFinishAttempt(): void {
    flushCurrentQuestionTime();
    setFinishing(true);
    const summary = finishAttempt(safeAttempt.id);
    setFinishing(false);
    if (summary) {
      router.push(`/tentativas/${safeAttempt.id}/resultado`);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Mantenha foco total na questão atual. Use o rascunho para registrar raciocínio e
        marque pontos para revisão.
      </p>

      <Card className="border-primary/20">
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Questão {currentIndex + 1}</Badge>
              <Badge variant="secondary">
                {answeredCount}/{questions.length} respondidas
              </Badge>
            </div>
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Timer className="h-4 w-4 text-primary" />
              <span>Total: {formatDuration(totalElapsedSeconds)}</span>
              <span className="text-border">|</span>
              <span>Nesta: {formatDuration(currentQuestionElapsed)}</span>
            </div>
          </div>
          <Progress value={progress} />
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[310px_minmax(0,1fr)]">
        <Card className="h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Navegação rápida</CardTitle>
            <CardDescription>Localize questões pendentes e marcadas para revisão.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-5 gap-2">
              {questions.map((question, index) => {
                const answer = answersByQuestion.get(question.id);
                const answered = Boolean(answer?.selectedOptionId || answer?.essayText?.trim());
                const flagged = Boolean(answer?.markedForReview);
                return (
                  <button
                    key={question.id}
                    type="button"
                    onClick={() => goToQuestion(index)}
                    className={cn(
                      "rounded-lg border p-2 text-xs font-semibold transition-all",
                      currentIndex === index
                        ? "border-primary bg-primary text-primary-foreground shadow-[0_10px_22px_-14px_hsl(var(--primary)/0.9)]"
                        : answered
                          ? "border-[hsl(var(--chart-2)/0.45)] bg-[hsl(var(--chart-2)/0.14)] text-foreground"
                          : "border-border bg-background text-muted-foreground hover:border-primary/35 hover:bg-primary/10",
                      flagged && "ring-2 ring-amber-300/70"
                    )}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full justify-start"
              onClick={toggleReviewFlag}
            >
              {currentAnswer?.markedForReview ? (
                <>
                  <FlagOff className="mr-2 h-4 w-4" />
                  Remover marcação de revisão
                </>
              ) : (
                <>
                  <Flag className="mr-2 h-4 w-4" />
                  Marcar questão para revisão
                </>
              )}
            </Button>

            <Button type="button" className="w-full" onClick={handleFinishAttempt} disabled={finishing}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {finishing ? "Finalizando..." : "Finalizar simulado"}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">
                  Questão {safeCurrentQuestion.index} de {questions.length}
                </Badge>
                <Badge variant="secondary">{safeCurrentQuestion.subject}</Badge>
                <Badge variant="outline">{safeCurrentQuestion.topic}</Badge>
              </div>
              <CardTitle className="pt-2 text-2xl leading-relaxed sm:text-[1.65rem]">
                {safeCurrentQuestion.statement}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {safeCurrentQuestion.type === "objective" ? (
                <div className="space-y-3">
                  {safeCurrentQuestion.options?.map((option) => {
                    const selected = currentAnswer?.selectedOptionId === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleSelectObjective(option.id)}
                        className={cn(
                          "group flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition-all duration-200",
                          selected
                            ? "border-primary bg-primary/10 shadow-[0_12px_24px_-18px_hsl(var(--primary)/0.8)]"
                            : "border-border/80 bg-background/70 hover:border-primary/35 hover:bg-accent/45"
                        )}
                      >
                        {selected ? (
                          <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                        ) : (
                          <Circle className="mt-0.5 h-4 w-4 text-muted-foreground group-hover:text-primary" />
                        )}
                        <span className="text-sm leading-relaxed">
                          <strong>{option.label})</strong> {option.text}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-3">
                  <Badge variant="outline">Questão discursiva - revisão manual</Badge>
                  <Textarea
                    placeholder="Escreva sua resposta aqui..."
                    value={currentAnswer?.essayText ?? ""}
                    onChange={(event) => handleEssayChange(event.target.value)}
                    className="min-h-[160px] leading-relaxed"
                  />
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={navigateBack} disabled={currentIndex === 0}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
              <Button
                type="button"
                onClick={navigateNext}
                disabled={currentIndex === questions.length - 1}
              >
                Avançar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Workspace de rascunho</CardTitle>
              <CardDescription>
                Use para fórmulas, contas e caminhos de resolução sem sair da prova.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SketchCanvas
                initialDataUrl={sketch?.imageDataUrl}
                onSave={handleSketchSave}
                className="w-full"
              />
              {savedMessage ? (
                <p className="mt-3 rounded-lg border border-primary/35 bg-primary/10 px-3 py-2 text-sm">
                  {savedMessage}
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
