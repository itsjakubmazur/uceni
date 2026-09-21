/**
 * Čísla: 1–10, pak 0, pak 11–20.
 *
 * Čeština má pro číslici jiný tvar než pro počet: číslice je „pětka",
 * ale napočítáme „pět". Držíme obojí, protože „Kde je pět?" je špatně česky,
 * kdežto „Kde je pětka?" zní přirozeně.
 */

export interface NumberItem {
  readonly id: `num:${number}`;
  readonly value: number;
  readonly glyph: string;
  /** Název číslice, 1. pád: „pětka". */
  readonly digitName: string;
  /** Název číslice, 4. pád: „Zkus najít pětku." */
  readonly digitAccusative: string;
  /** Počet, jak se napočítá: „pět". */
  readonly cardinal: string;
  /** Rozvržení jako na kostce (subitizing) — dává smysl do šesti. */
  readonly diceLayout: boolean;
  /** Motiv počítaných předmětů. Patří do světa, ne generické puntíky. */
  readonly motif: Motif;
  /** Vizuálně nebo sluchově zaměnitelná čísla pro těžší úlohy. */
  readonly confusables: readonly number[];
  readonly note?: string;
}

/** Motivy jsou z papírového divadla: co by v něm šlo vystřihnout a spočítat. */
export type Motif = 'lampa' | 'hvezda' | 'ptak' | 'list' | 'domek';

const MOTIFS: Motif[] = ['lampa', 'hvezda', 'ptak', 'list', 'domek'];

const N = (
  value: number,
  digitName: string,
  digitAccusative: string,
  cardinal: string,
  confusables: readonly number[] = [],
  note?: string,
): NumberItem => ({
  id: `num:${value}`,
  value,
  glyph: String(value),
  digitName,
  digitAccusative,
  cardinal,
  diceLayout: value >= 1 && value <= 6,
  // Motiv se střídá, ať každé číslo vypadá jinak, ale u jednoho čísla je vždy stejný.
  motif: MOTIFS[value % MOTIFS.length]!,
  confusables,
  note,
});

/** Pořadí výuky, ne číselná řada. */
export const NUMBERS: readonly NumberItem[] = [
  N(1, 'jednička', 'jedničku', 'jedna', [7]),
  N(2, 'dvojka', 'dvojku', 'dvě', [5]),
  N(3, 'trojka', 'trojku', 'tři', [8]),
  N(4, 'čtyřka', 'čtyřku', 'čtyři', [7]),
  N(5, 'pětka', 'pětku', 'pět', [2]),
  N(6, 'šestka', 'šestku', 'šest', [9], 'Klíčová dvojice s devítkou.'),
  N(7, 'sedmička', 'sedmičku', 'sedm', [1, 4]),
  N(8, 'osmička', 'osmičku', 'osm', [3]),
  N(9, 'devítka', 'devítku', 'devět', [6]),
  N(10, 'desítka', 'desítku', 'deset', [1]),
  N(0, 'nula', 'nulu', 'nula', [6, 8], 'Přichází až po desítce. Nula je těžký pojem — nic se taky dá spočítat.'),
  N(11, 'jedenáctka', 'jedenáctku', 'jedenáct', [1]),
  N(12, 'dvanáctka', 'dvanáctku', 'dvanáct', [2, 21]),
  N(13, 'třináctka', 'třináctku', 'třináct', [3]),
  N(14, 'čtrnáctka', 'čtrnáctku', 'čtrnáct', [4]),
  N(15, 'patnáctka', 'patnáctku', 'patnáct', [5]),
  N(16, 'šestnáctka', 'šestnáctku', 'šestnáct', [6]),
  N(17, 'sedmnáctka', 'sedmnáctku', 'sedmnáct', [7]),
  N(18, 'osmnáctka', 'osmnáctku', 'osmnáct', [8]),
  N(19, 'devatenáctka', 'devatenáctku', 'devatenáct', [9]),
  N(20, 'dvacítka', 'dvacítku', 'dvacet', [2, 12]),
];

export const numberById = new Map(NUMBERS.map((n) => [n.id, n]));

/** Počítací slova pro klepací počítání — „jedna, dvě, tři…". */
export const COUNTING_WORDS: readonly string[] = [
  'jedna', 'dvě', 'tři', 'čtyři', 'pět', 'šest', 'sedm', 'osm', 'devět', 'deset',
  'jedenáct', 'dvanáct', 'třináct', 'čtrnáct', 'patnáct', 'šestnáct', 'sedmnáct',
  'osmnáct', 'devatenáct', 'dvacet',
];
