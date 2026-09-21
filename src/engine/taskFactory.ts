import { shuffle, type Rng } from './scheduler.ts';
import type { EngineState, ItemId, ItemProgress, Stage, Task } from './types.ts';

export interface DistractorSource {
  /** Všechny položky oblasti v pořadí výuky. */
  order: readonly ItemId[];
  /** Vizuálně zaměnitelné položky, po ID. */
  confusables: Record<ItemId, readonly ItemId[]>;
}

/** Kolik možností má úloha v daném stupni. */
export function optionCount(stage: Stage, rng: Rng): number {
  if (stage <= 2) return 2;
  if (stage === 3) return rng() < 0.5 ? 3 : 4;
  return 4;
}

/**
 * Sestaví úlohu pro položku.
 *
 * Distraktory se berou jen z toho, co dítě už vidělo — nabídnout mu znak,
 * který nikdy nepotkalo, není těžší úloha, je to jen zmatek. Se vzrůstající
 * jistotou ve stupni 3 se přimíchávají vizuálně podobné znaky.
 */
export function buildTask(
  item: ItemProgress,
  state: EngineState,
  source: DistractorSource,
  rng: Rng,
  isReview = false,
): Task {
  const stage = item.stage;
  const kind = taskKind(stage, item.area);

  if (kind === 'intro' || kind === 'count' || kind === 'trace') {
    return { kind, itemId: item.itemId, area: item.area, stage, options: [], isReview };
  }

  const count = optionCount(stage, rng);
  const pool = seenItems(state, source.order, item.itemId);
  const confusable = (source.confusables[item.itemId] ?? []).filter((id) => pool.includes(id));

  // Čím jistější ve stupni, tím spíš přijde na řadu podobný znak.
  const wantConfusable = stage >= 3 && item.stageStreak >= 3 && confusable.length > 0;

  const picked: ItemId[] = [];
  if (wantConfusable) picked.push(shuffle(confusable, rng)[0]!);

  for (const id of shuffle(pool, rng)) {
    if (picked.length >= count - 1) break;
    if (!picked.includes(id)) picked.push(id);
  }

  return {
    kind,
    itemId: item.itemId,
    area: item.area,
    stage,
    options: shuffle([item.itemId, ...picked], rng),
    isReview,
  };
}

function taskKind(stage: Stage, area: ItemProgress['area']): Task['kind'] {
  if (stage === 1) return 'intro';
  if (stage === 2 || stage === 3) return 'choose';
  if (stage === 4) return area === 'numbers' ? 'count' : 'match';
  return 'trace';
}

/** Položky, které dítě už aspoň jednou vidělo, kromě té právě procvičované. */
function seenItems(state: EngineState, order: readonly ItemId[], exclude: ItemId): ItemId[] {
  return order.filter((id) => {
    if (id === exclude) return false;
    const p = state.items[id];
    return p !== undefined && p.state !== 'locked';
  });
}
