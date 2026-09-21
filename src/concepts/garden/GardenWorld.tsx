import type { CSSProperties } from 'react';
import { motion } from 'motion/react';
import { Glass } from '../../shared/Glass.tsx';
import { Grain } from '../../shared/Grain.tsx';
import { useParallax, useBreath } from '../../shared/useParallax.ts';
import { GardenScene } from './GardenScene.tsx';
import { Blikalka } from '../../mascots/Blikalka.tsx';

/**
 * NOČNÍ ZAHRADA
 *
 * Zahrada po setmění, kde světlo nosí světlušky. Tma je teplá — zelená
 * a okrová, žádná modrofialová — takže každý svítící bod je událost.
 *
 * Sklo je tu sklenice. Odpovědi jsou zavařovačky s chycenou světluškou,
 * písmeno je na skle. Správná volba sklenici otevře a světluška uletí
 * doplnit chybějící světlo na cestě.
 *
 * Postup světem: podél pěšiny stojí květy. Každé zvládnuté písmeno jeden
 * natrvalo rozsvítí a otevře.
 */

const TOKENS = {
  '--glass-tint': 'rgba(180, 226, 200, 0.08)',
  '--glass-edge':
    'linear-gradient(160deg, rgba(255,246,222,.75), rgba(255,246,222,.06) 42%, rgba(244,185,66,.45))',
  '--glass-sheen': 'linear-gradient(to bottom, rgba(255,246,222,.22), rgba(255,246,222,0))',
  '--glass-shadow': '0 20px 44px -22px rgba(0,0,0,.8)',
  '--glass-blur': '6px',
  '--glass-saturate': '1.5',
} as CSSProperties;

const TILES = [
  { glyph: 'N', lift: 14, tilt: -2 },
  { glyph: 'M', lift: 46, tilt: 1 },
  { glyph: 'A', lift: 6, tilt: 2.4 },
];

export function GardenWorld() {
  const p = useParallax();
  const breath = useBreath(18);

  return (
    <div
      className="relative h-full w-full overflow-hidden font-andika"
      style={{ ...TOKENS, background: '#0B1712' }}
    >
      <GardenScene p={p} breath={breath} />

      {/* Otázka visí na pavučinovém vlákně vlevo, mimo osu. */}
      <motion.div
        className="absolute left-[5%] top-[9%] w-[clamp(240px,32vw,430px)]"
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: [0, 5, 0] }}
        transition={{
          opacity: { duration: 0.5 },
          y: { duration: 7, repeat: Infinity, ease: 'easeInOut' },
        }}
      >
        <Glass radius={26} className="px-[clamp(18px,2.6vw,34px)] py-[clamp(14px,2.2vh,24px)]">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: 'linear-gradient(#0D1B14D9, #14291FE6)' }}
          />
          <p className="relative text-[clamp(18px,2.4vw,31px)] leading-tight text-[#FFF3D6]">
            Kde je písmeno od <strong className="font-bold text-[#F8D98A]">Mikuláše</strong>?
          </p>
        </Glass>
      </motion.div>

      <div className="absolute inset-x-0 bottom-[22%] flex items-end justify-center gap-[clamp(14px,3vw,48px)] px-[10%]">
        {TILES.map((tile, i) => (
          <Jar key={tile.glyph} {...tile} index={i} />
        ))}
      </div>

      <FlowerPath />

      <div className="absolute right-[5%] bottom-[30%] w-[clamp(120px,14vw,205px)]">
        <Blikalka state="waiting" />
      </div>

      <Grain opacity={0.14} seed={23} />
    </div>
  );
}

/* --------------------------------------------------------------- sklenice */

function Jar({ glyph, lift, tilt, index }: { glyph: string; lift: number; tilt: number; index: number }) {
  return (
    <motion.button
      className="relative origin-bottom"
      initial={{ y: 60, opacity: 0, rotate: tilt * 2 }}
      animate={{ y: -lift, opacity: 1, rotate: tilt }}
      transition={{ type: 'spring', stiffness: 150, damping: 14, delay: 0.12 * index }}
      whileTap={{ scale: 0.96, rotate: 0 }}
    >
      {/* víčko */}
      <div
        className="mx-auto h-[clamp(14px,1.9vh,22px)] w-[62%] rounded-t-[8px]"
        style={{ background: 'linear-gradient(#6E8B72, #47614E)', boxShadow: 'inset 0 2px 0 rgba(255,246,222,.3)' }}
      />
      <div className="mx-auto h-[clamp(8px,1vh,12px)] w-[72%] rounded-[3px] bg-[#3C5344]" />

      <div className="relative">
        <Glass
          radius={22}
          className="grid h-[clamp(140px,19vw,232px)] w-[clamp(120px,15.5vw,196px)] place-items-center"
        >
          {/*
            Světluška sedí za písmenem a podsvěcuje ho. Řeší to zároveň
            kontrast: tmavý znak na tmavém skle by byl nečitelný, takhle
            je vidět jako silueta proti světlu.
          */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 64% 54% at 50% 46%, rgba(255,240,200,.95), rgba(244,185,66,.72) 52%, rgba(244,185,66,.12) 80%, rgba(244,185,66,0) 92%)',
            }}
          />
          <motion.span
            aria-hidden
            className="pointer-events-none absolute h-[26%] w-[26%] rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(255,252,240,1), rgba(255,240,200,.6) 45%, rgba(244,185,66,0) 75%)',
            }}
            animate={{ opacity: [0.5, 1, 0.6, 0.95, 0.5], x: [0, 16, -12, 8, 0], y: [0, -18, 10, -8, 0] }}
            transition={{ duration: 6 + index * 1.4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <span
            className="relative block font-bold leading-none"
            style={{ fontSize: 'clamp(72px, 10vw, 140px)', color: '#14110B' }}
          >
            {glyph}
          </span>
        </Glass>
      </div>
    </motion.button>
  );
}

/* ------------------------------------------------------------ cesta květů */

const FLOWERS = [true, true, true, true, true, true, false, false, false];

function FlowerPath() {
  return (
    <div className="absolute inset-x-0 bottom-0 h-[20%]">
      <div className="absolute inset-x-[4%] bottom-[22%] flex items-end justify-between">
        {FLOWERS.map((open, i) => (
          <Flower key={i} open={open} index={i} />
        ))}
      </div>
    </div>
  );
}

function Flower({ open, index }: { open: boolean; index: number }) {
  const petals = 6;
  return (
    <motion.svg
      viewBox="0 0 60 110"
      className="h-[clamp(52px,9vh,104px)] w-auto"
      animate={{ rotate: [-2, 2, -2] }}
      transition={{ duration: 6 + index * 0.5, repeat: Infinity, ease: 'easeInOut' }}
      style={{ transformOrigin: '30px 108px' }}
    >
      <path d="M30 108 Q 26 76 30 52" stroke="#2C6247" strokeWidth="4" fill="none" strokeLinecap="round" />
      <ellipse cx="18" cy="80" rx="11" ry="6" fill="#24513F" transform="rotate(-24 18 80)" />
      {open ? (
        <g>
          <circle cx="30" cy="44" r="30" fill="#F4B942" opacity="0.18">
            <animate attributeName="opacity" values="0.1;0.3;0.1" dur={`${4 + index * 0.4}s`} repeatCount="indefinite" />
          </circle>
          {Array.from({ length: petals }, (_, i) => {
            const a = (i / petals) * 360;
            return (
              <ellipse
                key={i}
                cx="30"
                cy="30"
                rx="7"
                ry="15"
                fill="#EBD9BE"
                transform={`rotate(${a} 30 44)`}
                opacity="0.92"
              />
            );
          })}
          <circle cx="30" cy="44" r="8.5" fill="#F4B942" />
          <circle cx="30" cy="44" r="4.5" fill="#FFF6DE" />
        </g>
      ) : (
        // zavřené poupě: čeká, až ho probudí další zvládnuté písmeno
        <g opacity="0.75">
          <path d="M30 30 q 11 12 8 26 q -8 6 -16 0 q -3 -14 8 -26 Z" fill="#24513F" />
          <path d="M30 34 q 5 12 3 22" stroke="#2C6247" strokeWidth="2" fill="none" />
        </g>
      )}
    </motion.svg>
  );
}
