/**
 * Hodinářská dílna.
 *
 * Interiér, ne krajina — to je proti oběma ostatním světům hlavní rozdíl.
 * Světlo je z jediné lampy nad ponkem a všechno ostatní je v teplém šeru.
 * Za sklem se točí soukolí, každé svým tempem, takže scéna se hýbe
 * pořád, ale nikam nespěchá.
 *
 * Mosaz, ořech a smaltová zeleň. Žádná plocha není čistá: dřevo má léta,
 * mosaz má patinu, smalt má odražené hrany.
 */

interface Layer {
  x: number;
  y: number;
}

export function WorkshopScene({ p, breath }: { p: Layer; breath: number }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
    >
      <defs>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#241812" />
          <stop offset="55%" stopColor="#3A2A1E" />
          <stop offset="100%" stopColor="#2A1D14" />
        </linearGradient>
        <radialGradient id="lampPool" cx="46%" cy="20%" r="70%">
          <stop offset="0%" stopColor="#F6D68E" stopOpacity="0.4" />
          <stop offset="60%" stopColor="#D9A441" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#D9A441" stopOpacity="0" />
        </radialGradient>
        <pattern id="grainWood" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M0 5 H10" stroke="#1B120C" strokeWidth="0.7" opacity="0.2" />
        </pattern>
      </defs>

      <rect width="1200" height="800" fill="url(#wall)" />
      <rect width="1200" height="800" fill="url(#grainWood)" />

      {/* prkna na stěně */}
      {Array.from({ length: 8 }, (_, i) => (
        <line key={i} x1="0" y1={i * 108 + 40} x2="1200" y2={i * 108 + 40} stroke="#1B120C" strokeWidth="2.5" opacity="0.45" />
      ))}

      {/* soukolí za sklem — hlavní pohyb scény */}
      <g transform={`translate(${p.x * -8} ${p.y * -4 + breath * 2})`} opacity="0.55">
        <Gear cx={150} cy={250} r={104} teeth={16} dur={46} fill="#5E4718" />
        <Gear cx={292} cy={168} r={64} teeth={12} dur={-28} fill="#6E5220" />
        <Gear cx={1064} cy={222} r={118} teeth={18} dur={54} fill="#5E4718" />
        <Gear cx={922} cy={140} r={56} teeth={11} dur={-24} fill="#6E5220" />
      </g>

      {/* police s nářadím */}
      <g transform={`translate(${p.x * -16} ${p.y * -7})`}>
        <rect x="120" y="470" width="420" height="14" fill="#54402A" />
        <rect x="120" y="470" width="420" height="14" fill="url(#grainWood)" />
        <Jar x={168} y={470} h={62} w={44} fill="#2C5E4F" />
        <Jar x={228} y={470} h={48} w={38} fill="#8A3F35" />
        <Jar x={282} y={470} h={70} w={40} fill="#54402A" />
        <Tool x={360} y={470} />
        <Tool x={396} y={470} flip />
        <Jar x={452} y={470} h={54} w={46} fill="#2C5E4F" />

        <rect x="700" y="516" width="380" height="14" fill="#54402A" />
        <Jar x={744} y={516} h={56} w={42} fill="#8A3F35" />
        <Jar x={800} y={516} h={72} w={38} fill="#2C5E4F" />
        <Tool x={868} y={516} />
        <Jar x={920} y={516} h={50} w={44} fill="#54402A" />
      </g>

      {/* zavěšená lampa */}
      <g transform={`translate(${p.x * -22} 0)`}>
        <line x1="600" y1="0" x2="600" y2="86" stroke="#2A1D14" strokeWidth="5" />
        <path d="M528 92 H672 L636 150 H564 Z" fill="#2C5E4F" />
        <path d="M528 92 H672 L664 104 H536 Z" fill="#23483C" />
        <ellipse cx="600" cy="152" rx="36" ry="10" fill="#F6D68E" />
      </g>
      <ellipse cx="600" cy="300" rx="560" ry="360" fill="url(#lampPool)" />

      {/* ponk */}
      <g transform={`translate(0 ${p.y * -3})`}>
        <rect y="620" width="1200" height="200" fill="#5A4429" />
        <rect y="620" width="1200" height="200" fill="url(#grainWood)" />
        <rect y="612" width="1200" height="16" fill="#75592F" />
        <rect y="628" width="1200" height="5" fill="#8B6A3A" opacity="0.5" />
        {/* stopy po práci */}
        <path d="M120 690 q 60 -10 120 2" stroke="#4A371F" strokeWidth="3" fill="none" opacity="0.7" />
        <path d="M880 712 q 80 -12 150 4" stroke="#4A371F" strokeWidth="3" fill="none" opacity="0.6" />
        <circle cx="300" cy="726" r="16" fill="#4A371F" opacity="0.5" />
        {/* hrnek a smaltovaná plechovka na ponku, ať dřevo není prázdné */}
        <g>
          <rect x="196" y="658" width="56" height="62" rx="6" fill="#B0413A" />
          <rect x="196" y="658" width="56" height="12" rx="5" fill="#8A2F29" />
          <path d="M252 674 q 24 14 0 30" stroke="#B0413A" strokeWidth="8" fill="none" />
          <rect x="960" y="648" width="74" height="72" rx="5" fill="#2C5E4F" />
          <rect x="960" y="648" width="74" height="14" rx="4" fill="#23483C" />
          <rect x="972" y="672" width="50" height="28" rx="3" fill="#F1E3BE" opacity="0.85" />
          <rect x="1058" y="668" width="38" height="52" rx="4" fill="#75592F" />
        </g>
      </g>
    </svg>
  );
}

/** Ozubené kolo. Zuby jsou skutečné výřezy, ne obrys — proto je vidět i potmě. */
function Gear({ cx, cy, r, teeth, dur, fill }: { cx: number; cy: number; r: number; teeth: number; dur: number; fill: string }) {
  const toothH = r * 0.17;
  const paths = Array.from({ length: teeth }, (_, i) => {
    const a = (i / teeth) * Math.PI * 2;
    const w = (Math.PI / teeth) * 0.62;
    const pts = [
      [cx + Math.cos(a - w) * r, cy + Math.sin(a - w) * r],
      [cx + Math.cos(a - w * 0.62) * (r + toothH), cy + Math.sin(a - w * 0.62) * (r + toothH)],
      [cx + Math.cos(a + w * 0.62) * (r + toothH), cy + Math.sin(a + w * 0.62) * (r + toothH)],
      [cx + Math.cos(a + w) * r, cy + Math.sin(a + w) * r],
    ];
    return `M${pts.map((pt) => pt.map((n) => n.toFixed(1)).join(' ')).join(' L')} Z`;
  }).join(' ');

  return (
    <g>
      <animateTransform
        attributeName="transform"
        type="rotate"
        from={`0 ${cx} ${cy}`}
        to={`${dur > 0 ? 360 : -360} ${cx} ${cy}`}
        dur={`${Math.abs(dur)}s`}
        repeatCount="indefinite"
      />
      <circle cx={cx} cy={cy} r={r} fill={fill} />
      <path d={paths} fill={fill} />
      <circle cx={cx} cy={cy} r={r * 0.68} fill="#2A1D14" />
      <circle cx={cx} cy={cy} r={r * 0.2} fill={fill} />
      {Array.from({ length: 5 }, (_, i) => {
        const a = (i / 5) * Math.PI * 2;
        return (
          <line
            key={i}
            x1={cx + Math.cos(a) * r * 0.22}
            y1={cy + Math.sin(a) * r * 0.22}
            x2={cx + Math.cos(a) * r * 0.66}
            y2={cy + Math.sin(a) * r * 0.66}
            stroke={fill}
            strokeWidth={r * 0.1}
          />
        );
      })}
    </g>
  );
}

function Jar({ x, y, w, h, fill }: { x: number; y: number; w: number; h: number; fill: string }) {
  return (
    <g>
      <rect x={x} y={y - h} width={w} height={h} rx="4" fill={fill} />
      <rect x={x + 3} y={y - h + 5} width={w * 0.24} height={h * 0.6} rx="3" fill="#F6D68E" opacity="0.14" />
      <rect x={x - 3} y={y - h - 7} width={w + 6} height={9} rx="3" fill="#75592F" />
    </g>
  );
}

function Tool({ x, y, flip }: { x: number; y: number; flip?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) ${flip ? 'scale(-1 1)' : ''}`}>
      <path d="M0 0 V-74" stroke="#9A7B3E" strokeWidth="5" strokeLinecap="round" />
      <path d="M-9 -74 h18 v-16 h-18 Z" fill="#8A6A2A" />
      <circle cx="0" cy="-6" r="6" fill="#75592F" />
    </g>
  );
}
