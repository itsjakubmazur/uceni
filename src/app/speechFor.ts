import { VARIANT_GROUPS, SPEECH } from '../content/speech.ts';
import { numberById } from '../content/items.numbers.ts';
import { letterById } from '../content/items.letters.ts';
import type { ItemId } from '../engine/types.ts';

/** Klíč promluvy pro položku. „num:7" → „number.7", „let:M" → „letter.M". */
export function speechKey(itemId: ItemId): string {
  const [kind, rest] = itemId.split(':') as [string, string];
  return kind === 'num' ? `number.${rest}` : `letter.${rest}`;
}

export const say = {
  intro: (id: ItemId) => `${speechKey(id)}.intro`,
  this: (id: ItemId) => `${speechKey(id)}.this`,
  where: (id: ItemId) => `${speechKey(id)}.where`,
  tryFind: (id: ItemId) => `${speechKey(id)}.tryFind`,
  word: (id: ItemId) => `${speechKey(id)}.word`,
  total: (id: ItemId) => `${speechKey(id)}.total`,
  count: (n: number) => `count.${n}`,
};

/** Náhodná pochvala, nikdy dvě stejné po sobě. */
export function makeVariantPicker(group: keyof typeof VARIANT_GROUPS): () => string {
  const ids = VARIANT_GROUPS[group];
  let last = -1;
  return () => {
    let i = Math.floor(Math.random() * ids.length);
    if (i === last) i = (i + 1) % ids.length;
    last = i;
    return ids[i]!;
  };
}

/** Znak položky pro zobrazení. */
export function glyphOf(itemId: ItemId): string {
  return numberById.get(itemId as `num:${number}`)?.glyph ?? letterById.get(itemId as `let:${string}`)?.glyph ?? '?';
}

/** Texty pro nouzový prohlížečový hlas, kdyby chyběl soubor. */
export const FALLBACK_TEXTS: Record<string, string> = Object.fromEntries(
  SPEECH.map((s) => [s.id, s.text]),
);
