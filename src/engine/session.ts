import { buildTask, type DistractorSource } from './taskFactory.ts';
import { dueForReview, learningItems, shuffle, stalestMastered, type Rng } from './scheduler.ts';
import type { Area, CurriculumConfig, EngineState, Task } from './types.ts';

export interface SessionPlan {
  /** Kolik úloh se do rozpočtu zhruba vejde. */
  taskBudget: number;
  /** Kolik z nich má být opakování. */
  reviewBudget: number;
}

/** Odhad délky jedné úlohy včetně promluvy a reakce. */
const SECONDS_PER_TASK = 14;

export function planSession(minutes: number, rng: Rng, config: CurriculumConfig): SessionPlan {
  const taskBudget = Math.max(6, Math.round((minutes * 60) / SECONDS_PER_TASK));
  const [lo, hi] = config.reviewShare;
  const share = lo + rng() * (hi - lo);
  return { taskBudget, reviewBudget: Math.round(taskBudget * share) };
}

export interface SessionCursor {
  plan: SessionPlan;
  done: number;
  reviewsDone: number;
  /** ID poslední položky, aby nepřišla dvakrát za sebou. */
  lastItemId?: string;
}

export function startSession(plan: SessionPlan): SessionCursor {
  return { plan, done: 0, reviewsDone: 0 };
}

export function isSessionOver(cursor: SessionCursor): boolean {
  return cursor.done >= cursor.plan.taskBudget;
}

/**
 * Další úloha.
 *
 * Opakování se rozprostírá po celém sezení, ne na konec — dítě má cítit, že
 * se vrací k tomu, co umí, mezi tím, co se teprve učí.
 *
 * V poslední pětině sezení už se nové položky nezavádějí a chodí jen to, co
 * dítě zvládá, aby sezení skončilo úspěchem.
 */
export function nextTask(
  state: EngineState,
  cursor: SessionCursor,
  areas: readonly Area[],
  sources: Record<Area, DistractorSource>,
  rng: Rng,
): Task | null {
  const learning = learningItems(state, areas);
  const due = dueForReview(state, areas);

  const remaining = cursor.plan.taskBudget - cursor.done;
  const reviewsLeft = cursor.plan.reviewBudget - cursor.reviewsDone;
  const inClosingStretch = remaining <= Math.ceil(cursor.plan.taskBudget * 0.2);

  const wantReview =
    (reviewsLeft > 0 && rng() < reviewsLeft / Math.max(1, remaining)) ||
    inClosingStretch ||
    learning.length === 0;

  if (wantReview) {
    const pool = due.length ? due : [stalestMastered(state, areas)].filter((p) => p !== null);
    const pick = pickDifferent(shuffle(pool, rng), cursor.lastItemId);
    if (pick) return buildTask(pick, state, sources[pick.area], rng, true);
  }

  const pick = pickDifferent(learning, cursor.lastItemId) ?? learning[0];
  if (!pick) {
    const fallback = stalestMastered(state, areas);
    return fallback ? buildTask(fallback, state, sources[fallback.area], rng, true) : null;
  }
  return buildTask(pick, state, sources[pick.area], rng, false);
}

export function advance(cursor: SessionCursor, task: Task): SessionCursor {
  return {
    ...cursor,
    done: cursor.done + 1,
    reviewsDone: cursor.reviewsDone + (task.isReview ? 1 : 0),
    lastItemId: task.itemId,
  };
}

function pickDifferent<T extends { itemId: string }>(pool: readonly T[], lastId?: string): T | null {
  if (!pool.length) return null;
  const other = pool.filter((p) => p.itemId !== lastId);
  return (other.length ? other : pool)[0]!;
}

export interface SessionSummary {
  taskCount: number;
  correctFirstTry: number;
  newlyMastered: string[];
  itemsTouched: string[];
}

/** Co se dneska naučil — podklad pro laskavé ukončení sezení. */
export function summarize(before: EngineState, after: EngineState, cursor: SessionCursor): SessionSummary {
  const newlyMastered = Object.values(after.items)
    .filter((p) => p.state === 'mastered' && before.items[p.itemId]?.state !== 'mastered')
    .map((p) => p.itemId);

  const itemsTouched = Object.values(after.items)
    .filter((p) => p.updatedAt !== before.items[p.itemId]?.updatedAt)
    .map((p) => p.itemId);

  return {
    taskCount: cursor.done,
    correctFirstTry: 0,
    newlyMastered,
    itemsTouched,
  };
}
