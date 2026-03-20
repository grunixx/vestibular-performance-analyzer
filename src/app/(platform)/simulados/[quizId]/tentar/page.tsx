"use client";

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
  Save
} from "lucide-react";

import { SketchCanvas } from "@/components/sketch/sketch-canvas";
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
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/hooks/use-app";
import { cn, formatDuration } from "@/lib/utils";

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
  const [, setTick] = useState(0);
  const [finishing, setFinishing] = useState(false);
  const enteredQuestionAtRef = useRef<number>(Date.now());
  const initializedRef = useRef(false);

  const attempt = activeAttemptId ? getAttemptById(activeAttemptId) : undefined;

  useEffect(() => {
    const interval = window.setInterval(() => setTick((value) => value + 1), 1000);
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
  const currentAnswer = attempt?.answers.find(
    (answer) => answer.questionId === currentQuestion?.id
  );

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
  const totalElapsedSeconds = attempt
    ? attempt.answers.reduce((total, answer) => total + answer.timeSpentSeconds, 0) +
      (currentQuestion ? dynamicDeltaSeconds : 0)
    : 0;
  const currentQuestionElapsed = currentAnswer
    ? currentAnswer.timeSpentSeconds + dynamicDeltaSeconds
    : 0;

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

  useEffect(() => {
    return () => {
      flushCurrentQuestionTime();
    };
  }, [flushCurrentQuestionTime]);

  if (!quiz || questions.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="font-medium">Simulado indisponivel.</p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/simulados">Voltar ao catalogo</Link>
          </Button>
        </CardContent>
      </Card>
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
      <header className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              {quiz.examBoard} {quiz.year}
            </p>
            <h1 className="text-2xl font-semibold">{quiz.title}</h1>
          </div>
          <Badge variant="secondary">Tempo total: {formatDuration(totalElapsedSeconds)}</Badge>
        </div>
        <Progress value={progress} />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Progresso: {answeredCount}/{questions.length}
          </span>
          <span>Questao atual: {currentIndex + 1}</span>
          <span>Tempo nesta questao: {formatDuration(currentQuestionElapsed)}</span>
        </div>
      </header>

      <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
        <Card className="h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Navegacao rapida</CardTitle>
            <CardDescription>Marque questoes para revisar depois.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-5 gap-2">
              {questions.map((question, index) => {
                const answer = safeAttempt.answers.find(
                  (attemptAnswer) => attemptAnswer.questionId === question.id
                );
                const answered = Boolean(answer?.selectedOptionId || answer?.essayText?.trim());
                const flagged = Boolean(answer?.markedForReview);
                return (
                  <button
                    key={question.id}
                    type="button"
                    onClick={() => goToQuestion(index)}
                    className={cn(
                      "rounded-md border p-2 text-xs font-medium transition-colors",
                      currentIndex === index
                        ? "border-primary bg-primary text-primary-foreground"
                        : answered
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-border bg-background text-muted-foreground",
                      flagged && "ring-2 ring-amber-300"
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
                  Remover marcacao de revisao
                </>
              ) : (
                <>
                  <Flag className="mr-2 h-4 w-4" />
                  Marcar para revisao
                </>
              )}
            </Button>

            <Button
              type="button"
              className="w-full"
              onClick={handleFinishAttempt}
              disabled={finishing}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {finishing ? "Finalizando..." : "Finalizar simulado"}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardDescription>
                Questao {safeCurrentQuestion.index} de {questions.length} -{" "}
                {safeCurrentQuestion.subject} - {safeCurrentQuestion.topic}
              </CardDescription>
              <CardTitle className="text-xl leading-relaxed">
                {safeCurrentQuestion.statement}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {safeCurrentQuestion.type === "objective" ? (
                <div className="space-y-2">
                  {safeCurrentQuestion.options?.map((option) => {
                    const selected = currentAnswer?.selectedOptionId === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleSelectObjective(option.id)}
                        className={cn(
                          "flex w-full items-start gap-3 rounded-lg border px-3 py-3 text-left transition-colors",
                          selected
                            ? "border-primary bg-primary/10"
                            : "border-border hover:bg-accent/40"
                        )}
                      >
                        {selected ? (
                          <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                        ) : (
                          <Circle className="mt-0.5 h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-sm">
                          <strong>{option.label})</strong> {option.text}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-3">
                  <Badge variant="outline">Questao discursiva - revisao manual</Badge>
                  <Textarea
                    placeholder="Escreva sua resposta aqui..."
                    value={currentAnswer?.essayText ?? ""}
                    onChange={(event) => handleEssayChange(event.target.value)}
                    className="min-h-[140px]"
                  />
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={navigateBack}
                disabled={currentIndex === 0}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
              <Button
                type="button"
                onClick={navigateNext}
                disabled={currentIndex === questions.length - 1}
              >
                Avancar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Rascunho / resolucao manual</CardTitle>
              <CardDescription>
                Use para contas, diagramas e raciocinio. O arquivo fica salvo por questao.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SketchCanvas
                initialDataUrl={sketch?.imageDataUrl}
                onSave={handleSketchSave}
                className="w-full"
              />
              {savedMessage ? (
                <p className="mt-3 flex items-center text-sm text-emerald-700">
                  <Save className="mr-2 h-4 w-4" />
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
