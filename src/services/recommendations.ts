import { Recommendation, RecommendationPriority } from "@/types/domain";

interface TopicWeaknessInput {
  topic: string;
  subject: string;
  wrongCount: number;
  accuracy: number;
}

interface ErrorPatternInput {
  errorTagId: string;
  label: string;
  count: number;
  percentage: number;
}

interface SubjectPerformanceInput {
  subject: string;
  accuracy: number;
}

interface RecommendationContext {
  topicWeaknesses: TopicWeaknessInput[];
  errorPatterns: ErrorPatternInput[];
  subjectBreakdown: SubjectPerformanceInput[];
}

function priorityByAccuracy(accuracy: number): RecommendationPriority {
  if (accuracy < 0.5) return "alta";
  if (accuracy < 0.75) return "media";
  return "baixa";
}

const errorPlaybooks: Record<string, string> = {
  "content-gap":
    "Reserve 2 blocos curtos de revisao conceitual + 15 questoes graduais focadas no tema.",
  interpretation:
    "Antes de marcar, resuma o enunciado em 1 frase e sublinhe condicoes obrigatorias.",
  calculation:
    "Adote checkpoint de conta: sinais, unidades e estimativa de ordem de grandeza.",
  attention:
    "Use checklist final de 20 segundos por questao para evitar troca de alternativa.",
  strategy:
    "Treine selecao de metodo: compare 2 caminhos e escolha o mais curto antes de calcular.",
  incomplete:
    "Finalize toda resolucao com frase-resposta ou unidade final para nao deixar lacunas.",
  "concept-doubt":
    "Crie mapa mental com definicoes-chave e teste rapido de 5 minutos ao fim do estudo."
};

export function generateStudyRecommendations(
  context: RecommendationContext
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  context.topicWeaknesses.slice(0, 2).forEach((topicWeakness, index) => {
    recommendations.push({
      id: `topic-${topicWeakness.topic}-${index}`,
      title: `Priorize ${topicWeakness.topic}`,
      description: `Desempenho baixo em ${topicWeakness.subject}. Monte um plano de 3 ciclos: teoria curta, lista de 10 questoes e revisao ativa no dia seguinte.`,
      priority: priorityByAccuracy(topicWeakness.accuracy),
      topic: topicWeakness.topic,
      subject: topicWeakness.subject
    });
  });

  context.errorPatterns.slice(0, 2).forEach((errorPattern, index) => {
    recommendations.push({
      id: `error-${errorPattern.errorTagId}-${index}`,
      title: `Reduza "${errorPattern.label}"`,
      description:
        errorPlaybooks[errorPattern.errorTagId] ??
        "Adote rotina de revisao pos-prova para mapear e corrigir o padrao de erro.",
      priority: errorPattern.percentage >= 0.3 ? "alta" : "media",
      relatedErrorTagId: errorPattern.errorTagId
    });
  });

  const weakestSubject = [...context.subjectBreakdown].sort(
    (a, b) => a.accuracy - b.accuracy
  )[0];

  if (weakestSubject) {
    recommendations.push({
      id: `subject-${weakestSubject.subject}`,
      title: `Plano semanal para ${weakestSubject.subject}`,
      description: `Reserve 3 sessoes semanais de 45 minutos para ${weakestSubject.subject}, alternando revisao teorica e prova comentada.`,
      priority: priorityByAccuracy(weakestSubject.accuracy),
      subject: weakestSubject.subject
    });
  }

  recommendations.push({
    id: "study-habit",
    title: "Ritual de fechamento de simulado",
    description:
      "Apos cada tentativa, revise apenas as 5 questoes mais lentas e as 5 erradas para transformar erro em acao imediata.",
    priority: "media"
  });

  return recommendations.slice(0, 6);
}
