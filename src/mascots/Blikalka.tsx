import { motion } from 'motion/react';
import type { MascotProps } from './types.ts';

/**
 * BLIKALKA — můra se svítícím bříškem.
 *
 * Kulatá, chlupatá, s velkýma měkkýma očima a křídly, která má poskládaná
 * jako plášť. Bříško jí svítí a rytmus toho svícení je její řeč: když čeká,
 * dýchá pomalu; když se raduje, rozzáří se naplno; když spí, jen sotva
 * doutná. Tykadla reagují dřív než ona sama.
 */
export function Blikalka({ state = 'waiting', mouth = 0, className = '' }: MascotProps) {
  const sleeping = state === 'sleeping';
  const joy = state === 'joy';
  const talking = state === 'talking';

  const glow = sleeping ? [0.15, 0.25, 0.15] : joy ? [1, 0.7, 1] : [0.45, 0.85, 0.45];

  return (
    <motion.svg
      viewBox="0 0 260 260"
      className={`h-auto w-full ${className}`}
      animate={
        joy
          ? { y: [0, -26, 0, -12, 0], rotate: [0, -7, 7, 0] }
          : sleeping
            ? { y: 8, rotate: 3 }
            : { y: [0, -12, 0], rotate: [-2, 2, -2] }
      }
      transition={
        joy ? { duration: 0.9, ease: 'easeOut' } : { duration: 5, repeat: Infinity, ease: 'easeInOut' }
      }
    >
      <defs>
        <radialGradient id="bellyGlow">
          <stop offset="0%" stopColor="#FFF6DE" />
          <stop offset="45%" stopColor="#F4B942" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#F4B942" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* záře bříška do okolí */}
      <motion.circle
        cx="130" cy="176" r="86" fill="url(#bellyGlow)"
        animate={{ opacity: glow, scale: sleeping ? 1 : [1, 1.08, 1] }}
        transition={{ duration: joy ? 0.9 : 3.6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '130px 176px' }}
      />

      {/* křídla poskládaná jako plášť */}
      <motion.g
        animate={joy ? { rotate: [0, -9, 9, 0] } : { rotate: [-2.5, 2.5, -2.5] }}
        transition={{ duration: joy ? 0.8 : 4.4, repeat: joy ? 0 : Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '130px 130px' }}
      >
        <path d="M118 108 Q 46 112 30 176 Q 26 216 70 214 Q 112 208 124 166 Z" fill="#2C6247" />
        <path d="M142 108 Q 214 112 230 176 Q 234 216 190 214 Q 148 208 136 166 Z" fill="#2C6247" />
        <path d="M120 116 Q 62 122 48 172 Q 46 200 78 198 Q 110 192 122 160 Z" fill="#36795A" />
        <path d="M140 116 Q 198 122 212 172 Q 214 200 182 198 Q 150 192 138 160 Z" fill="#36795A" />
        <path d="M60 158 q 28 -12 56 -4" stroke="#2C6247" strokeWidth="2.5" fill="none" opacity="0.8" />
        <path d="M200 158 q -28 -12 -56 -4" stroke="#2C6247" strokeWidth="2.5" fill="none" opacity="0.8" />
      </motion.g>

      {/* bříško */}
      <ellipse cx="130" cy="172" rx="40" ry="46" fill="#3E8A65" />
      <motion.ellipse
        cx="130" cy="184" rx="27" ry="28" fill="#F4B942"
        animate={{ opacity: glow }}
        transition={{ duration: joy ? 0.9 : 3.6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.ellipse
        cx="130" cy="184" rx="15" ry="16" fill="#FFF6DE"
        animate={{ opacity: glow }}
        transition={{ duration: joy ? 0.9 : 3.6, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* chlupatý límec */}
      <path
        d="M96 128 q 34 -16 68 0 q -6 18 -34 20 q -28 -2 -34 -20 Z"
        fill="#5FA87E"
      />

      {/* hlava */}
      <circle cx="130" cy="98" r="42" fill="#4E9A72" />
      <circle cx="130" cy="98" r="42" fill="none" stroke="#2C6247" strokeWidth="2" opacity="0.5" />

      {/* tykadla — reagují dřív než zbytek */}
      <motion.g
        animate={joy ? { rotate: [0, -12, 12, 0] } : { rotate: [-4, 4, -4] }}
        transition={{ duration: joy ? 0.7 : 3.2, repeat: joy ? 0 : Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '130px 66px' }}
      >
        <path d="M112 64 Q 92 26 68 20" stroke="#2C6247" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M148 64 Q 168 26 192 20" stroke="#2C6247" strokeWidth="5" fill="none" strokeLinecap="round" />
        <circle cx="66" cy="18" r="8" fill="#F4B942" />
        <circle cx="194" cy="18" r="8" fill="#F4B942" />
      </motion.g>

      {/* oči */}
      {sleeping ? (
        <>
          <path d="M104 96 q 12 11 24 0" stroke="#14291F" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M132 96 q 12 11 24 0" stroke="#14291F" strokeWidth="4" fill="none" strokeLinecap="round" />
        </>
      ) : (
        [112, 148].map((cx) => (
          <g key={cx}>
            <motion.ellipse
              cx={cx} cy="96" rx="12" ry="13" fill="#14291F"
              animate={{ scaleY: [1, 1, 0.08, 1] }}
              transition={{ duration: 4.8, repeat: Infinity, times: [0, 0.94, 0.97, 1] }}
              style={{ transformOrigin: `${cx}px 96px` }}
            />
            <circle cx={cx + 4} cy="91" r="4" fill="#FFF6DE" opacity="0.9" />
          </g>
        ))
      )}

      {/* pusa */}
      {joy ? (
        <path d="M116 118 q 14 16 28 0 q -14 7 -28 0 Z" fill="#14291F" />
      ) : (
        <ellipse
          cx="130"
          cy="118"
          rx={talking ? 7 + mouth * 3 : 7}
          ry={talking ? 2 + mouth * 9 : 2.4}
          fill="#14291F"
        />
      )}
    </motion.svg>
  );
}
