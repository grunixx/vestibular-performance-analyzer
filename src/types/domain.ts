export type QuestionType = "objective" | "essay";

export type AttemptStatus = "in_progress" | "completed";

export type RecommendationPriority = "alta" | "media" | "baixa";

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  targetExam?: string;
  gradeLevel?: string;
  createdAt: string;
}

export interface Quiz {
  id: string;
  title: string;
  examBoard: string;
  year: number;
  description: string;
  durationMinutes: number;
  questionIds: string[];
}

export interface AnswerOption {
  id: string;
  label: string;
  text: string;
}

export interface Question {
  id: string;
  quizId: string;
  index: number;
  statement: string;
  subject: string;
  topic: string;
  type: QuestionType;
  options?: AnswerOption[];
  correctOptionId?: string;
  explanation: string;
  defaultErrorTagId: string;
}

export interface AttemptAnswer {
  questionId: string;
  selectedOptionId?: string;
  essayText?: string;
  markedForReview: boolean;
  timeSpentSeconds: number;
  isCorrect?: boolean;
  errorTagId?: string;
  manualReviewRequired?: boolean;
}

export interface Attempt {
  id: string;
  userId: string;
  quizId: string;
  status: AttemptStatus;
  startedAt: string;
  finishedAt?: string;
  totalTimeSeconds: number;
  answers: AttemptAnswer[];
}

export interface DraftSketch {
  id: string;
  attemptId: string;
  questionId: string;
  imageDataUrl: string;
  storagePath?: string;
  publicUrl?: string;
  updatedAt: string;
}

export interface ErrorTag {
  id: string;
  label: string;
  description: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: RecommendationPriority;
  subject?: string;
  topic?: string;
  relatedErrorTagId?: string;
}

export interface SubjectPerformance {
  subject: string;
  correct: number;
  wrong: number;
  unanswered: number;
  averageTimeSeconds: number;
  accuracy: number;
}

export interface TopicWeakness {
  topic: string;
  subject: string;
  wrongCount: number;
  total: number;
  accuracy: number;
}

export interface ErrorPattern {
  errorTagId: string;
  label: string;
  count: number;
  percentage: number;
}

export interface QuestionFeedback {
  questionId: string;
  subject: string;
  topic: string;
  selectedOptionId?: string;
  correctOptionId?: string;
  isCorrect?: boolean;
  markedForReview: boolean;
  timeSpentSeconds: number;
  explanation: string;
  manualReviewRequired?: boolean;
}

export interface PerformanceSummary {
  id: string;
  attemptId: string;
  userId: string;
  quizId: string;
  createdAt: string;
  score: number;
  objectiveQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  unanswered: number;
  manualReviewCount: number;
  accuracy: number;
  totalTimeSeconds: number;
  averageTimePerQuestion: number;
  mostTimeConsumingQuestionIds: string[];
  criticalQuestionIds: string[];
  subjectBreakdown: SubjectPerformance[];
  topicWeaknesses: TopicWeakness[];
  errorPatterns: ErrorPattern[];
  feedbackByQuestion: QuestionFeedback[];
  insights: string[];
  recommendations: Recommendation[];
}

export interface DashboardMetrics {
  totalAttempts: number;
  completedAttempts: number;
  averageAccuracy: number;
  bestScore: number;
  trend: Array<{
    attemptId: string;
    date: string;
    score: number;
    accuracy: number;
  }>;
  subjectAccuracy: Array<{
    subject: string;
    accuracy: number;
    correct: number;
    wrong: number;
  }>;
  errorTypeDistribution: Array<{
    label: string;
    value: number;
  }>;
  hardestQuestion?: {
    questionId: string;
    statement: string;
    wrongRate: number;
  };
  slowestQuestion?: {
    questionId: string;
    statement: string;
    averageTimeSeconds: number;
  };
}
