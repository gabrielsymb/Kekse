import { createInitialState } from "./model";
import type { LearnerState } from "./types";

const STORAGE_KEY = "algebra-viva/learner-v1";

export function loadLearnerState(): LearnerState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return createInitialState();
    const parsed = JSON.parse(saved) as LearnerState;
    return parsed.version === 1 ? parsed : createInitialState();
  } catch {
    return createInitialState();
  }
}

export function saveLearnerState(state: LearnerState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
