import { ErrorTag, Question, Quiz, UserProfile } from "@/types/domain";

export const demoProfile: UserProfile = {
  id: "demo-user",
  fullName: "Aluno Demo",
  email: "demo@simulai.education",
  targetExam: "ENEM + FUVEST",
  gradeLevel: "3o ano EM",
  createdAt: "2026-03-19T00:00:00.000Z"
};

export const errorTags: ErrorTag[] = [
  {
    id: "content-gap",
    label: "Conteudo nao dominado",
    description: "O tema principal ainda nao foi consolidado."
  },
  {
    id: "interpretation",
    label: "Interpretacao equivocada",
    description: "Leitura incompleta do enunciado ou das condicoes."
  },
  {
    id: "calculation",
    label: "Erro de conta",
    description: "Execucao algoritimica correta, mas com conta incorreta."
  },
  {
    id: "attention",
    label: "Erro de atencao",
    description: "Descuido na marcacao ou troca de sinal."
  },
  {
    id: "strategy",
    label: "Estrategia inadequada",
    description: "Abordagem menos eficiente para o tipo de questao."
  },
  {
    id: "incomplete",
    label: "Resposta incompleta",
    description: "Resolucao parou antes da conclusao final."
  },
  {
    id: "concept-doubt",
    label: "Duvida de conceito",
    description: "Conceito central ainda gera inseguranca."
  }
];

export const seedQuizzes: Quiz[] = [
  {
    id: "enem-2025-misto-a",
    title: "Simulado Enem Misto A",
    examBoard: "ENEM",
    year: 2025,
    description:
      "Treino com foco em matematica, linguagens e ciencias da natureza com perfil ENEM.",
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
    description:
      "Conjunto objetivo com maior exigencia de interpretacao e estrategia.",
    durationMinutes: 90,
    questionIds: ["q-201", "q-202", "q-203", "q-204", "q-205", "q-206"]
  },
  {
    id: "unicamp-2025-rapido-c",
    title: "UNICAMP Treino Rapido C",
    examBoard: "UNICAMP",
    year: 2025,
    description:
      "Simulado curto para rotina diaria, com foco em consistencia de desempenho.",
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
      "Uma progressao aritmetica tem primeiro termo 7 e razao 3. Qual e o 15o termo?",
    subject: "Matematica",
    topic: "Progressao Aritmetica",
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
    statement:
      "Uma solucao com pH 3 tem concentracao de ions H+ igual a:",
    subject: "Quimica",
    topic: "pH e pOH",
    type: "objective",
    options: [
      { id: "q-102-a", label: "A", text: "10^-3 mol/L" },
      { id: "q-102-b", label: "B", text: "10^3 mol/L" },
      { id: "q-102-c", label: "C", text: "3 mol/L" },
      { id: "q-102-d", label: "D", text: "0,03 mol/L" }
    ],
    correctOptionId: "q-102-a",
    explanation: "Definicao: pH = -log[H+]. Se pH=3, entao [H+] = 10^-3 mol/L.",
    defaultErrorTagId: "concept-doubt"
  },
  {
    id: "q-103",
    quizId: "enem-2025-misto-a",
    index: 3,
    statement:
      "No trecho 'Apesar da chuva, a prova ocorreu normalmente', a conjuncao expressa:",
    subject: "Linguagens",
    topic: "Conectivos e semantica",
    type: "objective",
    options: [
      { id: "q-103-a", label: "A", text: "Causa" },
      { id: "q-103-b", label: "B", text: "Concessao" },
      { id: "q-103-c", label: "C", text: "Conclusao" },
      { id: "q-103-d", label: "D", text: "Comparacao" }
    ],
    correctOptionId: "q-103-b",
    explanation: "Apesar de introduz ideia concessiva: fato contrario nao impede o outro.",
    defaultErrorTagId: "interpretation"
  },
  {
    id: "q-104",
    quizId: "enem-2025-misto-a",
    index: 4,
    statement:
      "Um carro percorre 180 km em 3 horas. Mantida a velocidade media, em 5 horas percorre:",
    subject: "Fisica",
    topic: "Velocidade media",
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
    statement:
      "Marque a alternativa com erro de concordancia verbal.",
    subject: "Linguagens",
    topic: "Concordancia verbal",
    type: "objective",
    options: [
      { id: "q-105-a", label: "A", text: "Faltam cinco minutos para a prova." },
      { id: "q-105-b", label: "B", text: "Houveram muitas duvidas na revisao." },
      { id: "q-105-c", label: "C", text: "Existem boas razoes para estudar." },
      { id: "q-105-d", label: "D", text: "Chegaram os resultados da turma." }
    ],
    correctOptionId: "q-105-b",
    explanation: "O verbo haver no sentido de existir e impessoal: 'Houve muitas duvidas'.",
    defaultErrorTagId: "attention"
  },
  {
    id: "q-106",
    quizId: "enem-2025-misto-a",
    index: 6,
    statement:
      "Um capital de R$ 1.000 a juros simples de 2% ao mes por 5 meses gera montante de:",
    subject: "Matematica",
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
      "Se a aceleracao da gravidade fosse menor, o tempo de queda livre para mesma altura seria:",
    subject: "Fisica",
    topic: "Queda livre",
    type: "objective",
    options: [
      { id: "q-107-a", label: "A", text: "Menor" },
      { id: "q-107-b", label: "B", text: "Igual" },
      { id: "q-107-c", label: "C", text: "Maior" },
      { id: "q-107-d", label: "D", text: "Nulo" }
    ],
    correctOptionId: "q-107-c",
    explanation:
      "h=(g*t^2)/2. Para mesma altura, menor g exige maior t.",
    defaultErrorTagId: "concept-doubt"
  },
  {
    id: "q-108",
    quizId: "enem-2025-misto-a",
    index: 8,
    statement:
      "Dissertativa curta: descreva em ate 5 linhas uma estrategia para reduzir erros de atencao em provas longas.",
    subject: "Metodologia de Estudos",
    topic: "Estrategia de prova",
    type: "essay",
    explanation:
      "Questao discursiva: revisar manualmente para avaliar qualidade de estrategia.",
    defaultErrorTagId: "incomplete"
  },
  {
    id: "q-201",
    quizId: "fuvest-2024-objetiva-b",
    index: 1,
    statement:
      "Resolva a inequacao 2x - 3 > 7. O conjunto-solucao e:",
    subject: "Matematica",
    topic: "Inequacoes",
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
    subject: "Redacao",
    topic: "Estrutura argumentativa",
    type: "objective",
    options: [
      { id: "q-202-a", label: "A", text: "Paragrafos de desenvolvimento" },
      { id: "q-202-b", label: "B", text: "Conclusao apenas" },
      { id: "q-202-c", label: "C", text: "Introducao e reforco final" },
      { id: "q-202-d", label: "D", text: "Citacoes de apoio" }
    ],
    correctOptionId: "q-202-c",
    explanation:
      "A tese costuma ser apresentada no inicio e retomada no fechamento.",
    defaultErrorTagId: "strategy"
  },
  {
    id: "q-203",
    quizId: "fuvest-2024-objetiva-b",
    index: 3,
    statement:
      "A energia cinetica de um corpo depende de:",
    subject: "Fisica",
    topic: "Energia cinetica",
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
      "No periodo 'Como estudou bastante, foi bem', a oracao subordinada exprime:",
    subject: "Linguagens",
    topic: "Oracoes subordinadas",
    type: "objective",
    options: [
      { id: "q-204-a", label: "A", text: "Concessao" },
      { id: "q-204-b", label: "B", text: "Causa" },
      { id: "q-204-c", label: "C", text: "Tempo" },
      { id: "q-204-d", label: "D", text: "Condicao" }
    ],
    correctOptionId: "q-204-b",
    explanation: "A particula 'como' (no inicio) pode indicar valor causal.",
    defaultErrorTagId: "interpretation"
  },
  {
    id: "q-205",
    quizId: "fuvest-2024-objetiva-b",
    index: 5,
    statement:
      "Se 30% de uma turma de 40 alunos faltou, quantos estiveram presentes?",
    subject: "Matematica",
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
    statement:
      "Qual gas e essencial para a respiracao celular aerobica?",
    subject: "Biologia",
    topic: "Respiracao celular",
    type: "objective",
    options: [
      { id: "q-206-a", label: "A", text: "Nitrogenio" },
      { id: "q-206-b", label: "B", text: "Oxigenio" },
      { id: "q-206-c", label: "C", text: "Dioxido de carbono" },
      { id: "q-206-d", label: "D", text: "Vapor d'agua" }
    ],
    correctOptionId: "q-206-b",
    explanation: "Na respiracao aerobica, O2 atua como aceptor final de eletrons.",
    defaultErrorTagId: "content-gap"
  },
  {
    id: "q-301",
    quizId: "unicamp-2025-rapido-c",
    index: 1,
    statement: "A derivada de f(x)=x^2 e:",
    subject: "Matematica",
    topic: "Derivadas basicas",
    type: "objective",
    options: [
      { id: "q-301-a", label: "A", text: "2x" },
      { id: "q-301-b", label: "B", text: "x" },
      { id: "q-301-c", label: "C", text: "x^3" },
      { id: "q-301-d", label: "D", text: "2" }
    ],
    correctOptionId: "q-301-a",
    explanation: "Regra de potencia: d/dx (x^n)=n*x^(n-1).",
    defaultErrorTagId: "content-gap"
  },
  {
    id: "q-302",
    quizId: "unicamp-2025-rapido-c",
    index: 2,
    statement:
      "A soma dos angulos internos de um triangulo plano vale:",
    subject: "Matematica",
    topic: "Geometria plana",
    type: "objective",
    options: [
      { id: "q-302-a", label: "A", text: "90 graus" },
      { id: "q-302-b", label: "B", text: "180 graus" },
      { id: "q-302-c", label: "C", text: "270 graus" },
      { id: "q-302-d", label: "D", text: "360 graus" }
    ],
    correctOptionId: "q-302-b",
    explanation: "Triangulo em geometria euclidiana possui soma 180 graus.",
    defaultErrorTagId: "concept-doubt"
  },
  {
    id: "q-303",
    quizId: "unicamp-2025-rapido-c",
    index: 3,
    statement:
      "No trecho 'Ele estudou, portanto passou', o conectivo introduz relacao de:",
    subject: "Linguagens",
    topic: "Conectivos",
    type: "objective",
    options: [
      { id: "q-303-a", label: "A", text: "Oposicao" },
      { id: "q-303-b", label: "B", text: "Conclusao" },
      { id: "q-303-c", label: "C", text: "Explicacao" },
      { id: "q-303-d", label: "D", text: "Adicao" }
    ],
    correctOptionId: "q-303-b",
    explanation: "Portanto marca conclusao resultante do argumento anterior.",
    defaultErrorTagId: "interpretation"
  },
  {
    id: "q-304",
    quizId: "unicamp-2025-rapido-c",
    index: 4,
    statement:
      "Uma corrente de 2A passa por um resistor de 5 ohms. A tensao aplicada e:",
    subject: "Fisica",
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
      "Qual habilidade mais ajuda a reduzir erros por interpretacao em prova objetiva?",
    subject: "Metodologia de Estudos",
    topic: "Leitura estrategica",
    type: "objective",
    options: [
      { id: "q-305-a", label: "A", text: "Ler rapido sem pausa" },
      { id: "q-305-b", label: "B", text: "Sublinhar dados-chave do enunciado" },
      { id: "q-305-c", label: "C", text: "Responder antes de ler opcoes" },
      { id: "q-305-d", label: "D", text: "Pular toda questao longa" }
    ],
    correctOptionId: "q-305-b",
    explanation:
      "Destacar palavras-chave reduz ambiguidade e melhora interpretacao.",
    defaultErrorTagId: "strategy"
  }
];
