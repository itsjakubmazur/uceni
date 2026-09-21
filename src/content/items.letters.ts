/**
 * Písmena: pořadí výuky, slovo k písmenu, zaměnitelné znaky.
 *
 * Pořadí je záměrné: M je první (Mikulášovo písmeno), pak následují
 * písmena s častým výskytem a jednoduchým tvarem. Písmena, která se pletou
 * (M/N, E/F), jsou od sebe v pořadí co nejdál.
 *
 * PROČ TU NENÍ VÝSLOVNOST ZNAKU
 *
 * Písmeno se dá podat třemi způsoby a dva z nich jsme vyzkoušeli a zahodili:
 *
 * 1. Názvem („em", „eř") — pedagogicky škodí. Kdo zná M jako „em" a Á jako „á",
 *    přečte MÁMA jako „em-á-em-á" a nespojí to. Název písmene se ve škole učí
 *    až mnohem později, kvůli hláskování nahlas.
 * 2. Hláskou („mmm") — správné, ale syntéza to neumí. Protahování hlásky
 *    vyzkoušeno na hlase Zuzana: zní to jako koktání, ne jako hučení.
 *    Navíc by to stejně nešlo u ražených hlásek (P T K D B C G Č), které se
 *    samostatně vyslovit nedají ani člověkem — bez samohlásky je z „p" fouknutí.
 * 3. Slovem — písmeno se vždycky ukotví svým slovem a nikdy se nevysloví samo.
 *    „Podívej. Takhle začíná Mikuláš." / „Kde je písmeno od Mikuláše?"
 *
 * Používáme třetí. Proto tu není žádné pole pro výslovnost znaku: nic se
 * nevyslovuje. Vazbu na tvar dělá obrázek a obří znak na displeji, ne hlas.
 */

export interface LetterItem {
  readonly id: `let:${string}`;
  readonly glyph: string;
  /** Slovo v 1. pádu: „Mikuláš." */
  readonly word: string;
  /** 2. pád: „Kde je písmeno od Mikuláše?" */
  readonly wordGenitive: string;
  /** 4. pád: „Kde je Mikuláše?" u přiřazování obrázku. */
  readonly wordAccusative: string;
  /** Klíč do registru SVG ilustrací. */
  readonly illustration: string;
  /** Vizuálně podobné znaky pro těžší úlohy. */
  readonly confusables: readonly string[];
  /** Písmeno, které se nedá ukotvit první hláskou (Y). Promluvy to přiznají. */
  readonly soundInsideWord?: boolean;
  readonly note?: string;
}

export const LETTERS: readonly LetterItem[] = [
  { id: 'let:M', glyph: 'M', word: 'Mikuláš', wordGenitive: 'Mikuláše', wordAccusative: 'Mikuláše', illustration: 'mikulas', confusables: ['N', 'W'], note: 'Mikulášovo písmeno. Na mapě má zvláštní místo.' },
  { id: 'let:A', glyph: 'A', word: 'anděl', wordGenitive: 'anděla', wordAccusative: 'anděla', illustration: 'andel', confusables: ['V'] },
  { id: 'let:E', glyph: 'E', word: 'ementál', wordGenitive: 'ementálu', wordAccusative: 'ementál', illustration: 'emental', confusables: ['F', 'B'] },
  { id: 'let:L', glyph: 'L', word: 'lev', wordGenitive: 'lva', wordAccusative: 'lva', illustration: 'lev', confusables: ['I', 'T'] },
  { id: 'let:O', glyph: 'O', word: 'oko', wordGenitive: 'oka', wordAccusative: 'oko', illustration: 'oko', confusables: ['C', 'Q'] },
  { id: 'let:P', glyph: 'P', word: 'pes', wordGenitive: 'psa', wordAccusative: 'psa', illustration: 'pes', confusables: ['B', 'R'] },
  { id: 'let:S', glyph: 'S', word: 'sova', wordGenitive: 'sovy', wordAccusative: 'sovu', illustration: 'sova', confusables: ['Z'] },
  { id: 'let:U', glyph: 'U', word: 'ucho', wordGenitive: 'ucha', wordAccusative: 'ucho', illustration: 'ucho', confusables: ['V', 'O'] },
  { id: 'let:I', glyph: 'I', word: 'iglú', wordGenitive: 'iglú', wordAccusative: 'iglú', illustration: 'iglu', confusables: ['L', 'T'] },
  { id: 'let:T', glyph: 'T', word: 'tygr', wordGenitive: 'tygra', wordAccusative: 'tygra', illustration: 'tygr', confusables: ['I', 'L'] },
  { id: 'let:J', glyph: 'J', word: 'jablko', wordGenitive: 'jablka', wordAccusative: 'jablko', illustration: 'jablko', confusables: ['I'] },
  { id: 'let:V', glyph: 'V', word: 'vlak', wordGenitive: 'vlaku', wordAccusative: 'vlak', illustration: 'vlak', confusables: ['U', 'A'] },
  { id: 'let:K', glyph: 'K', word: 'kočka', wordGenitive: 'kočky', wordAccusative: 'kočku', illustration: 'kocka', confusables: ['X'] },
  { id: 'let:D', glyph: 'D', word: 'dům', wordGenitive: 'domu', wordAccusative: 'dům', illustration: 'dum', confusables: ['O', 'B'] },
  { id: 'let:N', glyph: 'N', word: 'nos', wordGenitive: 'nosu', wordAccusative: 'nos', illustration: 'nos', confusables: ['M', 'H'], note: 'Hlavní dvojice s M. Zařazeno daleko za M, aby už bylo M pevné.' },
  { id: 'let:Z', glyph: 'Z', word: 'zebra', wordGenitive: 'zebry', wordAccusative: 'zebru', illustration: 'zebra', confusables: ['S'] },
  { id: 'let:R', glyph: 'R', word: 'ryba', wordGenitive: 'ryby', wordAccusative: 'rybu', illustration: 'ryba', confusables: ['P', 'B'] },
  { id: 'let:B', glyph: 'B', word: 'banán', wordGenitive: 'banánu', wordAccusative: 'banán', illustration: 'banan', confusables: ['P', 'R', 'D'] },
  { id: 'let:C', glyph: 'C', word: 'citron', wordGenitive: 'citronu', wordAccusative: 'citron', illustration: 'citron', confusables: ['O', 'G'] },
  { id: 'let:H', glyph: 'H', word: 'had', wordGenitive: 'hada', wordAccusative: 'hada', illustration: 'had', confusables: ['N', 'K'] },
  {
    id: 'let:Y', glyph: 'Y', word: 'myš', wordGenitive: 'myši', wordAccusative: 'myš', illustration: 'mys',
    confusables: ['V', 'X'], soundInsideWord: true,
    note: 'Jediné písmeno bez českého slova na začátku. V „myš" je Y jediná samohláska, nejde ji přeslechnout.',
  },
  { id: 'let:F', glyph: 'F', word: 'flétna', wordGenitive: 'flétny', wordAccusative: 'flétnu', illustration: 'fletna', confusables: ['E', 'T'] },
  { id: 'let:G', glyph: 'G', word: 'gorila', wordGenitive: 'gorily', wordAccusative: 'gorilu', illustration: 'gorila', confusables: ['C', 'O'] },
  { id: 'let:Č', glyph: 'Č', word: 'čert', wordGenitive: 'čerta', wordAccusative: 'čerta', illustration: 'cert', confusables: ['C'] },
  { id: 'let:Ř', glyph: 'Ř', word: 'řepa', wordGenitive: 'řepy', wordAccusative: 'řepu', illustration: 'repa', confusables: ['R'] },
  { id: 'let:Š', glyph: 'Š', word: 'šnek', wordGenitive: 'šneka', wordAccusative: 'šneka', illustration: 'snek', confusables: ['S'] },
  { id: 'let:Ž', glyph: 'Ž', word: 'žába', wordGenitive: 'žáby', wordAccusative: 'žábu', illustration: 'zaba', confusables: ['Z'] },
  { id: 'let:CH', glyph: 'CH', word: 'chobotnice', wordGenitive: 'chobotnice', wordAccusative: 'chobotnici', illustration: 'chobotnice', confusables: ['C', 'H'], note: 'Jeden znak, ne C + H. Proto až úplně nakonec.' },
] as const;

export const letterById = new Map(LETTERS.map((l) => [l.id, l]));
