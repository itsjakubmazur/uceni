import { motion } from 'motion/react';

/**
 * Rampa u paty jeviště — mapa postupu.
 *
 * Každá rozsvícená lampička je jedna zvládnutá položka. Nic se nepočítá
 * a nikde nejsou body: divadlo se prostě postupně rozsvěcí.
 */
export function Footlights({ lit, total }: { lit: number; total: number }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[15%]">
      <div className="absolute inset-x-0 bottom-0 h-[58%] bg-[var(--wood-deep)]" />
      <div className="absolute inset-x-0 bottom-[58%] h-[clamp(6px,.9vh,10px)] bg-[var(--wood)]" />
      <div className="absolute inset-x-0 bottom-[30%] flex items-end justify-center gap-[clamp(12px,3.2vw,56px)] px-4">
        {Array.from({ length: total }, (_, i) => (
          <Lamp key={i} on={i < lit} index={i} />
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
          style={{
            background: 'radial-gradient(circle, rgba(247,200,107,.6), rgba(247,200,107,0) 66%)',
          }}
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: [0.7, 1, 0.84, 1], scale: 1 }}
          transition={{
            opacity: { duration: 3.2 + index * 0.45, repeat: Infinity, ease: 'easeInOut' },
            scale: { type: 'spring', stiffness: 160, damping: 12 },
          }}
        />
      )}
      <motion.div
        className="relative h-[clamp(13px,1.8vw,24px)] w-[clamp(13px,1.8vw,24px)] rounded-t-full"
        animate={{
          background: on ? '#FBDC9A' : '#4A3826',
          boxShadow: on
            ? '0 0 16px rgba(247,200,107,.95), inset 0 -3px 5px rgba(201,142,51,.5)'
            : 'inset 0 -3px 5px rgba(0,0,0,.45)',
        }}
        transition={{ duration: 0.5 }}
      />
      <div className="h-[clamp(6px,1vh,10px)] w-[7px] bg-[#4A3826]" />
    </div>
  );
}
