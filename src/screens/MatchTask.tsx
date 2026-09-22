import { motion } from 'motion/react';
import { Glass } from '../shared/Glass.tsx';
import { Illustration } from '../theatre/Illustrations.tsx';
import { letterById } from '../content/items.letters.ts';
import type { ItemId } from '../engine/types.ts';

/**
 * Přiřazení obrázku k písmenu.
 *
 * Znak visí velký nalevo jako plakát a napravo stojí obrázky. Dítě hledá
 * ten, který začíná stejně. Pořadí je schválně takhle — znak první, obrázky
 * druhé — protože otázka zní „co začíná na tohle", ne „jaké písmeno má tohle".
 *
 * Obrázky jsou na papírových kartách, ne za sklem. Sklo v tomhle světě nese
 * znaky; obrázek je výstřižek a má vypadat jako výstřižek.
 */
export function MatchTask({
  itemId,
  options,
  picked,
  mistakes,
  onPick,
}: {
  itemId: ItemId;
  options: ItemId[];
  picked: ItemId | null;
  mistakes: number;
  onPick: (id: ItemId) => void;
}) {
  const letter = letterById.get(itemId as `let:${string}`);
  if (!letter) return null;

  return (
    <>
      {/* Znak jako plakát na levé kulise. */}
      <motion.div
        className="absolute left-[6%] top-[21%] z-20"
        initial={{ y: 30, opacity: 0, rotate: -2 }}
        animate={{ y: 0, opacity: 1, rotate: -1.4 }}
        transition={{ type: 'spring', stiffness: 140, damping: 14 }}
      >
        <div className="relative">
          <Glass radius={3} className="h-[clamp(160px,22vw,290px)] w-[clamp(140px,18vw,240px)]">
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 62% 54% at 50% 48%, rgba(248,238,216,.9), rgba(248,238,216,0) 88%)',
              }}
            />
            <span
              className="relative block font-bold leading-none text-[#1F1710]"
              style={{ fontSize: 'clamp(90px, 13vw, 190px)' }}
            >
              {letter.glyph}
            </span>
          </Glass>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              border: 'clamp(10px,1.2vw,16px) solid transparent',
              borderImage: 'linear-gradient(160deg, #A07C52, #6E5234 55%, #4E3A22) 1',
            }}
          />
        </div>
      </motion.div>

      {/* Obrázky na papírových kartách, v oblouku. */}
      <div className="absolute bottom-[19%] right-[3%] left-[33%] z-20 flex items-end justify-center gap-[clamp(12px,2.6vw,42px)]">
        {options.map((id, i) => (
          <PictureCard
            key={id}
            itemId={id}
            index={i}
            lift={[10, 34, 0, 24][i % 4]!}
            tilt={[-2, 1.2, 2.4, -1][i % 4]!}
            state={
              picked === id ? (id === itemId ? 'correct' : 'wrong') : mistakes >= 2 && id === itemId ? 'hint' : 'idle'
            }
            correct={id === itemId}
            onPick={() => onPick(id)}
          />
        ))}
      </div>
    </>
  );
}

function PictureCard({
  itemId,
  index,
  lift,
  tilt,
  state,
  correct,
  onPick,
}: {
  itemId: ItemId;
  index: number;
  lift: number;
  tilt: number;
  state: 'idle' | 'wrong' | 'correct' | 'hint';
  /** Jen pro automatickou kontrolu průchodu. */
  correct: boolean;
  onPick: () => void;
}) {
  const letter = letterById.get(itemId as `let:${string}`);
  if (!letter) return null;

  return (
    <motion.button
      className="relative origin-bottom"
      initial={{ y: 50, opacity: 0, rotate: tilt * 2 }}
      animate={
        state === 'wrong'
          ? { x: [0, -6, 6, -4, 3, 0], y: -lift, opacity: 1, rotate: tilt }
          : state === 'correct'
            ? { scale: [1, 1.07, 1.03], y: -lift - 10, opacity: 1, rotate: 0 }
            : { y: -lift, opacity: 1, rotate: tilt, scale: 1, x: 0 }
      }
      transition={
        state === 'wrong'
          ? { duration: 0.25 }
          : { type: 'spring', stiffness: 170, damping: 15, delay: index * 0.08 }
      }
      whileTap={{ scale: 0.965, rotate: 0 }}
      onPointerDown={onPick}
      data-spravne={state === 'correct' || correct ? 'ano' : 'ne'}
    >
      <div
        className="relative grid place-items-center p-[clamp(8px,1vw,14px)]"
        style={{
          background: '#F6EBD4',
          boxShadow: '0 16px 26px -16px rgba(43,30,22,.85)',
          outline: '3px solid #C3A377',
          outlineOffset: '-3px',
        }}
      >
        <div className="h-[clamp(96px,13vw,170px)] w-[clamp(96px,13vw,170px)]">
          <Illustration id={letter.illustration} />
        </div>
        {state === 'hint' && (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 70% 62% at 50% 50%, rgba(247,200,107,.55), rgba(247,200,107,0) 78%)',
            }}
            animate={{ opacity: [0.2, 0.8, 0.2] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </div>
      <div className="mx-auto h-[clamp(8px,1vh,12px)] w-[84%] bg-[var(--wood)]" />
      <div className="mx-auto h-[clamp(5px,.7vh,8px)] w-[60%] bg-[var(--wood-deep)]" />
    </motion.button>
  );
}
