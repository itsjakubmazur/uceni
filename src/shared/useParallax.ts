import { useEffect, useRef, useState } from 'react';

export interface ParallaxOffset {
  /** −1 až 1, vodorovně */
  x: number;
  /** −1 až 1, svisle */
  y: number;
}

/**
 * Náklon zařízení nebo pohyb prstu po scéně.
 *
 * Na iPadu je gyroskop až po povolení uživatelem, což se dítěte ptát nebudeme,
 * takže hlavní vstup je dotyk. Náklon se připojí jen tam, kde ho prohlížeč dá
 * bez ptaní. Když není ani jedno, scéna se hýbe sama pomalým dýcháním.
 */
export function useParallax(): ParallaxOffset {
  const [offset, setOffset] = useState<ParallaxOffset>({ x: 0, y: 0 });
  const raf = useRef(0);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const apply = (x: number, y: number) => {
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => setOffset({ x, y }));
    };

    const onPointer = (e: PointerEvent) => {
      apply(
        (e.clientX / window.innerWidth) * 2 - 1,
        (e.clientY / window.innerHeight) * 2 - 1,
      );
    };

    const onOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || e.beta === null) return;
      apply(clamp(e.gamma / 30), clamp((e.beta - 40) / 30));
    };

    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('deviceorientation', onOrientation, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('deviceorientation', onOrientation);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return offset;
}

const clamp = (v: number): number => Math.max(-1, Math.min(1, v));

/** Pomalé dýchání scény, když se nikdo nedotýká. Perioda v sekundách. */
export function useBreath(period = 14): number {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      setT(Math.sin(((now - start) / 1000 / period) * Math.PI * 2));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [period]);
  return t;
}
