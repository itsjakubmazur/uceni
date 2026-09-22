import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { sfx } from '../audio/sfx.ts';

/**
 * Mezihra.
 *
 * Chvíle mezi úlohami, ve které se nic nevyhodnocuje a nedá se v ní chybovat.
 * Dítě jen ťuká a divadlo reaguje. To je celé — a je to důležité: bez těchhle
 * chvil je aplikace cvičebnice, ne hra.
 *
 * Nikdo nikam nespěchá. Tlačítko „dál" se objeví až po chvíli a samo se
 * nepokračuje dřív než po deseti vteřinách ticha, aby se hra nepřetrhla
 * uprostřed.
 */

const AUTO_CONTINUE_MS = 10_000;
const BUTTON_AFTER_MS = 2600;

export function Interlude({ variant, onDone }: { variant: number; onDone: () => void }) {
  const [showButton, setShowButton] = useState(false);
  const idleTimer = useRef(0);

  const resetIdle = () => {
    window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(onDone, AUTO_CONTINUE_MS);
  };

  useEffect(() => {
    const button = window.setTimeout(() => setShowButton(true), BUTTON_AFTER_MS);
    resetIdle();
    return () => {
      window.clearTimeout(button);
      window.clearTimeout(idleTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant]);

  const Game = [LampWave, FallingPaper, PeekingPuppets][variant % 3]!;

  return (
    <div className="absolute inset-0 z-20" onPointerDown={resetIdle}>
      <Game />

      {showButton && (
        <motion.button
          className="absolute bottom-[19%] left-[7%] grid h-[clamp(88px,10vw,124px)] w-[clamp(88px,10vw,124px)] place-items-center rounded-full"
          style={{
            background: 'radial-gradient(circle at 36% 30%, #FBDC9A, #D69C36)',
            boxShadow: '0 12px 22px -12px rgba(43,30,22,.9)',
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 150, damping: 14 }}
          whileTap={{ scale: 0.94 }}
          onPointerDown={(e) => {
            e.stopPropagation();
            sfx.tap();
            onDone();
          }}
          aria-label="pokračovat"
        >
          <svg viewBox="0 0 40 40" className="h-1/2 w-1/2">
            <path d="M13 8 L30 20 L13 32 Z" fill="#3B2A20" />
          </svg>
        </motion.button>
      )}
    </div>
  );
}

/* ------------------------------------------------ šňůra lampionů */

/**
 * Přes jeviště je natažená šňůra s papírovými lampiony. Pod prstem se
 * rozsvěcují a za chvíli zase zhasnou, takže se dá „hrát" tam a zpátky.
 *
 * Visí na šňůře, ne ve vzduchu — když prvek nemá, čím by držel, vypadá to
 * jako chyba vykreslení, ne jako věc.
 */
function LampWave() {
  const [lit, setLit] = useState<Set<number>>(new Set());
  const count = 8;

  const touch = (i: number) => {
    setLit((prev) => {
      if (prev.has(i)) return prev;
      const next = new Set(prev);
      next.add(i);
      sfx.countStep(i);
      window.setTimeout(() => {
        setLit((cur) => {
          const after = new Set(cur);
          after.delete(i);
          return after;
        });
      }, 1600);
      return next;
    });
  };

  return (
    <div className="absolute inset-x-[6%] top-[26%]">
      {/* šňůra, na které lampiony visí */}
      <svg viewBox="0 0 1000 60" preserveAspectRatio="none" className="h-[40px] w-full">
        <path d="M0 8 Q 500 56 1000 8" stroke="#6E5234" strokeWidth="4" fill="none" />
      </svg>

      <div className="-mt-[14px] flex items-start justify-between px-[2%]">
        {Array.from({ length: count }, (_, i) => {
          const sag = Math.sin((i / (count - 1)) * Math.PI) * 26;
          const on = lit.has(i);
          return (
            <motion.button
              key={i}
              className="relative flex flex-col items-center"
              style={{ width: 'clamp(54px, 7vw, 96px)', marginTop: sag }}
              onPointerEnter={() => touch(i)}
              onPointerDown={() => touch(i)}
              animate={{ rotate: on ? [0, -6, 5, 0] : 0, y: on ? -6 : 0 }}
              transition={{ duration: on ? 0.7 : 0.3 }}
            >
              <span className="h-[clamp(10px,1.4vh,18px)] w-[3px] bg-[#6E5234]" />
              {on && (
                <motion.span
                  className="pointer-events-none absolute top-[10px] h-[190%] w-[190%] rounded-full"
                  style={{
                    background:
                      'radial-gradient(circle, rgba(247,200,107,.75), rgba(247,200,107,0) 66%)',
                  }}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                />
              )}
              <span
                className="relative w-full rounded-[40%]"
                style={{
                  height: 'clamp(52px, 6.6vw, 88px)',
                  background: on ? '#FBDC9A' : '#B0392B',
                  boxShadow: on
                    ? '0 0 26px rgba(247,200,107,.95), inset 0 -6px 10px rgba(201,142,51,.45)'
                    : 'inset 0 -6px 10px rgba(99,26,20,.55)',
                }}
              >
                {/* papírové žebrování lampionu */}
                <span
                  className="absolute inset-0 rounded-[40%]"
                  style={{
                    background:
                      'repeating-linear-gradient(90deg, rgba(59,42,32,.18) 0 1px, transparent 1px 12px)',
                  }}
                />
              </span>
              <span className="h-[clamp(6px,.9vh,10px)] w-[26%] bg-[#6E5234]" />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* --------------------------------------------------- padající výstřižky */

interface Scrap {
  id: number;
  x: number;
  /** Odkud výstřižek padá, v procentech výšky. Záporné je nad obrazovkou. */
  start: number;
  shape: number;
  color: string;
}

const SCRAP_COLORS = ['#B0392B', '#D69C36', '#2F6B62', '#E2CCA4', '#8E2C21'];

/**
 * Z provaziště padají papírové výstřižky. Klepnutím se roztočí a odletí.
 *
 * Schválně ne konfety: jsou to velké, pomalé kusy papíru, na které se dá
 * v klidu trefit. Konfety by byly rychlé, drobné a frustrující.
 */
function FallingPaper() {
  // Scéna musí být plná hned. Kdyby všechno startovalo nad obrazovkou,
  // první dvě vteřiny mezihry by bylo prázdno a dítě by nevědělo, co dělat.
  const [scraps, setScraps] = useState<Scrap[]>(() => makeScraps(0, true));
  const [caught, setCaught] = useState<Set<number>>(new Set());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setScraps((prev) => [...prev.slice(-18), ...makeScraps(prev.length, false)]);
    }, 2000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {scraps.map((s) => (
        <motion.button
          key={s.id}
          className="absolute"
          style={{ left: `${s.x}%`, width: 'clamp(54px,7vw,92px)', height: 'clamp(54px,7vw,92px)' }}
          initial={{ y: `${s.start}vh`, rotate: -20 }}
          animate={
            caught.has(s.id)
              ? { y: `${s.start - 20}vh`, rotate: 420, opacity: 0, scale: 1.5 }
              : { y: '115vh', rotate: 30 }
          }
          transition={
            caught.has(s.id)
              ? { duration: 0.7, ease: 'easeOut' }
              : { duration: ((115 - s.start) / 135) * 11, ease: 'linear' }
          }
          onPointerDown={() => {
            if (caught.has(s.id)) return;
            sfx.countStep(s.shape);
            setCaught((prev) => new Set(prev).add(s.id));
          }}
        >
          <ScrapShape shape={s.shape} color={s.color} />
        </motion.button>
      ))}
    </div>
  );
}

function makeScraps(offset: number, spreadAcrossScreen: boolean): Scrap[] {
  return Array.from({ length: spreadAcrossScreen ? 9 : 5 }, (_, i) => ({
    id: offset * 10 + i + Math.random(),
    x: 5 + Math.random() * 86,
    start: spreadAcrossScreen ? -20 + Math.random() * 95 : -20 - Math.random() * 25,
    shape: Math.floor(Math.random() * 4),
    color: SCRAP_COLORS[Math.floor(Math.random() * SCRAP_COLORS.length)]!,
  }));
}

function ScrapShape({ shape, color }: { shape: number; color: string }) {
  const paths = [
    'M50 6 L92 50 L50 94 L8 50 Z',
    'M12 18 H88 L74 82 H26 Z',
    'M50 8 C 88 20 92 78 50 94 C 8 78 12 20 50 8 Z',
    'M10 30 Q 50 -6 90 30 Q 50 66 10 30 Z',
  ];
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <path d={paths[shape % paths.length]} fill={color} opacity="0.45" transform="translate(4 4)" />
      <path d={paths[shape % paths.length]} fill={color} />
    </svg>
  );
}

/* ------------------------------------------------- loutky za oponou */

/** Za kulisami vykukují loutky. Když na ně klepneš, schovají se a vyskočí jinde. */
function PeekingPuppets() {
  const spots = [
    { x: 14, y: 46 },
    { x: 34, y: 58 },
    { x: 56, y: 44 },
    { x: 76, y: 56 },
    { x: 88, y: 40 },
  ];
  const [visible, setVisible] = useState<number[]>([0, 2, 4]);

  const poke = (index: number) => {
    sfx.countStep(index);
    setVisible((prev) => {
      const without = prev.filter((i) => i !== index);
      const free = spots.map((_, i) => i).filter((i) => !without.includes(i));
      const next = free[Math.floor(Math.random() * free.length)] ?? index;
      return [...without, next];
    });
  };

  return (
    <div className="absolute inset-0">
      {spots.map((spot, i) =>
        visible.includes(i) ? (
          <motion.button
            key={i}
            className="absolute"
            style={{
              left: `${spot.x}%`,
              top: `${spot.y}%`,
              width: 'clamp(70px,9vw,130px)',
              translate: '-50% 0',
            }}
            initial={{ y: 70, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 70, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 16 }}
            onPointerDown={() => poke(i)}
          >
            <PaperPuppet seed={i} />
          </motion.button>
        ) : null,
      )}
    </div>
  );
}

function PaperPuppet({ seed }: { seed: number }) {
  const bodies = ['#2F6B62', '#B0392B', '#D69C36', '#7A5C3B', '#24564F'];
  const hats = ['#B0392B', '#D69C36', '#2F6B62', '#8E2C21', '#E2CCA4'];
  return (
    <svg viewBox="0 0 100 130" className="h-auto w-full">
      <path d="M28 130 Q 26 74 40 58 L60 58 Q 74 74 72 130 Z" fill={bodies[seed % bodies.length]} />
      <circle cx="50" cy="42" r="24" fill="#F3E5CA" />
      <path d="M26 34 L50 12 L74 34 Z" fill={hats[seed % hats.length]} />
      <circle cx="42" cy="42" r="3.4" fill="#241C16" />
      <circle cx="58" cy="42" r="3.4" fill="#241C16" />
      <ellipse cx="34" cy="50" rx="5" ry="3.4" fill="#B0392B" opacity="0.3" />
      <ellipse cx="66" cy="50" rx="5" ry="3.4" fill="#B0392B" opacity="0.3" />
      <path d="M44 52 q 6 6 12 0" stroke="#241C16" strokeWidth="2.6" fill="none" strokeLinecap="round" />
    </svg>
  );
}
