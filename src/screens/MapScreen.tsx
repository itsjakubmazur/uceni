import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { NUMBERS } from '../content/items.numbers.ts';
import { LETTERS } from '../content/items.letters.ts';
import { director } from '../audio/director.ts';
import { sfx } from '../audio/sfx.ts';
import { say } from '../app/speechFor.ts';
import { Illustration } from '../theatre/Illustrations.tsx';
import { letterById } from '../content/items.letters.ts';
import type { EngineState, ItemId } from '../engine/types.ts';

/**
 * Mapa postupu — cesta divadlem.
 *
 * Nejsou tu body ani hvězdičky. Je tu jen cesta a na ní lampy: co Mikuláš
 * umí, to svítí, a svítí to napořád. Zhasnuté lampy nejsou trest, jsou to
 * místa, kam se ještě půjde.
 *
 * Mikulášovo M má vlastní místo hned na začátku cesty a vlastní tvar —
 * je to jeho lampa, ne jedna z řady.
 *
 * Mapa je zároveň hračka, ne jen výkaz. Na rozsvícenou lampu se dá klepat
 * a vyskočí z ní to, co k ní patří — obrázek slova nebo znak. Bez toho by
 * to byl graf postupu, a graf postupu pětiletého nezajímá.
 */

const ROWS = 3;

interface Node {
  itemId: ItemId;
  glyph: string;
  x: number;
  y: number;
  special: boolean;
}

export function MapScreen({ state, onBack }: { state: EngineState | null; onBack: () => void }) {
  const nodes = useMemo(() => buildNodes(), []);
  const path = useMemo(() => buildPath(nodes), [nodes]);

  const isLit = (id: ItemId): boolean => state?.items[id]?.state === 'mastered';
  const litCount = nodes.filter((n) => isLit(n.itemId)).length;

  return (
    <div className="absolute inset-0 z-20 flex flex-col">
      <button className="absolute inset-0" aria-label="zpět" onPointerDown={onBack} />

      <svg
        viewBox="0 0 1000 520"
        preserveAspectRatio="xMidYMid meet"
        className="pointer-events-none relative h-full w-full px-[14%] pb-[16%] pt-[5%]"
      >
        {/* Cesta: provázek napnutý mezi lampami. */}
        <path d={path} fill="none" stroke="#C3A377" strokeWidth="7" strokeLinecap="round" />
        <path
          d={path}
          fill="none"
          stroke="#F7C86B"
          strokeWidth="7"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={`${nodes.length ? litCount / nodes.length : 0} 1`}
        />

        {nodes.map((node, i) => (
          <MapLamp key={node.itemId} node={node} lit={isLit(node.itemId)} index={i} />
        ))}
      </svg>
    </div>
  );
}

function MapLamp({ node, lit, index }: { node: Node; lit: boolean; index: number }) {
  const r = node.special ? 28 : 20;
  const [popped, setPopped] = useState(0);
  const letter = letterById.get(node.itemId as `let:${string}`);

  return (
    <g
      className="pointer-events-auto cursor-pointer"
      onPointerDown={(e) => {
        e.stopPropagation();
        sfx.tap();
        if (lit) {
          setPopped((n) => n + 1);
          director.sayAlways(letter ? say.word(node.itemId) : say.this(node.itemId));
        } else {
          director.say(say.this(node.itemId));
        }
      }}
    >
      {/* Co z lampy vyskočí: u písmene jeho obrázek, u čísla jeho znak. */}
      {lit && popped > 0 && letter && (
        <motion.g
          key={popped}
          initial={{ opacity: 0, y: 0, scale: 0.4 }}
          animate={{ opacity: [0, 1, 1, 0], y: -r * 3.4, scale: 1 }}
          transition={{ duration: 1.9, times: [0, 0.15, 0.7, 1], ease: 'easeOut' }}
        >
          <foreignObject x={node.x - 34} y={node.y - 34} width="68" height="68">
            <div style={{ width: '100%', height: '100%' }}>
              <Illustration id={letter.illustration} />
            </div>
          </foreignObject>
        </motion.g>
      )}
      {lit && (
        <motion.circle
          cx={node.x}
          cy={node.y}
          r={r * 2.4}
          fill="#F7C86B"
          opacity={0.22}
          animate={{ opacity: [0.14, 0.28, 0.14] }}
          transition={{ duration: 3.4 + (index % 5) * 0.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Stínítko lampy. Mikulášovo M má stříšku jako jeho čepice. */}
      {node.special ? (
        <path
          d={`M${node.x - r - 6} ${node.y - r} L${node.x} ${node.y - r - 22} L${node.x + r + 6} ${node.y - r} Z`}
          fill={lit ? '#B0392B' : '#7A3129'}
        />
      ) : (
        <path
          d={`M${node.x - r - 2} ${node.y - r + 2} L${node.x} ${node.y - r - 12} L${node.x + r + 2} ${node.y - r + 2} Z`}
          fill={lit ? '#8B6A45' : '#4A3826'}
        />
      )}

      <motion.circle
        cx={node.x}
        cy={node.y}
        r={r}
        animate={{ fill: lit ? '#FBDC9A' : '#4A3826' }}
        transition={{ duration: 0.6 }}
        stroke={lit ? '#D69C36' : '#3B2A20'}
        strokeWidth="3"
      />

      <text
        x={node.x}
        y={node.y + r * 0.36}
        textAnchor="middle"
        className="font-andika font-bold"
        style={{ fontSize: r * 1.05, fill: lit ? '#241C16' : '#7A5C3B' }}
      >
        {node.glyph}
      </text>

      {/* Stojan lampy. */}
      <rect x={node.x - 3} y={node.y + r} width="6" height="14" fill={lit ? '#8B6A45' : '#4A3826'} />
    </g>
  );
}

/**
 * Rozmístění po hadovité cestě.
 *
 * Čísla a písmena jdou za sebou v pořadí výuky, takže mapa čte stejně,
 * jako se učí: zleva doprava, řádek po řádku, dolů.
 */
function buildNodes(): Node[] {
  const items: { itemId: ItemId; glyph: string; special: boolean }[] = [
    ...LETTERS.map((l) => ({ itemId: l.id as ItemId, glyph: l.glyph, special: l.glyph === 'M' })),
    ...NUMBERS.map((n) => ({ itemId: n.id as ItemId, glyph: n.glyph, special: false })),
  ];

  const perRow = Math.ceil(items.length / ROWS);
  const marginX = 116;
  const spanX = 1000 - marginX * 2;

  return items.map((item, i) => {
    const row = Math.floor(i / perRow);
    const inRow = i % perRow;
    const forward = row % 2 === 0;
    const t = inRow / (perRow - 1);
    const x = marginX + (forward ? t : 1 - t) * spanX;
    // Řádky se mírně vlní, ať cesta nevypadá jako tabulka.
    const y = 90 + row * 170 + Math.sin(inRow * 0.9) * 16;
    return { ...item, x, y };
  });
}

/** Cesta vede od lampy k lampě, konce řádků se zaoblí. */
function buildPath(nodes: Node[]): string {
  if (!nodes.length) return '';
  return nodes
    .map((n, i) => {
      if (i === 0) return `M${n.x} ${n.y}`;
      const prev = nodes[i - 1]!;
      const sameRow = Math.abs(n.y - prev.y) < 60;
      if (sameRow) return `L${n.x} ${n.y}`;
      // Přechod na další řádek: obloukem ven a zpátky.
      const bulge = n.x > 500 ? 60 : -60;
      return `C ${prev.x + bulge} ${prev.y + 50} ${n.x + bulge} ${n.y - 50} ${n.x} ${n.y}`;
    })
    .join(' ');
}
