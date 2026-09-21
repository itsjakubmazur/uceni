/**
 * Projde aplikaci jako dítě a po cestě fotí.
 *
 *   npm run flow
 *
 * Je to zároveň kouřová zkouška: kdyby se kterákoliv obrazovka rozbila,
 * skript spadne na chybě v konzoli a řekne, na čem.
 */
import { chromium, type Page } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { parseArgs } from '../lib/args.ts';

const OUT = 'review/flow';

async function shot(page: Page, name: string): Promise<void> {
  const cdp = await page.context().newCDPSession(page);
  const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' });
  await writeFile(`${OUT}/${name}.png`, Buffer.from(data, 'base64'));
  console.log(`${OUT}/${name}.png`);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const base = typeof args.base === 'string' ? args.base : 'http://localhost:4173';
  await mkdir(OUT, { recursive: true });

  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  const page = await browser.newPage({
    viewport: { width: 1180, height: 820 },
    deviceScaleFactor: 2,
  });

  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });

  await page.goto(base, { waitUntil: 'load' });
  await page.evaluate(async () => {
    await Promise.all([
      document.fonts.load('400 64px Andika', 'Příšerně žluťoučký kůň'),
      document.fonts.load('700 64px Andika', 'Příšerně žluťoučký kůň'),
    ]);
  });
  await page.waitForTimeout(900);
  await shot(page, '1-start');

  // První dotek odemkne zvuk a otevře rozcestník.
  await page.mouse.click(590, 410);
  await page.waitForTimeout(1000);
  await shot(page, '2-domu');

  // Čísla jsou vlevo.
  await page.mouse.click(430, 400);
  await page.waitForTimeout(1800);
  await shot(page, '3-seznameni');

  // Kulaté tlačítko vpravo dole vede dál.
  await page.mouse.click(1010, 640);
  await page.waitForTimeout(2000);
  await shot(page, '4-poznavani');

  // Klepnout na krajní diapozitiv — ukáže reakci na volbu.
  await page.mouse.click(400, 560);
  await page.waitForTimeout(600);
  await shot(page, '5-po-volbe');

  await page.waitForTimeout(2600);
  await shot(page, '6-dalsi-uloha');

  console.log(errors.length ? `\nCHYBY V KONZOLI:\n${errors.join('\n')}` : '\nŽádné chyby v konzoli.');
  await browser.close();
  if (errors.length) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
