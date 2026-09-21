import { motion } from 'motion/react';
import { audio } from '../audio/AudioEngine.ts';
import { sfx } from '../audio/sfx.ts';
import { glyphOf, say } from '../app/speechFor.ts';
import type { ItemId } from '../engine/types.ts';

/**
 * Seznámení: znak obří přes půl jeviště.
 *
 * Znak se „narodí" — přijede zespodu na pružině, jako když loutkář zvedne
 * kulisu. Klepnutí kdekoliv přehraje promluvu znovu, protože pětiletý chce
 * věci opakovat a nemá to být schované za tlačítkem.
 */
export function IntroTask({ itemId, onDone }: { itemId: ItemId; onDone: () => void }) {
  const glyph = glyphOf(itemId);

  return (
    <button
      className="absolute inset-0 z-20 grid place-items-center pb-[14%]"
      onPointerDown={() => {
        sfx.tap();
        audio.stop();
        void audio.say(say.intro(itemId));
      }}
    >
      <motion.div
        className="relative grid place-items-center"
        initial={{ y: 140, opacity: 0, scale: 0.85 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 130, damping: 13 }}
      >
        {/* Zákal na skle laterny. Znak musí být čitelný i přes stromy pod ním. */}
        <span
          aria-hidden
          className="pointer-events-none absolute h-[min(62vh,62vw)] w-[min(62vh,62vw)] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(246,235,212,.95), rgba(246,235,212,.72) 44%, rgba(246,235,212,0) 72%)',
          }}
        />
        <span
          className="relative block font-bold leading-none text-[#1F1710]"
          style={{ fontSize: 'clamp(140px, 26vw, 360px)' }}
        >
          {glyph}
        </span>
      </motion.div>

      {/* Pokračuje se klepnutím na cedulku, ne časovačem. Dítě nikam nespěchá. */}
      <motion.div
        className="absolute bottom-[19%] left-[7%]"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6, type: 'spring', stiffness: 120, damping: 14 }}
      >
        <NextButton onPress={onDone} />
      </motion.div>
    </button>
  );
}

function NextButton({ onPress }: { onPress: () => void }) {
  return (
    <motion.button
      className="grid h-[clamp(88px,11vw,124px)] w-[clamp(88px,11vw,124px)] place-items-center rounded-full"
      style={{
        background: 'radial-gradient(circle at 36% 30%, #FBDC9A, #D69C36)',
        boxShadow: '0 12px 22px -12px rgba(43,30,22,.9), inset 0 2px 0 rgba(255,246,222,.6)',
      }}
      whileTap={{ scale: 0.94 }}
      animate={{ scale: [1, 1.04, 1] }}
      transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      onPointerDown={(e) => {
        e.stopPropagation();
        sfx.tap();
        onPress();
      }}
    >
      <svg viewBox="0 0 40 40" className="h-1/2 w-1/2">
        <path d="M13 8 L30 20 L13 32 Z" fill="#3B2A20" />
      </svg>
    </motion.button>
  );
}
