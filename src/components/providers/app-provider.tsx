"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js";

import { demoProfile, errorTags, seedQuestions, seedQuizzes } from "@/data/seed";
import { readLocalStorage, removeLocalStorage, writeLocalStorage } from "@/lib/local-storage";
import { getSupabaseClient, isSupabaseEnabled } from "@/lib/supabase/client";
import { uploadSketchToStorage } from "@/lib/supabase/storage";
import { createQuizRepository } from "@/repositories";
import { buildDashboardMetrics, buildPerformanceSummary } from "@/services/analysis";
import { gradeAttempt } from "@/services/grading";
import {
  Attempt,
  AttemptAnswer,
  DashboardMetrics,
  DraftSketch,
  ErrorTag,
  PerformanceSummary,
  Question,
  Quiz,
  UserProfile
} from "@/types/domain";

const STORAGE_KEYS = {
  attempts: "attempts",
  summaries: "summaries",
  sketches: "sketches",
  sessionMode: "session-mode"
} as const;

type AuthStatus = "loading" | "authenticated" | "guest";

interface AuthState {
  status: AuthStatus;
  isDemo: boolean;
  user: UserProfile | null;
  supabaseEnabled: boolean;
}

interface AppContextValue {
  auth: AuthState;
  loadingCatalog: boolean;
  quizzes: Quiz[];
  questions: Question[];
  attempts: Attempt[];
  summaries: PerformanceSummary[];
  sketches: DraftSketch[];
  errorTags: ErrorTag[];
  dashboardMetrics: DashboardMetrics;
  signIn: (email: string, password: string) => Promise<{
    ok: boolean;
    message?: string;
  }>;
  enterDemoMode: () => void;
  signOut: () => Promise<void>;
  getQuizById: (quizId: string) => Quiz | undefined;
  getQuestionsByQuiz: (quizId: string) => Question[];
  startAttempt: (quizId: string) => string;
  getAttemptById: (attemptId: string) => Attempt | undefined;
  getSummaryByAttemptId: (attemptId: string) => PerformanceSummary | undefined;
  updateAttemptAnswer: (
    attemptId: string,
    questionId: string,
    patch: Partial<Pick<AttemptAnswer, "selectedOptionId" | "essayText" | "markedForReview" | "errorTagId">>
  ) => void;
  addQuestionTime: (attemptId: string, questionId: string, deltaSeconds: number) => void;
  saveSketch: (attemptId: string, questionId: string, imageDataUrl: string) => void;
  getSketch: (attemptId: string, questionId: string) => DraftSketch | undefined;
  finishAttempt: (attemptId: string) => PerformanceSummary | undefined;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

function toUserProfile(user: User): UserProfile {
  const fullName =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email?.split("@")[0] ??
    "Estudante";

  return {
    id: user.id,
    fullName,
    email: user.email ?? "",
    targetExam: user.user_metadata?.target_exam,
    gradeLevel: user.user_metadata?.grade_level,
    createdAt: user.created_at ?? new Date().toISOString()
  };
}

function upsertById<T extends { id: string }>(items: T[], item: T): T[] {
  const index = items.findIndex((existingItem) => existingItem.id === item.id);
  if (index < 0) return [...items, item];

  const next = [...items];
  next[index] = item;
  return next;
}

export function AppProvider({ children }: { children: ReactNode }): JSX.Element {
  const [auth, setAuth] = useState<AuthState>({
    status: "loading",
    isDemo: false,
    user: null,
    supabaseEnabled: isSupabaseEnabled()
  });
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [summaries, setSummaries] = useState<PerformanceSummary[]>([]);
  const [sketches, setSketches] = useState<DraftSketch[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setAttempts(readLocalStorage(STORAGE_KEYS.attempts, [] as Attempt[]));
    setSummaries(readLocalStorage(STORAGE_KEYS.summaries, [] as PerformanceSummary[]));
    setSketches(readLocalStorage(STORAGE_KEYS.sketches, [] as DraftSketch[]));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeLocalStorage(STORAGE_KEYS.attempts, attempts);
  }, [attempts, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    writeLocalStorage(STORAGE_KEYS.summaries, summaries);
  }, [summaries, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    writeLocalStorage(STORAGE_KEYS.sketches, sketches);
  }, [sketches, hydrated]);

  useEffect(() => {
    async function loadCatalog(): Promise<void> {
      const primaryRepo = createQuizRepository(isSupabaseEnabled());
      let fetchedQuizzes = await primaryRepo.listQuizzes();
      let fetchedQuestions: Question[] = [];

      for (const quiz of fetchedQuizzes) {
        const quizQuestions = await primaryRepo.listQuestionsByQuiz(quiz.id);
        fetchedQuestions = [...fetchedQuestions, ...quizQuestions];
      }

      if (fetchedQuizzes.length === 0 || fetchedQuestions.length === 0) {
        fetchedQuizzes = seedQuizzes;
        fetchedQuestions = seedQuestions;
      }

      const normalizedQuizzes = fetchedQuizzes.map((quiz) => {
        const fromQuestions = fetchedQuestions
          .filter((question) => question.quizId === quiz.id)
          .sort((a, b) => a.index - b.index)
          .map((question) => question.id);
        return {
          ...quiz,
          questionIds: fromQuestions.length > 0 ? fromQuestions : quiz.questionIds
        };
      });

      setQuizzes(normalizedQuizzes);
      setQuestions(fetchedQuestions);
      setLoadingCatalog(false);
    }

    void loadCatalog();
  }, []);

  useEffect(() => {
    const supabase = getSupabaseClient();
    const savedSessionMode = readLocalStorage<{ mode: "demo" } | null>(
      STORAGE_KEYS.sessionMode,
      null
    );

    if (!supabase) {
      if (savedSessionMode?.mode === "demo") {
        setAuth({
          status: "authenticated",
          user: demoProfile,
          isDemo: true,
          supabaseEnabled: false
        });
      } else {
        setAuth({
          status: "guest",
          user: null,
          isDemo: false,
          supabaseEnabled: false
        });
      }
      return;
    }

    void supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setAuth({
          status: "authenticated",
          user: toUserProfile(data.session.user),
          isDemo: false,
          supabaseEnabled: true
        });
        removeLocalStorage(STORAGE_KEYS.sessionMode);
      } else if (savedSessionMode?.mode === "demo") {
        setAuth({
          status: "authenticated",
          user: demoProfile,
          isDemo: true,
          supabaseEnabled: true
        });
      } else {
        setAuth({
          status: "guest",
          user: null,
          isDemo: false,
          supabaseEnabled: true
        });
      }
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setAuth({
          status: "authenticated",
          user: toUserProfile(session.user),
          isDemo: false,
          supabaseEnabled: true
        });
        removeLocalStorage(STORAGE_KEYS.sessionMode);
      } else {
        const stillDemo = readLocalStorage<{ mode: "demo" } | null>(
          STORAGE_KEYS.sessionMode,
          null
        );
        if (stillDemo?.mode === "demo") {
          setAuth({
            status: "authenticated",
            user: demoProfile,
            isDemo: true,
            supabaseEnabled: true
          });
        } else {
          setAuth({
            status: "guest",
            user: null,
            isDemo: false,
            supabaseEnabled: true
          });
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const supabase = getSupabaseClient();
      if (!supabase) {
        return {
          ok: false,
          message:
            "Supabase não configurado neste ambiente. Use o modo demo para explorar o sistema."
        };
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return {
          ok: false,
          message: error.message
        };
      }

      return { ok: true };
    },
    []
  );

  const enterDemoMode = useCallback(() => {
    writeLocalStorage(STORAGE_KEYS.sessionMode, { mode: "demo" });
    setAuth((prevAuth) => ({
      ...prevAuth,
      status: "authenticated",
      user: demoProfile,
      isDemo: true
    }));
  }, []);

  const signOut = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (supabase && !auth.isDemo) {
      await supabase.auth.signOut();
    }
    removeLocalStorage(STORAGE_KEYS.sessionMode);
    setAuth((prevAuth) => ({
      ...prevAuth,
      status: "guest",
      user: null,
      isDemo: false
    }));
  }, [auth.isDemo]);

  const getQuizById = useCallback(
    (quizId: string) => quizzes.find((quiz) => quiz.id === quizId),
    [quizzes]
  );

  const getQuestionsByQuiz = useCallback(
    (quizId: string) =>
      questions.filter((question) => question.quizId === quizId).sort((a, b) => a.index - b.index),
    [questions]
  );

  const getAttemptById = useCallback(
    (attemptId: string) => attempts.find((attempt) => attempt.id === attemptId),
    [attempts]
  );

  const getSummaryByAttemptId = useCallback(
    (attemptId: string) => summaries.find((summary) => summary.attemptId === attemptId),
    [summaries]
  );

  const startAttempt = useCallback(
    (quizId: string) => {
      const quizQuestions = getQuestionsByQuiz(quizId);
      const userId = auth.user?.id ?? demoProfile.id;
      const attemptId = crypto.randomUUID();

      const answers: AttemptAnswer[] = quizQuestions.map((question) => ({
        questionId: question.id,
        selectedOptionId: undefined,
        essayText: "",
        markedForReview: false,
        timeSpentSeconds: 0,
        isCorrect: undefined,
        errorTagId: undefined,
        manualReviewRequired: question.type === "essay"
      }));

      const attempt: Attempt = {
        id: attemptId,
        userId,
        quizId,
        status: "in_progress",
        startedAt: new Date().toISOString(),
        totalTimeSeconds: 0,
        answers
      };

      setAttempts((prevAttempts) => [...prevAttempts, attempt]);
      return attemptId;
    },
    [auth.user?.id, getQuestionsByQuiz]
  );

  const updateAttemptAnswer = useCallback(
    (
      attemptId: string,
      questionId: string,
      patch: Partial<
        Pick<
          AttemptAnswer,
          "selectedOptionId" | "essayText" | "markedForReview" | "errorTagId"
        >
      >
    ) => {
      setAttempts((prevAttempts) =>
        prevAttempts.map((attempt) => {
          if (attempt.id !== attemptId) return attempt;
          return {
            ...attempt,
            answers: attempt.answers.map((answer) =>
              answer.questionId === questionId ? { ...answer, ...patch } : answer
            )
          };
        })
      );
    },
    []
  );

  const addQuestionTime = useCallback(
    (attemptId: string, questionId: string, deltaSeconds: number) => {
      if (deltaSeconds <= 0) return;

      setAttempts((prevAttempts) =>
        prevAttempts.map((attempt) => {
          if (attempt.id !== attemptId) return attempt;
          return {
            ...attempt,
            answers: attempt.answers.map((answer) =>
              answer.questionId === questionId
                ? {
                    ...answer,
                    timeSpentSeconds: answer.timeSpentSeconds + deltaSeconds
                  }
                : answer
            )
          };
        })
      );
    },
    []
  );

  const saveSketch = useCallback(
    (attemptId: string, questionId: string, imageDataUrl: string) => {
      const nextSketch: DraftSketch = {
        id: `${attemptId}:${questionId}`,
        attemptId,
        questionId,
        imageDataUrl,
        updatedAt: new Date().toISOString()
      };
      setSketches((prevSketches) => upsertById(prevSketches, nextSketch));

      if (auth.isDemo || !auth.user) return;

      void uploadSketchToStorage({
        userId: auth.user.id,
        attemptId,
        questionId,
        imageDataUrl
      }).then((uploaded) => {
        if (!uploaded) return;
        setSketches((prevSketches) =>
          prevSketches.map((existingSketch) =>
            existingSketch.id === nextSketch.id
              ? {
                  ...existingSketch,
                  storagePath: uploaded.storagePath,
                  publicUrl: uploaded.publicUrl
                }
              : existingSketch
          )
        );
      });
    },
    [auth.isDemo, auth.user]
  );

  const getSketch = useCallback(
    (attemptId: string, questionId: string) =>
      sketches.find(
        (sketch) => sketch.attemptId === attemptId && sketch.questionId === questionId
      ),
    [sketches]
  );

  const finishAttempt = useCallback(
    (attemptId: string) => {
      const attempt = attempts.find((currentAttempt) => currentAttempt.id === attemptId);
      if (!attempt) return undefined;

      const quiz = getQuizById(attempt.quizId);
      if (!quiz) return undefined;

      const quizQuestions = getQuestionsByQuiz(quiz.id);
      const grading = gradeAttempt(quizQuestions, attempt);

      const completedAttempt: Attempt = {
        ...attempt,
        status: "completed",
        finishedAt: new Date().toISOString(),
        totalTimeSeconds: grading.totalTimeSeconds,
        answers: grading.answers
      };

      const summary = buildPerformanceSummary({
        attempt: completedAttempt,
        quiz,
        questions: quizQuestions,
        errorTags
      });

      setAttempts((prevAttempts) =>
        prevAttempts.map((existingAttempt) =>
          existingAttempt.id === completedAttempt.id ? completedAttempt : existingAttempt
        )
      );
      setSummaries((prevSummaries) => {
        const withoutCurrent = prevSummaries.filter(
          (existingSummary) => existingSummary.attemptId !== completedAttempt.id
        );
        return [...withoutCurrent, summary];
      });

      return summary;
    },
    [attempts, getQuestionsByQuiz, getQuizById]
  );

  const dashboardMetrics = useMemo(
    () => buildDashboardMetrics(attempts, summaries, questions),
    [attempts, summaries, questions]
  );

  const value = useMemo<AppContextValue>(
    () => ({
      auth,
      loadingCatalog,
      quizzes,
      questions,
      attempts,
      summaries,
      sketches,
      errorTags,
      dashboardMetrics,
      signIn,
      enterDemoMode,
      signOut,
      getQuizById,
      getQuestionsByQuiz,
      startAttempt,
      getAttemptById,
      getSummaryByAttemptId,
      updateAttemptAnswer,
      addQuestionTime,
      saveSketch,
      getSketch,
      finishAttempt
    }),
    [
      auth,
      loadingCatalog,
      quizzes,
      questions,
      attempts,
      summaries,
      sketches,
      dashboardMetrics,
      signIn,
      enterDemoMode,
      signOut,
      getQuizById,
      getQuestionsByQuiz,
      startAttempt,
      getAttemptById,
      getSummaryByAttemptId,
      updateAttemptAnswer,
      addQuestionTime,
      saveSketch,
      getSketch,
      finishAttempt
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
}
