import type { CSSProperties } from 'react';
import { motion } from 'motion/react';
import { Glass } from '../../shared/Glass.tsx';
import { Grain } from '../../shared/Grain.tsx';
import { useParallax, useBreath } from '../../shared/useParallax.ts';
import { PaperScene } from './PaperScene.tsx';
import { Kulisak } from '../../mascots/Kulisak.tsx';

/**
 * PAPÍROVÉ DIVADLO
 *
 * Svět je ručně vystřižené loutkové divadlo. Vrstvy papíru zasunuté v drážkách,
 * prosvícené teplou lampou zezadu, barvy o chlup mimo soutisk jako ve starém
 * dětském tisku.
 *
 * Sklo je tu kouzelná laterna: odpovědi jsou skleněné diapozitivy v dřevěných
 * rámech. Písmeno je na skle namalované neprůhlednou barvou, kolem něj je vidět
 * scéna — rozostřená tím sklem, ne schovaná za ním.
 *
 * Postup světem: rampa u paty jeviště. Každé zvládnuté písmeno natrvalo
 * rozsvítí jednu lampičku a do scény sjede další kulisa.
 */

const TOKENS = {
  '--glass-tint': 'rgba(243, 229, 202, 0.10)',
  '--glass-edge':
    'linear-gradient(155deg, rgba(255,252,242,.9), rgba(255,252,242,.1) 45%, rgba(59,42,32,.45))',
  '--glass-sheen': 'linear-gradient(to bottom, rgba(255,252,243,.3), rgba(255,252,243,0))',
  '--glass-shadow': '0 14px 30px -14px rgba(59,42,32,.6)',
  '--glass-blur': '5px',
  '--glass-saturate': '1.25',
} as CSSProperties;

const TILES = [
  { glyph: 'N', lift: 0, tilt: -1.4 },
  { glyph: 'M', lift: 34, tilt: 0.6 },
  { glyph: 'A', lift: 12, tilt: 1.6 },
];

export function PaperWorld() {
  const p = useParallax();
  const breath = useBreath(16);

  return (
    <div
      className="relative h-full w-full overflow-hidden font-andika"
      style={{ ...TOKENS, background: '#3B2A20' }}
    >
      <PaperScene p={p} breath={breath} />

      <HangingSign />

      {/* Diapozitivy stojí na prknech v mírném oblouku, každý jinak vysoko. */}
      <div className="absolute inset-x-0 bottom-[18.5%] flex items-end justify-center gap-[clamp(16px,3.2vw,52px)] px-[8%]">
        {TILES.map((tile, i) => (
          <Slide key={tile.glyph} {...tile} index={i} />
        ))}
      </div>

      <Footlights />

      <div className="absolute bottom-[15.5%] right-[2.5%] w-[clamp(170px,21vw,320px)] origin-bottom">
        <Kulisak state="waiting" />
      </div>

      <Grain opacity={0.26} seed={11} />
    </div>
  );
}

/* --------------------------------------------------------------- cedule */

function HangingSign() {
  return (
    <motion.div
      className="absolute left-[6.5%] top-[13.5%] w-[clamp(250px,34vw,460px)] origin-top"
      initial={{ rotate: -2.2, y: -26, opacity: 0 }}
      animate={{ rotate: [-1.2, 1, -1.2], y: 0, opacity: 1 }}
      transition={{
        rotate: { duration: 8.5, repeat: Infinity, ease: 'easeInOut' },
        y: { type: 'spring', stiffness: 70, damping: 11 },
        opacity: { duration: 0.4 },
      }}
    >
      <svg aria-hidden viewBox="0 0 400 40" className="h-[clamp(22px,3.4vh,40px)] w-full" preserveAspectRatio="none">
        <line x1="66" y1="-40" x2="74" y2="40" stroke="#3B2A20" strokeWidth="2" opacity=".65" />
        <line x1="334" y1="-40" x2="326" y2="40" stroke="#3B2A20" strokeWidth="2" opacity=".65" />
      </svg>
      <Glass radius={12} className="px-[clamp(18px,2.6vw,34px)] py-[clamp(12px,2vh,22px)]">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: 'linear-gradient(#F6EBD4F2, #EADCBEF7)' }}
        />
        <p className="relative text-[clamp(19px,2.5vw,33px)] leading-tight text-[#2A1E16]">
          Kde je písmeno od <strong className="font-bold">Mikuláše</strong>?
        </p>
      </Glass>
    </motion.div>
  );
}

/* --------------------------------------------------------- diapozitiv */

function Slide({ glyph, lift, tilt, index }: { glyph: string; lift: number; tilt: number; index: number }) {
  return (
    <motion.button
      className="relative origin-bottom"
      initial={{ y: 56, opacity: 0, rotate: tilt * 2 }}
      animate={{ y: -lift, opacity: 1, rotate: tilt }}
      transition={{ type: 'spring', stiffness: 170, damping: 15, delay: 0.1 * index }}
      whileTap={{ scale: 0.965, rotate: 0 }}
    >
      {/*
        Rám je vrstva NAD sklem, ne pod ním. Kdyby bylo sklo uvnitř rámu,
        rozostřovalo by dřevo místo scény a celý diapozitiv by byl slepý.
      */}
      <div className="relative">
        <Glass
          radius={3}
          className="grid h-[clamp(132px,18vw,222px)] w-[clamp(118px,15.5vw,196px)] place-items-center"
          style={{ boxShadow: '0 18px 28px -18px rgba(43,30,22,.9)' }}
        >
          {/*
            Zápal na skle. Diapozitivy se malovaly tak, že se plocha kolem
            motivu zakalila — tady dělá totéž a zároveň to řeší požadavek,
            aby byl znak čitelný vždycky. Bez toho by N leželo na červeném
            domku a zmizelo by.
          */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 62% 54% at 50% 48%, rgba(248,238,216,.86), rgba(248,238,216,.4) 66%, rgba(248,238,216,0) 90%)',
            }}
          />
          <span
            className="relative block font-bold leading-none text-[#1F1710]"
            style={{ fontSize: 'clamp(70px, 10vw, 138px)' }}
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
      {/* podstavec */}
      <div className="mx-auto h-[clamp(9px,1.1vh,13px)] w-[88%] rounded-b-[3px] bg-[#7A5C3B]" />
      <div className="mx-auto h-[clamp(6px,.8vh,9px)] w-[66%] bg-[#5C4429]" />
    </motion.button>
  );
}

/* ---------------------------------------------------------------- rampa */

/** Šest z devíti svítí: tolik písmen už Mikuláš umí. */
const LIT = [true, true, true, true, true, true, false, false, false];

function Footlights() {
  return (
    <div className="absolute inset-x-0 bottom-0 h-[16%]">
      <div className="absolute inset-x-0 bottom-0 h-[58%] bg-[#5C4429]" />
      <div className="absolute inset-x-0 bottom-[58%] h-[clamp(6px,.9vh,10px)] bg-[#7A5C3B]" />
      <div className="absolute inset-x-0 bottom-[30%] flex items-end justify-center gap-[clamp(20px,4.4vw,72px)]">
        {LIT.map((on, i) => (
          <Lamp key={i} on={on} index={i} />
        ))}
      </div>
    </div>
  );
}

function Lamp({ on, index }: { on: boolean; index: number }) {
  return (
    <div className="relative grid place-items-end">
      {on && (
        <motion.div
          className="pointer-events-none absolute -top-[52px] left-1/2 h-[112px] w-[112px] -translate-x-1/2 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(247,200,107,.62), rgba(247,200,107,0) 66%)' }}
          animate={{ opacity: [0.7, 1, 0.84, 1], scale: [1, 1.05, 1] }}
          transition={{ duration: 3.2 + index * 0.45, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      <div
        className="relative h-[clamp(15px,2vw,26px)] w-[clamp(15px,2vw,26px)] rounded-t-full"
        style={{
          background: on ? '#FBDC9A' : '#4A3826',
          boxShadow: on
            ? '0 0 16px rgba(247,200,107,.95), inset 0 -3px 5px rgba(201,142,51,.5)'
            : 'inset 0 -3px 5px rgba(0,0,0,.45)',
        }}
      />
      <div className="h-[clamp(7px,1vh,10px)] w-[7px] bg-[#4A3826]" />
    </div>
  );
}
