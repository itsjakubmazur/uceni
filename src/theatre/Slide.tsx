import { motion } from 'motion/react';
import { Glass } from '../shared/Glass.tsx';

export type SlideFeedback = 'none' | 'wrong' | 'correct' | 'hint';

/**
 * Odpověď: skleněný diapozitiv v dřevěném rámu.
 *
 * Rám je vrstva NAD sklem. Kdyby bylo sklo uvnitř rámu, rozostřovalo by dřevo
 * místo scény a diapozitiv by byl slepý.
 *
 * Zpětná vazba nikdy není červená. Špatná volba se jemně zavrtí, správná
 * krátce povyroste a rozsvítí se. Po dvou chybách začne ta správná dýchat.
 */
export function Slide({
  glyph,
  lift,
  tilt,
  index,
  feedback,
  correct,
  onPick,
}: {
  glyph: string;
  lift: number;
  tilt: number;
  index: number;
  feedback: SlideFeedback;
  /** Jen pro automatickou kontrolu průchodu — v UI se nijak neprojeví. */
  correct: boolean;
  onPick: () => void;
}) {
  return (
    <motion.button
      className="relative origin-bottom"
      style={{ touchAction: 'manipulation' }}
      initial={{ y: 56, opacity: 0, rotate: tilt * 2 }}
      animate={
        feedback === 'wrong'
          ? { x: [0, -6, 6, -4, 3, 0], y: -lift, opacity: 1, rotate: tilt }
          : feedback === 'correct'
            ? { scale: [1, 1.07, 1.03], y: -lift - 10, opacity: 1, rotate: 0 }
            : feedback === 'hint'
              ? { scale: [1, 1.03, 1], y: -lift, opacity: 1, rotate: tilt }
              : { y: -lift, opacity: 1, rotate: tilt, scale: 1, x: 0 }
      }
      transition={
        feedback === 'wrong'
          ? { duration: 0.25 }
          : feedback === 'hint'
            ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }
            : { type: 'spring', stiffness: 170, damping: 15, delay: index * 0.08 }
      }
      whileTap={{ scale: 0.965, rotate: 0 }}
      onPointerDown={onPick}
      data-spravne={correct ? 'ano' : 'ne'}
    >
      <div className="relative">
        <Glass
          radius={3}
          className="h-[clamp(104px,19vw,238px)] w-[clamp(92px,16vw,208px)]"
          style={{ boxShadow: '0 18px 28px -18px rgba(43,30,22,.9)' }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 62% 54% at 50% 48%, rgba(248,238,216,.86), rgba(248,238,216,.4) 66%, rgba(248,238,216,0) 90%)',
            }}
          />
          {feedback === 'hint' && (
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 70% 60% at 50% 48%, rgba(247,200,107,.55), rgba(247,200,107,0) 78%)',
              }}
              animate={{ opacity: [0.25, 0.8, 0.25] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
          <span
            className="relative block font-bold leading-none text-[#1F1710]"
            style={{ fontSize: 'clamp(54px, 10vw, 142px)' }}
          >
            {glyph}
          </span>
        </Glass>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            border: 'clamp(10px,1.2vw,16px) solid transparent',
            borderImage: 'linear-gradient(160deg, #A07C52, #6E5234 55%, #4E3A22) 1',
            boxShadow: 'inset 0 0 0 1px rgba(43,30,22,.5)',
          }}
        />
      </div>
      <div className="mx-auto h-[clamp(9px,1.1vh,13px)] w-[88%] rounded-b-[3px] bg-[var(--wood)]" />
      <div className="mx-auto h-[clamp(6px,.8vh,9px)] w-[66%] bg-[var(--wood-deep)]" />
    </motion.button>
  );
}
