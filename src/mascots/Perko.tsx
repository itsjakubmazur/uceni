import { motion } from 'motion/react';
import type { MascotProps } from './types.ts';

/**
 * PÉRKO — natahovací ptáček z dílny.
 *
 * Mosazné tělo, smaltovaná prsíčka, na zádech klíček, který se při čekání
 * pomalu odtáčí. Oči jsou dva kamínky jako v hodinkách. Místo peří má
 * plíšky, které při radosti cvaknou nahoru.
 *
 * Nemá křídla k létání — je to mechanika, která poskakuje. To je záměr:
 * pohyb má být cukavý a rytmický, ne plynulý, protože tenhle svět jede na
 * pérku a ne na větru.
 */
export function Perko({ state = 'waiting', mouth = 0, className = '' }: MascotProps) {
  const sleeping = state === 'sleeping';
  const joy = state === 'joy';
  const talking = state === 'talking';

  return (
    <motion.svg
      viewBox="0 0 240 260"
      className={`h-auto w-full ${className}`}
      animate={
        joy
          ? { y: [0, -22, 0, -10, 0], rotate: [0, -8, 8, 0] }
          : sleeping
            ? { y: 6, rotate: 4 }
            : { y: [0, -6, 0, 0], rotate: [-1, 1.5, -1] }
      }
      transition={
        joy
          ? { duration: 0.8, ease: 'easeOut' }
          : { duration: 3.6, repeat: Infinity, ease: 'easeInOut', times: [0, 0.18, 0.36, 1] }
      }
    >
      {/* stín na ponku */}
      <ellipse cx="120" cy="248" rx="54" ry="9" fill="#1B120C" opacity="0.45" />

      {/* klíček na zádech — pomalu se odtáčí */}
      <motion.g
        animate={sleeping ? { rotate: 0 } : { rotate: -360 }}
        transition={{ duration: sleeping ? 0 : 26, repeat: sleeping ? 0 : Infinity, ease: 'linear' }}
        style={{ transformOrigin: '62px 128px' }}
      >
        <circle cx="62" cy="128" r="9" fill="#8A6A2A" />
        <path d="M62 128 m -26 0 a 26 26 0 0 1 52 0" fill="none" stroke="#C9A227" strokeWidth="9" strokeLinecap="round" />
        <rect x="58" y="118" width="8" height="22" rx="3" fill="#C9A227" />
      </motion.g>

      {/* nohy */}
      <path d="M100 232 V212 M100 232 h-14 M100 232 h14" stroke="#8A6A2A" strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M142 232 V212 M142 232 h-14 M142 232 h14" stroke="#8A6A2A" strokeWidth="6" strokeLinecap="round" fill="none" />

      {/* tělo */}
      <ellipse cx="122" cy="166" rx="56" ry="54" fill="#C9A227" />
      <ellipse cx="122" cy="166" rx="56" ry="54" fill="none" stroke="#8A6A2A" strokeWidth="3" />
      {/* smaltovaná prsíčka */}
      <path d="M122 118 q 40 22 34 62 q -34 22 -68 0 q -6 -40 34 -62 Z" fill="#2C5E4F" />
      <path d="M122 126 q 30 18 26 50" stroke="#3C7D69" strokeWidth="3" fill="none" opacity="0.8" />

      {/* plíškové křídlo */}
      <motion.g
        animate={joy ? { rotate: [0, -26, 4, 0] } : { rotate: [0, -5, 0] }}
        transition={{ duration: joy ? 0.7 : 4.2, repeat: joy ? 0 : Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '150px 150px' }}
      >
        <path d="M150 146 q 40 6 46 34 q -26 14 -50 -6 Z" fill="#E3C567" />
        <path d="M150 156 q 34 6 40 26" stroke="#8A6A2A" strokeWidth="2.5" fill="none" />
      </motion.g>

      {/* ocásek z plíšků */}
      <path d="M68 166 L28 148 L34 168 L26 186 Z" fill="#E3C567" />
      <path d="M68 166 L30 166" stroke="#8A6A2A" strokeWidth="2" />

      {/* hlava */}
      <circle cx="134" cy="96" r="40" fill="#D9B43C" />
      <circle cx="134" cy="96" r="40" fill="none" stroke="#8A6A2A" strokeWidth="3" />
      {/* čepička z mosazi */}
      <path d="M100 76 q 34 -34 68 -4 q -34 -12 -68 4 Z" fill="#E3C567" />

      {/* zobák — při mluvení se otevírá */}
      <motion.g animate={{ rotate: talking ? mouth * 14 : joy ? 10 : 0 }} style={{ transformOrigin: '172px 100px' }}>
        <path d="M172 92 L210 100 L172 110 Z" fill="#B0413A" />
      </motion.g>
      <path d="M172 100 L206 100" stroke="#8A2F29" strokeWidth="2" opacity="0.7" />

      {/* oko jako kámen v hodinkách */}
      {sleeping ? (
        <path d="M136 94 q 12 10 24 0" stroke="#1B120C" strokeWidth="4" fill="none" strokeLinecap="round" />
      ) : (
        <g>
          <circle cx="148" cy="92" r="13" fill="#F1E3BE" />
          <motion.circle
            cx="151" cy="93" r="7.5" fill="#B0413A"
            animate={{ scaleY: [1, 1, 0.08, 1] }}
            transition={{ duration: 4.4, repeat: Infinity, times: [0, 0.93, 0.96, 1] }}
            style={{ transformOrigin: '151px 93px' }}
          />
          <circle cx="154" cy="89" r="2.6" fill="#FFF6DE" />
        </g>
      )}

      {/* chocholka z pérka */}
      <motion.path
        d="M126 58 q -6 -26 14 -34"
        stroke="#C9A227"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
        animate={joy ? { rotate: [0, -16, 12, 0] } : { rotate: [-3, 5, -3] }}
        transition={{ duration: joy ? 0.7 : 3.4, repeat: joy ? 0 : Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '126px 58px' }}
      />
      <circle cx="141" cy="23" r="5.5" fill="#B0413A" />
    </motion.svg>
  );
}
