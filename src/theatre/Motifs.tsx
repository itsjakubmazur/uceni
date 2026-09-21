import type { Motif } from '../content/items.numbers.ts';

/**
 * Počítané předměty. Všechno jsou věci, které by v papírovém divadle
 * mohly viset nebo stát — ne abstraktní puntíky.
 *
 * `lit` je stav po klepnutí: předmět se rozsvítí a zůstane rozsvícený,
 * aby bylo pořád vidět, co už je spočítané.
 */
export function MotifShape({ motif, lit }: { motif: Motif; lit: boolean }) {
  const glow = lit ? 'var(--lamp-bright)' : undefined;

  switch (motif) {
    case 'lampa':
      return (
        <svg viewBox="0 0 100 120" className="h-full w-full">
          <line x1="50" y1="0" x2="50" y2="34" stroke="#3B2A20" strokeWidth="4" />
          <path d="M22 38 H78 L64 86 H36 Z" fill={lit ? '#D69C36' : '#7A5C3B'} />
          <ellipse cx="50" cy="88" rx="16" ry="8" fill={glow ?? '#4A3826'} />
          {lit && <circle cx="50" cy="88" r="22" fill="#F7C86B" opacity="0.32" />}
        </svg>
      );
    case 'hvezda':
      return (
        <svg viewBox="0 0 100 100" className="h-full w-full">
          <path
            d="M50 6 L61 38 L95 38 L67 58 L78 92 L50 71 L22 92 L33 58 L5 38 L39 38 Z"
            fill={lit ? '#FBDC9A' : '#8B6A45'}
            stroke="#3B2A20"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {lit && <circle cx="50" cy="52" r="30" fill="#F7C86B" opacity="0.28" />}
        </svg>
      );
    case 'ptak':
      return (
        <svg viewBox="0 0 110 90" className="h-full w-full">
          <ellipse cx="52" cy="52" rx="30" ry="24" fill={lit ? '#D69C36' : '#7A5C3B'} />
          <circle cx="76" cy="40" r="15" fill={lit ? '#E8B657' : '#8B6A45'} />
          <path d="M88 40 L106 46 L88 50 Z" fill="#B0392B" />
          <circle cx="80" cy="37" r="3" fill="#241C16" />
          <path d="M40 44 q 22 -14 34 6 q -20 12 -34 -6 Z" fill={lit ? '#FBDC9A' : '#5C4429'} />
          <path d="M24 56 L4 48 L22 66 Z" fill={lit ? '#D69C36' : '#7A5C3B'} />
          {lit && <circle cx="55" cy="50" r="28" fill="#F7C86B" opacity="0.26" />}
        </svg>
      );
    case 'list':
      return (
        <svg viewBox="0 0 90 110" className="h-full w-full">
          <path
            d="M45 104 C 6 74 8 26 45 4 C 82 26 84 74 45 104 Z"
            fill={lit ? '#5E9A72' : '#3E6B58'}
            stroke="#24564F"
            strokeWidth="2.5"
          />
          <path d="M45 100 V12" stroke="#24564F" strokeWidth="3" />
          {[26, 44, 62].map((y) => (
            <g key={y}>
              <path d={`M45 ${y} q -18 -6 -24 -18`} stroke="#24564F" strokeWidth="2" fill="none" />
              <path d={`M45 ${y} q 18 -6 24 -18`} stroke="#24564F" strokeWidth="2" fill="none" />
            </g>
          ))}
          {lit && <circle cx="45" cy="54" r="32" fill="#F7C86B" opacity="0.26" />}
        </svg>
      );
    case 'domek':
    default:
      return (
        <svg viewBox="0 0 110 110" className="h-full w-full">
          <rect x="18" y="46" width="74" height="58" fill={lit ? '#C2503F' : '#7A5C3B'} />
          <path d="M8 46 L55 10 L102 46 Z" fill="#3B2A20" />
          <rect x="34" y="62" width="20" height="22" fill={glow ?? '#4A3826'} />
          <rect x="62" y="62" width="20" height="22" fill={glow ?? '#4A3826'} />
          <rect x="34" y="62" width="20" height="22" fill="none" stroke="#3B2A20" strokeWidth="2.5" />
          <rect x="62" y="62" width="20" height="22" fill="none" stroke="#3B2A20" strokeWidth="2.5" />
          {lit && <circle cx="55" cy="70" r="34" fill="#F7C86B" opacity="0.24" />}
        </svg>
      );
  }
}

/**
 * Rozmístění počítaných předmětů.
 *
 * Do šesti se používá rozvržení jako na kostce — dítě si tím trénuje
 * subitizing, tedy rozpoznání počtu bez počítání. Nad šest jdou dvě řady
 * po pěti, aby se desítka dala vidět jako dvě pětky.
 */
export function layoutFor(count: number, dice: boolean): { x: number; y: number }[] {
  if (dice && count <= 6) return DICE[count] ?? [];
  const perRow = count <= 10 ? 5 : Math.ceil(count / 2);
  const rows = Math.ceil(count / perRow);
  const out: { x: number; y: number }[] = [];
  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / perRow);
    const col = i % perRow;
    const inRow = Math.min(perRow, count - row * perRow);
    out.push({
      x: (col + 0.5 - inRow / 2) * 1.15,
      y: (row + 0.5 - rows / 2) * 1.25,
    });
  }
  return out;
}

const DICE: Record<number, { x: number; y: number }[]> = {
  1: [{ x: 0, y: 0 }],
  2: [
    { x: -0.7, y: -0.7 },
    { x: 0.7, y: 0.7 },
  ],
  3: [
    { x: -0.9, y: -0.9 },
    { x: 0, y: 0 },
    { x: 0.9, y: 0.9 },
  ],
  4: [
    { x: -0.7, y: -0.7 },
    { x: 0.7, y: -0.7 },
    { x: -0.7, y: 0.7 },
    { x: 0.7, y: 0.7 },
  ],
  5: [
    { x: -0.9, y: -0.9 },
    { x: 0.9, y: -0.9 },
    { x: 0, y: 0 },
    { x: -0.9, y: 0.9 },
    { x: 0.9, y: 0.9 },
  ],
  6: [
    { x: -0.9, y: -0.95 },
    { x: 0.9, y: -0.95 },
    { x: -0.9, y: 0 },
    { x: 0.9, y: 0 },
    { x: -0.9, y: 0.95 },
    { x: 0.9, y: 0.95 },
  ],
};
