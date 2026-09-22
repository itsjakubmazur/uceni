import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { Grain } from '../shared/Grain.tsx';
import { useParallax, useBreath } from '../shared/useParallax.ts';
import { PaperScene } from '../concepts/paper/PaperScene.tsx';
import { Footlights } from './Footlights.tsx';
import { Kulisak } from '../mascots/Kulisak.tsx';
import { sfx } from '../audio/sfx.ts';
import type { MascotState } from '../mascots/types.ts';

/**
 * Jeviště. Společný rám pro všechny obrazovky: scéna, sukno, rampa, zrno.
 *
 * Obsah se do něj vkládá, takže se scéna mezi úlohami nepřekresluje a
 * přechody jsou plynulé — divadlo zůstává, mění se jen to, co se na něm hraje.
 */
export function Stage({
  children,
  progress,
  mascot = 'waiting',
  mouth = 0,
  onBack,
  showMascot = true,
}: {
  children: ReactNode;
  /** Postup v běžícím sezení. Chybí, když se zrovna nehraje. */
  progress?: { done: number; total: number };
  mascot?: MascotState;
  mouth?: number;
  /** Cesta zpátky. Je vidět vždycky, když se dá někam odejít. */
  onBack?: () => void;
  showMascot?: boolean;
}) {
  const p = useParallax();
  const breath = useBreath(16);

  return (
    <div
      className="relative h-full w-full overflow-hidden font-andika"
      style={{ background: 'var(--ink-soft)' }}
    >
      <PaperScene p={p} breath={breath} />

      {children}

      {showMascot && (
        <div className="pointer-events-none absolute bottom-[15.5%] right-[2.5%] z-10 w-[clamp(120px,16vw,240px)]">
          <Kulisak state={mascot} mouth={mouth} />
        </div>
      )}

      {onBack && <BackButton onBack={onBack} />}

      {progress && <Footlights done={progress.done} total={progress.total} />}

      <Grain opacity={0.24} seed={11} />
    </div>
  );
}

/**
 * Odchod zpátky na cestu.
 *
 * Bez ptaní a bez potvrzování. Dítě, které se rozhodne skončit, má mít
 * možnost skončit — postup se ukládá po každé odpovědi, takže se nic
 * neztratí. Ikona je domeček, protože šipka zpátky pro pětiletého nic
 * neznamená.
 */
function BackButton({ onBack }: { onBack: () => void }) {
  return (
    <motion.button
      className="absolute left-[2%] top-[3%] z-40 grid place-items-center rounded-full"
      style={{
        width: 'clamp(88px, 8vw, 104px)',
        height: 'clamp(88px, 8vw, 104px)',
        background: 'rgba(246,235,212,.88)',
        border: '3px solid #8B6A45',
        boxShadow: '0 10px 18px -10px rgba(43,30,22,.85)',
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 180, damping: 16 }}
      whileTap={{ scale: 0.93 }}
      onPointerDown={() => {
        sfx.tap();
        onBack();
      }}
      aria-label="zpátky na cestu"
    >
      <svg viewBox="0 0 48 48" className="h-[52%] w-[52%]">
        <path d="M24 8 L6 24 h6 v16 h24 V24 h6 Z" fill="#3B2A20" />
        <rect x="20" y="28" width="8" height="12" fill="#F6EBD4" />
      </svg>
    </motion.button>
  );
}
