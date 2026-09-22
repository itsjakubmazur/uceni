import { motion } from 'motion/react';

/**
 * Rampa u paty jeviště — **postup v právě běžícím sezení**.
 *
 * Tohle je cíl, který dítě celou dobu vidí: rozsvítit rampu. Až svítí celá,
 * je představení hotové. Dřív tu byl počet zvládnutých položek celkem, což
 * znamenalo dvě chyby naráz — po desáté položce se ukazatel nasytil a přestal
 * cokoliv znamenat, a hlavně během hraní neříkal nic o tom, kolik zbývá.
 *
 * Dlouhodobý postup patří na cestu, ne sem.
 */

/** Víc lampiček už se na rampu nevejde čitelně. */
const MAX_LAMPS = 12;

export function Footlights({ done, total }: { done: number; total: number }) {
  // Do dvanácti úloh je jedna lampička jedna úloha — každá odpověď je vidět.
  // U delších sezení se lampičky plní poměrně, ať se rampa vejde na obrazovku.
  const lamps = Math.max(1, Math.min(MAX_LAMPS, total));
  const lit = total > 0 ? Math.round((done / total) * lamps) : 0;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[15%]">
      <div className="absolute inset-x-0 bottom-0 h-[58%] bg-[var(--wood-deep)]" />
      <div className="absolute inset-x-0 bottom-[58%] h-[clamp(6px,.9vh,10px)] bg-[var(--wood)]" />
      <div className="absolute inset-x-0 bottom-[30%] flex items-end justify-center gap-[clamp(10px,3vw,52px)] px-4">
        {Array.from({ length: lamps }, (_, i) => (
          <Lamp key={i} on={i < lit} last={i === lamps - 1} index={i} />
        ))}
      </div>
    </div>
  );
}

function Lamp({ on, last, index }: { on: boolean; last: boolean; index: number }) {
  const size = last ? 'clamp(17px,2.4vw,30px)' : 'clamp(13px,1.8vw,24px)';

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
        className="relative rounded-t-full"
        style={{ width: size, height: size }}
        animate={{
          // Poslední lampička je ta, kterou se představení uzavírá, a je větší.
          background: on ? (last ? '#FFF0CE' : '#FBDC9A') : '#4A3826',
          boxShadow: on
            ? '0 0 16px rgba(247,200,107,.95), inset 0 -3px 5px rgba(201,142,51,.5)'
            : 'inset 0 -3px 5px rgba(0,0,0,.45)',
        }}
        transition={{ duration: 0.45 }}
      />
      <div className="h-[clamp(6px,1vh,10px)] w-[7px] bg-[#4A3826]" />
    </div>
  );
}
