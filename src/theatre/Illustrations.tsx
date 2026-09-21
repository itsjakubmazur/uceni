/**
 * Obrázky ke slovům.
 *
 * Všechno jsou vystřihovánky ve stylu světa: ploché tvary z palety divadla,
 * pár barev na obrázek, tmavé linky jen tam, kde bez nich tvar nedrží.
 * Žádné přechody, žádné stíny — hloubku dělá překryv vrstev, ne rozmazání.
 *
 * Každý obrázek se vejde do čtverce 100 × 100 a je čitelný i na ploše
 * velké jako palec, protože přesně tak velký bude v úloze na telefonu.
 */

const INK = '#241C16';
const PAPER = '#F3E5CA';

import type { ReactElement } from 'react';

type Illo = () => ReactElement;

/* ------------------------------------------------------------------ zvířata */

const pes: Illo = () => (
  <>
    <ellipse cx="44" cy="64" rx="28" ry="20" fill="#B0392B" />
    <circle cx="72" cy="46" r="20" fill="#C2503F" />
    <path d="M56 34 q -14 -8 -14 10 q 0 16 12 14 Z" fill="#8E2C21" />
    <path d="M88 34 q 14 -8 14 10 q 0 16 -12 14 Z" fill="#8E2C21" />
    <circle cx="66" cy="44" r="3.5" fill={INK} />
    <circle cx="80" cy="44" r="3.5" fill={INK} />
    <ellipse cx="74" cy="56" rx="7" ry="5" fill={INK} />
    <path d="M18 76 q -10 8 -2 14" stroke="#B0392B" strokeWidth="7" fill="none" strokeLinecap="round" />
    <rect x="30" y="78" width="9" height="16" rx="4" fill="#8E2C21" />
    <rect x="52" y="78" width="9" height="16" rx="4" fill="#8E2C21" />
  </>
);

const kocka: Illo = () => (
  <>
    <ellipse cx="50" cy="70" rx="24" ry="22" fill="#5C4429" />
    <circle cx="50" cy="40" r="22" fill="#7A5C3B" />
    <path d="M32 26 L30 6 L48 20 Z" fill="#5C4429" />
    <path d="M68 26 L70 6 L52 20 Z" fill="#5C4429" />
    <ellipse cx="42" cy="38" rx="4" ry="6" fill="#2F6B62" />
    <ellipse cx="58" cy="38" rx="4" ry="6" fill="#2F6B62" />
    <path d="M46 48 q 4 5 8 0" stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <path d="M22 44 H8 M22 50 H8 M78 44 H92 M78 50 H92" stroke={INK} strokeWidth="2" strokeLinecap="round" />
    <path d="M74 76 q 18 4 14 -18" stroke="#5C4429" strokeWidth="8" fill="none" strokeLinecap="round" />
  </>
);

const lev: Illo = () => (
  <>
    <circle cx="50" cy="48" r="34" fill="#D69C36" />
    {Array.from({ length: 14 }, (_, i) => {
      const a = (i / 14) * Math.PI * 2;
      return (
        <ellipse
          key={i}
          cx={50 + Math.cos(a) * 34}
          cy={48 + Math.sin(a) * 34}
          rx="9"
          ry="13"
          fill="#B0392B"
          transform={`rotate(${(a * 180) / Math.PI + 90} ${50 + Math.cos(a) * 34} ${48 + Math.sin(a) * 34})`}
        />
      );
    })}
    <circle cx="50" cy="48" r="26" fill="#E8B657" />
    <circle cx="41" cy="44" r="3.5" fill={INK} />
    <circle cx="59" cy="44" r="3.5" fill={INK} />
    <path d="M44 56 q 6 6 12 0" stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <ellipse cx="50" cy="54" rx="5" ry="3.5" fill={INK} />
  </>
);

const sova: Illo = () => (
  <>
    <ellipse cx="50" cy="56" rx="30" ry="34" fill="#7A5C3B" />
    <ellipse cx="50" cy="62" rx="20" ry="24" fill="#D69C36" />
    <path d="M24 30 L30 12 L44 26 Z" fill="#5C4429" />
    <path d="M76 30 L70 12 L56 26 Z" fill="#5C4429" />
    <circle cx="38" cy="42" r="12" fill={PAPER} />
    <circle cx="62" cy="42" r="12" fill={PAPER} />
    <circle cx="38" cy="42" r="6" fill={INK} />
    <circle cx="62" cy="42" r="6" fill={INK} />
    <path d="M50 50 L44 60 L56 60 Z" fill="#B0392B" />
    <path d="M38 90 h10 M52 90 h10" stroke="#B0392B" strokeWidth="5" strokeLinecap="round" />
  </>
);

const tygr: Illo = () => (
  <>
    <ellipse cx="50" cy="56" rx="32" ry="30" fill="#D69C36" />
    <path d="M22 34 L20 14 L38 28 Z" fill="#B0392B" />
    <path d="M78 34 L80 14 L62 28 Z" fill="#B0392B" />
    <path d="M30 34 q 6 12 2 24 M70 34 q -6 12 -2 24 M50 26 v12" stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" />
    <ellipse cx="50" cy="62" rx="18" ry="14" fill={PAPER} />
    <circle cx="40" cy="48" r="4" fill={INK} />
    <circle cx="60" cy="48" r="4" fill={INK} />
    <path d="M50 58 L44 64 h12 Z" fill="#B0392B" />
    <path d="M50 64 q -6 8 -12 4 M50 64 q 6 8 12 4" stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round" />
  </>
);

const zebra: Illo = () => (
  <>
    <ellipse cx="46" cy="56" rx="30" ry="20" fill={PAPER} />
    <path d="M30 40 q 0 32 2 32 M44 36 q -2 36 0 38 M58 38 q 2 34 0 34" stroke={INK} strokeWidth="6" fill="none" />
    <path d="M70 38 q 14 -6 18 -22 l 10 4 q -4 20 -18 28 Z" fill={PAPER} />
    <path d="M80 26 l -4 -16 l 8 6 Z" fill={INK} />
    <path d="M88 20 l 2 -14 l 6 10 Z" fill={INK} />
    <circle cx="86" cy="26" r="3" fill={INK} />
    <rect x="28" y="72" width="8" height="22" rx="3" fill={PAPER} />
    <rect x="56" y="72" width="8" height="22" rx="3" fill={PAPER} />
    <rect x="28" y="84" width="8" height="8" fill={INK} />
    <rect x="56" y="84" width="8" height="8" fill={INK} />
  </>
);

const ryba: Illo = () => (
  <>
    <path d="M18 50 q 22 -26 48 0 q -22 26 -48 0 Z" fill="#2F6B62" />
    <path d="M66 50 l 20 -16 v32 Z" fill="#24564F" />
    <path d="M38 34 q 6 -14 14 -8" stroke="#24564F" strokeWidth="5" fill="none" strokeLinecap="round" />
    <circle cx="30" cy="46" r="4" fill={PAPER} />
    <circle cx="30" cy="46" r="2" fill={INK} />
    <path d="M42 40 q 6 10 0 20 M52 38 q 6 12 0 24" stroke="#24564F" strokeWidth="3" fill="none" />
    <circle cx="20" cy="30" r="4" fill="#7FA8A0" opacity="0.7" />
    <circle cx="30" cy="20" r="3" fill="#7FA8A0" opacity="0.6" />
  </>
);

const had: Illo = () => (
  <>
    <path
      d="M16 82 q 20 -10 18 -24 q -2 -16 16 -18 q 20 -2 20 -14"
      stroke="#2F6B62"
      strokeWidth="16"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M16 82 q 20 -10 18 -24 q -2 -16 16 -18 q 20 -2 20 -14"
      stroke="#3E7D63"
      strokeWidth="6"
      fill="none"
      strokeDasharray="6 10"
      strokeLinecap="round"
    />
    <circle cx="70" cy="26" r="12" fill="#2F6B62" />
    <circle cx="66" cy="22" r="3" fill={INK} />
    <circle cx="76" cy="24" r="3" fill={INK} />
    <path d="M78 32 l 14 6 l -8 2 l 8 4" stroke="#B0392B" strokeWidth="3" fill="none" strokeLinecap="round" />
  </>
);

const zaba: Illo = () => (
  <>
    <ellipse cx="50" cy="62" rx="32" ry="26" fill="#3E7D63" />
    <circle cx="34" cy="34" r="14" fill="#3E7D63" />
    <circle cx="66" cy="34" r="14" fill="#3E7D63" />
    <circle cx="34" cy="32" r="7" fill={PAPER} />
    <circle cx="66" cy="32" r="7" fill={PAPER} />
    <circle cx="34" cy="32" r="3.5" fill={INK} />
    <circle cx="66" cy="32" r="3.5" fill={INK} />
    <path d="M34 66 q 16 12 32 0" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M18 78 q -10 10 0 12 M82 78 q 10 10 0 12" stroke="#2F6B62" strokeWidth="9" fill="none" strokeLinecap="round" />
  </>
);

const gorila: Illo = () => (
  <>
    <ellipse cx="50" cy="66" rx="32" ry="26" fill="#3B2A20" />
    <ellipse cx="50" cy="70" rx="20" ry="18" fill="#5C4429" />
    <circle cx="50" cy="36" r="24" fill="#3B2A20" />
    <circle cx="26" cy="36" r="8" fill="#3B2A20" />
    <circle cx="74" cy="36" r="8" fill="#3B2A20" />
    <ellipse cx="50" cy="42" rx="16" ry="13" fill="#5C4429" />
    <circle cx="43" cy="32" r="3.5" fill={PAPER} />
    <circle cx="57" cy="32" r="3.5" fill={PAPER} />
    <ellipse cx="46" cy="42" rx="2.5" ry="3" fill={INK} />
    <ellipse cx="54" cy="42" rx="2.5" ry="3" fill={INK} />
    <path d="M42 50 q 8 5 16 0" stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round" />
  </>
);

const mys: Illo = () => (
  <>
    <ellipse cx="46" cy="62" rx="28" ry="20" fill="#8B7355" />
    <circle cx="30" cy="40" r="14" fill="#A08C6A" />
    <circle cx="62" cy="40" r="14" fill="#A08C6A" />
    <circle cx="30" cy="40" r="7" fill="#C9A5A0" />
    <circle cx="62" cy="40" r="7" fill="#C9A5A0" />
    <circle cx="46" cy="58" r="16" fill="#A08C6A" />
    <circle cx="40" cy="54" r="3" fill={INK} />
    <circle cx="52" cy="54" r="3" fill={INK} />
    <ellipse cx="46" cy="64" rx="4" ry="3" fill="#B0392B" />
    <path d="M40 66 H26 M40 70 H28 M52 66 H66 M52 70 H64" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
    <path d="M74 66 q 18 2 14 -18" stroke="#8B7355" strokeWidth="5" fill="none" strokeLinecap="round" />
  </>
);

const chobotnice: Illo = () => (
  <>
    <ellipse cx="50" cy="40" rx="28" ry="26" fill="#B0392B" />
    {[22, 34, 50, 66, 78].map((x, i) => (
      <path
        key={x}
        d={`M${x} 60 q ${i % 2 ? -10 : 10} 18 ${i % 2 ? -6 : 6} 32`}
        stroke="#C2503F"
        strokeWidth="9"
        fill="none"
        strokeLinecap="round"
      />
    ))}
    <circle cx="40" cy="36" r="8" fill={PAPER} />
    <circle cx="62" cy="36" r="8" fill={PAPER} />
    <circle cx="40" cy="37" r="4" fill={INK} />
    <circle cx="62" cy="37" r="4" fill={INK} />
    <path d="M44 52 q 6 5 12 0" stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round" />
  </>
);

const snek: Illo = () => (
  <>
    <path d="M14 80 q 6 -14 26 -12 q 10 1 14 6" stroke="#D69C36" strokeWidth="12" fill="none" strokeLinecap="round" />
    <circle cx="62" cy="54" r="26" fill="#8B6A45" />
    <path
      d="M62 54 m 0 -18 a 18 18 0 1 1 -12 31 a 12 12 0 1 1 10 -20 a 6 6 0 1 0 -4 10"
      stroke="#5C4429"
      strokeWidth="5"
      fill="none"
      strokeLinecap="round"
    />
    <path d="M20 68 q -2 -16 4 -22 M28 68 q 4 -18 12 -22" stroke="#D69C36" strokeWidth="4" fill="none" strokeLinecap="round" />
    <circle cx="24" cy="44" r="4" fill={INK} />
    <circle cx="41" cy="44" r="4" fill={INK} />
  </>
);

const cert: Illo = () => (
  <>
    <ellipse cx="50" cy="66" rx="24" ry="26" fill="#3B2A20" />
    <circle cx="50" cy="38" r="22" fill="#B0392B" />
    <path d="M32 22 L26 4 L44 16 Z" fill="#3B2A20" />
    <path d="M68 22 L74 4 L56 16 Z" fill="#3B2A20" />
    <circle cx="42" cy="36" r="3.5" fill={INK} />
    <circle cx="58" cy="36" r="3.5" fill={INK} />
    <path d="M40 48 q 10 8 20 0" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M74 70 q 16 6 10 22" stroke="#3B2A20" strokeWidth="6" fill="none" strokeLinecap="round" />
    <path d="M84 92 l 8 6 l -10 2 Z" fill="#3B2A20" />
  </>
);

const andel: Illo = () => (
  <>
    <path d="M28 54 q -22 -6 -20 -26 q 16 4 24 18 Z" fill={PAPER} />
    <path d="M72 54 q 22 -6 20 -26 q -16 4 -24 18 Z" fill={PAPER} />
    <path d="M50 44 L74 92 H26 Z" fill="#E8D7B0" />
    <circle cx="50" cy="34" r="16" fill="#F3E5CA" />
    <circle cx="44" cy="32" r="2.8" fill={INK} />
    <circle cx="56" cy="32" r="2.8" fill={INK} />
    <path d="M45 40 q 5 4 10 0" stroke={INK} strokeWidth="2.2" fill="none" strokeLinecap="round" />
    <ellipse cx="50" cy="14" rx="13" ry="4" fill="none" stroke="#D69C36" strokeWidth="4" />
  </>
);

const mikulas: Illo = () => (
  <>
    <path d="M50 44 L76 92 H24 Z" fill="#2F6B62" />
    <path d="M50 44 L62 92 H38 Z" fill="#24564F" />
    <circle cx="50" cy="32" r="18" fill="#F3E5CA" />
    <path d="M30 24 q 6 -20 20 -20 q 14 0 20 20 q -14 -8 -20 0 q -6 -8 -20 0 Z" fill="#6E4A2E" />
    <path d="M28 22 L50 2 L72 22 Z" fill="#B0392B" />
    <path d="M24 22 H76 L72 30 H28 Z" fill="#8E2C21" />
    <circle cx="43" cy="32" r="3" fill={INK} />
    <circle cx="57" cy="32" r="3" fill={INK} />
    <ellipse cx="36" cy="38" rx="4.5" ry="3" fill="#B0392B" opacity="0.32" />
    <ellipse cx="64" cy="38" rx="4.5" ry="3" fill="#B0392B" opacity="0.32" />
    <path d="M45 40 q 5 5 10 0" stroke={INK} strokeWidth="2.2" fill="none" strokeLinecap="round" />
  </>
);

/* -------------------------------------------------------------------- věci */

const emental: Illo = () => (
  <>
    <path d="M12 72 L12 44 L62 20 L92 34 L92 62 L46 86 Z" fill="#E8B657" />
    <path d="M12 44 L62 20 L92 34 L46 58 Z" fill="#F5CE7E" />
    <circle cx="34" cy="62" r="7" fill="#C98E33" />
    <circle cx="58" cy="70" r="5" fill="#C98E33" />
    <circle cx="74" cy="52" r="6" fill="#C98E33" />
    <circle cx="48" cy="44" r="5" fill="#D9A441" />
    <circle cx="70" cy="36" r="4" fill="#D9A441" />
  </>
);

const oko: Illo = () => (
  <>
    <path d="M8 50 q 42 -34 84 0 q -42 34 -84 0 Z" fill={PAPER} stroke={INK} strokeWidth="3" />
    <circle cx="50" cy="50" r="18" fill="#2F6B62" />
    <circle cx="50" cy="50" r="8" fill={INK} />
    <circle cx="56" cy="44" r="4" fill={PAPER} />
    <path d="M12 42 q 38 -28 76 0" stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" />
  </>
);

const ucho: Illo = () => (
  <>
    <path
      d="M64 12 q -32 -6 -36 30 q -2 24 10 34 q 10 8 12 -6 q 2 -12 12 -14 q 16 -4 16 -20 q 0 -20 -14 -24 Z"
      fill="#F3E5CA"
      stroke={INK}
      strokeWidth="3"
    />
    <path d="M60 34 q -14 2 -12 18 q 1 10 8 10" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
    <ellipse cx="42" cy="34" rx="5" ry="4" fill="#B0392B" opacity="0.25" />
  </>
);

const nos: Illo = () => (
  <>
    <path
      d="M50 8 q -6 24 -14 38 q -8 14 2 20 q 6 4 12 0 q 6 4 12 0 q 10 -6 2 -20 q -8 -14 -14 -38 Z"
      fill="#F3E5CA"
      stroke={INK}
      strokeWidth="3"
    />
    <ellipse cx="38" cy="64" rx="5" ry="4" fill={INK} />
    <ellipse cx="62" cy="64" rx="5" ry="4" fill={INK} />
    <path d="M32 78 q 18 10 36 0" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
  </>
);

const iglu: Illo = () => (
  <>
    <path d="M8 74 a 42 42 0 0 1 84 0 Z" fill={PAPER} />
    <path d="M8 74 a 42 42 0 0 1 84 0" fill="none" stroke={INK} strokeWidth="3" />
    <path d="M14 58 h72 M22 44 h56" stroke="#C3A377" strokeWidth="2.5" />
    <path d="M34 74 v -16 M50 58 v -14 M66 74 v -16" stroke="#C3A377" strokeWidth="2.5" />
    <path d="M38 74 a 12 14 0 0 1 24 0 Z" fill="#7FA8A0" />
    <rect x="6" y="74" width="88" height="8" fill="#E2CCA4" />
  </>
);

const jablko: Illo = () => (
  <>
    <path d="M50 30 q -28 -8 -30 22 q -2 30 22 40 q 8 4 8 -2 q 0 6 8 2 q 24 -10 22 -40 q -2 -30 -30 -22 Z" fill="#B0392B" />
    <path d="M36 36 q -8 8 -6 20" stroke="#C2503F" strokeWidth="5" fill="none" strokeLinecap="round" />
    <path d="M50 30 q 2 -16 -6 -20" stroke="#5C4429" strokeWidth="5" fill="none" strokeLinecap="round" />
    <path d="M54 22 q 18 -12 22 2 q -14 10 -22 -2 Z" fill="#2F6B62" />
  </>
);

const banan: Illo = () => (
  <>
    <path d="M18 24 q 10 52 62 58 q 12 -6 8 -14 q -44 -6 -54 -48 Z" fill="#D69C36" />
    <path d="M18 24 q 10 52 62 58" stroke="#C98E33" strokeWidth="3" fill="none" />
    <path d="M14 18 q 6 -8 12 0 q -4 8 -12 6 Z" fill="#5C4429" />
    <path d="M86 68 q 10 4 6 12" stroke="#5C4429" strokeWidth="5" fill="none" strokeLinecap="round" />
  </>
);

const citron: Illo = () => (
  <>
    <ellipse cx="50" cy="52" rx="36" ry="26" fill="#E8B657" />
    <path d="M14 52 q -8 0 -8 -4 q 6 -2 8 4 Z" fill="#C98E33" />
    <path d="M86 52 q 8 0 8 -4 q -6 -2 -8 4 Z" fill="#C98E33" />
    <ellipse cx="50" cy="52" rx="36" ry="26" fill="none" stroke="#C98E33" strokeWidth="2.5" />
    <path d="M30 40 q 14 -6 28 0" stroke="#F5CE7E" strokeWidth="4" fill="none" strokeLinecap="round" />
    <path d="M52 26 q 12 -10 20 -2 q -12 8 -20 2 Z" fill="#2F6B62" />
  </>
);

const repa: Illo = () => (
  <>
    <path d="M50 34 q -26 4 -24 26 q 2 22 24 34 q 22 -12 24 -34 q 2 -22 -24 -26 Z" fill="#8E2C21" />
    <path d="M50 94 q 2 4 0 6" stroke="#8E2C21" strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M50 34 q -14 -24 -30 -24 q 4 20 24 26 Z" fill="#2F6B62" />
    <path d="M50 34 q 14 -24 30 -24 q -4 20 -24 26 Z" fill="#3E7D63" />
    <path d="M50 34 V 8" stroke="#2F6B62" strokeWidth="4" strokeLinecap="round" />
  </>
);

const dum: Illo = () => (
  <>
    <rect x="20" y="46" width="60" height="46" fill="#D69C36" />
    <path d="M10 46 L50 14 L90 46 Z" fill="#8E2C21" />
    <rect x="30" y="58" width="16" height="16" fill="#F7C86B" stroke={INK} strokeWidth="2.5" />
    <rect x="56" y="58" width="16" height="16" fill="#F7C86B" stroke={INK} strokeWidth="2.5" />
    <rect x="42" y="76" width="16" height="16" fill="#5C4429" />
    <rect x="64" y="20" width="10" height="18" fill="#B0392B" />
  </>
);

const vlak: Illo = () => (
  <>
    <rect x="8" y="52" width="40" height="26" rx="4" fill="#2F6B62" />
    <path d="M48 36 h26 v42 h-26 Z" fill="#B0392B" />
    <rect x="54" y="42" width="14" height="14" fill="#F7C86B" />
    <rect x="16" y="58" width="12" height="12" fill="#F7C86B" />
    <rect x="30" y="58" width="12" height="12" fill="#F7C86B" />
    <rect x="52" y="24" width="10" height="14" fill="#5C4429" />
    <circle cx="20" cy="82" r="8" fill={INK} />
    <circle cx="40" cy="82" r="8" fill={INK} />
    <circle cx="64" cy="82" r="8" fill={INK} />
    <rect x="4" y="90" width="92" height="5" fill="#5C4429" />
  </>
);

const fletna: Illo = () => (
  <>
    <rect x="42" y="8" width="16" height="84" rx="8" fill="#8B6A45" />
    <rect x="42" y="8" width="16" height="14" rx="7" fill="#5C4429" />
    <rect x="40" y="26" width="20" height="6" rx="3" fill="#5C4429" />
    {[42, 54, 66, 78].map((y) => (
      <circle key={y} cx="50" cy={y} r="4" fill={INK} />
    ))}
    <path d="M58 18 q 10 -6 14 2" stroke="#D69C36" strokeWidth="3" fill="none" strokeLinecap="round" />
  </>
);

/* ------------------------------------------------------------------ registr */

const REGISTRY: Record<string, Illo> = {
  mikulas,
  andel,
  emental,
  lev,
  oko,
  pes,
  sova,
  ucho,
  iglu,
  tygr,
  jablko,
  vlak,
  kocka,
  dum,
  nos,
  zebra,
  ryba,
  banan,
  citron,
  had,
  mys,
  fletna,
  gorila,
  cert,
  repa,
  snek,
  zaba,
  chobotnice,
};

export function Illustration({ id, className = '' }: { id: string; className?: string }) {
  const Shape = REGISTRY[id];
  return (
    <svg viewBox="0 0 100 100" className={`h-full w-full ${className}`} aria-hidden>
      {Shape ? <Shape /> : <circle cx="50" cy="50" r="30" fill="#C3A377" />}
    </svg>
  );
}

export const hasIllustration = (id: string): boolean => id in REGISTRY;
export const illustrationIds = (): string[] => Object.keys(REGISTRY);
