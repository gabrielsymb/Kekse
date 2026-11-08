import { ACTIVE_SKILLS, PROVENANCE } from "./catalog";
import type { ActiveSkillId, Exercise } from "./types";

function random(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(items: T[], rnd: () => number): T {
  return items[Math.floor(rnd() * items.length)] ?? items[0];
}

export function generateExercise(
  skillId: ActiveSkillId,
  seed: number,
): Exercise {
  const rnd = random(seed * 7919 + ACTIVE_SKILLS.indexOf(skillId) * 104729);
  if (skillId === "common-factor") {
    const v = pick(["p", "x", "a", "t"], rnd);
    const exponent = pick([2, 3, 4], rnd);
    const remainingPower = exponent - 1;
    const remainder = remainingPower === 1 ? v : `${v}^{${remainingPower}}`;
    return {
      ...PROVENANCE[skillId],
      id: `${skillId}-${seed}-${v}-${exponent}`,
      skillId,
      area: pick(["Álgebra", "Probabilidade", "Estatística"], rnd),
      prompt: `Coloque ${v} em evidência e preserve a expressão.`,
      source: `${v}-${v}^{${exponent}}`,
      actionLabel: "Reexpandir e testar",
      tool: "colocar fator em evidência",
      transfer: "Esta ferramenta volta em variância, polinômios e derivadas.",
      goalCheck: (latex) => latex.includes("(") || latex.includes("\\left"),
      choices: [
        {
          id: "right",
          latex: `${v}(1-${remainder})`,
          candidate: `${v}(1-${remainder})`,
          correct: true,
        },
        {
          id: "same-power",
          latex: `${v}(1-${v}^{${exponent}})`,
          candidate: `${v}(1-${v}^{${exponent}})`,
          correct: false,
          errorCode: "expoente-nao-reduzido",
          feedback: `Ao dividir ${v}^{${exponent}} por ${v}, o expoente também muda.`,
        },
        {
          id: "wrong-sign",
          latex: `${v}(1+${remainder})`,
          candidate: `${v}(1+${remainder})`,
          correct: false,
          errorCode: "sinal-alterado",
          feedback: "O fator saiu, mas a subtração mudou de operação.",
        },
      ],
    };
  }
  if (skillId === "powers") {
    const v = pick(["x", "a", "t", "p"], rnd);
    const first = pick([2, 3, 4], rnd);
    const second = pick([2, 3, 5], rnd);
    const total = first + second;
    return {
      ...PROVENANCE[skillId],
      id: `${skillId}-${seed}-${v}-${first}-${second}`,
      skillId,
      area: pick(["Álgebra", "Cálculo", "Probabilidade"], rnd),
      prompt:
        "Comprima o produto sem transformar soma de expoentes em multiplicação.",
      source: `${v}^{${first}}${v}^{${second}}`,
      actionLabel: "Reexpandir e testar",
      tool: "produto de potências de mesma base",
      transfer:
        "Essa lei reaparece em derivadas, densidades e mudança de escala.",
      goalCheck: (latex) =>
        latex.includes(`^{${total}}`) || latex.includes(`^${total}`),
      choices: [
        {
          id: "right",
          latex: `${v}^{${total}}`,
          candidate: `${v}^{${total}}`,
          correct: true,
        },
        {
          id: "multiply-exponents",
          latex: `${v}^{${first * second}}`,
          candidate: `${v}^{${first * second}}`,
          correct: false,
          errorCode: "expoentes-multiplicados",
          feedback:
            "As bases estão sendo multiplicadas; por isso os expoentes se somam.",
        },
        {
          id: "coefficient",
          latex: `2${v}^{${total}}`,
          candidate: `2${v}^{${total}}`,
          correct: false,
          errorCode: "fator-dois-inventado",
          feedback:
            "Dois fatores iguais não significam acrescentar um coeficiente 2 ao produto.",
        },
      ],
    };
  }
  if (skillId === "radical-fraction") {
    const numerator = pick([8, 12, 18, 20, 27], rnd);
    const denominator = pick([9, 16, 25, 36, 49], rnd);
    return {
      ...PROVENANCE[skillId],
      id: `${skillId}-${seed}-${numerator}-${denominator}`,
      skillId,
      area: pick(["Álgebra", "Probabilidade", "Cálculo"], rnd),
      prompt: "Separe a raiz no numerador e no denominador.",
      source: `\\sqrt{\\frac{${numerator}}{${denominator}}}`,
      actionLabel: "Testar equivalência",
      tool: "raiz de um quociente",
      transfer:
        "A mesma estrutura volta em desvios-padrão, normas e densidades.",
      goalCheck: (latex) =>
        latex.includes("\\frac") && (latex.match(/\\sqrt/g)?.length ?? 0) >= 2,
      choices: [
        {
          id: "right",
          latex: `\\frac{\\sqrt{${numerator}}}{\\sqrt{${denominator}}}`,
          candidate: `\\frac{\\sqrt{${numerator}}}{\\sqrt{${denominator}}}`,
          correct: true,
        },
        {
          id: "denominator-outside",
          latex: `\\frac{\\sqrt{${numerator}}}{${denominator}}`,
          candidate: `\\frac{\\sqrt{${numerator}}}{${denominator}}`,
          correct: false,
          errorCode: "raiz-nao-aplicada-ao-denominador",
          feedback: "A raiz ainda não alcançou o denominador.",
        },
        {
          id: "split-as-subtraction",
          latex: `\\sqrt{${numerator}}-\\sqrt{${denominator}}`,
          candidate: `\\sqrt{${numerator}}-\\sqrt{${denominator}}`,
          correct: false,
          errorCode: "quociente-virou-diferenca",
          feedback: "A barra da fração mudou de operação.",
        },
      ],
    };
  }
  if (skillId === "trig-identity") {
    const cosineFirst = rnd() > 0.5;
    const source = cosineFirst ? "1-\\cos^2(x)" : "1-\\sin^2(x)";
    const partner = cosineFirst ? "\\sin" : "\\cos";
    return {
      ...PROVENANCE[skillId],
      id: `${skillId}-${seed}-${cosineFirst ? "cos" : "sin"}`,
      skillId,
      area: "Cálculo",
      prompt: "Use a identidade pitagórica sem perder o quadrado.",
      source,
      actionLabel: "Substituir e testar",
      tool: "identidade pitagórica",
      transfer: "Depois ela volta em integrais, Fourier e comprimentos.",
      goalCheck: (latex) => latex.includes("^2") || latex.includes("^{2}"),
      choices: [
        {
          id: "right",
          latex: `${partner}^2(x)`,
          candidate: `${partner}^2(x)`,
          correct: true,
        },
        {
          id: "lost-square",
          latex: `${partner}(x)`,
          candidate: `${partner}(x)`,
          correct: false,
          errorCode: "quadrado-perdido",
          feedback: "A função permaneceu, mas o quadrado desapareceu.",
        },
        {
          id: "inverse-confusion",
          latex: `\\cos^{-1}(x)`,
          candidate: `\\cos^{-1}(x)`,
          correct: false,
          errorCode: "quadrado-confundido-com-inversa",
          feedback:
            "Expoente 2 e expoente −1 representam operações diferentes.",
        },
      ],
    };
  }
  if (skillId === "complete-square") {
    const coefficient = pick([4, 6, 8, 10], rnd);
    const half = coefficient / 2;
    const square = half * half;
    return {
      ...PROVENANCE[skillId],
      id: `${skillId}-${seed}-${coefficient}`,
      skillId,
      area: pick(["Estatística", "Cálculo", "Álgebra"], rnd),
      prompt: "Reescreva a expressão como um quadrado e teste.",
      source: `x^2+${coefficient}x`,
      actionLabel: "Reexpandir e testar",
      tool: "completar quadrado",
      transfer: "Ela volta em Bernoulli, otimização e expoentes Gaussianos.",
      goalCheck: (latex) => latex.includes("^2") && latex.includes(`${half}`),
      choices: [
        {
          id: "right",
          latex: `(x+${half})^2-${square}`,
          candidate: `(x+${half})^2-${square}`,
          correct: true,
        },
        {
          id: "half-not-squared",
          latex: `(x+${half})^2-${half}`,
          candidate: `(x+${half})^2-${half}`,
          correct: false,
          errorCode: "constante-nao-elevada-ao-quadrado",
          feedback:
            "A metade entrou no quadrado, mas a compensação não foi elevada ao quadrado.",
        },
        {
          id: "wrong-sign",
          latex: `(x+${half})^2+${square}`,
          candidate: `(x+${half})^2+${square}`,
          correct: false,
          errorCode: "compensacao-com-sinal-trocado",
          feedback:
            "O termo acrescentado precisa ser compensado com a operação oposta.",
        },
      ],
    };
  }
  if (skillId === "implicit-product") {
    const gap = pick([1, 2, 3], rnd);
    return {
      ...PROVENANCE[skillId],
      id: `${skillId}-${seed}-${gap}`,
      skillId,
      area: "Combinatória",
      prompt: "Torne a multiplicação invisível em uma operação explícita.",
      source: `n(n-${gap})`,
      actionLabel: "Testar a leitura",
      tool: "produto implícito",
      transfer: "Essa leitura volta em contagem, matrizes e composição.",
      goalCheck: (latex) =>
        latex.includes("\\cdot") || latex.includes("\\times"),
      choices: [
        {
          id: "right",
          latex: `n\\cdot(n-${gap})`,
          candidate: `n\\cdot(n-${gap})`,
          correct: true,
        },
        {
          id: "sum",
          latex: `n+(n-${gap})`,
          candidate: `n+(n-${gap})`,
          correct: false,
          errorCode: "produto-lido-como-soma",
          feedback: "A justaposição foi trocada por soma.",
        },
        {
          id: "distributed-too-soon",
          latex: `n^2-${gap}`,
          candidate: `n^2-${gap}`,
          correct: false,
          errorCode: "distributiva-incompleta",
          feedback: `O ${gap} também precisa ser multiplicado por n.`,
        },
      ],
    };
  }
  if (skillId === "inner-product") {
    const first = pick([2, 3, 4, 5], rnd);
    const second = pick([2, 3, 5, 7], rnd);
    return {
      ...PROVENANCE[skillId],
      id: `${skillId}-${seed}-${first}-${second}`,
      skillId,
      area: "Geometria Analítica",
      prompt: `Leia a soma como o produto interno de (${first}, ${second}) com (x, y).`,
      source: `${first}x+${second}y`,
      actionLabel: "Testar a soma de produtos",
      tool: "produto interno por coordenadas",
      transfer:
        "A mesma soma mede ângulos, ortogonalidade e erro em mínimos quadrados.",
      goalCheck: (latex) =>
        latex.includes("\\cdot") || latex.includes("\\times"),
      choices: [
        {
          id: "right",
          latex: `${first}\\cdot x+${second}\\cdot y`,
          candidate: `${first}\\cdot x+${second}\\cdot y`,
          correct: true,
        },
        {
          id: "crossed",
          latex: `${first}\\cdot y+${second}\\cdot x`,
          candidate: `${first}\\cdot y+${second}\\cdot x`,
          correct: false,
          errorCode: "coordenadas-cruzadas",
          feedback:
            "No produto interno, primeira coordenada encontra primeira coordenada.",
        },
        {
          id: "missing-product",
          latex: `${first}+x+${second}+y`,
          candidate: `${first}+x+${second}+y`,
          correct: false,
          errorCode: "produtos-viraram-somas",
          feedback:
            "Cada par de coordenadas precisa produzir um produto antes da soma final.",
        },
      ],
    };
  }
  const first = pick([2, 3, 4], rnd);
  const second = pick([1, 2, 5], rnd);
  return {
    ...PROVENANCE[skillId],
    id: `${skillId}-${seed}-${first}-${second}`,
    skillId,
    area: "Geometria Analítica",
    prompt: "Transforme o inverso da norma ao quadrado numa fração visível.",
    source: `(${first}u+${second}v)(u^2+v^2)^{-1}`,
    actionLabel: "Testar o coeficiente",
    tool: "coeficiente de projeção",
    transfer:
      "Esse quociente reaparece em projeção, Gram–Schmidt e mínimos quadrados.",
    goalCheck: (latex) => latex.includes("\\frac"),
    choices: [
      {
        id: "right",
        latex: `\\frac{${first}u+${second}v}{u^2+v^2}`,
        candidate: `\\frac{${first}u+${second}v}{u^2+v^2}`,
        correct: true,
      },
      {
        id: "norm-not-squared",
        latex: `\\frac{${first}u+${second}v}{\\sqrt{u^2+v^2}}`,
        candidate: `\\frac{${first}u+${second}v}{\\sqrt{u^2+v^2}}`,
        correct: false,
        errorCode: "norma-nao-elevada-ao-quadrado",
        feedback:
          "A projeção divide pela norma ao quadrado, não apenas pela norma.",
      },
      {
        id: "denominator-split",
        latex: `\\frac{${first}u+${second}v}{u+v}`,
        candidate: `\\frac{${first}u+${second}v}{u+v}`,
        correct: false,
        errorCode: "quadrados-perdidos-no-denominador",
        feedback: "O denominador veio do produto do vetor consigo mesmo.",
      },
    ],
  };
}
