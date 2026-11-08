import type { ActiveSkillId, SkillId } from "./types";

export const ACTIVE_SKILLS: ActiveSkillId[] = [
  "common-factor",
  "powers",
  "radical-fraction",
  "trig-identity",
  "complete-square",
  "implicit-product",
  "inner-product",
  "projection",
];

export const SKILL_META: Record<
  SkillId,
  { label: string; layer: string; contexts: string }
> = {
  "common-factor": {
    label: "Fator comum",
    layer: "Fundação",
    contexts: "Álgebra · variância · polinômios",
  },
  powers: {
    label: "Potências e expoentes",
    layer: "Fundação",
    contexts: "Fatoração · funções · escalas",
  },
  "radical-fraction": {
    label: "Raízes em frações",
    layer: "Fundação",
    contexts: "Probabilidade · cálculo · normas",
  },
  "trig-identity": {
    label: "Identidades trigonométricas",
    layer: "Transferência",
    contexts: "Trigonometria · cálculo · Fourier",
  },
  "complete-square": {
    label: "Completar quadrado",
    layer: "Transferência",
    contexts: "Bernoulli · otimização · Gaussianas",
  },
  "implicit-product": {
    label: "Produto implícito",
    layer: "Fundação",
    contexts: "Contagem · polinômios · matrizes",
  },
  "inner-product": {
    label: "Produto interno",
    layer: "Próxima camada",
    contexts: "Vetores · funções · integrais",
  },
  projection: {
    label: "Projeção e ortogonalidade",
    layer: "Próxima camada",
    contexts: "Gram–Schmidt · mínimos quadrados",
  },
  "group-structure": {
    label: "Estruturas algébricas",
    layer: "Álgebra abstrata",
    contexts: "Grupos · anéis · corpos",
  },
};

export const SOURCE_SUMMARY = [
  {
    course: "Probabilidade I · Vinicius",
    state: "atual · principal",
    count: "20 arquivos",
    topics: "Conjuntos → Bayes → variáveis aleatórias → variância",
  },
  {
    course: "Cálculo I",
    state: "atual",
    count: "26 arquivos",
    topics: "Limites → derivadas → integrais → áreas entre curvas",
  },
  {
    course: "Geometria Analítica + monitoria",
    state: "atual",
    count: "61 arquivos",
    topics: "Vetores → sistemas → projeção → mínimos quadrados",
  },
  {
    course: "Probabilidade · Aline",
    state: "arquivo histórico",
    count: "17 arquivos",
    topics: "Só banco suplementar; não guia sua sequência atual",
  },
];

export const PROVENANCE: Record<
  ActiveSkillId,
  { sourceRef: string; family: string }
> = {
  "common-factor": {
    sourceRef: "Probabilidade I · variância e Bernoulli",
    family: "fatoração-paramétrica",
  },
  powers: {
    sourceRef: "Cálculo I · regras algébricas",
    family: "leis-de-potências",
  },
  "radical-fraction": {
    sourceRef: "Probabilidade I · desvio-padrão",
    family: "raízes-e-quocientes",
  },
  "trig-identity": {
    sourceRef: "Cálculo I · integrais e identidades",
    family: "identidades-pitagóricas",
  },
  "complete-square": {
    sourceRef: "Probabilidade I + Cálculo I",
    family: "quadráticas-equivalentes",
  },
  "implicit-product": {
    sourceRef: "Probabilidade I · métodos de contagem",
    family: "justaposição-e-distributiva",
  },
  "inner-product": {
    sourceRef: "Geometria Analítica · produto interno",
    family: "soma-de-produtos",
  },
  projection: {
    sourceRef: "Geometria Analítica · projeção e mínimos quadrados",
    family: "coeficiente-de-projeção",
  },
};
