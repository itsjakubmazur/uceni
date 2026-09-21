import type { ReactNode } from 'react';
import { Grain } from '../shared/Grain.tsx';
import { useParallax, useBreath } from '../shared/useParallax.ts';
import { PaperScene } from '../concepts/paper/PaperScene.tsx';
import { Footlights } from './Footlights.tsx';
import { Kulisak } from '../mascots/Kulisak.tsx';
import type { MascotState } from '../mascots/types.ts';
import { THEATRE_TOKENS } from './tokens.ts';

/**
 * Jeviště. Společný rám pro všechny obrazovky: scéna, sukno, rampa, zrno.
 *
 * Obsah se do něj vkládá, takže scéna se mezi úlohami nepřekresluje a
 * přechody jsou plynulé — divadlo zůstává, mění se jen to, co se na něm hraje.
 */
export function Stage({
  children,
  litCount,
  totalLights = 10,
  mascot = 'waiting',
  mouth = 0,
}: {
  children: ReactNode;
  litCount: number;
  totalLights?: number;
  mascot?: MascotState;
  mouth?: number;
}) {
  const p = useParallax();
  const breath = useBreath(16);

  return (
    <div
      className="relative h-full w-full overflow-hidden font-andika"
      style={{ ...THEATRE_TOKENS, background: 'var(--ink-soft)' }}
    >
      <PaperScene p={p} breath={breath} />
      {children}

      {/* Kulisák stojí u pravé kulisy pořád. Je to jeho divadlo. */}
      <div className="pointer-events-none absolute bottom-[15.5%] right-[2.5%] z-10 w-[clamp(120px,16vw,240px)]">
        <Kulisak state={mascot} mouth={mouth} />
      </div>

      <Footlights lit={litCount} total={totalLights} />
      <Grain opacity={0.24} seed={11} />
    </div>
  );
}
