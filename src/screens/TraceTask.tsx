import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Sign } from '../theatre/Sign.tsx';
import { audio } from '../audio/AudioEngine.ts';
import { sfx } from '../audio/sfx.ts';
import { glyphOf } from '../app/speechFor.ts';
import { strokesForText } from '../content/strokes.ts';
import type { ItemId } from '../engine/types.ts';

/**
 * Obtahování prstem.
 *
 * Cílem je radost, ne přesnost. Vyhodnocení je proto schválně shovívavé:
 * tah se počítá za hotový, jakmile prst pokryje většinu jeho délky, a
 * nezáleží na tom, jak přesně ani jak rychle. Odejít z tahu ven nic nekazí —
 * dítě prostě pokračuje dál.
 *
 * Průvodce ukáže tah dřív, než ho má dítě vést: po znaku jede světlá tečka
 * a za ní se dokresluje čára. Když dítě začne kreslit, průvodce zmlkne, aby
 * nepřekážel.
 */

/** Jak daleko od čáry se prst ještě počítá, v jednotkách čtverce 100. */
const TOLERANCE = 15;
/** Kolik z tahu musí projít, aby se považoval za obtažený. */
const COVERAGE_NEEDED = 0.62;
/** Na kolik bodů se tah rozdělí při vyhodnocení. */
const SAMPLES = 44;

export function TraceTask({ itemId, onDone }: { itemId: ItemId; onDone: () => void }) {
  const text = glyphOf(itemId);
  const { strokes, width } = useMemo(() => strokesForText(text), [text]);

  const svgRef = useRef<SVGSVGElement>(null);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const [current, setCurrent] = useState(0);
  /**
   * Pokryté body drží ref, ne jen stav.
   *
   * Vyhodnocení tahu musí proběhnout právě jednou. Kdyby se počítalo uvnitř
   * aktualizační funkce `setCovered`, React by ho ve StrictMode zavolal
   * dvakrát a každý dokončený tah by index posunul o dva — celé M by se
   * „obtáhlo" jedním svislým tahem.
   */
  const coveredRef = useRef<boolean[]>([]);
  const advancing = useRef(false);
  const [covered, setCovered] = useState<boolean[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [trail, setTrail] = useState<{ x: number; y: number }[]>([]);
  const done = current >= strokes.length;
  const coverage = covered.length ? covered.filter(Boolean).length / covered.length : 0;

  useEffect(() => {
    setCurrent(0);
    setCovered([]);
    coveredRef.current = [];
    advancing.current = false;
    setTrail([]);
    void audio.say('trace.start');
  }, [itemId]);

  useEffect(() => {
    if (done) {
      sfx.lampLit();
      void audio.say('trace.done');
      const timer = window.setTimeout(onDone, 1800);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [done, onDone]);

  /** Body aktuálního tahu v souřadnicích SVG. */
  const samplePoints = (index: number): { x: number; y: number }[] => {
    const path = pathRefs.current[index];
    if (!path) return [];
    const total = path.getTotalLength();
    return Array.from({ length: SAMPLES }, (_, i) => {
      const p = path.getPointAtLength((i / (SAMPLES - 1)) * total);
      return { x: p.x, y: p.y };
    });
  };

  const toSvg = (event: React.PointerEvent): { x: number; y: number } | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    // viewBox je vepsaný přes preserveAspectRatio="xMidYMid meet", takže
    // se počítá měřítko z toho menšího rozměru a zbytek je okraj.
    const scale = Math.min(rect.width / width, rect.height / 100);
    const offsetX = (rect.width - width * scale) / 2;
    const offsetY = (rect.height - 100 * scale) / 2;
    return {
      x: (event.clientX - rect.left - offsetX) / scale,
      y: (event.clientY - rect.top - offsetY) / scale,
    };
  };

  const handleMove = (event: React.PointerEvent) => {
    if (!drawing || done || advancing.current) return;
    const point = toSvg(event);
    if (!point) return;

    setTrail((t) => [...t.slice(-140), point]);

    const points = samplePoints(current);
    if (!points.length) return;

    const next =
      coveredRef.current.length === points.length
        ? [...coveredRef.current]
        : new Array<boolean>(points.length).fill(false);

    points.forEach((p, i) => {
      if (next[i]) return;
      if (Math.hypot(p.x - point.x, p.y - point.y) <= TOLERANCE) next[i] = true;
    });

    coveredRef.current = next;
    setCovered(next);

    const ratio = next.filter(Boolean).length / next.length;
    if (ratio < COVERAGE_NEEDED) return;

    advancing.current = true;
    sfx.countStep(current);
    window.setTimeout(() => {
      coveredRef.current = [];
      setCovered([]);
      setTrail([]);
      setCurrent((c) => c + 1);
      advancing.current = false;
      if (current + 1 < strokes.length) void audio.say('trace.again');
    }, 160);
  };

  return (
    <>
      <Sign>{done ? 'Krásně obtažené!' : 'Obtáhni to prstem.'}</Sign>

      <div className="absolute inset-0 z-20 grid place-items-center pb-[13%] pt-[16%]">
        {/*
          List papíru pod znakem. Bez něj splývá světlá kostra tahu
          se světlou oblohou a dítě nevidí, kudy má jet.
        */}
        <div
          className="absolute h-[min(62vh,62vw)] w-[min(74vw,74vh)]"
          style={{
            background: '#F6EBD4',
            outline: '4px solid #C3A377',
            outlineOffset: '-4px',
            boxShadow: '0 22px 40px -24px rgba(43,30,22,.85)',
          }}
        />
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} 100`}
          preserveAspectRatio="xMidYMid meet"
          className="relative h-[min(58vh,58vw)] w-[min(70vw,70vh)] touch-none"
          onPointerDown={(e) => {
            (e.target as Element).setPointerCapture?.(e.pointerId);
            setDrawing(true);
            handleMove(e);
          }}
          onPointerMove={handleMove}
          onPointerUp={() => {
            setDrawing(false);
            setTrail([]);
          }}
          onPointerLeave={() => setDrawing(false)}
        >
          {/* Znak jako světlý podklad: dítě vidí celý tvar, ne jen jeden tah. */}
          {strokes.map((stroke, i) => (
            <path
              key={`bg-${i}`}
              d={stroke.d}
              transform={placement(stroke.offsetX, stroke.transform)}
              fill="none"
              stroke="#E2CCA4"
              strokeWidth="17"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {/* Hotové tahy zůstávají plné a tmavé. */}
          {strokes.slice(0, current).map((stroke, i) => (
            <path
              key={`done-${i}`}
              d={stroke.d}
              transform={placement(stroke.offsetX, stroke.transform)}
              fill="none"
              stroke="#241C16"
              strokeWidth="15"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {/* Aktuální tah: průvodce se sám nakreslí a ukáže směr. */}
          {!done && (
            <GuideStroke
              key={`guide-${current}`}
              d={strokes[current]!.d}
              transform={placement(strokes[current]!.offsetX, strokes[current]!.transform)}
              quiet={drawing}
              refFor={(el) => {
                pathRefs.current[current] = el;
              }}
            />
          )}

          {/* Stopa prstu. Mizí sama, je to jen ohlas doteku. */}
          {trail.length > 1 && (
            <polyline
              points={trail.map((p) => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke="#F7C86B"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.55"
            />
          )}

          {/*
            Kolik z tahu už prst pokryl. Kreslí se jako rostoucí čára, ne jako
            řada teček — dítě tím vidí, že píše, ne že sbírá body.
          */}
          {!done && coverage > 0 && (
            <path
              d={strokes[current]!.d}
              transform={placement(strokes[current]!.offsetX, strokes[current]!.transform)}
              fill="none"
              stroke="#241C16"
              strokeWidth="15"
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray={`${coverage} 1`}
            />
          )}
        </svg>
      </div>
    </>
  );
}

function placement(offsetX: number, transform?: string): string {
  return transform ? `translate(${offsetX} 0) ${transform}` : `translate(${offsetX} 0)`;
}

/**
 * Průvodce tahem.
 *
 * Čára se nakreslí sama a na jejím konci jede tečka — dítě tak vidí nejen
 * kudy, ale i odkud kam. Jakmile začne kreslit samo, průvodce se ztlumí,
 * aby nepřekážel.
 */
function GuideStroke({
  d,
  transform,
  quiet,
  refFor,
}: {
  d: string;
  transform: string;
  quiet: boolean;
  refFor: (el: SVGPathElement | null) => void;
}) {
  return (
    <g transform={transform} opacity={quiet ? 0.35 : 1}>
      <path
        ref={refFor}
        d={d}
        fill="none"
        stroke="#C3A377"
        strokeWidth="15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <motion.path
        d={d}
        fill="none"
        stroke="#B0392B"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="1 1"
        pathLength={1}
        initial={{ pathOffset: 0, strokeDasharray: '0.18 1' }}
        animate={{ pathOffset: [0, 1] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.5 }}
      />
      {/* Začátek tahu — odsud se vyráží. */}
      <StartDot d={d} />
    </g>
  );
}

function StartDot({ d }: { d: string }) {
  const match = /^M\s*(-?[\d.]+)[ ,]+(-?[\d.]+)/.exec(d);
  if (!match) return null;
  return (
    <motion.circle
      cx={Number(match[1])}
      cy={Number(match[2])}
      r="9"
      fill="#B0392B"
      animate={{ scale: [1, 1.25, 1], opacity: [0.8, 1, 0.8] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}
