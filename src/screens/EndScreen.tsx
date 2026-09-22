import { motion } from 'motion/react';
import { Glass } from '../shared/Glass.tsx';
import { Kulisak } from '../mascots/Kulisak.tsx';
import { glyphOf } from '../app/speechFor.ts';
import { audio } from '../audio/AudioEngine.ts';
import { sfx } from '../audio/sfx.ts';
import type { ItemId } from '../engine/types.ts';

/**
 * Konec sezení.
 *
 * Děkovačka, ne vysvědčení. Rampa dosvítila, představení skončilo.
 *
 * Když dnes něco zvládl celé, vyjde si to na jeviště poklonit. Když ne,
 * není tu žádné hodnocení ani prázdno — jen Kulisák, který se raduje,
 * a cesta zpátky. Sezení musí skončit dobře vždycky.
 */
export function EndScreen({ mastered, onHome }: { mastered: ItemId[]; onHome: () => void }) {
  const shown = mastered.slice(0, 5);

  return (
    <div className="absolute inset-0 z-30 grid place-items-center pb-[14%]">
      <div className="flex flex-col items-center gap-[clamp(18px,3vh,36px)]">
        {shown.length === 0 && (
          <motion.p
            className="max-w-[70%] text-center text-[clamp(20px,2.6vw,34px)] leading-tight text-[#F6EBD4]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ textShadow: '0 2px 10px rgba(35,26,19,.8)' }}
          >
            Dneska jsme si zahráli.
          </motion.p>
        )}

        <motion.div
          className="flex gap-[clamp(12px,2.4vw,34px)]"
          initial="hidden"
          animate="shown"
          variants={{ shown: { transition: { staggerChildren: 0.16 } } }}
        >
          {shown.map((id) => (
            <motion.div
              key={id}
              variants={{
                hidden: { y: 40, opacity: 0, rotate: -4 },
                shown: { y: 0, opacity: 1, rotate: 0 },
              }}
              transition={{ type: 'spring', stiffness: 160, damping: 14 }}
            >
              <div className="relative">
                <Glass radius={3} className="h-[clamp(110px,14vw,180px)] w-[clamp(96px,12vw,156px)]">
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        'radial-gradient(ellipse 62% 54% at 50% 48%, rgba(248,238,216,.9), rgba(248,238,216,0) 88%)',
                    }}
                  />
                  <span
                    className="relative block font-bold leading-none text-[#1F1710]"
                    style={{ fontSize: 'clamp(56px, 7.5vw, 106px)' }}
                  >
                    {glyphOf(id)}
                  </span>
                </Glass>
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    border: 'clamp(8px,1vw,13px) solid transparent',
                    borderImage: 'linear-gradient(160deg, #A07C52, #6E5234 55%, #4E3A22) 1',
                  }}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.button
          className="grid h-[clamp(96px,11vw,132px)] w-[clamp(96px,11vw,132px)] place-items-center rounded-full"
          style={{
            background: 'radial-gradient(circle at 36% 30%, #FBDC9A, #D69C36)',
            boxShadow: '0 12px 22px -12px rgba(43,30,22,.9)',
          }}
          whileTap={{ scale: 0.94 }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          onPointerDown={() => {
            sfx.tap();
            void audio.say('session.end.bye');
            onHome();
          }}
        >
          <svg viewBox="0 0 40 40" className="h-1/2 w-1/2">
            <path d="M20 8 L8 20 H14 V32 H26 V20 H32 Z" fill="#3B2A20" />
          </svg>
        </motion.button>
      </div>

      <div className="absolute bottom-[15%] right-[5%] w-[clamp(140px,17vw,250px)]">
        <Kulisak state="joy" />
      </div>
    </div>
  );
}
