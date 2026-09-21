import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { Glass } from '../shared/Glass.tsx';

/** Cedule na provázcích. Visí vlevo, mimo osu — nikdy uprostřed. */
export function Sign({ children }: { children: ReactNode }) {
  return (
    <motion.div
      className="absolute left-[6.5%] top-[13.5%] z-20 w-[clamp(250px,34vw,460px)] origin-top"
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
        <p className="relative text-[clamp(19px,2.5vw,33px)] leading-tight text-[#2A1E16]">{children}</p>
      </Glass>
    </motion.div>
  );
}
