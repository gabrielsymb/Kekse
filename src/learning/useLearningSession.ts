import { useEffect, useMemo, useState } from "react";
import { analyzeWithSympy, equivalentWithSympy, warmSympy } from "../sympy";
import { equivalentLocally } from "./equivalence";
import { generateExercise } from "./generators";
import {
  countDueSkills,
  createInitialState,
  selectSkill,
  updateProgress,
} from "./model";
import { loadLearnerState, saveLearnerState } from "./persistence";
import type {
  ActiveSkillId,
  AttemptEvent,
  FeedbackKind,
  SymbolicAnalysis,
  VerificationEngine,
} from "./types";

export function useLearningSession() {
  const initial = useMemo(() => loadLearnerState(), []);
  const [learner, setLearner] = useState(initial);
  const [currentSkill, setCurrentSkill] = useState<ActiveSkillId>(() =>
    selectSkill(initial),
  );
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackKind>(null);
  const [hintOpen, setHintOpen] = useState(false);
  const [attemptsThisRound, setAttemptsThisRound] = useState(0);
  const [freeMode, setFreeMode] = useState(false);
  const [freeValue, setFreeValue] = useState("");
  const [sympyStatus, setSympyStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [verifying, setVerifying] = useState(false);
  const [engineUsed, setEngineUsed] = useState<VerificationEngine | null>(null);
  const [structureOpen, setStructureOpen] = useState(false);
  const [structure, setStructure] = useState<SymbolicAnalysis | null>(null);
  const [structureError, setStructureError] = useState<string | null>(null);

  const exercise = useMemo(
    () => generateExercise(currentSkill, learner.sessionSeed),
    [currentSkill, learner.sessionSeed],
  );
  const selected =
    exercise.choices.find((choice) => choice.id === selectedChoice) ?? null;
  const candidate = freeMode ? freeValue : (selected?.candidate ?? "");
  const latestEvent = learner.events[0];
  const currentProgress = learner.skills[currentSkill];
  const reviewReason =
    currentProgress.attempts === 0
      ? "diagnóstico de uma relação nova"
      : new Date(currentProgress.card.due).getTime() <= Date.now()
        ? "voltou antes de esfriar"
        : "misturada para testar transferência";
  const dueCount = countDueSkills(learner);

  useEffect(() => saveLearnerState(learner), [learner]);
  useEffect(() => {
    let active = true;
    warmSympy()
      .then(() => {
        if (active) setSympyStatus("ready");
      })
      .catch(() => {
        if (active) setSympyStatus("error");
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    setStructureOpen(false);
    setStructure(null);
    setStructureError(null);
    setEngineUsed(null);
  }, [exercise.id]);

  function resetWorkspace() {
    setSelectedChoice(null);
    setFeedback(null);
    setHintOpen(false);
    setAttemptsThisRound(0);
    setFreeMode(false);
    setFreeValue("");
  }

  function recordAttempt(correct: boolean, errorCode?: string) {
    const now = new Date();
    setLearner((current) => {
      const progress = current.skills[exercise.skillId];
      const assisted = attemptsThisRound > 0 || hintOpen;
      const event: AttemptEvent = {
        id: `${now.getTime()}-${exercise.id}`,
        at: now.toISOString(),
        skillId: exercise.skillId,
        source: exercise.source,
        candidate,
        correct,
        errorCode,
      };
      return {
        ...current,
        skills: {
          ...current.skills,
          [exercise.skillId]: updateProgress(progress, correct, assisted, now),
        },
        events: [event, ...current.events].slice(0, 80),
      };
    });
  }

  async function testCandidate() {
    if (!candidate) return;
    setVerifying(true);
    let algebraicallyEquivalent =
      selected?.correct ?? equivalentLocally(exercise.source, candidate);
    let engine: VerificationEngine = "Cortex";
    if (sympyStatus === "ready") {
      try {
        algebraicallyEquivalent = (
          await equivalentWithSympy(exercise.source, candidate)
        ).equivalent;
        engine = "SymPy";
      } catch {
        // The local engine remains available if the safe SymPy bridge rejects a form.
      }
    }
    setEngineUsed(engine);
    setVerifying(false);
    const meetsGoal = exercise.goalCheck(candidate);
    if (algebraicallyEquivalent && meetsGoal) {
      setFeedback("correct");
      recordAttempt(true);
      return;
    }
    if (algebraicallyEquivalent) {
      setFeedback("goal");
      setAttemptsThisRound((count) => count + 1);
      return;
    }
    setFeedback("wrong");
    setAttemptsThisRound((count) => count + 1);
    recordAttempt(false, selected?.errorCode ?? "equivalencia-quebrada");
  }

  async function toggleStructure() {
    if (structureOpen) {
      setStructureOpen(false);
      return;
    }
    setStructureOpen(true);
    if (structure || sympyStatus !== "ready") return;
    setStructureError(null);
    try {
      setStructure(await analyzeWithSympy(exercise.source));
    } catch {
      setStructureError(
        "Esta forma ainda não entrou na ponte segura do SymPy.",
      );
    }
  }

  function nextExercise() {
    const nextState = { ...learner, sessionSeed: learner.sessionSeed + 1 };
    setLearner(nextState);
    setCurrentSkill(selectSkill(nextState, currentSkill));
    resetWorkspace();
  }

  function restartProfile() {
    const fresh = createInitialState();
    setLearner(fresh);
    setCurrentSkill(selectSkill(fresh));
    resetWorkspace();
  }

  function selectChoice(id: string) {
    setSelectedChoice(id);
    setFeedback(null);
  }

  function startFreeMode() {
    setFreeMode(true);
    setSelectedChoice(null);
    setFeedback(null);
  }

  function stopFreeMode() {
    setFreeMode(false);
    setFreeValue("");
    setFeedback(null);
  }

  function updateFreeValue(value: string) {
    setFreeValue(value);
    setFeedback(null);
  }

  return {
    learner,
    exercise,
    selectedChoice,
    selected,
    candidate,
    feedback,
    hintOpen,
    freeMode,
    sympyStatus,
    verifying,
    engineUsed,
    structureOpen,
    structure,
    structureError,
    latestEvent,
    currentProgress,
    reviewReason,
    dueCount,
    selectChoice,
    startFreeMode,
    stopFreeMode,
    updateFreeValue,
    testCandidate,
    toggleStructure,
    nextExercise,
    retry: () => setFeedback(null),
    toggleHint: () => setHintOpen((open) => !open),
    restartProfile,
  };
}

export type LearningSession = ReturnType<typeof useLearningSession>;
