/**
 * Písmena: pořadí výuky, slovo k písmenu, zaměnitelné znaky.
 *
 * Pořadí je záměrné: M je první (Mikulášovo písmeno), pak následují
 * písmena s častým výskytem a jednoduchým tvarem. Písmena, která se pletou
 * (M/N, E/F), jsou od sebe v pořadí co nejdál.
 *
 * JAK SE PÍSMENO PODÁVÁ
 *
 * Obě hlavní české metody prvopočátečního čtení učí HLÁSKU, ne název písmene.
 * Analyticko-syntetická metoda vyvodí slovo z mluvené řeči a rozloží ho na
 * hlásky; genetická metoda slovo hláskuje a skládá (L-U-K = LUK) s cílem
 * propojit každé písmeno s odpovídající hláskou. Názvy písmen a abeceda
 * jsou učivo až druhé třídy, tedy o dva roky později.
 *
 * Hlásku ale nejde přehrát ze syntézy:
 * - izolovaný znak přečte hlas názvem („em", „eř") a název písmene dítěti
 *   překáží při skládání — kdo zná M jako „em", přečte MÁMA jako „em-á-em-á";
 * - protahovaná hláska („Mmmikuláš") zní na hlase Zuzana jako koktání
 *   a u ražených hlásek (P T K D B C G Č) nejde vyslovit ani člověkem.
 *
 * Používáme proto postup, který se v hodinách dělá stejně: VYVOZENÍ HLÁSKY
 * Z VÍCE SLOV. Zazní tři slova se stejným začátkem a dítě si hlásku vytáhne
 * samo — „Mikuláš. Máma. Med. Slyšíš, jak začínají stejně?" To je přesně to
 * cvičení, které u předškoláka rozvíjí fonematické uvědomování, a syntéza na
 * něm nemá jak selhat, protože říká jen celá česká slova.
 *
 * `letterName` je název písmene pro druhou třídu. V promluvách se použije jen
 * tehdy, když si to rodič v rodičovské zóně zapne. Výchozí stav je vypnuto.
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
  /**
   * Dvě další slova se stejnou první hláskou. Nepotřebují ilustraci, jen zazní:
   * z trojice slov si dítě hlásku vyvodí samo.
   */
  readonly echoWords: readonly [string, string];
  /** Název písmene („em"). Učivo 2. třídy, v aplikaci volitelné a výchozí vypnuté. */
  readonly letterName: string;
  /** Vizuálně podobné znaky pro těžší úlohy. */
  readonly confusables: readonly string[];
  /** Písmeno, které se nedá ukotvit první hláskou (Y). Promluvy to přiznají. */
  readonly soundInsideWord?: boolean;
  readonly note?: string;
}

export const LETTERS: readonly LetterItem[] = [
  { id: 'let:M', glyph: 'M', word: 'Mikuláš', wordGenitive: 'Mikuláše', wordAccusative: 'Mikuláše', illustration: 'mikulas', echoWords: ['máma', 'med'], letterName: 'em', confusables: ['N', 'W'], note: 'Mikulášovo písmeno. Na mapě má zvláštní místo.' },
  { id: 'let:A', glyph: 'A', word: 'anděl', wordGenitive: 'anděla', wordAccusative: 'anděla', illustration: 'andel', echoWords: ['ananas', 'Adam'], letterName: 'á', confusables: ['V'] },
  { id: 'let:E', glyph: 'E', word: 'ementál', wordGenitive: 'ementálu', wordAccusative: 'ementál', illustration: 'emental', echoWords: ['Eva', 'Emil'], letterName: 'é', confusables: ['F', 'B'] },
  { id: 'let:L', glyph: 'L', word: 'lev', wordGenitive: 'lva', wordAccusative: 'lva', illustration: 'lev', echoWords: ['loď', 'les'], letterName: 'el', confusables: ['I', 'T'] },
  { id: 'let:O', glyph: 'O', word: 'oko', wordGenitive: 'oka', wordAccusative: 'oko', illustration: 'oko', echoWords: ['oheň', 'ovce'], letterName: 'ó', confusables: ['C', 'Q'] },
  { id: 'let:P', glyph: 'P', word: 'pes', wordGenitive: 'psa', wordAccusative: 'psa', illustration: 'pes', echoWords: ['pomeranč', 'postel'], letterName: 'pé', confusables: ['B', 'R'] },
  { id: 'let:S', glyph: 'S', word: 'sova', wordGenitive: 'sovy', wordAccusative: 'sovu', illustration: 'sova', echoWords: ['slunce', 'sýr'], letterName: 'es', confusables: ['Z'] },
  { id: 'let:U', glyph: 'U', word: 'ucho', wordGenitive: 'ucha', wordAccusative: 'ucho', illustration: 'ucho', echoWords: ['ulice', 'ulita'], letterName: 'ú', confusables: ['V', 'O'] },
  { id: 'let:I', glyph: 'I', word: 'iglú', wordGenitive: 'iglú', wordAccusative: 'iglú', illustration: 'iglu', echoWords: ['Ivan', 'Irena'], letterName: 'í', confusables: ['L', 'T'] },
  { id: 'let:T', glyph: 'T', word: 'tygr', wordGenitive: 'tygra', wordAccusative: 'tygra', illustration: 'tygr', echoWords: ['tatínek', 'taška'], letterName: 'té', confusables: ['I', 'L'] },
  { id: 'let:J', glyph: 'J', word: 'jablko', wordGenitive: 'jablka', wordAccusative: 'jablko', illustration: 'jablko', echoWords: ['jahoda', 'jazyk'], letterName: 'jé', confusables: ['I'] },
  { id: 'let:V', glyph: 'V', word: 'vlak', wordGenitive: 'vlaku', wordAccusative: 'vlak', illustration: 'vlak', echoWords: ['voda', 'vlk'], letterName: 'vé', confusables: ['U', 'A'] },
  { id: 'let:K', glyph: 'K', word: 'kočka', wordGenitive: 'kočky', wordAccusative: 'kočku', illustration: 'kocka', echoWords: ['kolo', 'kniha'], letterName: 'ká', confusables: ['X'] },
  { id: 'let:D', glyph: 'D', word: 'dům', wordGenitive: 'domu', wordAccusative: 'dům', illustration: 'dum', echoWords: ['dort', 'dveře'], letterName: 'dé', confusables: ['O', 'B'] },
  { id: 'let:N', glyph: 'N', word: 'nos', wordGenitive: 'nosu', wordAccusative: 'nos', illustration: 'nos', echoWords: ['noha', 'nebe'], letterName: 'en', confusables: ['M', 'H'], note: 'Hlavní dvojice s M. Zařazeno daleko za M, aby už bylo M pevné.' },
  { id: 'let:Z', glyph: 'Z', word: 'zebra', wordGenitive: 'zebry', wordAccusative: 'zebru', illustration: 'zebra', echoWords: ['zub', 'zahrada'], letterName: 'zet', confusables: ['S'] },
  { id: 'let:R', glyph: 'R', word: 'ryba', wordGenitive: 'ryby', wordAccusative: 'rybu', illustration: 'ryba', echoWords: ['ruka', 'růže'], letterName: 'er', confusables: ['P', 'B'] },
  { id: 'let:B', glyph: 'B', word: 'banán', wordGenitive: 'banánu', wordAccusative: 'banán', illustration: 'banan', echoWords: ['bota', 'balón'], letterName: 'bé', confusables: ['P', 'R', 'D'] },
  { id: 'let:C', glyph: 'C', word: 'citron', wordGenitive: 'citronu', wordAccusative: 'citron', illustration: 'citron', echoWords: ['cibule', 'cukr'], letterName: 'cé', confusables: ['O', 'G'] },
  { id: 'let:H', glyph: 'H', word: 'had', wordGenitive: 'hada', wordAccusative: 'hada', illustration: 'had', echoWords: ['hora', 'hlava'], letterName: 'há', confusables: ['N', 'K'] },
  {
    id: 'let:Y', glyph: 'Y', word: 'myš', wordGenitive: 'myši', wordAccusative: 'myš', illustration: 'mys',
    echoWords: ['sýr', 'motýl'], letterName: 'ypsilon', confusables: ['V', 'X'], soundInsideWord: true,
    note: 'Jediné písmeno bez českého slova na začátku. V „myš" je Y jediná samohláska, nejde ji přeslechnout.',
  },
  { id: 'let:F', glyph: 'F', word: 'flétna', wordGenitive: 'flétny', wordAccusative: 'flétnu', illustration: 'fletna', echoWords: ['fialka', 'fazole'], letterName: 'ef', confusables: ['E', 'T'] },
  { id: 'let:G', glyph: 'G', word: 'gorila', wordGenitive: 'gorily', wordAccusative: 'gorilu', illustration: 'gorila', echoWords: ['guma', 'garáž'], letterName: 'gé', confusables: ['C', 'O'] },
  { id: 'let:Č', glyph: 'Č', word: 'čert', wordGenitive: 'čerta', wordAccusative: 'čerta', illustration: 'cert', echoWords: ['čepice', 'čokoláda'], letterName: 'čé', confusables: ['C'] },
  { id: 'let:Ř', glyph: 'Ř', word: 'řepa', wordGenitive: 'řepy', wordAccusative: 'řepu', illustration: 'repa', echoWords: ['řeka', 'řízek'], letterName: 'eř', confusables: ['R'] },
  { id: 'let:Š', glyph: 'Š', word: 'šnek', wordGenitive: 'šneka', wordAccusative: 'šneka', illustration: 'snek', echoWords: ['šála', 'škola'], letterName: 'eš', confusables: ['S'] },
  { id: 'let:Ž', glyph: 'Ž', word: 'žába', wordGenitive: 'žáby', wordAccusative: 'žábu', illustration: 'zaba', echoWords: ['žirafa', 'žralok'], letterName: 'žet', confusables: ['Z'] },
  { id: 'let:CH', glyph: 'CH', word: 'chobotnice', wordGenitive: 'chobotnice', wordAccusative: 'chobotnici', illustration: 'chobotnice', echoWords: ['chleba', 'chata'], letterName: 'chá', confusables: ['C', 'H'], note: 'Jeden znak, ne C + H. Proto až úplně nakonec.' },
] as const;

export const letterById = new Map(LETTERS.map((l) => [l.id, l]));
