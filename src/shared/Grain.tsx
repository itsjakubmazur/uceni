/**
 * Zrno přes celou scénu.
 *
 * Dělá dvě věci naráz: rozbíjí pruhování (banding) v plochách, kterým se
 * jinak na iPadu nevyhneme, a dodává tiskový nádech, kvůli kterému scéna
 * nevypadá jako vektor z prohlížeče.
 *
 * POZOR NA VÝKON: první verze byla `<feTurbulence>` roztažená přes celou
 * obrazovku. Vypadalo to stejně, ale prohlížeč musí ten šum spočítat pro
 * každý pixel plochy — při 2× hustotě na iPadu jsou to přes tři miliony
 * pixelů a snímková frekvence spadne na kolena. (Poznalo se to na tom, že
 * ani Playwright nestihl udělat screenshot do minuty.)
 *
 * Teď se šum spočítá jednou do malé dlaždice, prohlížeč ji vyrasterizuje
 * jako obrázek a pak ji jen opakuje. Vizuálně totéž, výkonově nic.
 */

const TILE = 140;

const noiseTile = (seed: number) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${TILE}" height="${TILE}">` +
      `<filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="${seed}" stitchTiles="stitch"/>` +
      `<feColorMatrix type="saturate" values="0"/></filter>` +
      `<rect width="100%" height="100%" filter="url(#n)"/></svg>`,
  )}")`;

export function Grain({ opacity = 0.18, seed = 7 }: { opacity?: number; seed?: number }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-50"
      style={{
        opacity,
        mixBlendMode: 'overlay',
        backgroundImage: noiseTile(seed),
        backgroundRepeat: 'repeat',
        backgroundSize: `${TILE}px ${TILE}px`,
      }}
    />
  );
}
