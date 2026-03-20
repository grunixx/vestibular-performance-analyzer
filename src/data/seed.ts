import { ErrorTag, Question, Quiz, UserProfile } from "@/types/domain";

export const demoProfile: UserProfile = {
  id: "demo-user",
  fullName: "Aluno Demo",
  email: "demo@simulai.education",
  targetExam: "ENEM + FUVEST",
  gradeLevel: "3º ano EM",
  createdAt: "2026-03-19T00:00:00.000Z"
};

export const errorTags: ErrorTag[] = [
  {
    id: "content-gap",
    label: "Conteúdo não dominado",
    description: "O tema principal ainda não foi consolidado."
  },
  {
    id: "interpretation",
    label: "Interpretação equivocada",
    description: "Leitura incompleta do enunciado ou das condições."
  },
  {
    id: "calculation",
    label: "Erro de conta",
    description: "Execução algorítmica correta, mas com conta incorreta."
  },
  {
    id: "attention",
    label: "Erro de atenção",
    description: "Descuido na marcação ou troca de sinal."
  },
  {
    id: "strategy",
    label: "Estratégia inadequada",
    description: "Abordagem menos eficiente para o tipo de questão."
  },
  {
    id: "incomplete",
    label: "Resposta incompleta",
    description: "Resolução parou antes da conclusão final."
  },
  {
    id: "concept-doubt",
    label: "Dúvida de conceito",
    description: "Conceito central ainda gera insegurança."
  }
];

export const seedQuizzes: Quiz[] = [
  {
    id: "enem-2025-misto-a",
    title: "Simulado Enem Misto A",
    examBoard: "ENEM",
    year: 2025,
    description:
      "Treino com foco em matemática, linguagens e ciências da natureza com perfil ENEM.",
    durationMinutes: 120,
    questionIds: [
      "q-101",
      "q-102",
      "q-103",
      "q-104",
      "q-105",
      "q-106",
      "q-107",
      "q-108"
    ]
  },
  {
    id: "fuvest-2024-objetiva-b",
    title: "FUVEST Objetiva B",
    examBoard: "FUVEST",
    year: 2024,
    description: "Conjunto objetivo com maior exigência de interpretação e estratégia.",
    durationMinutes: 90,
    questionIds: ["q-201", "q-202", "q-203", "q-204", "q-205", "q-206"]
  },
  {
    id: "unicamp-2025-rapido-c",
    title: "UNICAMP Treino Rápido C",
    examBoard: "UNICAMP",
    year: 2025,
    description: "Simulado curto para rotina diária, com foco em consistência de desempenho.",
    durationMinutes: 60,
    questionIds: ["q-301", "q-302", "q-303", "q-304", "q-305"]
  }
];

export const seedQuestions: Question[] = [
  {
    id: "q-101",
    quizId: "enem-2025-misto-a",
    index: 1,
    statement:
      "Uma progressão aritmética tem primeiro termo 7 e razão 3. Qual é o 15º termo?",
    subject: "Matemática",
    topic: "Progressão Aritmética",
    type: "objective",
    options: [
      { id: "q-101-a", label: "A", text: "46" },
      { id: "q-101-b", label: "B", text: "49" },
      { id: "q-101-c", label: "C", text: "52" },
      { id: "q-101-d", label: "D", text: "55" }
    ],
    correctOptionId: "q-101-b",
    explanation: "Em PA: a_n = 7 + (15-1)*3 = 7 + 42 = 49.",
    defaultErrorTagId: "calculation"
  },
  {
    id: "q-102",
    quizId: "enem-2025-misto-a",
    index: 2,
    statement: "Uma solução com pH 3 tem concentração de íons H+ igual a:",
    subject: "Química",
    topic: "pH e pOH",
    type: "objective",
    options: [
      { id: "q-102-a", label: "A", text: "10^-3 mol/L" },
      { id: "q-102-b", label: "B", text: "10^3 mol/L" },
      { id: "q-102-c", label: "C", text: "3 mol/L" },
      { id: "q-102-d", label: "D", text: "0,03 mol/L" }
    ],
    correctOptionId: "q-102-a",
    explanation: "Definição: pH = -log[H+]. Se pH=3, então [H+] = 10^-3 mol/L.",
    defaultErrorTagId: "concept-doubt"
  },
  {
    id: "q-103",
    quizId: "enem-2025-misto-a",
    index: 3,
    statement:
      "No trecho 'Apesar da chuva, a prova ocorreu normalmente', a conjunção expressa:",
    subject: "Linguagens",
    topic: "Conectivos e Semântica",
    type: "objective",
    options: [
      { id: "q-103-a", label: "A", text: "Causa" },
      { id: "q-103-b", label: "B", text: "Concessão" },
      { id: "q-103-c", label: "C", text: "Conclusão" },
      { id: "q-103-d", label: "D", text: "Comparação" }
    ],
    correctOptionId: "q-103-b",
    explanation: "Apesar de introduz ideia concessiva: fato contrário não impede o outro.",
    defaultErrorTagId: "interpretation"
  },
  {
    id: "q-104",
    quizId: "enem-2025-misto-a",
    index: 4,
    statement:
      "Um carro percorre 180 km em 3 horas. Mantida a velocidade média, em 5 horas percorre:",
    subject: "Física",
    topic: "Velocidade média",
    type: "objective",
    options: [
      { id: "q-104-a", label: "A", text: "240 km" },
      { id: "q-104-b", label: "B", text: "270 km" },
      { id: "q-104-c", label: "C", text: "300 km" },
      { id: "q-104-d", label: "D", text: "360 km" }
    ],
    correctOptionId: "q-104-c",
    explanation: "v=180/3=60 km/h. Em 5h: d=60*5=300 km.",
    defaultErrorTagId: "strategy"
  },
  {
    id: "q-105",
    quizId: "enem-2025-misto-a",
    index: 5,
    statement: "Marque a alternativa com erro de concordância verbal.",
    subject: "Linguagens",
    topic: "Concordância verbal",
    type: "objective",
    options: [
      { id: "q-105-a", label: "A", text: "Faltam cinco minutos para a prova." },
      { id: "q-105-b", label: "B", text: "Houveram muitas dúvidas na revisão." },
      { id: "q-105-c", label: "C", text: "Existem boas razões para estudar." },
      { id: "q-105-d", label: "D", text: "Chegaram os resultados da turma." }
    ],
    correctOptionId: "q-105-b",
    explanation: "O verbo haver no sentido de existir é impessoal: 'Houve muitas dúvidas'.",
    defaultErrorTagId: "attention"
  },
  {
    id: "q-106",
    quizId: "enem-2025-misto-a",
    index: 6,
    statement:
      "Um capital de R$ 1.000 a juros simples de 2% ao mês por 5 meses gera montante de:",
    subject: "Matemática",
    topic: "Juros simples",
    type: "objective",
    options: [
      { id: "q-106-a", label: "A", text: "R$ 1.050" },
      { id: "q-106-b", label: "B", text: "R$ 1.100" },
      { id: "q-106-c", label: "C", text: "R$ 1.120" },
      { id: "q-106-d", label: "D", text: "R$ 1.200" }
    ],
    correctOptionId: "q-106-b",
    explanation: "J=C*i*t = 1000*0,02*5=100. M=1000+100=1100.",
    defaultErrorTagId: "content-gap"
  },
  {
    id: "q-107",
    quizId: "enem-2025-misto-a",
    index: 7,
    statement:
      "Se a aceleração da gravidade fosse menor, o tempo de queda livre para mesma altura seria:",
    subject: "Física",
    topic: "Queda livre",
    type: "objective",
    options: [
      { id: "q-107-a", label: "A", text: "Menor" },
      { id: "q-107-b", label: "B", text: "Igual" },
      { id: "q-107-c", label: "C", text: "Maior" },
      { id: "q-107-d", label: "D", text: "Nulo" }
    ],
    correctOptionId: "q-107-c",
    explanation: "h=(g*t^2)/2. Para mesma altura, menor g exige maior t.",
    defaultErrorTagId: "concept-doubt"
  },
  {
    id: "q-108",
    quizId: "enem-2025-misto-a",
    index: 8,
    statement:
      "Dissertativa curta: descreva em até 5 linhas uma estratégia para reduzir erros de atenção em provas longas.",
    subject: "Metodologia de Estudos",
    topic: "Estratégia de prova",
    type: "essay",
    explanation:
      "Questão discursiva: revisar manualmente para avaliar qualidade de estratégia.",
    defaultErrorTagId: "incomplete"
  },
  {
    id: "q-201",
    quizId: "fuvest-2024-objetiva-b",
    index: 1,
    statement: "Resolva a inequação 2x - 3 > 7. O conjunto-solução é:",
    subject: "Matemática",
    topic: "Inequações",
    type: "objective",
    options: [
      { id: "q-201-a", label: "A", text: "x > 5" },
      { id: "q-201-b", label: "B", text: "x >= 5" },
      { id: "q-201-c", label: "C", text: "x < 5" },
      { id: "q-201-d", label: "D", text: "x > 2" }
    ],
    correctOptionId: "q-201-a",
    explanation: "2x>10 => x>5.",
    defaultErrorTagId: "calculation"
  },
  {
    id: "q-202",
    quizId: "fuvest-2024-objetiva-b",
    index: 2,
    statement:
      "Em um texto argumentativo, a tese principal deve aparecer com maior clareza em:",
    subject: "Redação",
    topic: "Estrutura argumentativa",
    type: "objective",
    options: [
      { id: "q-202-a", label: "A", text: "Parágrafos de desenvolvimento" },
      { id: "q-202-b", label: "B", text: "Conclusão apenas" },
      { id: "q-202-c", label: "C", text: "Introdução e reforço final" },
      { id: "q-202-d", label: "D", text: "Citações de apoio" }
    ],
    correctOptionId: "q-202-c",
    explanation: "A tese costuma ser apresentada no início e retomada no fechamento.",
    defaultErrorTagId: "strategy"
  },
  {
    id: "q-203",
    quizId: "fuvest-2024-objetiva-b",
    index: 3,
    statement: "A energia cinética de um corpo depende de:",
    subject: "Física",
    topic: "Energia cinética",
    type: "objective",
    options: [
      { id: "q-203-a", label: "A", text: "Massa e velocidade" },
      { id: "q-203-b", label: "B", text: "Apenas massa" },
      { id: "q-203-c", label: "C", text: "Apenas velocidade" },
      { id: "q-203-d", label: "D", text: "Massa e altura" }
    ],
    correctOptionId: "q-203-a",
    explanation: "Ec = (m*v^2)/2. Depende de massa e quadrado da velocidade.",
    defaultErrorTagId: "concept-doubt"
  },
  {
    id: "q-204",
    quizId: "fuvest-2024-objetiva-b",
    index: 4,
    statement:
      "No período 'Como estudou bastante, foi bem', a oração subordinada exprime:",
    subject: "Linguagens",
    topic: "Orações subordinadas",
    type: "objective",
    options: [
      { id: "q-204-a", label: "A", text: "Concessão" },
      { id: "q-204-b", label: "B", text: "Causa" },
      { id: "q-204-c", label: "C", text: "Tempo" },
      { id: "q-204-d", label: "D", text: "Condição" }
    ],
    correctOptionId: "q-204-b",
    explanation: "A partícula 'como' (no início) pode indicar valor causal.",
    defaultErrorTagId: "interpretation"
  },
  {
    id: "q-205",
    quizId: "fuvest-2024-objetiva-b",
    index: 5,
    statement: "Se 30% de uma turma de 40 alunos faltou, quantos estiveram presentes?",
    subject: "Matemática",
    topic: "Porcentagem",
    type: "objective",
    options: [
      { id: "q-205-a", label: "A", text: "12" },
      { id: "q-205-b", label: "B", text: "18" },
      { id: "q-205-c", label: "C", text: "28" },
      { id: "q-205-d", label: "D", text: "30" }
    ],
    correctOptionId: "q-205-c",
    explanation: "Faltaram 12 (30% de 40). Presentes = 40 - 12 = 28.",
    defaultErrorTagId: "attention"
  },
  {
    id: "q-206",
    quizId: "fuvest-2024-objetiva-b",
    index: 6,
    statement: "Qual gás é essencial para a respiração celular aeróbica?",
    subject: "Biologia",
    topic: "Respiração celular",
    type: "objective",
    options: [
      { id: "q-206-a", label: "A", text: "Nitrogênio" },
      { id: "q-206-b", label: "B", text: "Oxigênio" },
      { id: "q-206-c", label: "C", text: "Dióxido de carbono" },
      { id: "q-206-d", label: "D", text: "Vapor d'água" }
    ],
    correctOptionId: "q-206-b",
    explanation: "Na respiração aeróbica, O2 atua como aceptor final de elétrons.",
    defaultErrorTagId: "content-gap"
  },
  {
    id: "q-301",
    quizId: "unicamp-2025-rapido-c",
    index: 1,
    statement: "A derivada de f(x)=x^2 é:",
    subject: "Matemática",
    topic: "Derivadas básicas",
    type: "objective",
    options: [
      { id: "q-301-a", label: "A", text: "2x" },
      { id: "q-301-b", label: "B", text: "x" },
      { id: "q-301-c", label: "C", text: "x^3" },
      { id: "q-301-d", label: "D", text: "2" }
    ],
    correctOptionId: "q-301-a",
    explanation: "Regra de potência: d/dx (x^n)=n*x^(n-1).",
    defaultErrorTagId: "content-gap"
  },
  {
    id: "q-302",
    quizId: "unicamp-2025-rapido-c",
    index: 2,
    statement: "A soma dos ângulos internos de um triângulo plano vale:",
    subject: "Matemática",
    topic: "Geometria plana",
    type: "objective",
    options: [
      { id: "q-302-a", label: "A", text: "90 graus" },
      { id: "q-302-b", label: "B", text: "180 graus" },
      { id: "q-302-c", label: "C", text: "270 graus" },
      { id: "q-302-d", label: "D", text: "360 graus" }
    ],
    correctOptionId: "q-302-b",
    explanation: "Triângulo em geometria euclidiana possui soma 180 graus.",
    defaultErrorTagId: "concept-doubt"
  },
  {
    id: "q-303",
    quizId: "unicamp-2025-rapido-c",
    index: 3,
    statement:
      "No trecho 'Ele estudou, portanto passou', o conectivo introduz relação de:",
    subject: "Linguagens",
    topic: "Conectivos",
    type: "objective",
    options: [
      { id: "q-303-a", label: "A", text: "Oposição" },
      { id: "q-303-b", label: "B", text: "Conclusão" },
      { id: "q-303-c", label: "C", text: "Explicação" },
      { id: "q-303-d", label: "D", text: "Adição" }
    ],
    correctOptionId: "q-303-b",
    explanation: "Portanto marca conclusão resultante do argumento anterior.",
    defaultErrorTagId: "interpretation"
  },
  {
    id: "q-304",
    quizId: "unicamp-2025-rapido-c",
    index: 4,
    statement: "Uma corrente de 2A passa por um resistor de 5 ohms. A tensão aplicada é:",
    subject: "Física",
    topic: "Lei de Ohm",
    type: "objective",
    options: [
      { id: "q-304-a", label: "A", text: "2,5 V" },
      { id: "q-304-b", label: "B", text: "5 V" },
      { id: "q-304-c", label: "C", text: "10 V" },
      { id: "q-304-d", label: "D", text: "20 V" }
    ],
    correctOptionId: "q-304-c",
    explanation: "U=R*i => U=5*2 = 10 V.",
    defaultErrorTagId: "calculation"
  },
  {
    id: "q-305",
    quizId: "unicamp-2025-rapido-c",
    index: 5,
    statement:
      "Qual habilidade mais ajuda a reduzir erros por interpretação em prova objetiva?",
    subject: "Metodologia de Estudos",
    topic: "Leitura estratégica",
    type: "objective",
    options: [
      { id: "q-305-a", label: "A", text: "Ler rápido sem pausa" },
      { id: "q-305-b", label: "B", text: "Sublinhar dados-chave do enunciado" },
      { id: "q-305-c", label: "C", text: "Responder antes de ler opções" },
      { id: "q-305-d", label: "D", text: "Pular toda questão longa" }
    ],
    correctOptionId: "q-305-b",
    explanation: "Destacar palavras-chave reduz ambiguidade e melhora interpretação.",
    defaultErrorTagId: "strategy"
  }
];
