import { motion } from 'motion/react';
import type { MascotProps } from './types.ts';

/**
 * KULISÁK — kluk, co v divadle obsluhuje lampy.
 *
 * Vystřižený z papíru a složený z plochých dílů, které se překrývají a vrhají
 * na sebe drobné stíny. Na hlavě má čepici složenou z novin jako loďku.
 * V ruce drží lampičku — tou se rozsvěcí rampa, takže patří přímo k tomu,
 * jak se ve světě postupuje.
 *
 * Záměrně nemá nos ani uši: čím míň detailů v obličeji, tím líp se do něj
 * dítě vidí. Výraz nesou jenom oči, tváře a pusa.
 */
export function Kulisak({ state = 'waiting', mouth = 0, className = '' }: MascotProps) {
  const sleeping = state === 'sleeping';
  const joy = state === 'joy';
  const talking = state === 'talking';

  return (
    <motion.svg
      viewBox="0 0 240 320"
      className={`h-auto w-full ${className}`}
      animate={
        joy
          ? { rotate: [0, -6, 6, -3, 0], y: [0, -18, 0] }
          : sleeping
            ? { rotate: 5, y: 8 }
            : { rotate: [-1.4, 1.4, -1.4], y: [0, -5, 0] }
      }
      transition={
        joy
          ? { duration: 0.75, ease: 'easeOut' }
          : { duration: 6, repeat: Infinity, ease: 'easeInOut' }
      }
      style={{ transformOrigin: '120px 316px' }}
    >
      {/* stín na prknech */}
      <ellipse cx="120" cy="312" rx="62" ry="10" fill="#3B2A20" opacity="0.22" />

      {/* --------------------------------------------------------- tělo */}
      <path d="M74 306 Q 70 206 92 178 L148 178 Q 170 206 166 306 Z" fill="#2F6B62" />
      <path d="M74 306 Q 72 236 84 198 L104 198 Q 90 250 92 306 Z" fill="#26564F" />
      {/* zástěra */}
      <path d="M92 214 H148 L154 288 Q 120 298 86 288 Z" fill="#E3D3B2" />
      <path d="M92 214 H148 L150 236 H90 Z" fill="#D2BF9A" />

      {/* levá ruka volně podél těla */}
      <path d="M84 224 Q 62 244 66 272" stroke="#2F6B62" strokeWidth="15" fill="none" strokeLinecap="round" />
      <circle cx="66" cy="276" r="9" fill="#F3E5CA" />

      {/* ruka s lampičkou */}
      <path d="M160 226 Q 196 214 202 186" stroke="#2F6B62" strokeWidth="15" fill="none" strokeLinecap="round" />
      <circle cx="202" cy="184" r="9" fill="#F3E5CA" />
      <g>
        <line x1="202" y1="186" x2="202" y2="162" stroke="#6E5234" strokeWidth="4" />
        <motion.g
          animate={joy ? { rotate: [0, -12, 12, 0] } : { rotate: [-4, 4, -4] }}
          transition={{ duration: joy ? 0.7 : 5, repeat: joy ? 0 : Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '202px 162px' }}
        >
          <path d="M186 162 H218 L212 138 H192 Z" fill="#F5CE7E" />
          <path d="M186 162 H218 L212 138 H192 Z" fill="none" stroke="#6E5234" strokeWidth="3" />
          <circle cx="202" cy="150" r="22" fill="#F7C86B" opacity="0.28" />
        </motion.g>
      </g>

      {/* -------------------------------------------------------- hlava */}
      <circle cx="120" cy="120" r="54" fill="#F3E5CA" />
      <circle cx="120" cy="120" r="54" fill="none" stroke="#3B2A20" strokeWidth="2" opacity="0.28" />

      {/* vlasy: papírová ofina, jeden střih nůžkami */}
      <path d="M68 108 Q 74 64 120 62 Q 166 64 172 108 Q 150 92 132 104 Q 116 86 96 102 Q 82 94 68 108 Z" fill="#6E4A2E" />

      {/*
        Čepice složená z novin: lodička. Špičky nahoru, vodorovný přehyb
        přes celou šířku, boky mírně vypouklé tak, jak papír po složení drží.
      */}
      <g>
        <path d="M62 104 L74 62 Q 120 50 166 62 L178 104 Q 120 116 62 104 Z" fill="#E3D3B2" />
        <path d="M62 104 L74 62 Q 120 50 166 62 L178 104 Q 120 116 62 104 Z" fill="none" stroke="#A8906A" strokeWidth="2.5" />
        <path d="M66 88 Q 120 100 174 88" stroke="#A8906A" strokeWidth="2.5" fill="none" />
        <path d="M74 62 Q 120 74 166 62 L166 66 Q 120 78 74 66 Z" fill="#C3AD84" />
        {/* tisk na novinách — jen náznak řádků */}
        <g stroke="#8C7150" strokeWidth="2" opacity="0.4" strokeLinecap="round">
          <path d="M86 74 H112" />
          <path d="M122 76 H150" />
          <path d="M92 82 H134" />
        </g>
        <path d="M120 50 L120 62" stroke="#A8906A" strokeWidth="2.5" />
      </g>

      {/* oči */}
      {sleeping ? (
        <>
          <path d="M92 122 q 11 9 22 0" stroke="#231A13" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M126 122 q 11 9 22 0" stroke="#231A13" strokeWidth="4" fill="none" strokeLinecap="round" />
        </>
      ) : (
        [100, 140].map((cx) => (
          <motion.ellipse
            key={cx}
            cx={cx}
            cy="122"
            rx="7"
            ry="8"
            fill="#231A13"
            animate={{ scaleY: [1, 1, 0.08, 1] }}
            transition={{ duration: 5.2, repeat: Infinity, times: [0, 0.93, 0.965, 1] }}
            style={{ transformOrigin: `${cx}px 122px` }}
          />
        ))
      )}

      {/* tváře */}
      <ellipse cx="84" cy="140" rx="11" ry="8" fill="#B0392B" opacity="0.3" />
      <ellipse cx="156" cy="140" rx="11" ry="8" fill="#B0392B" opacity="0.3" />

      {/* pusa — při mluvení se otevírá podle hlasitosti */}
      {joy ? (
        <path d="M104 146 q 16 20 32 0 q -16 8 -32 0 Z" fill="#231A13" />
      ) : (
        <ellipse
          cx="120"
          cy="148"
          rx={talking ? 8 + mouth * 4 : 9}
          ry={talking ? 2.5 + mouth * 11 : 3}
          fill="#231A13"
        />
      )}

      {/* šála přes rameno */}
      <path d="M88 176 Q 120 190 152 176 L156 192 Q 120 206 84 192 Z" fill="#B0392B" />
      {/*
        Konec šály se hýbe otáčením kolem místa, kde vychází z uzlu — ne
        morfováním cesty. Motion mezi dvěma řetězci `d` interpolovat neumí
        a místo toho ho nastaví na undefined, což SVG shodí.
      */}
      <motion.path
        d="M150 190 Q 178 206 170 238"
        stroke="#B0392B"
        strokeWidth="13"
        fill="none"
        strokeLinecap="round"
        animate={{ rotate: [-5, 6, -5] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '150px 190px' }}
      />
    </motion.svg>
  );
}
