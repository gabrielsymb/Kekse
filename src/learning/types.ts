import type { Card } from "ts-fsrs";

export type SkillId =
  | "common-factor"
  | "powers"
  | "radical-fraction"
  | "trig-identity"
  | "complete-square"
  | "implicit-product"
  | "inner-product"
  | "projection"
  | "group-structure";

export type ActiveSkillId = Exclude<SkillId, "group-structure">;
export type StoredCard = Omit<Card, "due" | "last_review"> & {
  due: string;
  last_review?: string;
};
export type SkillProgress = {
  mastery: number;
  attempts: number;
  correct: number;
  card: StoredCard;
};
export type AttemptEvent = {
  id: string;
  at: string;
  skillId: SkillId;
  source: string;
  candidate: string;
  correct: boolean;
  errorCode?: string;
};
export type LearnerState = {
  version: 1;
  sessionSeed: number;
  skills: Record<SkillId, SkillProgress>;
  events: AttemptEvent[];
};
export type Choice = {
  id: string;
  latex: string;
  candidate: string;
  correct: boolean;
  errorCode?: string;
  feedback?: string;
};
export type Exercise = {
  id: string;
  skillId: ActiveSkillId;
  area: string;
  prompt: string;
  source: string;
  actionLabel: string;
  tool: string;
  transfer: string;
  sourceRef: string;
  family: string;
  choices: Choice[];
  goalCheck: (latex: string) => boolean;
};
export type FeedbackKind = "correct" | "wrong" | "goal" | null;
export type EngineStatus = "loading" | "ready" | "error";
export type VerificationEngine = "Cortex" | "SymPy";
export type AppTab = "practice" | "memory" | "path";
export type SymbolicTree = {
  kind: string;
  preview: string;
  children: SymbolicTree[];
};
export type SymbolicAnalysis = {
  text: string;
  latex: string;
  srepr: string;
  tree: SymbolicTree;
};
