/**
 * Kulisy papírového divadla.
 *
 * Každá barevná plocha je vytištěná dvakrát: jednou o kousek posunutá
 * a světlejší. Tomu se v tisku říká špatný soutisk a ve starých dětských
 * knížkách to bylo všude. Tady je to schválně — právě díky tomu scéna
 * nevypadá jako vektor vygenerovaný počítačem.
 *
 * Vrstvy jsou papír zasunutý do drážek, takže každá vrhá na tu pod sebou
 * úzký stín. To dělá hloubku víc než jakýkoliv gradient.
 */

interface Layer {
  x: number;
  y: number;
}

export function PaperScene({ p, breath }: { p: Layer; breath: number }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
    >
      <defs>
        {/* Vlákno papíru: pár jemných linek, ne filtr přes celou plochu. */}
        <pattern id="fiber" width="7" height="7" patternUnits="userSpaceOnUse">
          <path d="M0 3.5 H7" stroke="#8C7150" strokeWidth="0.4" opacity="0.16" />
          <path d="M3.5 0 V7" stroke="#8C7150" strokeWidth="0.3" opacity="0.09" />
        </pattern>
        <linearGradient id="floorLight" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#F7C86B" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#F7C86B" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* ---------------------------------------------------------- obloha */}
      <rect width="1200" height="800" fill="#F3E5CA" />
      <rect width="1200" height="800" fill="url(#fiber)" />

      <g transform={`translate(${p.x * -5} ${p.y * -3 + breath * 1.5})`}>
        {/* slunce: dva kruhy mimo sebe, jako špatně padnoucí barva */}
        <g>
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return (
              <line
                key={i}
                x1={876 + Math.cos(a) * 96}
                y1={244 + Math.sin(a) * 96}
                x2={876 + Math.cos(a) * 126}
                y2={244 + Math.sin(a) * 126}
                stroke="#E8B657"
                strokeWidth="7"
                strokeLinecap="round"
                opacity="0.45"
              />
            );
          })}
          <circle cx="882" cy="250" r="82" fill="#E09A3C" opacity="0.45" />
          <circle cx="876" cy="244" r="82" fill="#F5CE7E" />
          <circle cx="876" cy="244" r="82" fill="none" stroke="#C98E33" strokeWidth="3" opacity="0.55" />
        </g>
        <Cloud x={420} y={330} s={0.92} />
        <Cloud x={660} y={210} s={0.62} />
        <Cloud x={1080} y={356} s={0.5} />
        <Birds x={560} y={300} />
        <Birds x={700} y={340} scale={0.66} />
      </g>

      {/* ------------------------------------------------------------ kopce */}
      <g transform={`translate(${p.x * -11} ${p.y * -5 + breath * 2.5})`}>
        <Hill d="M-40 392 Q 150 318 336 372 Q 520 424 700 360 Q 900 292 1240 366 L1240 820 L-40 820Z" fill="#7FA8A0" shift={5} />
      </g>
      <g transform={`translate(${p.x * -18} ${p.y * -8 + breath * 3.5})`}>
        <Hill d="M-40 462 Q 190 394 392 448 Q 600 502 812 440 Q 1010 384 1240 452 L1240 820 L-40 820Z" fill="#4E8177" shift={5} />
        <Village x={880} y={438} />
      </g>
      <g transform={`translate(${p.x * -26} ${p.y * -11 + breath * 5})`}>
        <Hill d="M-40 536 Q 210 470 424 522 Q 640 574 866 514 Q 1060 462 1240 528 L1240 820 L-40 820Z" fill="#2F6B62" shift={6} />
      </g>

      {/* ------------------------------------------------- stromy a domky */}
      <g transform={`translate(${p.x * -36} ${p.y * -14 + breath * 6})`}>
        <Tree x={84} y={614} h={272} fill="#24564F" />
        <Tree x={186} y={620} h={196} fill="#2F6B62" />
        <House x={258} y={618} w={126} h={116} body="#B0392B" roof="#3B2A20" />
        <Tree x={430} y={616} h={246} fill="#24564F" />
        <Tree x={596} y={620} h={186} fill="#35766B" />
        <House x={686} y={618} w={152} h={134} body="#D69C36" roof="#3B2A20" />
        <Tree x={886} y={614} h={264} fill="#2F6B62" />
        <Tree x={1002} y={620} h={198} fill="#24564F" />
        <Tree x={1118} y={616} h={240} fill="#2F6B62" />
      </g>

      {/* ------------------------------------------------------------ prkna */}
      <g transform={`translate(0 ${p.y * -4})`}>
        <rect y="604" width="1200" height="210" fill="#E2CCA4" />
        <rect y="604" width="1200" height="210" fill="url(#fiber)" />
        {Array.from({ length: 15 }, (_, i) => (
          <line
            key={i}
            x1={i * 86 - 10}
            y1="608"
            x2={i * 118 - 210}
            y2="816"
            stroke="#C3A377"
            strokeWidth="2"
            opacity="0.85"
          />
        ))}
        <rect y="598" width="1200" height="9" fill="#C3A377" />
        <rect y="700" width="1200" height="120" fill="url(#floorLight)" />
      </g>

      {/* ------------------------------------------------- boční kulisy */}
      <g transform={`translate(${p.x * -44} 0)`}>
        <Drape side="left" />
      </g>
      <g transform={`translate(${p.x * -44} 0)`}>
        <Drape side="right" />
      </g>

      {/* ------------------------------------------------------- sukno */}
      <Garland />
      <Valance />
    </svg>
  );
}

/** Papírová plocha vytištěná dvakrát — spodní o `shift` vedle a světlejší. */
function Hill({ d, fill, shift }: { d: string; fill: string; shift: number }) {
  return (
    <g>
      <path d={d} fill={fill} opacity="0.4" transform={`translate(${shift} ${-shift * 0.7})`} />
      <path d={d} fill={fill} />
      <path d={d} fill="url(#fiber)" />
      {/* úzký stín na vrstvu pod sebou */}
      <path d={d} fill="none" stroke="#1C3F3A" strokeWidth="2" opacity="0.22" />
    </g>
  );
}

function Tree({ x, y, h, fill }: { x: number; y: number; h: number; fill: string }) {
  const w = h * 0.58;
  return (
    <g>
      <rect x={x - 8} y={y - h * 0.26} width="16" height={h * 0.28} fill="#6B4A2C" />
      <g>
        <path d={`M${x + 4} ${y - h - 4} L${x + w / 2 + 4} ${y - h * 0.26} L${x - w / 2 + 4} ${y - h * 0.26} Z`} fill={fill} opacity="0.38" />
        <path d={`M${x} ${y - h} L${x + w / 2} ${y - h * 0.26} L${x - w / 2} ${y - h * 0.26} Z`} fill={fill} />
        <path
          d={`M${x} ${y - h * 0.84} L${x + w * 0.4} ${y - h * 0.1} L${x - w * 0.4} ${y - h * 0.1} Z`}
          fill="#12332E"
          opacity="0.18"
        />
      </g>
    </g>
  );
}

function House({ x, y, w, h, body, roof }: { x: number; y: number; w: number; h: number; body: string; roof: string }) {
  return (
    <g>
      <rect x={x + 5} y={y - h - 4} width={w} height={h} fill={body} opacity="0.38" />
      <rect x={x} y={y - h} width={w} height={h} fill={body} />
      <rect x={x} y={y - h} width={w} height={h} fill="url(#fiber)" />
      <path d={`M${x - 16} ${y - h} L${x + w / 2} ${y - h - 56} L${x + w + 16} ${y - h} Z`} fill={roof} />
      <rect x={x + w * 0.18} y={y - h * 0.74} width={w * 0.26} height={h * 0.32} fill="#F7C86B" />
      <rect x={x + w * 0.56} y={y - h * 0.74} width={w * 0.26} height={h * 0.32} fill="#F7C86B" />
      <rect x={x + w * 0.18} y={y - h * 0.74} width={w * 0.26} height={h * 0.32} fill="none" stroke="#3B2A20" strokeWidth="2.5" />
      <rect x={x + w * 0.56} y={y - h * 0.74} width={w * 0.26} height={h * 0.32} fill="none" stroke="#3B2A20" strokeWidth="2.5" />
    </g>
  );
}

function Village({ x, y }: { x: number; y: number }) {
  return (
    <g opacity="0.85">
      <rect x={x} y={y - 34} width="30" height="34" fill="#E8D0A8" />
      <path d={`M${x - 5} ${y - 34} L${x + 15} ${y - 52} L${x + 35} ${y - 34} Z`} fill="#8E4034" />
      <rect x={x + 40} y={y - 26} width="24" height="26" fill="#E8D0A8" />
      <path d={`M${x + 35} ${y - 26} L${x + 52} ${y - 41} L${x + 69} ${y - 26} Z`} fill="#8E4034" />
      <rect x={x - 38} y={y - 28} width="26" height="28" fill="#E8D0A8" />
      <path d={`M${x - 43} ${y - 28} L${x - 25} ${y - 45} L${x - 7} ${y - 28} Z`} fill="#8E4034" />
    </g>
  );
}

function Cloud({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path
        d="M0 0 q -34 0 -34 -26 q 0 -26 30 -24 q 6 -30 42 -28 q 34 2 40 30 q 30 -4 32 22 q 2 26 -32 26 Z"
        fill="#E3D3B2"
        opacity="0.55"
        transform="translate(6 5)"
      />
      <path
        d="M0 0 q -34 0 -34 -26 q 0 -26 30 -24 q 6 -30 42 -28 q 34 2 40 30 q 30 -4 32 22 q 2 26 -32 26 Z"
        fill="#FAF0DB"
      />
    </g>
  );
}

/** Papírová girlanda pod suknem — praporky střídají barvy divadla. */
function Garland() {
  const colors = ['#D69C36', '#2F6B62', '#B0392B', '#E3D3B2'];
  const flags = Array.from({ length: 15 }, (_, i) => {
    const x = 40 + i * 80;
    const sag = Math.sin((i / 14) * Math.PI) * 26;
    return (
      <g key={i} transform={`translate(${x} ${96 + sag})`}>
        <path d="M-26 0 L26 0 L0 52 Z" fill={colors[i % colors.length]} />
        <path d="M-26 0 L26 0 L0 52 Z" fill="url(#fiber)" />
      </g>
    );
  });
  return (
    <g>
      <path
        d="M40 96 Q 600 148 1160 96"
        stroke="#6E5234"
        strokeWidth="3"
        fill="none"
        opacity="0.75"
      />
      {flags}
    </g>
  );
}

function Birds({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} stroke="#3B2A20" strokeWidth="3" fill="none" opacity="0.5" strokeLinecap="round">
      <path d="M0 0 q 11 -9 22 0" />
      <path d="M32 16 q 9 -7 18 0" />
      <path d="M-24 22 q 8 -6 16 0" />
    </g>
  );
}

/** Drapérie po stranách: tři tóny a pár záhybů, ne plochý pruh. */
function Drape({ side }: { side: 'left' | 'right' }) {
  return (
    <g transform={side === 'right' ? 'translate(1200 0) scale(-1 1)' : undefined}>
      <path d="M0 0 H232 Q 196 210 224 430 Q 178 640 214 812 H0 Z" fill="#8E2C21" />
      <path d="M0 0 H178 Q 150 214 170 432 Q 138 652 160 812 H0 Z" fill="#7A241B" />
      <path d="M0 0 H104 Q 86 216 98 436 Q 76 656 90 812 H0 Z" fill="#631A14" />
      {/* záhyby */}
      <path d="M126 10 Q 108 220 124 440 Q 104 660 118 810" stroke="#4E120E" strokeWidth="3" fill="none" opacity="0.55" />
      <path d="M196 10 Q 172 220 190 440 Q 166 660 182 810" stroke="#4E120E" strokeWidth="2.5" fill="none" opacity="0.4" />
      {/* zlatá šňůra */}
      <path d="M214 372 q 34 26 8 62" stroke="#D69C36" strokeWidth="6" fill="none" strokeLinecap="round" />
      <circle cx="220" cy="442" r="11" fill="#D69C36" />
    </g>
  );
}

function Valance() {
  const scallops = Array.from({ length: 17 }, () => 'q -35.3 46 -70.6 0').join(' ');
  return (
    <g>
      <path d={`M0 0 H1200 V104 ${scallops} Z`} fill="#8E2C21" />
      <path d={`M0 0 H1200 V96 ${scallops} Z`} fill="#A63426" />
      <path d="M0 0 H1200 V30 H0 Z" fill="#631A14" />
      <path d="M0 34 H1200" stroke="#D69C36" strokeWidth="4" opacity="0.8" />
    </g>
  );
}
