import { useState } from 'react';
import { motion } from 'motion/react';
import { Sign } from '../theatre/Sign.tsx';
import { Glass } from '../shared/Glass.tsx';
import { MotifShape, layoutFor } from '../theatre/Motifs.tsx';
import { audio } from '../audio/AudioEngine.ts';
import { sfx } from '../audio/sfx.ts';
import { say } from '../app/speechFor.ts';
import { numberById } from '../content/items.numbers.ts';
import type { ItemId } from '../engine/types.ts';

/**
 * Přiřazení počtu k číslici — klepací počítání.
 *
 * Dítě klepá na předměty. Každý se při klepnutí rozsvítí a zůstane
 * rozsvícený, takže je pořád vidět, co už je spočítané. Hlas počítá spolu
 * s ním a na konci řekne, kolik jich dohromady je. Teprve pak se objeví
 * číslice — vazba počet → znak vzniká v tomhle pořadí, ne naopak.
 *
 * Pořadí klepání je libovolné. Nejde o to trefit pořadí, jde o to, že
 * každý předmět se počítá jednou.
 */
export function CountTask({ itemId, onDone }: { itemId: ItemId; onDone: () => void }) {
  const item = numberById.get(itemId as `num:${number}`);
  const [counted, setCounted] = useState<number[]>([]);

  if (!item) return null;

  const total = item.value;
  const positions = layoutFor(total, item.diceLayout);
  const done = counted.length >= total;

  const tap = (index: number) => {
    if (counted.includes(index) || done) return;
    const next = [...counted, index];
    setCounted(next);
    sfx.countStep(next.length - 1);
    audio.stop();

    if (next.length < total) {
      void audio.say(say.count(next.length));
      return;
    }
    // Poslední předmět: dopočítat, shrnout a teprve pak ukázat číslici.
    void audio.say(say.count(next.length), say.total(itemId));
  };

  return (
    <>
      <Sign>Spočítáme je?</Sign>

      {/*
        Rozestup musí být větší než předmět sám, jinak se počítané věci
        překrývají a dítě neví, na co ještě neklepalo. Krok mřížky je 24 %
        šířky rámu a předmět nejvýš 21 %, takže mezi nimi vždycky zbude mezera.
      */}
      <div className="absolute inset-0 z-20 grid place-items-center pb-[6%] pt-[8%]">
        <div className="relative h-[min(52vh,52vw)] w-[min(78vh,78vw)]">
          {positions.map((pos, i) => (
            <motion.button
              key={i}
              className="absolute grid place-items-center"
              style={{
                left: `calc(50% + ${pos.x * 24}%)`,
                top: `calc(50% + ${pos.y * 26}%)`,
                width: 'min(21%, clamp(88px, 11vw, 132px))',
                height: 'min(21%, clamp(88px, 11vw, 132px))',
                translate: '-50% -50%',
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: counted.includes(i) ? 1.1 : 1,
                opacity: 1,
                rotate: counted.includes(i) ? 0 : i % 2 ? 3 : -3,
              }}
              transition={{ type: 'spring', stiffness: 200, damping: 14, delay: i * 0.06 }}
              whileTap={{ scale: 0.92 }}
              onPointerDown={() => tap(i)}
            >
              <MotifShape motif={item.motif} lit={counted.includes(i)} />
            </motion.button>
          ))}
        </div>
      </div>

      {done && (
        <motion.div
          className="absolute bottom-[19%] right-[7%] z-30"
          initial={{ scale: 0.7, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 150, damping: 13, delay: 0.6 }}
        >
          <button
            onPointerDown={() => {
              sfx.tap();
              onDone();
            }}
          >
            <div className="relative">
              <Glass radius={3} className="h-[clamp(150px,19vw,240px)] w-[clamp(132px,16vw,210px)]">
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
                  style={{ fontSize: 'clamp(80px, 11vw, 160px)' }}
                >
                  {item.glyph}
                </span>
              </Glass>
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  border: 'clamp(10px,1.2vw,16px) solid transparent',
                  borderImage: 'linear-gradient(160deg, #A07C52, #6E5234 55%, #4E3A22) 1',
                }}
              />
            </div>
          </button>
        </motion.div>
      )}
    </>
  );
}
