import type { Area, CurriculumConfig, EngineState, ItemId, ItemProgress } from './types.ts';

/** Deterministický generátor. Testy tak nejsou závislé na náhodě. */
export type Rng = () => number;

export function createRng(seed: number): Rng {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 0xffffffff;
  };
}

export function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

export function emptyProgress(itemId: ItemId, area: Area, now: number): ItemProgress {
  return {
    itemId,
    area,
    state: 'locked',
    stage: 1,
    recent: [],
    stageStreak: 0,
    review: null,
    updatedAt: now,
    dirty: true,
  };
}

export function initState(
  order: Record<Area, readonly ItemId[]>,
  config: CurriculumConfig,
  now = Date.now(),
): EngineState {
  const items: Record<ItemId, ItemProgress> = {};
  for (const area of Object.keys(order) as Area[]) {
    for (const id of order[area]) items[id] = emptyProgress(id, area, now);
  }
  return unlockNext({ sessionIndex: 0, items }, order, config, now);
}

/**
 * Odemkne další položky v pořadí, dokud není naplněný limit rozpracovaných.
 * Pořadí je pevné: nová se odemkne až po zvládnutí předchozí.
 */
export function unlockNext(
  state: EngineState,
  order: Record<Area, readonly ItemId[]>,
  config: CurriculumConfig,
  now = Date.now(),
): EngineState {
  const items = { ...state.items };

  for (const area of Object.keys(order) as Area[]) {
    let learning = order[area].filter((id) => items[id]?.state === 'learning').length;

    for (const id of order[area]) {
      if (learning >= config.maxLearning) break;
      const p = items[id];
      if (!p || p.state !== 'locked') continue;
      items[id] = { ...p, state: 'learning', unlockedAt: now, updatedAt: now, dirty: true };
      learning++;
    }
  }

  return { ...state, items };
}

/** Zvládnuté položky, které jsou v tomhle sezení splatné k opakování. */
export function dueForReview(state: EngineState, areas: readonly Area[]): ItemProgress[] {
  return Object.values(state.items)
    .filter((p) => areas.includes(p.area))
    .filter((p) => p.state === 'mastered' && p.review !== null)
    .filter((p) => p.review!.dueAtSession <= state.sessionIndex)
    .sort((a, b) => a.review!.dueAtSession - b.review!.dueAtSession);
}

/** Zvládnutá položka, kterou dítě nevidělo nejdéle. Záloha, když nic není splatné. */
export function stalestMastered(state: EngineState, areas: readonly Area[]): ItemProgress | null {
  const mastered = Object.values(state.items)
    .filter((p) => areas.includes(p.area) && p.state === 'mastered')
    .sort((a, b) => a.updatedAt - b.updatedAt);
  return mastered[0] ?? null;
}

/**
 * Kolik položek má dítě v daných oblastech k dispozici.
 *
 * Počítá se jen to, co je odemčené **a v oblasti, která se zrovna hraje**.
 * Kdyby se sčítaly obě oblasti, vyšel by dvojnásobný rozpočet sezení a
 * jedno písmeno by přišlo dvakrát tolikrát, než je zdrávo.
 */
export function availableCount(state: EngineState, areas: readonly Area[]): number {
  return Object.values(state.items).filter((p) => areas.includes(p.area) && p.state !== 'locked')
    .length;
}

export function learningItems(state: EngineState, areas: readonly Area[]): ItemProgress[] {
  return Object.values(state.items)
    .filter((p) => areas.includes(p.area) && p.state === 'learning')
    .sort((a, b) => (a.unlockedAt ?? 0) - (b.unlockedAt ?? 0));
}
