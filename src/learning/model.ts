import { createEmptyCard, fsrs, Rating, type Card } from "ts-fsrs";
import { ACTIVE_SKILLS, SKILL_META } from "./catalog";
import type {
  ActiveSkillId,
  LearnerState,
  SkillId,
  SkillProgress,
  StoredCard,
} from "./types";

const scheduler = fsrs({
  request_retention: 0.9,
  enable_fuzz: false,
  enable_short_term: true,
});

function serializeCard(card: Card): StoredCard {
  return {
    ...card,
    due: card.due.toISOString(),
    last_review: card.last_review?.toISOString(),
  };
}

function hydrateCard(card: StoredCard): Card {
  return {
    ...card,
    due: new Date(card.due),
    last_review: card.last_review ? new Date(card.last_review) : undefined,
  } as Card;
}

function createProgress(): SkillProgress {
  return {
    mastery: 0.12,
    attempts: 0,
    correct: 0,
    card: serializeCard(createEmptyCard(new Date())),
  };
}

export function createInitialState(): LearnerState {
  const ids = Object.keys(SKILL_META) as SkillId[];
  return {
    version: 1,
    sessionSeed: 17,
    skills: Object.fromEntries(
      ids.map((id) => [id, createProgress()]),
    ) as Record<SkillId, SkillProgress>,
    events: [],
  };
}

export function updateProgress(
  progress: SkillProgress,
  correct: boolean,
  assisted: boolean,
  now: Date,
): SkillProgress {
  const grade = correct ? (assisted ? Rating.Hard : Rating.Good) : Rating.Again;
  const scheduled = scheduler.next(hydrateCard(progress.card), now, grade).card;
  const mastery = correct
    ? Math.min(
        0.98,
        progress.mastery + (1 - progress.mastery) * (assisted ? 0.12 : 0.2),
      )
    : Math.max(0.05, progress.mastery * 0.78);
  return {
    mastery,
    attempts: progress.attempts + 1,
    correct: progress.correct + (correct ? 1 : 0),
    card: serializeCard(scheduled),
  };
}

export function selectSkill(
  state: LearnerState,
  previous?: SkillId,
): ActiveSkillId {
  const now = Date.now();
  const ranked = ACTIVE_SKILLS.map((id, index) => {
    const progress = state.skills[id];
    const due = new Date(progress.card.due).getTime();
    const dueBoost =
      due <= now ? 1000 + Math.min(Math.max(0, now - due) / 60_000, 500) : 0;
    const weakBoost = (1 - progress.mastery) * 100;
    return {
      id,
      score: dueBoost + weakBoost - (id === previous ? 80 : 0) - index * 0.01,
    };
  });
  ranked.sort((a, b) => b.score - a.score);
  return ranked[0].id;
}

export function countDueSkills(state: LearnerState) {
  return ACTIVE_SKILLS.filter(
    (id) => new Date(state.skills[id].card.due).getTime() <= Date.now(),
  ).length;
}
