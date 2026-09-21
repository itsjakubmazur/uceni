import { motion } from 'motion/react';
import { Glass } from '../shared/Glass.tsx';
import { audio } from '../audio/AudioEngine.ts';
import { sfx } from '../audio/sfx.ts';
import type { Area } from '../engine/types.ts';

/**
 * Rozcestník. Dvě velké volby, žádný text nutný k ovládání.
 *
 * Klepnutí na cokoliv to vždycky i vysloví — i na volbu, kterou dítě
 * nakonec nevybere, protože právě tím se naučí, co ta volba znamená.
 */
export function HomeScreen({ onChoose }: { onChoose: (area: Area) => void }) {
  return (
    <div className="absolute inset-x-0 bottom-[17%] z-20 flex items-end justify-center gap-[clamp(20px,5vw,80px)] px-[6%]">
      <Choice
        area="numbers"
        speechId="ui.numbers"
        lift={26}
        onChoose={onChoose}
        sample={<span className="text-[clamp(64px,11vw,150px)] font-bold leading-none text-[#1F1710]">3</span>}
      />
      <Choice
        area="letters"
        speechId="ui.letters"
        lift={0}
        onChoose={onChoose}
        sample={<span className="text-[clamp(64px,11vw,150px)] font-bold leading-none text-[#1F1710]">M</span>}
      />
    </div>
  );
}

function Choice({
  area,
  speechId,
  sample,
  lift,
  onChoose,
}: {
  area: Area;
  speechId: string;
  sample: React.ReactNode;
  lift: number;
  onChoose: (area: Area) => void;
}) {
  return (
    <motion.button
      className="origin-bottom"
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: -lift, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 150, damping: 15 }}
      whileTap={{ scale: 0.96 }}
      onPointerDown={() => {
        sfx.tap();
        void audio.say(speechId);
        window.setTimeout(() => onChoose(area), 620);
      }}
    >
      <div className="relative">
        <Glass
          radius={6}
          className="h-[clamp(180px,24vw,300px)] w-[clamp(160px,21vw,268px)]"
          style={{ boxShadow: '0 22px 34px -20px rgba(43,30,22,.9)' }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 64% 56% at 50% 48%, rgba(248,238,216,.88), rgba(248,238,216,.4) 66%, rgba(248,238,216,0) 90%)',
            }}
          />
          <span className="relative">{sample}</span>
        </Glass>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            border: 'clamp(12px,1.5vw,20px) solid transparent',
            borderImage: 'linear-gradient(160deg, #A07C52, #6E5234 55%, #4E3A22) 1',
          }}
        />
      </div>
      <div className="mx-auto h-[clamp(10px,1.3vh,16px)] w-[88%] bg-[var(--wood)]" />
      <div className="mx-auto h-[clamp(7px,1vh,11px)] w-[64%] bg-[var(--wood-deep)]" />
    </motion.button>
  );
}
