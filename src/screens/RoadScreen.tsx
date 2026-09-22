import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { NUMBERS } from '../content/items.numbers.ts';
import { LETTERS, letterById } from '../content/items.letters.ts';
import { Illustration } from '../theatre/Illustrations.tsx';
import { Kulisak } from '../mascots/Kulisak.tsx';
import { director } from '../audio/director.ts';
import { sfx } from '../audio/sfx.ts';
import { say } from '../app/speechFor.ts';
import type { Area, EngineState, ItemId } from '../engine/types.ts';

/**
 * CESTA — domovská obrazovka.
 *
 * Tohle je páteř celé aplikace a všechno ostatní z ní vychází. Dítě tu vidí
 * naráz tři věci, které mu dřív chyběly:
 *
 * - **kde je** — Kulisák stojí na místě, kde se zrovna pokračuje,
 * - **co má za sebou** — rozsvícené lampy s obrázky, na které se dá klepat,
 * - **co ho čeká** — další zastávky jsou vidět dopředu, jen zatím zhasnuté.
 *
 * Cesta se posouvá do stran, takže se na ni vejde celá abeceda, a při otevření
 * sama sjede tam, kde se pokračuje. Hrát se začíná klepnutím na to velké
 * svítící místo, ne přes menu.
 */

const NODE_GAP = 168;
const EDGE_PAD = 130;

interface RoadNode {
  itemId: ItemId;
  glyph: string;
  illustration?: string;
  index: number;
  x: number;
  y: number;
  state: 'hotovo' | 'ted' | 'dalsi' | 'daleko';
  special: boolean;
}

export function RoadScreen({
  state,
  area,
  onChangeArea,
  onPlay,
}: {
  state: EngineState | null;
  area: Area;
  onChangeArea: (area: Area) => void;
  onPlay: (area: Area) => void;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const nodes = useMemo(() => buildRoad(state, area), [state, area]);
  const current = nodes.find((n) => n.state === 'ted') ?? nodes[0];
  const width = EDGE_PAD * 2 + Math.max(0, nodes.length - 1) * NODE_GAP;

  // Při otevření sjet tam, kde se pokračuje — ne na začátek, ne na konec.
  useLayoutEffect(() => {
    const el = scroller.current;
    if (!el || !current) return;
    el.scrollLeft = Math.max(0, current.x - el.clientWidth * 0.38);
  }, [area, current]);

  useEffect(() => {
    director.say('map.intro');
  }, []);

  return (
    <div className="absolute inset-0 z-20 flex flex-col">
      <RoadSwitch area={area} onChange={onChangeArea} />

      {/*
        Cesta se drží uvnitř otvoru jeviště. Kdyby přetékala přes oponu,
        rozpadla by se iluze divadla — a právě ta drží celý svět pohromadě.
      */}
      <div
        ref={scroller}
        className="relative mx-[15%] mb-[17%] mt-[1%] flex-1 overflow-x-auto overflow-y-hidden"
        style={{ WebkitOverflowScrolling: 'touch', overscrollBehaviorX: 'contain' }}
      >
        <div className="relative h-full" style={{ width }}>
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox={`0 0 ${width} 520`}
            preserveAspectRatio="none"
          >
            <path d={roadPath(nodes)} stroke="#8B6A45" strokeWidth="26" fill="none" strokeLinecap="round" />
            <path d={roadPath(nodes)} stroke="#C3A377" strokeWidth="18" fill="none" strokeLinecap="round" />
            <path
              d={roadPath(nodes)}
              stroke="#F7C86B"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="10 16"
              opacity="0.7"
            />
          </svg>

          {nodes.map((node) => (
            <RoadStop key={node.itemId} node={node} onPlay={() => onPlay(area)} />
          ))}

          {current && (
            <motion.div
              className="pointer-events-none absolute"
              style={{
                // Stojí vedle zastávky a o kus výš, aby nezakrýval znak.
                left: current.x - 186,
                top: `calc(${(current.y / 520) * 100}% - 138px)`,
                width: 108,
              }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 120, damping: 14 }}
            >
              <Kulisak state="waiting" />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------- přepínač cest */

/** Dvě cesty: písmena a čísla. Přepíná se plakáty, ne textem. */
function RoadSwitch({ area, onChange }: { area: Area; onChange: (area: Area) => void }) {
  return (
    <div className="relative z-30 flex justify-center gap-[clamp(10px,2vw,28px)] pt-[clamp(58px,9vh,104px)]">
      {(
        [
          { id: 'letters' as Area, glyph: 'M', speech: 'ui.letters' },
          { id: 'numbers' as Area, glyph: '3', speech: 'ui.numbers' },
        ]
      ).map((road) => {
        const active = area === road.id;
        return (
          <motion.button
            key={road.id}
            className="relative grid place-items-center"
            style={{
              width: 'clamp(74px, 8vw, 116px)',
              height: 'clamp(62px, 6.8vw, 96px)',
              background: active ? '#F6EBD4' : '#C9B18A',
              outline: `3px solid ${active ? '#8B6A45' : '#9C8360'}`,
              outlineOffset: '-3px',
              boxShadow: active ? '0 10px 18px -10px rgba(43,30,22,.8)' : 'none',
            }}
            animate={{ y: active ? 0 : 6, opacity: active ? 1 : 0.75 }}
            whileTap={{ scale: 0.95 }}
            onPointerDown={() => {
              sfx.tap();
              director.say(road.speech);
              onChange(road.id);
            }}
            aria-label={road.id === 'letters' ? 'písmena' : 'čísla'}
          >
            <span
              className="font-bold leading-none text-[#1F1710]"
              style={{ fontSize: 'clamp(30px, 3.4vw, 52px)', opacity: active ? 1 : 0.55 }}
            >
              {road.glyph}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------- zastávka */

function RoadStop({ node, onPlay }: { node: RoadNode; onPlay: () => void }) {
  const [popped, setPopped] = useState(0);
  const [refused, setRefused] = useState(0);

  const size = node.state === 'ted' ? 150 : node.state === 'hotovo' ? 104 : 92;
  const top = `calc(${(node.y / 520) * 100}% - ${size / 2}px)`;

  const press = () => {
    if (node.state === 'ted') {
      sfx.correct();
      onPlay();
      return;
    }
    if (node.state === 'hotovo') {
      sfx.tap();
      setPopped((n) => n + 1);
      director.sayAlways(node.illustration ? say.word(node.itemId) : say.this(node.itemId));
      return;
    }
    // Zamčená zastávka se jen zavrtí. Žádné „ještě nemůžeš" — to by bylo
    // odmítnutí, a odmítat pětiletého za to, že je zvědavý, nemá smysl.
    sfx.nudge();
    setRefused((n) => n + 1);
  };

  return (
    <motion.button
      className="absolute grid place-items-center"
      style={{ left: node.x - size / 2, top, width: size, height: size }}
      animate={
        refused > 0
          ? { x: [0, -5, 5, -3, 0] }
          : node.state === 'ted'
            ? { scale: [1, 1.05, 1] }
            : { scale: 1 }
      }
      transition={
        refused > 0
          ? { duration: 0.28 }
          : node.state === 'ted'
            ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }
            : { type: 'spring', stiffness: 200, damping: 16 }
      }
      whileTap={{ scale: 0.95 }}
      onPointerDown={press}
      key={refused}
      aria-label={node.glyph}
      data-zastavka={node.state}
    >
      {/* Co vyskočí ze zvládnuté zastávky: obrázek jejího slova. */}
      {popped > 0 && node.illustration && (
        <motion.div
          key={popped}
          className="pointer-events-none absolute"
          style={{ width: size * 0.9, height: size * 0.9 }}
          initial={{ opacity: 0, y: 0, scale: 0.5 }}
          animate={{ opacity: [0, 1, 1, 0], y: -size * 1.1, scale: 1 }}
          transition={{ duration: 1.9, times: [0, 0.14, 0.7, 1], ease: 'easeOut' }}
        >
          <Illustration id={node.illustration} />
        </motion.div>
      )}

      {node.state === 'hotovo' && (
        <motion.span
          className="pointer-events-none absolute rounded-full"
          style={{
            width: size * 1.7,
            height: size * 1.7,
            background: 'radial-gradient(circle, rgba(247,200,107,.55), rgba(247,200,107,0) 68%)',
          }}
          animate={{ opacity: [0.5, 0.85, 0.5] }}
          transition={{ duration: 3.4 + (node.index % 5) * 0.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {node.state === 'ted' && (
        <motion.span
          className="pointer-events-none absolute rounded-full"
          style={{
            width: size * 1.9,
            height: size * 1.9,
            background: 'radial-gradient(circle, rgba(247,200,107,.7), rgba(247,200,107,0) 66%)',
          }}
          animate={{ opacity: [0.45, 0.95, 0.45], scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Stínítko lampy. Mikulášovo M má stříšku jako jeho čepice. */}
      <span
        className="pointer-events-none absolute"
        style={{ top: -size * 0.24, width: size * 0.92, height: size * 0.3 }}
      >
        <svg viewBox="0 0 100 32" className="h-full w-full">
          <path
            d={node.special ? 'M4 32 L50 0 L96 32 Z' : 'M10 32 L50 6 L90 32 Z'}
            fill={node.state === 'daleko' ? '#4A3826' : node.special ? '#B0392B' : '#8B6A45'}
          />
        </svg>
      </span>

      <span
        className="relative grid h-full w-full place-items-center rounded-full"
        style={{
          background:
            node.state === 'hotovo' || node.state === 'ted'
              ? '#FBDC9A'
              : node.state === 'dalsi'
                ? '#6E5234'
                : '#4A3826',
          border: `4px solid ${node.state === 'daleko' ? '#3B2A20' : '#D69C36'}`,
          boxShadow:
            node.state === 'hotovo' || node.state === 'ted'
              ? '0 0 26px rgba(247,200,107,.9)'
              : 'inset 0 -6px 12px rgba(0,0,0,.35)',
          opacity: node.state === 'daleko' ? 0.62 : 1,
        }}
      >
        <span
          className="font-bold leading-none"
          style={{
            fontSize: size * 0.46,
            color: node.state === 'hotovo' || node.state === 'ted' ? '#241C16' : '#C3A377',
          }}
        >
          {node.glyph}
        </span>

        {/* Na místě, kde se pokračuje, je velká zelená šipka: tady se hraje. */}
        {node.state === 'ted' && (
          <motion.span
            className="absolute grid place-items-center rounded-full"
            style={{
              right: -size * 0.2,
              bottom: -size * 0.12,
              width: size * 0.52,
              height: size * 0.52,
              background: 'radial-gradient(circle at 36% 30%, #7FBF8E, #2F6B62)',
              boxShadow: '0 8px 16px -8px rgba(43,30,22,.9)',
            }}
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg viewBox="0 0 40 40" className="h-1/2 w-1/2">
              <path d="M14 9 L31 20 L14 31 Z" fill="#F6EBD4" />
            </svg>
          </motion.span>
        )}
      </span>
    </motion.button>
  );
}

/* --------------------------------------------------------------- pomocné */

function buildRoad(state: EngineState | null, area: Area): RoadNode[] {
  const source =
    area === 'letters'
      ? LETTERS.map((l) => ({ id: l.id as ItemId, glyph: l.glyph, illustration: l.illustration, special: l.glyph === 'M' }))
      : NUMBERS.map((n) => ({ id: n.id as ItemId, glyph: n.glyph, illustration: undefined, special: false }));

  let firstLearning = -1;
  source.forEach((item, i) => {
    if (firstLearning === -1 && state?.items[item.id]?.state === 'learning') firstLearning = i;
  });

  return source.map((item, index) => {
    const progress = state?.items[item.id];
    const nodeState: RoadNode['state'] =
      progress?.state === 'mastered'
        ? 'hotovo'
        : index === firstLearning
          ? 'ted'
          : index < firstLearning + 4
            ? 'dalsi'
            : 'daleko';

    return {
      itemId: item.id,
      glyph: item.glyph,
      illustration: item.illustration,
      special: item.special,
      index,
      state: nodeState,
      x: EDGE_PAD + index * NODE_GAP,
      // Cesta se vlní, aby to byla cesta, a ne řádek v tabulce.
      y: 300 + Math.sin(index * 0.72) * 96,
    };
  });
}

function roadPath(nodes: readonly RoadNode[]): string {
  if (!nodes.length) return '';
  return nodes
    .map((n, i) => {
      if (i === 0) return `M${n.x} ${n.y}`;
      const prev = nodes[i - 1]!;
      const mid = (prev.x + n.x) / 2;
      return `C ${mid} ${prev.y} ${mid} ${n.y} ${n.x} ${n.y}`;
    })
    .join(' ');
}

/** Slovo k položce, když existuje. Používá se pro obrázek, co vyskočí z lampy. */
export const illustrationOf = (itemId: ItemId): string | undefined =>
  letterById.get(itemId as `let:${string}`)?.illustration;
