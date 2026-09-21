/**
 * Tahy pro obtahování prstem.
 *
 * Každý znak je popsaný jako kostra — čára, kterou by vedla tužka — ne jako
 * obrys písmene z fontu. Obtahovat obrys je pro dítě matoucí: vede ho to
 * kolem znaku dokola místo skrz něj.
 *
 * Souřadnice jsou ve čtverci 100 × 100: horní dotažnice na 12, účaří na 88.
 * Pořadí tahů v poli je pořadí, ve kterém se mají psát.
 *
 * Háčkovaná písmena se nekreslí zvlášť. Základní znak se stlačí dolů přes
 * `transform` a nad něj přibude háček — jinak by se musely všechny tvary psát
 * dvakrát a při každé opravě rozcházet.
 */

export interface Stroke {
  readonly d: string;
  /** Transformace tahu. Používá se u písmen s háčkem. */
  readonly transform?: string;
}

/** Stlačení základního znaku, aby se nad něj vešel háček. */
const UNDER_CARON = 'translate(0 26) scale(1 0.816)';
const CARON: Stroke = { d: 'M36 6 L50 20 L64 6' };

const BASE: Record<string, string[]> = {
  /* ---------------------------------------------------------------- písmena */
  // Lomené znaky se dělí v každém rohu. Táhnout M jedním tahem je pro
  // pětiletého moc: pustí se v ohybu a tah se rozpadne.
  // Směr tahu není jedno: svislice se vždycky píšou shora dolů.
  M: ['M22 12 L22 88', 'M22 12 L50 56', 'M50 56 L78 12', 'M78 12 L78 88'],
  A: ['M50 12 L26 88', 'M50 12 L74 88', 'M34 62 L66 62'],
  E: ['M28 12 L28 88', 'M28 12 L72 12', 'M28 50 L64 50', 'M28 88 L72 88'],
  L: ['M30 12 L30 88', 'M30 88 L72 88'],
  O: ['M50 12 C 32 12 22 30 22 50 C 22 70 32 88 50 88 C 68 88 78 70 78 50 C 78 30 68 12 50 12 Z'],
  P: ['M30 12 L30 88', 'M30 12 L58 12 C 74 12 74 46 58 46 L30 46'],
  S: ['M72 22 C 60 10 30 12 30 30 C 30 48 70 46 70 68 C 70 88 38 90 26 78'],
  U: ['M28 12 L28 60 C 28 82 72 82 72 60 L72 12'],
  I: ['M50 12 L50 88'],
  T: ['M26 12 L74 12', 'M50 12 L50 88'],
  J: ['M64 12 L64 66 C 64 86 34 88 30 70'],
  V: ['M26 12 L50 88', 'M50 88 L74 12'],
  K: ['M30 12 L30 88', 'M72 12 L34 52', 'M44 44 L74 88'],
  D: ['M30 12 L30 88', 'M30 12 L52 12 C 76 12 76 88 52 88 L30 88'],
  N: ['M26 12 L26 88', 'M26 12 L74 88', 'M74 12 L74 88'],
  Z: ['M28 12 L72 12', 'M72 12 L28 88', 'M28 88 L72 88'],
  R: ['M30 12 L30 88', 'M30 12 L56 12 C 72 12 72 46 56 46 L30 46', 'M50 46 L74 88'],
  B: [
    'M30 12 L30 88',
    'M30 12 L54 12 C 70 12 70 44 54 44 L30 44',
    'M30 44 L56 44 C 74 44 74 88 56 88 L30 88',
  ],
  C: ['M72 26 C 62 12 28 12 24 44 C 20 76 60 94 74 74'],
  H: ['M28 12 L28 88', 'M72 12 L72 88', 'M28 50 L72 50'],
  Y: ['M26 12 L50 50', 'M74 12 L50 50', 'M50 50 L50 88'],
  F: ['M30 12 L30 88', 'M30 12 L72 12', 'M30 48 L62 48'],
  G: ['M72 26 C 62 12 28 12 24 44 C 20 76 60 94 74 72 L74 54 L56 54'],
  W: ['M20 12 L34 88', 'M34 88 L50 40', 'M50 40 L66 88', 'M66 88 L80 12'],
  X: ['M26 12 L74 88', 'M74 12 L26 88'],
  Q: ['M50 12 C 32 12 22 30 22 50 C 22 70 32 88 50 88 C 68 88 78 70 78 50 C 78 30 68 12 50 12 Z', 'M58 66 L80 92'],

  /* ------------------------------------------------------------------ čísla */
  '0': ['M50 12 C 32 12 22 30 22 50 C 22 70 32 88 50 88 C 68 88 78 70 78 50 C 78 30 68 12 50 12 Z'],
  '1': ['M34 26 L50 12', 'M50 12 L50 88'],
  '2': ['M28 26 C 32 10 70 8 72 28 C 74 46 34 60 26 88', 'M26 88 L74 88'],
  '3': [
    'M28 22 C 36 8 70 10 70 28 C 70 42 52 46 44 46',
    'M44 46 C 54 46 74 50 74 66 C 74 88 36 92 26 76',
  ],
  '4': ['M62 12 L22 64', 'M22 64 L76 64', 'M62 12 L62 88'],
  '5': ['M70 12 L34 12', 'M34 12 L30 44 C 44 36 72 40 72 62 C 72 86 38 92 26 78'],
  '6': ['M68 16 C 52 8 30 22 28 52 C 26 78 44 90 56 88 C 72 86 76 66 66 58 C 54 48 34 54 30 66'],
  '7': ['M26 12 L74 12', 'M74 12 L44 88'],
  '8': [
    'M50 46 C 32 46 26 34 30 24 C 34 12 66 12 70 24 C 74 34 68 46 50 46',
    'M50 46 C 30 46 24 60 28 72 C 32 88 68 88 72 72 C 76 60 70 46 50 46',
  ],
  '9': ['M32 84 C 48 92 70 78 72 48 C 74 22 56 10 44 12 C 28 14 24 34 34 42 C 46 52 66 46 70 34'],
};

/** Písmena s háčkem: základ se stlačí a nad něj přijde háček. */
const CARONED: Record<string, string> = { Č: 'C', Ř: 'R', Š: 'S', Ž: 'Z' };

/** Tahy jednoho znaku. U neznámého znaku vrátí prázdné pole. */
export function strokesFor(glyph: string): Stroke[] {
  const base = BASE[glyph];
  if (base) return base.map((d) => ({ d }));

  const caroned = CARONED[glyph];
  if (caroned) {
    const inner = BASE[caroned] ?? [];
    return [...inner.map((d) => ({ d, transform: UNDER_CARON })), CARON];
  }

  return [];
}

/**
 * Tahy celého nápisu, každý znak ve vlastním čtverci vedle sebe.
 *
 * Používá se u čísel nad devět a u CH: obtahuje se znak po znaku zleva
 * doprava, tedy přesně tak, jak se to píše.
 */
export interface PlacedStroke extends Stroke {
  /** Posun ve vodorovném směru, v jednotkách čtverce 100. */
  readonly offsetX: number;
}

export function strokesForText(text: string): { strokes: PlacedStroke[]; width: number } {
  const chars = [...text];
  const strokes: PlacedStroke[] = [];

  chars.forEach((char, index) => {
    for (const stroke of strokesFor(char)) {
      strokes.push({ ...stroke, offsetX: index * 100 });
    }
  });

  return { strokes, width: chars.length * 100 };
}

/** Znaky, pro které tahy zatím nemáme. Hlídá to test. */
export function missingStrokes(glyphs: readonly string[]): string[] {
  return glyphs.filter((g) => [...g].some((char) => strokesFor(char).length === 0));
}
