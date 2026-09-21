/**
 * Screenshoty ve skutečných rozměrech zařízení, na kterých to poběží.
 *
 *   npm run shots                 # všechny koncepty, všechna rozlišení
 *   npm run shots -- --only=paper
 *
 * iPad je priorita, takže je první a v obou orientacích.
 */
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { parseArgs } from '../lib/args.ts';

const VIEWPORTS = [
  { id: 'ipad-landscape', width: 1180, height: 820 },
  { id: 'ipad-portrait', width: 820, height: 1180 },
  { id: 'telefon', width: 390, height: 844 },
];

const OUT = 'review';

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const only = typeof args.only === 'string' ? args.only.split(',') : null;
  const base = typeof args.base === 'string' ? args.base : 'http://localhost:5173';
  const concepts = only ?? ['paper', 'garden', 'workshop', 'maskoti'];

  await mkdir(OUT, { recursive: true });
  // Prohlížeč je v obrazu předinstalovaný, jen ho Playwright hledá jinde,
  // než kde leží. Necháme ho tedy ukázat na něj napřímo.
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });

  for (const concept of concepts) {
    for (const vp of VIEWPORTS) {
      const page = await browser.newPage({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 2,
      });
      await page.goto(`${base}/?concept=${concept}`, { waitUntil: 'load' });

      // Písmo si vynutíme sami. Playwright jinak čeká na document.fonts.ready,
      // které se v tomhle prohlížeči u latin-ext řezu nikdy nedočká, a screenshot
      // se nikdy nepořídí. Takhle víme, že na obrázku je opravdu Andika.
      await page.evaluate(async () => {
        await Promise.all([
          document.fonts.load('400 64px Andika', 'Příšerně žluťoučký kůň'),
          document.fonts.load('700 64px Andika', 'Příšerně žluťoučký kůň'),
        ]);
      });

      // Přepínač konceptů do posudku nepatří.
      await page.addStyleTag({ content: 'nav { display: none !important; }' });

      // Scéna dýchá a loutky dosedají na pružinách — ať se to ustálí.
      await page.waitForTimeout(1600);

      // Snímek bereme přes CDP, čímž obejdeme to čekání na fonty.
      const cdp = await page.context().newCDPSession(page);
      const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' });
      const path = `${OUT}/${concept}--${vp.id}.png`;
      await writeFile(path, Buffer.from(data, 'base64'));
      console.log(path);
      await page.close();
    }
  }

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
