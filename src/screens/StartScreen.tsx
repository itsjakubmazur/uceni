import { motion } from 'motion/react';
import { Kulisak } from '../mascots/Kulisak.tsx';

/**
 * První dotek.
 *
 * Safari na iPadu nepustí zvuk, dokud se uživatel obrazovky nedotkne, takže
 * appka do té doby mlčí. Místo vysvětlování tu stojí Kulisák a mává — na to
 * pětiletý klepne sám a odemkne tím zvuk, aniž by tušil, že něco odemyká.
 */
export function StartScreen({ onStart }: { onStart: () => void }) {
  return (
    <button
      className="relative h-full w-full"
      style={{ background: '#631A14' }}
      onPointerDown={onStart}
    >
      <div className="absolute inset-0 grid place-items-center">
        <motion.div
          className="w-[clamp(200px,32vw,420px)]"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 120, damping: 14 }}
        >
          <Kulisak state="waiting" />
        </motion.div>
      </div>

      {/* Sukno se rozhrne až po doteku — tohle je jen jeho náznak. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[16%]" style={{ background: '#8E2C21' }}>
        <div className="h-[30px] w-full" style={{ background: '#631A14' }} />
      </div>

      <motion.div
        className="absolute inset-x-0 bottom-[12%] flex justify-center"
        animate={{ opacity: [0.35, 1, 0.35], scale: [1, 1.06, 1] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="h-[clamp(72px,10vw,120px)] w-[clamp(72px,10vw,120px)] rounded-full border-[6px] border-[#F7C86B]" />
      </motion.div>
    </button>
  );
}
