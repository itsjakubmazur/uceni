/**
 * Písmena: pořadí výuky, slovo k písmenu, zaměnitelné znaky.
 *
 * Pořadí je záměrné: M je první (Mikulášovo písmeno), pak následují
 * písmena s častým výskytem a jednoduchým tvarem. Písmena, která se pletou
 * (M/N, E/F), jsou od sebe v pořadí co nejdál.
 *
 * `spokenName` je jediné místo, kde se ladí, jak má hlas znak přečíst.
 * Když ho nevyplníš, použije se `glyph` a syntéza si název domyslí sama.
 * Vyplň ho, jakmile při poslechu zjistíš, že hlas znak komolí.
 */

export interface LetterItem {
  readonly id: `let:${string}`;
  readonly glyph: string;
  /** Jak má hlas znak vyslovit. Výchozí je `glyph`. */
  readonly spokenName?: string;
  /** Slovo v 1. pádu, zní stejnou hláskou jako písmeno. */
  readonly word: string;
  /** Slovo ve 4. pádu — „Najdi obrázek, kde je ryba" apod. */
  readonly wordAccusative: string;
  /** Klíč do registru SVG ilustrací. */
  readonly illustration: string;
  /** Vizuálně podobné znaky pro těžší úlohy. */
  readonly confusables: readonly string[];
  /** Písmeno, které se nedá ukotvit první hláskou (Y). */
  readonly soundInsideWord?: boolean;
  readonly note?: string;
}

export const LETTERS: readonly LetterItem[] = [
  { id: 'let:M', glyph: 'M', word: 'Mikuláš', wordAccusative: 'Mikuláše', illustration: 'mikulas', confusables: ['N', 'W'], note: 'Mikulášovo písmeno. Na mapě má zvláštní místo.' },
  { id: 'let:A', glyph: 'A', word: 'anděl', wordAccusative: 'anděla', illustration: 'andel', confusables: ['V'] },
  { id: 'let:E', glyph: 'E', word: 'ementál', wordAccusative: 'ementál', illustration: 'emental', confusables: ['F', 'B'] },
  { id: 'let:L', glyph: 'L', word: 'lev', wordAccusative: 'lva', illustration: 'lev', confusables: ['I', 'T'] },
  { id: 'let:O', glyph: 'O', word: 'oko', wordAccusative: 'oko', illustration: 'oko', confusables: ['C', 'Q'] },
  { id: 'let:P', glyph: 'P', word: 'pes', wordAccusative: 'psa', illustration: 'pes', confusables: ['B', 'R'] },
  { id: 'let:S', glyph: 'S', word: 'sova', wordAccusative: 'sovu', illustration: 'sova', confusables: ['Z'] },
  { id: 'let:U', glyph: 'U', word: 'ucho', wordAccusative: 'ucho', illustration: 'ucho', confusables: ['V', 'O'] },
  { id: 'let:I', glyph: 'I', word: 'iglú', wordAccusative: 'iglú', illustration: 'iglu', confusables: ['L', 'T'] },
  { id: 'let:T', glyph: 'T', word: 'tygr', wordAccusative: 'tygra', illustration: 'tygr', confusables: ['I', 'L'] },
  { id: 'let:J', glyph: 'J', word: 'jablko', wordAccusative: 'jablko', illustration: 'jablko', confusables: ['I'] },
  { id: 'let:V', glyph: 'V', word: 'vlak', wordAccusative: 'vlak', illustration: 'vlak', confusables: ['U', 'A'] },
  { id: 'let:K', glyph: 'K', word: 'kočka', wordAccusative: 'kočku', illustration: 'kocka', confusables: ['X'] },
  { id: 'let:D', glyph: 'D', word: 'dům', wordAccusative: 'dům', illustration: 'dum', confusables: ['O', 'B'] },
  { id: 'let:N', glyph: 'N', word: 'nos', wordAccusative: 'nos', illustration: 'nos', confusables: ['M', 'H'], note: 'Hlavní dvojice s M. Zařazeno daleko za M, aby už bylo M pevné.' },
  { id: 'let:Z', glyph: 'Z', word: 'zebra', wordAccusative: 'zebru', illustration: 'zebra', confusables: ['S'] },
  { id: 'let:R', glyph: 'R', word: 'ryba', wordAccusative: 'rybu', illustration: 'ryba', confusables: ['P', 'B'] },
  { id: 'let:B', glyph: 'B', word: 'banán', wordAccusative: 'banán', illustration: 'banan', confusables: ['P', 'R', 'D'] },
  { id: 'let:C', glyph: 'C', word: 'citron', wordAccusative: 'citron', illustration: 'citron', confusables: ['O', 'G'] },
  { id: 'let:H', glyph: 'H', word: 'had', wordAccusative: 'hada', illustration: 'had', confusables: ['N', 'K'] },
  {
    id: 'let:Y', glyph: 'Y', spokenName: 'ypsilon', word: 'myš', wordAccusative: 'myš', illustration: 'mys',
    confusables: ['V', 'X'], soundInsideWord: true,
    note: 'Jediné písmeno bez českého slova na začátku. Y je v „myš" jediná samohláska, nejde ji přeslechnout.',
  },
  { id: 'let:F', glyph: 'F', word: 'flétna', wordAccusative: 'flétnu', illustration: 'fletna', confusables: ['E', 'T'] },
  { id: 'let:G', glyph: 'G', word: 'gorila', wordAccusative: 'gorilu', illustration: 'gorila', confusables: ['C', 'O'] },
  { id: 'let:Č', glyph: 'Č', spokenName: 'čé', word: 'čert', wordAccusative: 'čerta', illustration: 'cert', confusables: ['C'] },
  { id: 'let:Ř', glyph: 'Ř', spokenName: 'eř', word: 'řepa', wordAccusative: 'řepu', illustration: 'repa', confusables: ['R'] },
  { id: 'let:Š', glyph: 'Š', spokenName: 'eš', word: 'šnek', wordAccusative: 'šneka', illustration: 'snek', confusables: ['S'] },
  { id: 'let:Ž', glyph: 'Ž', spokenName: 'žet', word: 'žába', wordAccusative: 'žábu', illustration: 'zaba', confusables: ['Z'] },
  { id: 'let:CH', glyph: 'CH', spokenName: 'chá', word: 'chobotnice', wordAccusative: 'chobotnici', illustration: 'chobotnice', confusables: ['C', 'H'], note: 'Jeden znak, ne C + H. Proto až úplně nakonec.' },
] as const;

export const letterById = new Map(LETTERS.map((l) => [l.id, l]));
export const spokenName = (l: LetterItem): string => l.spokenName ?? l.glyph;
