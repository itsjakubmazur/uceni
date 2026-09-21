/**
 * Noční zahrada.
 *
 * Tma tu není prázdná: obloha má hvězdy, měsíc a přes všechno se táhnou
 * stébla, která se hýbou každé svým tempem. Světlo nese jediná barva —
 * jantarová — a všechno ostatní jsou tlumené zeleně. Díky tomu je každý
 * svítící bod ve scéně událost.
 *
 * Záměrně žádná modrofialová: noc se dá udělat i teple, v zeleni a okru,
 * a vypadá to pak jako zahrada, ne jako spořič obrazovky.
 */

interface Layer {
  x: number;
  y: number;
}

const FIREFLIES = [
  { x: 180, y: 250, d: 7.5, r: 46 },
  { x: 420, y: 170, d: 9.5, r: 60 },
  { x: 760, y: 214, d: 8.2, r: 38 },
  { x: 980, y: 300, d: 11, r: 54 },
  { x: 596, y: 330, d: 10.2, r: 44 },
  { x: 1108, y: 196, d: 8.8, r: 40 },
  { x: 300, y: 402, d: 12, r: 34 },
  { x: 860, y: 430, d: 9, r: 30 },
];

export function GardenScene({ p, breath }: { p: Layer; breath: number }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
    >
      <defs>
        <radialGradient id="moonGlow">
          <stop offset="0%" stopColor="#FFF0CE" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#FFF0CE" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="fly">
          <stop offset="0%" stopColor="#FFF3D2" stopOpacity="1" />
          <stop offset="28%" stopColor="#F4B942" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#F4B942" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="nightSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0B1712" />
          <stop offset="62%" stopColor="#14291F" />
          <stop offset="100%" stopColor="#1B3826" />
        </linearGradient>
      </defs>

      <rect width="1200" height="800" fill="url(#nightSky)" />

      {/* hvězdy */}
      <g fill="#FFF0CE">
        {STARS.map((s, i) => (
          <circle key={i} cx={s[0]} cy={s[1]} r={s[2]} opacity={s[3]} />
        ))}
      </g>

      {/* měsíc */}
      <g transform={`translate(${p.x * -4} ${p.y * -2 + breath * 1.2})`}>
        <circle cx="960" cy="140" r="150" fill="url(#moonGlow)" />
        <circle cx="960" cy="140" r="54" fill="#FBEDCC" />
        <circle cx="944" cy="128" r="9" fill="#E8D7AE" opacity="0.7" />
        <circle cx="974" cy="156" r="13" fill="#E8D7AE" opacity="0.55" />
        <circle cx="968" cy="118" r="6" fill="#E8D7AE" opacity="0.6" />
      </g>

      {/* vzdálený živý plot */}
      <g transform={`translate(${p.x * -10} ${p.y * -4 + breath * 2})`}>
        <path
          d="M-40 470 q 90 -58 180 -16 q 70 -60 156 -18 q 96 -64 190 -10 q 86 -56 176 -12 q 96 -60 196 -8 q 80 -44 182 -6 L1240 820 L-40 820 Z"
          fill="#12291D"
        />
      </g>

      {/* stébla vzadu */}
      <g transform={`translate(${p.x * -20} ${p.y * -7})`}>
        {BACK_STEMS.map((st, i) => (
          <Stem key={i} {...st} fill="#1B3B2A" delay={i * 0.6} />
        ))}
      </g>

      {/* světlušky */}
      {FIREFLIES.map((f, i) => (
        <g key={i} transform={`translate(${p.x * -14} ${p.y * -6})`}>
          <circle cx={f.x} cy={f.y} r={f.r} fill="url(#fly)" opacity="0.55">
            <animate
              attributeName="opacity"
              values="0.2;0.7;0.3;0.65;0.2"
              dur={`${f.d}s`}
              repeatCount="indefinite"
            />
            <animateTransform
              attributeName="transform"
              type="translate"
              values={`0 0; ${14 - i * 3} -${18 + i * 2}; -${10 + i} -${6 + i}; 0 0`}
              dur={`${f.d * 2}s`}
              repeatCount="indefinite"
            />
          </circle>
          <circle cx={f.x} cy={f.y} r="3.4" fill="#FFF6DE">
            <animate attributeName="opacity" values="0.4;1;0.5;1;0.4" dur={`${f.d}s`} repeatCount="indefinite" />
          </circle>
        </g>
      ))}

      {/* stébla vepředu */}
      <g transform={`translate(${p.x * -34} ${p.y * -12})`}>
        {FRONT_STEMS.map((st, i) => (
          <Stem key={i} {...st} fill="#24513F" delay={i * 0.45} />
        ))}
      </g>

      {/* země */}
      <g transform={`translate(0 ${p.y * -5})`}>
        <path d="M-40 690 q 180 -34 380 -12 q 220 24 420 -8 q 210 -32 480 -4 L1240 820 L-40 820Z" fill="#16301F" />
        <path d="M-40 706 q 180 -30 380 -10 q 220 22 420 -6 q 210 -28 480 -2 L1240 820 L-40 820Z" fill="#102418" />
      </g>

      {/* pěšina: světlejší pruh, po kterém vede cesta zvládnutých písmen */}
      <g transform={`translate(0 ${p.y * -5})`}>
        <path
          d="M-40 754 q 200 -26 400 -14 q 230 14 440 -10 q 210 -24 440 -2 L1240 820 L-40 820Z"
          fill="#1D3A26"
        />
        <path
          d="M-40 762 q 200 -24 400 -12 q 230 12 440 -8 q 210 -22 440 0"
          stroke="#2C6247"
          strokeWidth="2.5"
          fill="none"
          opacity="0.6"
        />
      </g>

      {/* velké listy v popředí, rámují obraz */}
      <g transform={`translate(${p.x * -52} ${p.y * -18})`}>
        <Leaf x={-30} y={800} rot={-24} s={1.5} />
        <Leaf x={86} y={824} rot={-8} s={1.15} />
        <Leaf x={1230} y={800} rot={24} s={1.5} flip />
        <Leaf x={1120} y={828} rot={9} s={1.1} flip />
      </g>
    </svg>
  );
}

/**
 * Stéblo trávy. Kreslí se jako plocha, která se směrem nahoru zužuje do
 * špičky — ne jako čára s kuličkou na konci, což vypadá jako vatová tyčinka.
 */
function Stem({ x, h, lean, fill, delay }: { x: number; h: number; lean: number; fill: string; delay: number }) {
  const top = 800 - h;
  const w = 7 + h / 80;
  return (
    <g>
      <path
        d={
          `M${x - w} 800 ` +
          `C ${x - w * 0.7} ${top + h * 0.5} ${x + lean * 0.6 - w * 0.3} ${top + h * 0.22} ${x + lean} ${top} ` +
          `C ${x + lean * 0.6 + w * 0.5} ${top + h * 0.24} ${x + w * 0.8} ${top + h * 0.52} ${x + w} 800 Z`
        }
        fill={fill}
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          values={`0 ${x} 800; ${lean > 0 ? 1.6 : -1.6} ${x} 800; 0 ${x} 800`}
          dur={`${7 + delay}s`}
          repeatCount="indefinite"
        />
      </path>
    </g>
  );
}

function Leaf({ x, y, rot, s, flip }: { x: number; y: number; rot: number; s: number; flip?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${flip ? -s : s} ${s})`}>
      <path d="M0 0 C -14 -130 46 -226 128 -262 C 96 -168 70 -74 22 8 Z" fill="#1E4230" />
      <path d="M0 0 C -6 -120 44 -212 120 -250" stroke="#2C6247" strokeWidth="3" fill="none" />
      {[0.25, 0.45, 0.65].map((t) => (
        <path
          key={t}
          d={`M${-4 + t * 30} ${-t * 230} q 26 -20 44 -12`}
          stroke="#2C6247"
          strokeWidth="2"
          fill="none"
          opacity="0.7"
        />
      ))}
    </g>
  );
}

const STARS: [number, number, number, number][] = [
  [88, 64, 1.8, 0.7], [246, 42, 1.4, 0.55], [372, 96, 2.1, 0.8], [468, 38, 1.5, 0.5],
  [556, 120, 1.7, 0.6], [640, 56, 2.2, 0.85], [742, 106, 1.4, 0.5], [824, 44, 1.8, 0.7],
  [930, 96, 1.5, 0.55], [1016, 40, 2, 0.75], [1104, 118, 1.6, 0.6], [1168, 62, 1.4, 0.5],
  [312, 168, 1.3, 0.45], [700, 172, 1.5, 0.5], [1052, 182, 1.3, 0.45], [148, 214, 1.2, 0.4],
];

const BACK_STEMS = [
  { x: 60, h: 240, lean: 18 }, { x: 140, h: 300, lean: -14 }, { x: 236, h: 258, lean: 22 },
  { x: 340, h: 320, lean: -18 }, { x: 452, h: 268, lean: 14 }, { x: 560, h: 310, lean: -20 },
  { x: 672, h: 250, lean: 18 }, { x: 790, h: 296, lean: -16 }, { x: 900, h: 262, lean: 20 },
  { x: 1010, h: 318, lean: -14 }, { x: 1120, h: 254, lean: 16 },
];

const FRONT_STEMS = [
  { x: 30, h: 390, lean: 26 }, { x: 190, h: 330, lean: -22 }, { x: 396, h: 360, lean: 24 },
  { x: 660, h: 342, lean: -26 }, { x: 900, h: 372, lean: 22 }, { x: 1080, h: 336, lean: -24 },
  { x: 1180, h: 398, lean: 18 },
];
