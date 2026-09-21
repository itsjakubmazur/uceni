import type { CSSProperties } from 'react';
import { motion } from 'motion/react';
import { Glass } from '../../shared/Glass.tsx';
import { Grain } from '../../shared/Grain.tsx';
import { useParallax, useBreath } from '../../shared/useParallax.ts';
import { WorkshopScene } from './WorkshopScene.tsx';
import { Perko } from '../../mascots/Perko.tsx';

/**
 * HODINÁŘSKÁ DÍLNA
 *
 * Interiér místo krajiny, mosaz a ořech místo papíru a listí, rytmus místo
 * plynutí. Za sklem se pořád něco točí, ale nikam to nespěchá.
 *
 * Sklo je hodinkové sklíčko: kulaté, mírně vypouklé, v mosazném kroužku.
 * Odpovědi jsou ciferníky pod ním — kulaté, což je proti hranatým
 * diapozitivům i sklenicím okamžitě poznat.
 *
 * Postup světem: nad ponkem visí soukolí. Každé zvládnuté písmeno přidá
 * jedno kolečko, které se natrvalo roztočí a pohne tím dalším.
 */

const TOKENS = {
  '--glass-tint': 'rgba(246, 214, 142, 0.07)',
  '--glass-edge':
    'linear-gradient(150deg, rgba(255,240,205,.85), rgba(255,240,205,.08) 46%, rgba(138,106,42,.7))',
  '--glass-sheen': 'linear-gradient(to bottom, rgba(255,244,214,.26), rgba(255,244,214,0))',
  '--glass-shadow': '0 16px 34px -16px rgba(0,0,0,.85)',
  '--glass-blur': '5px',
  '--glass-saturate': '1.3',
} as CSSProperties;

const TILES = [
  { glyph: 'N', lift: 8, tilt: -2.5 },
  { glyph: 'M', lift: 40, tilt: 0 },
  { glyph: 'A', lift: 18, tilt: 2.5 },
];

export function WorkshopWorld() {
  const p = useParallax();
  const breath = useBreath(20);

  return (
    <div
      className="relative h-full w-full overflow-hidden font-andika"
      style={{ ...TOKENS, background: '#241812' }}
    >
      <WorkshopScene p={p} breath={breath} />

      <GearTrain />

      {/* Otázka na mosazném štítku přišroubovaném ke stěně, vlevo dole. */}
      <motion.div
        className="absolute bottom-[8%] left-[4%] w-[clamp(230px,30vw,410px)]"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 110, damping: 15 }}
      >
        <Glass radius={10} className="px-[clamp(18px,2.4vw,32px)] py-[clamp(14px,2vh,22px)]">
          <Screw className="left-[10px] top-[10px]" />
          <Screw className="right-[10px] top-[10px]" />
          <Screw className="bottom-[10px] left-[10px]" />
          <Screw className="bottom-[10px] right-[10px]" />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: 'linear-gradient(#2A1D14E6, #1B120CF2)' }}
          />
          <p className="relative px-5 text-[clamp(17px,2.2vw,29px)] leading-tight text-[#F1E3BE]">
            Kde je písmeno od <strong className="font-bold text-[#F6D68E]">Mikuláše</strong>?
          </p>
        </Glass>
      </motion.div>

      {/* Ciferníky na mosazné liště, ve výšce ruky. */}
      <div className="absolute inset-x-0 top-[32%] flex items-center justify-center gap-[clamp(16px,3.4vw,58px)] px-[6%]">
        {TILES.map((tile, i) => (
          <Dial key={tile.glyph} {...tile} index={i} />
        ))}
      </div>

      <div className="absolute bottom-[8%] right-[13%] w-[clamp(120px,15vw,215px)]">
        <Perko state="waiting" />
      </div>

      <Grain opacity={0.2} seed={31} />
    </div>
  );
}

/* --------------------------------------------------------------- ciferník */

function Dial({ glyph, lift, tilt, index }: { glyph: string; lift: number; tilt: number; index: number }) {
  return (
    <motion.button
      className="relative"
      initial={{ scale: 0.86, opacity: 0, rotate: tilt * 3 }}
      animate={{ scale: 1, opacity: 1, rotate: tilt, y: -lift }}
      transition={{ type: 'spring', stiffness: 200, damping: 17, delay: 0.09 * index }}
      whileTap={{ scale: 0.95 }}
    >
      {/* závěs na liště */}
      <div className="mx-auto h-[clamp(16px,2.4vh,30px)] w-[10px] bg-[#8A6A2A]" />

      <div className="relative">
        <Glass
          radius={999}
          className="grid h-[clamp(140px,19vw,228px)] w-[clamp(140px,19vw,228px)] place-items-center"
        >
          {/* smaltovaný ciferník pod sklem: zaručuje kontrast znaku */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-[7%] rounded-full"
            style={{
              background: 'radial-gradient(circle at 42% 34%, #F6EBD0, #E2D0AA 72%, #CBB88F)',
              boxShadow: 'inset 0 2px 8px rgba(43,30,22,.35)',
            }}
          />
          {/* rysky jako na hodinkách */}
          <svg aria-hidden viewBox="0 0 100 100" className="pointer-events-none absolute inset-[7%]">
            {Array.from({ length: 12 }, (_, i) => {
              const a = (i / 12) * Math.PI * 2;
              return (
                <line
                  key={i}
                  x1={50 + Math.cos(a) * 43}
                  y1={50 + Math.sin(a) * 43}
                  x2={50 + Math.cos(a) * (i % 3 === 0 ? 36 : 39)}
                  y2={50 + Math.sin(a) * (i % 3 === 0 ? 36 : 39)}
                  stroke="#8A6A2A"
                  strokeWidth={i % 3 === 0 ? 2.4 : 1.2}
                  opacity="0.75"
                />
              );
            })}
          </svg>
          <span
            className="relative block font-bold leading-none text-[#1B120C]"
            style={{ fontSize: 'clamp(72px, 10vw, 140px)' }}
          >
            {glyph}
          </span>
        </Glass>
        {/* mosazný kroužek kolem sklíčka */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            border: 'clamp(7px,.9vw,12px) solid transparent',
            background:
              'linear-gradient(150deg,#E8CE86,#8A6A2A 55%,#5E4718) border-box',
            WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          }}
        />
      </div>
    </motion.button>
  );
}

function Screw({ className = '' }: { className?: string }) {
  return (
    <span
      className={`absolute h-[10px] w-[10px] rounded-full ${className}`}
      style={{ background: 'radial-gradient(circle at 35% 30%, #E8CE86, #7A5B22)' }}
    >
      <span className="absolute left-1/2 top-1/2 h-[1.5px] w-[7px] -translate-x-1/2 -translate-y-1/2 rotate-[34deg] bg-[#3A2A1E]" />
    </span>
  );
}

/* ------------------------------------------------------------- soukolí */

/** Šest z devíti koleček se točí: tolik písmen už Mikuláš umí. */
const TURNING = [true, true, true, true, true, true, false, false, false];

function GearTrain() {
  return (
    <div className="absolute inset-x-0 top-0 h-[13%]">
      <div className="absolute inset-x-0 top-[38%] h-[7px] bg-[#5E4718]" />
      <div className="absolute inset-x-0 top-[calc(38%+7px)] h-[3px] bg-[#8A6A2A] opacity-60" />
      <div className="absolute inset-x-[4%] top-[8%] flex items-start justify-between">
        {TURNING.map((on, i) => (
          <SmallGear key={i} on={on} index={i} />
        ))}
      </div>
    </div>
  );
}

function SmallGear({ on, index }: { on: boolean; index: number }) {
  const teeth = 10;
  return (
    <svg viewBox="0 0 100 100" className="h-[clamp(36px,6.2vh,64px)] w-auto">
      <g
        style={
          on
            ? {
                animation: `spin ${13 + index * 2}s linear infinite`,
                animationDirection: index % 2 ? 'reverse' : 'normal',
                transformOrigin: '50px 50px',
              }
            : undefined
        }
      >
        <circle cx="50" cy="50" r="32" fill={on ? '#E3C567' : '#4A371F'} />
        {Array.from({ length: teeth }, (_, i) => {
          const a = (i / teeth) * Math.PI * 2;
          return (
            <rect
              key={i}
              x="45"
              y="10"
              width="10"
              height="16"
              rx="2"
              fill={on ? '#E3C567' : '#4A371F'}
              transform={`rotate(${(a * 180) / Math.PI} 50 50)`}
            />
          );
        })}
        <circle cx="50" cy="50" r="20" fill={on ? '#B98F2C' : '#3A2A1E'} />
        <circle cx="50" cy="50" r="7" fill="#2A1D14" />
      </g>
      {on && <circle cx="50" cy="50" r="46" fill="#F6D68E" opacity="0.1" />}
    </svg>
  );
}
