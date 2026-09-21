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
export function HomeScreen({
  onChoose,
  onMap,
  areas,
}: {
  onChoose: (area: Area) => void;
  onMap: () => void;
  /** Vypnutá oblast se na rozcestníku vůbec nenabídne. */
  areas: { numbers: boolean; letters: boolean };
}) {
  return (
    <div className="absolute inset-0 z-20">
      <div className="absolute inset-x-0 bottom-[17%] flex flex-col items-center justify-center gap-[clamp(10px,2vh,28px)] px-[4%] sm:flex-row sm:items-end sm:gap-[clamp(20px,5vw,80px)]">
      {areas.numbers && (
      <Choice
        area="numbers"
        speechId="ui.numbers"
        lift={26}
        onChoose={onChoose}
        sample={<span className="text-[clamp(52px,11vw,150px)] font-bold leading-none text-[#1F1710]">3</span>}
      />
      )}
      {areas.letters && (
      <Choice
        area="letters"
        speechId="ui.letters"
        lift={0}
        onChoose={onChoose}
        sample={<span className="text-[clamp(52px,11vw,150px)] font-bold leading-none text-[#1F1710]">M</span>}
      />
      )}

      </div>

      {/* Mapa je menší a stranou: není to učení, je to odměna. */}
      <motion.button
        className="absolute left-[5%] top-[7%] grid h-[clamp(88px,10vw,128px)] w-[clamp(88px,10vw,128px)] place-items-center rounded-full"
        style={{
          background: 'radial-gradient(circle at 36% 30%, #FBDC9A, #D69C36)',
          boxShadow: '0 12px 22px -12px rgba(43,30,22,.9)',
        }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 150, damping: 14, delay: 0.2 }}
        whileTap={{ scale: 0.94 }}
        onPointerDown={() => {
          sfx.tap();
          void audio.say('ui.map');
          window.setTimeout(onMap, 500);
        }}
        aria-label="mapa"
      >
        <svg viewBox="0 0 40 40" className="h-1/2 w-1/2">
          <path d="M5 30 Q 14 20 20 26 T 35 12" stroke="#3B2A20" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <circle cx="5" cy="30" r="4" fill="#3B2A20" />
          <circle cx="20" cy="26" r="3.5" fill="#3B2A20" />
          <circle cx="35" cy="12" r="4" fill="#3B2A20" />
        </svg>
      </motion.button>
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
          className="h-[clamp(120px,24vw,300px)] w-[clamp(108px,21vw,268px)]"
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
