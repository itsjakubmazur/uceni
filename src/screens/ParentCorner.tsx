import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

/** Jak dlouho se musí roh držet, aby se zóna otevřela. */
const HOLD_MS = 3000;

/**
 * Vstup do rodičovské zóny.
 *
 * Nenápadný roh, který se musí podržet tři vteřiny. Pětiletý na něj klepne,
 * nic se nestane a jde dál; dospělý ho podrží a dostane se dovnitř. Během
 * držení se plní tenký oblouk, takže rodič vidí, že to funguje, ale dítě
 * v tom nevidí nic lákavého.
 */
export function ParentCorner({ onOpen }: { onOpen: () => void }) {
  const [progress, setProgress] = useState(0);
  const timer = useRef(0);
  const frame = useRef(0);

  const stop = () => {
    window.clearTimeout(timer.current);
    cancelAnimationFrame(frame.current);
    setProgress(0);
  };

  useEffect(() => stop, []);

  const start = () => {
    const started = performance.now();
    const tick = () => {
      const p = Math.min(1, (performance.now() - started) / HOLD_MS);
      setProgress(p);
      if (p < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    timer.current = window.setTimeout(() => {
      stop();
      onOpen();
    }, HOLD_MS);
  };

  return (
    <button
      className="absolute right-0 top-0 z-[65] h-[72px] w-[72px]"
      aria-label="pro rodiče"
      onPointerDown={start}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
    >
      <svg viewBox="0 0 72 72" className="h-full w-full">
        <path
          d="M72 4 A 44 44 0 0 1 28 48"
          fill="none"
          stroke="#F3E5CA"
          strokeWidth="3"
          opacity={progress > 0 ? 0.35 : 0.12}
          strokeLinecap="round"
        />
        {progress > 0 && (
          <motion.path
            d="M72 4 A 44 44 0 0 1 28 48"
            fill="none"
            stroke="#F7C86B"
            strokeWidth="3"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={`${progress} 1`}
          />
        )}
      </svg>
    </button>
  );
}
