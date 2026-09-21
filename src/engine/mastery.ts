import type { Attempt, CurriculumConfig, EngineState, ItemProgress, Stage } from './types.ts';

/**
 * Vyhodnocení pokusu.
 *
 * Do zvládnutí se počítá jen správnost napoprvé a jen od stupně 3 výš —
 * stupeň 2 je výběr ze dvou, kde se dá trefit náhodou.
 */
export function applyAttempt(
  state: EngineState,
  attempt: Attempt,
  config: CurriculumConfig,
): EngineState {
  const before = state.items[attempt.itemId];
  if (!before) return state;

  const counts = attempt.stage >= 3;
  const scored = attempt.correct && !attempt.helped;

  const recent = counts ? [...before.recent, scored].slice(-config.masteryWindow) : before.recent;
  const stageStreak = scored ? before.stageStreak + 1 : 0;

  let next: ItemProgress = {
    ...before,
    recent,
    stageStreak,
    updatedAt: attempt.ts,
    dirty: true,
  };

  // Postup do dalšího stupně
  const needed = config.streakToAdvance[before.stage];
  if (stageStreak >= needed && before.stage < 5) {
    next = { ...next, stage: (before.stage + 1) as Stage, stageStreak: 0 };
  }

  // Zvládnutí
  if (before.state === 'learning' && isMastered(next, config)) {
    next = {
      ...next,
      state: 'mastered',
      masteredAt: attempt.ts,
      review: {
        interval: config.reviewIntervals[0]!,
        dueAtSession: state.sessionIndex + config.reviewIntervals[0]!,
        lapses: 0,
      },
    };
  }

  // Opakování zvládnuté položky posouvá interval nahoru, chyba dolů.
  if (before.state === 'mastered' && before.review) {
    next = { ...next, review: nextReview(before.review, scored, state.sessionIndex, config) };
  }

  return { ...state, items: { ...state.items, [attempt.itemId]: next } };
}

export function isMastered(p: ItemProgress, config: CurriculumConfig): boolean {
  if (p.stage < 3) return false;
  if (p.recent.length < config.masteryWindow) return false;
  const correct = p.recent.filter(Boolean).length;
  return correct >= config.masteryNeeded;
}

/**
 * Rostoucí intervaly. Po chybě se vrací o dva kroky, ne na začátek — cílem je
 * položku připomenout dřív, ne ji učit znovu od nuly.
 */
export function nextReview(
  review: NonNullable<ItemProgress['review']>,
  correct: boolean,
  sessionIndex: number,
  config: CurriculumConfig,
): NonNullable<ItemProgress['review']> {
  const steps = config.reviewIntervals;
  const at = Math.max(0, steps.indexOf(review.interval));
  const to = correct ? Math.min(at + 1, steps.length - 1) : Math.max(0, at - 2);
  const interval = steps[to]!;
  return {
    interval,
    dueAtSession: sessionIndex + interval,
    lapses: correct ? review.lapses : review.lapses + 1,
  };
}
