/**
 * Odehraje celé sezení správnými odpověďmi a vypíše, co po sobě přišlo.
 *
 *   npm run play
 *
 * Je to kontrola na to, na co si nejdřív stěžoval táta: jestli se úlohy
 * střídají, nebo jestli se jedno písmeno vrací desetkrát za sebou. Testy
 * enginu hlídají pravidla, tohle hlídá výsledek v běžící aplikaci.
 */
import { chromium, type Page } from 'playwright';
import { parseArgs } from '../lib/args.ts';

async function describe(page: Page): Promise<string> {
  if (await page.locator('[data-mezihra]').count()) return 'MEZIHRA';
  if (await page.locator('[data-uloha]').count()) {
    return (await page.locator('[data-uloha]').first().getAttribute('data-uloha')) ?? '?';
  }
  return 'konec';
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const base = typeof args.base === 'string' ? args.base : 'http://127.0.0.1:4173';
  const area = args.pismena ? 'M' : '3';

  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  const page = await browser.newPage({ viewport: { width: 1180, height: 820 } });

  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error' && !m.text().includes('favicon')) errors.push(m.text());
  });

  await page.goto(base, { waitUntil: 'load' });
  await page.mouse.click(590, 410);
  await page.waitForTimeout(800);
  await page.locator('button').filter({ hasText: area }).first().click({ force: true });
  await page.waitForTimeout(1600);

  const seq: string[] = [];

  for (let i = 0; i < 60; i++) {
    const what = await describe(page);
    if (what === 'konec') break;
    seq.push(what);

    if (what === 'MEZIHRA') {
      // Počkat na tlačítko „dál" a pokračovat.
      const next = page.locator('button[aria-label="pokračovat"]');
      await next.waitFor({ timeout: 6000 }).catch(() => {});
      await next.click({ force: true }).catch(() => {});
      await page.waitForTimeout(1200);
      continue;
    }

    // Správná dlaždice je označená; u ostatních úloh se prostě proklikne.
    const right = page.locator('[data-spravne="ano"]');
    if (await right.count()) {
      await right.first().click({ force: true });
    } else {
      const buttons = page.locator('button:visible');
      const n = await buttons.count();
      for (let b = 0; b < Math.min(n, 12); b++) {
        await buttons.nth(b).click({ force: true }).catch(() => {});
        await page.waitForTimeout(90);
      }
    }
    await page.waitForTimeout(1500);
  }

  console.log(seq.map((s, i) => `${String(i).padStart(2)}  ${s}`).join('\n'));
  console.log('\nPočty:');
  const counts = new Map<string, number>();
  for (const s of seq) counts.set(s, (counts.get(s) ?? 0) + 1);
  for (const [k, v] of [...counts].sort((a, b) => b[1] - a[1])) console.log(`  ${k}: ${v}`);

  const worst = longestRun(seq);
  console.log(`\nNejdelší série téhož: ${worst.length}× ${worst.what}`);
  console.log(errors.length ? `\nCHYBY:\n${errors.join('\n')}` : '\nBez chyb v konzoli.');

  await browser.close();
  if (errors.length) process.exitCode = 1;
}

function longestRun(seq: readonly string[]): { what: string; length: number } {
  let best = { what: seq[0] ?? '', length: 0 };
  let run = 0;
  for (let i = 0; i < seq.length; i++) {
    run = i > 0 && seq[i] === seq[i - 1] ? run + 1 : 1;
    if (run > best.length) best = { what: seq[i]!, length: run };
  }
  return best;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
