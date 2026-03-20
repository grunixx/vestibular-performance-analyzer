import { Attempt, AttemptAnswer, Question, QuestionFeedback } from "@/types/domain";

export interface GradingResult {
  answers: AttemptAnswer[];
  feedbackByQuestion: QuestionFeedback[];
  totalTimeSeconds: number;
}

export function gradeAttempt(questions: Question[], attempt: Attempt): GradingResult {
  const questionMap = new Map(questions.map((question) => [question.id, question]));

  const answers = attempt.answers.map((answer) => {
    const question = questionMap.get(answer.questionId);
    if (!question) return answer;

    if (question.type === "essay") {
      return {
        ...answer,
        isCorrect: undefined,
        manualReviewRequired: true
      };
    }

    if (!answer.selectedOptionId) {
      return {
        ...answer,
        isCorrect: undefined,
        manualReviewRequired: false
      };
    }

    const isCorrect = answer.selectedOptionId === question.correctOptionId;
    return {
      ...answer,
      isCorrect,
      manualReviewRequired: false,
      errorTagId: !isCorrect ? answer.errorTagId ?? question.defaultErrorTagId : undefined
    };
  });

  const feedbackByQuestion: QuestionFeedback[] = [];
  for (const answer of answers) {
    const question = questionMap.get(answer.questionId);
    if (!question) continue;

    feedbackByQuestion.push({
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
    });
  }

  const totalTimeSeconds = answers.reduce(
    (total, answer) => total + answer.timeSpentSeconds,
    0
  );

  return {
    answers,
    feedbackByQuestion,
    totalTimeSeconds
  };
}
