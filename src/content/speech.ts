/**
 * Všechny promluvy aplikace. Jediný zdroj textů pro hlas.
 *
 * Pravidla:
 * - Nikdy izolovaná hláska („Mmm"). Znak se vysloví názvem a ukotví slovem.
 * - Delší promluvy se skládají z kratších klipů, aby jich nebylo 800.
 *   „Tohle je N. Zkus najít M." = letter.N.this + letter.M.tryFind.
 * - Text se nikdy nemění „jen tak": změna textu = nový hash = přegenerování klipu.
 */

import { LETTERS, type LetterItem } from './items.letters.ts';
import { NUMBERS, COUNTING_WORDS, type NumberItem } from './items.numbers.ts';

export interface SpeechLine {
  readonly id: string;
  readonly text: string;
  /** Proč je text takhle — čte to rodič v rodičovské zóně. */
  readonly note?: string;
}

/* ---------------------------------------------------------------- písmena */

function letterLines(l: LetterItem): SpeechLine[] {
  const key = l.glyph;
  const Word = cap(l.word);

  // Y nezačíná žádné české slovo, tak to promluva rovnou přizná.
  if (l.soundInsideWord) {
    return [
      { id: `letter.${key}.intro`, text: `Tohle písmeno je schované uprostřed slova ${l.word}.`, note: l.note },
      { id: `letter.${key}.this`, text: `To je písmeno ze slova ${l.word}.` },
      { id: `letter.${key}.where`, text: `Kde je písmeno ze slova ${l.word}?` },
      { id: `letter.${key}.tryFind`, text: `Zkus najít písmeno ze slova ${l.word}.` },
      { id: `letter.${key}.word`, text: `${Word}.` },
      { id: `letter.${key}.pickPicture`, text: `Kde je ${l.word}?` },
      { id: `letter.${key}.pickPictureRetry`, text: `Zkus najít ${l.wordAccusative}.` },
    ];
  }

  return [
    { id: `letter.${key}.intro`, text: `Podívej. Takhle začíná ${l.word}.`, note: l.note },
    { id: `letter.${key}.this`, text: `To je písmeno od ${l.wordGenitive}.` },
    { id: `letter.${key}.where`, text: `Kde je písmeno od ${l.wordGenitive}?` },
    { id: `letter.${key}.tryFind`, text: `Zkus najít písmeno od ${l.wordGenitive}.` },
    { id: `letter.${key}.word`, text: `${Word}.` },
    { id: `letter.${key}.pickPicture`, text: `Kde je ${l.word}?` },
    { id: `letter.${key}.pickPictureRetry`, text: `Zkus najít ${l.wordAccusative}.` },
  ];
}

/* ----------------------------------------------------------------- čísla */

function numberLines(n: NumberItem): SpeechLine[] {
  const key = n.value;

  const intro = n.value === 0
    ? 'Tohle je nula. Nula znamená, že tam není nic.'
    : `Tohle je ${n.digitName}. Číslo ${n.cardinal}.`;

  const total = n.value === 0
    ? 'Není tam nic. Nula.'
    : n.value === 1
      ? 'Je to jenom jedna.'
      : `Dohromady ${n.cardinal}.`;

  return [
    { id: `number.${key}.intro`, text: intro, note: n.note },
    { id: `number.${key}.this`, text: `Tohle je ${n.digitName}.` },
    { id: `number.${key}.where`, text: `Kde je ${n.digitName}?` },
    { id: `number.${key}.tryFind`, text: `Zkus najít ${n.digitAccusative}.` },
    { id: `number.${key}.total`, text: total },
  ];
}

/* ------------------------------------------------- počítání a jednotlivosti */

const countingLines: SpeechLine[] = COUNTING_WORDS.map((word, i) => ({
  id: `count.${i + 1}`,
  text: `${cap(word)}.`,
  note: 'Přehrává se při klepnutí na předmět. Musí být krátké a svižné.',
}));

/* --------------------------------------------------- pochvaly a povzbuzení */

/** Střídají se, aby to neomrzelo. Přehrává se náhodná, ale nikdy dvě stejné po sobě. */
const praise = [
  'To je ono!',
  'Přesně tak!',
  'Výborně, Mikuláši!',
  'Máš to!',
  'Krásně!',
  'Jde ti to!',
  'Paráda!',
  'Trefa!',
];

/** Po chybě. Nikdy nehodnotí dítě, vždy nabízí další pokus. */
const encourage = [
  'To nevadí, zkus to ještě jednou.',
  'Skoro! Podívej se ještě jednou.',
  'Nic se nestalo, pojď to zkusit znova.',
  'Zkusíme to spolu.',
  'Ještě jednou, zvládneš to.',
  'To nic. Koukni se pořádně.',
];

const variantLines: SpeechLine[] = [
  ...praise.map((text, i) => ({ id: `praise.${i + 1}`, text })),
  ...encourage.map((text, i) => ({ id: `encourage.${i + 1}`, text })),
];

/* ------------------------------------------------------------ systémové */

const systemLines: SpeechLine[] = [
  { id: 'ui.tapToStart', text: 'Klepni na obrazovku a začneme.', note: 'Safari nepustí zvuk před prvním dotykem. Tohle je ten dotyk.' },
  { id: 'ui.welcome', text: 'Ahoj Mikuláši! Na co se dneska podíváme?' },
  { id: 'ui.numbers', text: 'Čísla.' },
  { id: 'ui.letters', text: 'Písmena.' },
  { id: 'ui.map', text: 'Mapa.' },
  { id: 'ui.again', text: 'Ještě jednou.' },
  { id: 'ui.back', text: 'Zpátky.' },

  { id: 'count.prompt', text: 'Spočítáme to spolu. Klepej na ně.' },
  { id: 'count.howMany', text: 'Kolik jich je?' },

  { id: 'trace.start', text: 'Obtáhni to prstem.' },
  { id: 'trace.follow', text: 'Jeď po té cestičce.' },
  { id: 'trace.done', text: 'Krásně obtažené!' },
  { id: 'trace.again', text: 'Ještě jeden tah.' },

  { id: 'session.end.great', text: 'Dneska ti to moc šlo. Zítra se na tebe těším.' },
  { id: 'session.end.learned', text: 'Podívej, co všechno už umíš.' },
  { id: 'session.end.bye', text: 'Ahoj, Mikuláši!' },

  { id: 'map.newLight', text: 'Podívej! Něco se rozsvítilo.' },
  { id: 'map.intro', text: 'Tohle je tvoje cesta. Co umíš, to svítí.' },
];

/* -------------------------------------------------------------- registr */

export const SPEECH: readonly SpeechLine[] = [
  ...LETTERS.flatMap(letterLines),
  ...NUMBERS.flatMap(numberLines),
  ...countingLines,
  ...variantLines,
  ...systemLines,
];

export const speechById = new Map(SPEECH.map((s) => [s.id, s]));

/** Skupiny variant — runtime si z nich vybírá náhodně. */
export const VARIANT_GROUPS = {
  praise: praise.map((_, i) => `praise.${i + 1}`),
  encourage: encourage.map((_, i) => `encourage.${i + 1}`),
} as const;

/**
 * Věty pro srovnání hlasů. Schválně pokrývají to nejtěžší z celé aplikace.
 *
 * Protahování hlásky („Mmmikuláš") tu bývalo taky — vyzkoušeno na hlase Zuzana
 * a zahozeno, syntéza z toho dělá koktání. Stejně tak názvy písmen („eř"),
 * které navíc dítěti překážejí při skládání slov. Zbylo to, co Zuzana umí
 * říct přirozeně: celá česká slova.
 */
export const VOICE_TEST_SENTENCES: readonly { id: string; text: string; why: string }[] = [
  { id: 'test-1', text: 'Podívej. Takhle začíná Mikuláš.', why: 'Seznámení s písmenem. Znak se nevyslovuje, nese ho slovo.' },
  { id: 'test-2', text: 'Kde je písmeno od Mikuláše?', why: 'Otázka v úloze. Tuhle větu Mikuláš uslyší stokrát — není moc dlouhá?' },
  { id: 'test-3', text: 'To je písmeno od nosu. Zkus najít písmeno od Mikuláše.', why: 'Oprava po chybě, poskládaná ze dvou klipů. Nesmí znít přísně.' },
  { id: 'test-4', text: 'Podívej. Takhle začíná řepa.', why: 'Nejtěžší česká hláska uvnitř běžného slova.' },
  { id: 'test-5', text: 'Spočítáme to spolu. Jedna, dvě, tři.', why: 'Rytmus počítání a pauzy mezi čísly.' },
  { id: 'test-6', text: 'To je ono! Moc ti to jde.', why: 'Radost. Zní to vřele, nebo jako hlášení na nádraží?' },
  { id: 'test-7', text: 'Tohle je pětka. Číslo pět.', why: 'Číslice má jiný tvar než počet. Nezní „pětka" divně?' },
  { id: 'test-8', text: 'Dneska ses naučil písmeno od Mikuláše a číslo tři. Zítra se na tebe těším.', why: 'Závěr sezení. Delší věta, intonace na konci.' },
];

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
