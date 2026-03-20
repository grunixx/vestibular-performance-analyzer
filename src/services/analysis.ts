import { generateStudyRecommendations } from "@/services/recommendations";
import {
  Attempt,
  DashboardMetrics,
  ErrorTag,
  PerformanceSummary,
  Question,
  Quiz,
  SubjectPerformance,
  TopicWeakness
} from "@/types/domain";
import { percent } from "@/lib/utils";

interface BuildSummaryParams {
  attempt: Attempt;
  quiz: Quiz;
  questions: Question[];
  errorTags: ErrorTag[];
}

interface SubjectAccumulator {
  correct: number;
  wrong: number;
  unanswered: number;
  totalTimeSeconds: number;
  answeredCount: number;
}

interface TopicAccumulator {
  subject: string;
  total: number;
  wrongCount: number;
  correct: number;
}

export function buildPerformanceSummary({
  attempt,
  quiz,
  questions,
  errorTags
}: BuildSummaryParams): PerformanceSummary {
  const questionMap = new Map(questions.map((question) => [question.id, question]));

  const objectiveQuestions = questions.filter(
    (question) => question.type === "objective"
  ).length;

  let correctAnswers = 0;
  let wrongAnswers = 0;
  let unanswered = 0;
  let manualReviewCount = 0;
  let totalTimeSeconds = 0;

  const subjectMap = new Map<string, SubjectAccumulator>();
  const topicMap = new Map<string, TopicAccumulator>();
  const errorCounter = new Map<string, number>();

  for (const answer of attempt.answers) {
    const question = questionMap.get(answer.questionId);
    if (!question) continue;

    const subjectAcc = subjectMap.get(question.subject) ?? {
      correct: 0,
      wrong: 0,
      unanswered: 0,
      totalTimeSeconds: 0,
      answeredCount: 0
    };

    const topicKey = `${question.subject}::${question.topic}`;
    const topicAcc = topicMap.get(topicKey) ?? {
      subject: question.subject,
      total: 0,
      wrongCount: 0,
      correct: 0
    };

    subjectAcc.totalTimeSeconds += answer.timeSpentSeconds;
    totalTimeSeconds += answer.timeSpentSeconds;
    topicAcc.total += 1;

    if (question.type === "essay" || answer.manualReviewRequired) {
      manualReviewCount += 1;
      if ((answer.essayText ?? "").trim().length === 0) {
        unanswered += 1;
        subjectAcc.unanswered += 1;
      } else {
        subjectAcc.answeredCount += 1;
      }
    } else if (!answer.selectedOptionId) {
      unanswered += 1;
      subjectAcc.unanswered += 1;
    } else if (answer.isCorrect) {
      correctAnswers += 1;
      subjectAcc.correct += 1;
      subjectAcc.answeredCount += 1;
      topicAcc.correct += 1;
    } else {
      wrongAnswers += 1;
      subjectAcc.wrong += 1;
      subjectAcc.answeredCount += 1;
      topicAcc.wrongCount += 1;

      const errorTagId = answer.errorTagId ?? question.defaultErrorTagId;
      errorCounter.set(errorTagId, (errorCounter.get(errorTagId) ?? 0) + 1);
    }

    subjectMap.set(question.subject, subjectAcc);
    topicMap.set(topicKey, topicAcc);
  }

  const score = correctAnswers;
  const accuracy = objectiveQuestions > 0 ? correctAnswers / objectiveQuestions : 0;
  const averageTimePerQuestion =
    questions.length > 0 ? totalTimeSeconds / questions.length : 0;

  const subjectBreakdown: SubjectPerformance[] = [...subjectMap.entries()].map(
    ([subject, acc]) => ({
      subject,
      correct: acc.correct,
      wrong: acc.wrong,
      unanswered: acc.unanswered,
      averageTimeSeconds:
        acc.answeredCount > 0 ? acc.totalTimeSeconds / acc.answeredCount : 0,
      accuracy: acc.correct + acc.wrong > 0 ? acc.correct / (acc.correct + acc.wrong) : 0
    })
  );

  const topicWeaknesses: TopicWeakness[] = [...topicMap.entries()]
    .map(([key, acc]) => {
      const [, topic] = key.split("::");
      const accuracyByTopic = acc.total > 0 ? acc.correct / acc.total : 0;
      return {
        topic,
        subject: acc.subject,
        wrongCount: acc.wrongCount,
        total: acc.total,
        accuracy: accuracyByTopic
      };
    })
    .filter((topic) => topic.wrongCount > 0)
    .sort((a, b) => {
      if (b.wrongCount !== a.wrongCount) return b.wrongCount - a.wrongCount;
      return a.accuracy - b.accuracy;
    });

  const errorPatterns = [...errorCounter.entries()]
    .map(([errorTagId, count]) => {
      const label = errorTags.find((errorTag) => errorTag.id === errorTagId)?.label;
      return {
        errorTagId,
        label: label ?? "Nao classificado",
        count,
        percentage: wrongAnswers > 0 ? count / wrongAnswers : 0
      };
    })
    .sort((a, b) => b.count - a.count);

  const feedbackByQuestion = attempt.answers.map((answer) => {
    const question = questionMap.get(answer.questionId);
    if (!question) {
      return {
        questionId: answer.questionId,
        subject: "Desconhecido",
        topic: "Desconhecido",
        selectedOptionId: answer.selectedOptionId,
        correctOptionId: undefined,
        isCorrect: answer.isCorrect,
        markedForReview: answer.markedForReview,
        timeSpentSeconds: answer.timeSpentSeconds,
        explanation: "Questao nao encontrada",
        manualReviewRequired: answer.manualReviewRequired
      };
    }

    return {
      questionId: question.id,
      subject: question.subject,
      topic: question.topic,
      selectedOptionId: answer.selectedOptionId,
      correctOptionId: question.correctOptionId,
      isCorrect: answer.isCorrect,
      markedForReview: answer.markedForReview,
      timeSpentSeconds: answer.timeSpentSeconds,
      explanation: question.explanation,
      manualReviewRequired: answer.manualReviewRequired
    };
  });

  const mostTimeConsumingQuestionIds = [...attempt.answers]
    .sort((a, b) => b.timeSpentSeconds - a.timeSpentSeconds)
    .slice(0, 3)
    .map((answer) => answer.questionId);

  const criticalQuestionIds = attempt.answers
    .filter(
      (answer) =>
        answer.markedForReview ||
        (!answer.isCorrect && answer.selectedOptionId) ||
        answer.timeSpentSeconds > averageTimePerQuestion * 1.5
    )
    .slice(0, 5)
    .map((answer) => answer.questionId);

  const topWeakness = topicWeaknesses[0];
  const topErrorPattern = errorPatterns[0];
  const insights = [
    `Voce acertou ${correctAnswers} de ${objectiveQuestions} questoes objetivas (${percent(
      accuracy,
      1
    )}%).`,
    topWeakness
      ? `Ponto de atencao: ${topWeakness.subject} / ${topWeakness.topic} concentrou ${topWeakness.wrongCount} erro(s).`
      : "Nenhum tema com concentracao critica de erros nesta tentativa.",
    topErrorPattern
      ? `Padrao predominante: ${topErrorPattern.label} em ${percent(
          topErrorPattern.percentage,
          0
        )}% das questoes erradas.`
      : "Sem padrao de erro recorrente detectado.",
    `Tempo total ${Math.round(
      totalTimeSeconds / 60
    )} min; revise as questoes mais lentas para ganhar eficiencia.`
  ];

  const recommendations = generateStudyRecommendations({
    topicWeaknesses,
    errorPatterns,
    subjectBreakdown
  });

  return {
    id: crypto.randomUUID(),
    attemptId: attempt.id,
    userId: attempt.userId,
    quizId: quiz.id,
    createdAt: new Date().toISOString(),
    score,
    objectiveQuestions,
    correctAnswers,
    wrongAnswers,
    unanswered,
    manualReviewCount,
    accuracy,
    totalTimeSeconds,
    averageTimePerQuestion,
    mostTimeConsumingQuestionIds,
    criticalQuestionIds,
    subjectBreakdown,
    topicWeaknesses,
    errorPatterns,
    feedbackByQuestion,
    insights,
    recommendations
  };
}

export function buildDashboardMetrics(
  attempts: Attempt[],
  summaries: PerformanceSummary[],
  questions: Question[]
): DashboardMetrics {
  const completedAttempts = attempts.filter((attempt) => attempt.status === "completed");

  const averageAccuracy =
    summaries.length > 0
      ? summaries.reduce((total, summary) => total + summary.accuracy, 0) / summaries.length
      : 0;

  const bestScore =
    summaries.length > 0
      ? Math.max(...summaries.map((summary) => summary.score))
      : 0;

  const trend = [...summaries]
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((summary) => ({
      attemptId: summary.attemptId,
      date: new Date(summary.createdAt).toLocaleDateString("pt-BR"),
      score: summary.score,
      accuracy: percent(summary.accuracy, 1)
    }));

  const subjectAggregator = new Map<
    string,
    { correct: number; wrong: number; unanswered: number }
  >();
  summaries.forEach((summary) => {
    summary.subjectBreakdown.forEach((subject) => {
      const acc = subjectAggregator.get(subject.subject) ?? {
        correct: 0,
        wrong: 0,
        unanswered: 0
      };
      acc.correct += subject.correct;
      acc.wrong += subject.wrong;
      acc.unanswered += subject.unanswered;
      subjectAggregator.set(subject.subject, acc);
    });
  });

  const subjectAccuracy = [...subjectAggregator.entries()]
    .map(([subject, acc]) => ({
      subject,
      accuracy:
        acc.correct + acc.wrong > 0
          ? percent(acc.correct / (acc.correct + acc.wrong), 1)
          : 0,
      correct: acc.correct,
      wrong: acc.wrong
    }))
    .sort((a, b) => a.accuracy - b.accuracy);

  const errorTypeAggregator = new Map<string, number>();
  summaries.forEach((summary) => {
    summary.errorPatterns.forEach((pattern) => {
      errorTypeAggregator.set(
        pattern.label,
        (errorTypeAggregator.get(pattern.label) ?? 0) + pattern.count
      );
    });
  });
  const errorTypeDistribution = [...errorTypeAggregator.entries()].map(
    ([label, value]) => ({
      label,
      value
    })
  );

  const wrongCountByQuestion = new Map<string, { wrong: number; total: number }>();
  const timeByQuestion = new Map<string, { time: number; total: number }>();

  summaries.forEach((summary) => {
    summary.feedbackByQuestion.forEach((feedback) => {
      const wrongAcc = wrongCountByQuestion.get(feedback.questionId) ?? {
        wrong: 0,
        total: 0
      };
      wrongAcc.total += 1;
      if (feedback.isCorrect === false) wrongAcc.wrong += 1;
      wrongCountByQuestion.set(feedback.questionId, wrongAcc);

      const timeAcc = timeByQuestion.get(feedback.questionId) ?? { time: 0, total: 0 };
      timeAcc.total += 1;
      timeAcc.time += feedback.timeSpentSeconds;
      timeByQuestion.set(feedback.questionId, timeAcc);
    });
  });

  const hardestEntry = [...wrongCountByQuestion.entries()]
    .map(([questionId, acc]) => ({
      questionId,
      wrongRate: acc.total > 0 ? acc.wrong / acc.total : 0
    }))
    .sort((a, b) => b.wrongRate - a.wrongRate)[0];

  const slowestEntry = [...timeByQuestion.entries()]
    .map(([questionId, acc]) => ({
      questionId,
      averageTimeSeconds: acc.total > 0 ? acc.time / acc.total : 0
    }))
    .sort((a, b) => b.averageTimeSeconds - a.averageTimeSeconds)[0];

  const questionMap = new Map(questions.map((question) => [question.id, question]));

  return {
    totalAttempts: attempts.length,
    completedAttempts: completedAttempts.length,
    averageAccuracy: percent(averageAccuracy, 1),
    bestScore,
    trend,
    subjectAccuracy,
    errorTypeDistribution,
    hardestQuestion: hardestEntry
      ? {
          questionId: hardestEntry.questionId,
          statement: questionMap.get(hardestEntry.questionId)?.statement ?? "Questao",
          wrongRate: percent(hardestEntry.wrongRate, 1)
        }
      : undefined,
    slowestQuestion: slowestEntry
      ? {
          questionId: slowestEntry.questionId,
          statement: questionMap.get(slowestEntry.questionId)?.statement ?? "Questao",
          averageTimeSeconds: Math.round(slowestEntry.averageTimeSeconds)
        }
      : undefined
  };
}
