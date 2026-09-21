/**
 * Vygeneruje šest testovacích vět v několika variantách hlasu a udělá k nim
 * stránku, na které si je poslechneš vedle sebe — ideálně rovnou na iPadu,
 * protože právě tam to bude Mikuláš slyšet.
 *
 *   npm run voices                     # výchozí: macOS Zuzana ve třech tempech
 *   npm run voices -- --voice="Zuzana (Premium)"
 *   npm run voices -- --provider=elevenlabs
 *
 * Výstup: voice-samples/index.html (adresář je mimo git, je to jen pomůcka).
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { VOICE_TEST_SENTENCES } from '../src/content/speech.ts';
import { createProvider } from './tts/index.ts';
import { parseArgs, loadEnvLocal } from './lib/args.ts';

const OUT_DIR = 'voice-samples';

interface Variant {
  readonly id: string;
  readonly label: string;
  readonly why: string;
  readonly opts: { voice?: string; rate?: number; sentencePauseMs?: number };
}

function variantsFor(providerName: string, voice: string | undefined): Variant[] {
  if (providerName === 'macos-say') {
    const v = voice ?? 'Zuzana';
    return [
      { id: 'tempo-klidne', label: `${v}, pomalu (140)`, why: 'Pro předškoláka bývá pomalejší tempo srozumitelnější.', opts: { voice: v, rate: 140 } },
      { id: 'tempo-stredni', label: `${v}, středně (160)`, why: 'Výchozí nastavení.', opts: { voice: v, rate: 160 } },
      { id: 'tempo-svizne', label: `${v}, svižně (180)`, why: 'Živější, ale může splývat.', opts: { voice: v, rate: 180 } },
      { id: 'tempo-s-pauzami', label: `${v}, pomalu + pauzy`, why: 'Delší ticho mezi větami. Starší hlasy to umí, prémiové to můžou ignorovat.', opts: { voice: v, rate: 145, sentencePauseMs: 300 } },
    ];
  }
  return [{ id: 'vychozi', label: `${providerName}`, why: 'Výchozí nastavení providera.', opts: { voice } }];
}

async function main(): Promise<void> {
  loadEnvLocal();
  const args = parseArgs(process.argv.slice(2));
  const providerName = typeof args.provider === 'string' ? args.provider : 'macos-say';
  const voice = typeof args.voice === 'string' ? args.voice : undefined;

  const variants = variantsFor(providerName, voice);
  await mkdir(OUT_DIR, { recursive: true });

  // Preflight jednou, ať případná chyba přijde hned a srozumitelně.
  await createProvider(providerName, variants[0]!.opts).preflight();

  const rows: { variant: Variant; files: (string | null)[] }[] = [];

  for (const variant of variants) {
    const provider = createProvider(providerName, variant.opts);
    const files: (string | null)[] = [];
    console.log(`\n${variant.label}`);

    for (const sentence of VOICE_TEST_SENTENCES) {
      try {
        const result = await provider.synthesize({
          text: sentence.text,
          outPathWithoutExt: join(OUT_DIR, `${variant.id}--${sentence.id}`),
        });
        files.push(result.path.slice(OUT_DIR.length + 1));
        console.log(`  ✓ ${sentence.text}`);
      } catch (err) {
        files.push(null);
        console.error(`  ✗ ${sentence.text} — ${(err as Error).message}`);
      }
    }
    rows.push({ variant, files });
  }

  await writeFile(join(OUT_DIR, 'index.html'), page(rows), 'utf8');
  console.log(`\nHotovo. Otevři ${OUT_DIR}/index.html — na Macu příkazem:`);
  console.log(`  open ${OUT_DIR}/index.html`);
  console.log('Nebo si adresář nasdílej do iPadu a poslechni si to tam.');
}

function page(rows: { variant: Variant; files: (string | null)[] }[]): string {
  let lastGroup = '';
  const sentences = VOICE_TEST_SENTENCES.map((s, i) => {
    const heading = s.group === lastGroup ? '' : `<h2 class="group">${esc(groupTitle(s.group))}</h2>`;
    lastGroup = s.group;
    return `${heading}
    <section>
      <h3>${i + 1}. „${esc(s.text)}"</h3>
      <p class="why">${esc(s.why)}</p>
      ${rows
        .map(({ variant, files }) =>
          files[i]
            ? `<div class="row"><span>${esc(variant.label)}</span><audio controls preload="none" src="${encodeURI(files[i]!)}"></audio></div>`
            : `<div class="row failed"><span>${esc(variant.label)}</span><em>nevygenerováno</em></div>`,
        )
        .join('\n      ')}
    </section>`;
  }).join('\n');

  const legend = rows
    .map(({ variant }) => `<li><strong>${esc(variant.label)}</strong> — ${esc(variant.why)}</li>`)
    .join('\n      ');

  return `<!doctype html>
<html lang="cs">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Poslech hlasů</title>
<style>
  :root { color-scheme: light dark; }
  body { font: 17px/1.5 ui-serif, Georgia, serif; max-width: 46rem; margin: 0 auto; padding: 2rem 1rem 6rem; }
  h1 { font-size: 1.6rem; margin-bottom: .25rem; }
  .intro { color: color-mix(in oklab, currentColor 60%, transparent); margin-top: 0; }
  ul { color: color-mix(in oklab, currentColor 70%, transparent); font-size: .95rem; }
  section { margin: 2.5rem 0; padding-top: 1.25rem; border-top: 1px solid color-mix(in oklab, currentColor 15%, transparent); }
  h2.group { font-size: 1rem; letter-spacing: .08em; text-transform: uppercase; margin: 3rem 0 0; color: color-mix(in oklab, currentColor 50%, transparent); }
  h3 { font-size: 1.15rem; margin: 0 0 .25rem; }
  .why { margin: 0 0 1rem; font-size: .9rem; color: color-mix(in oklab, currentColor 55%, transparent); }
  .row { display: flex; align-items: center; gap: 1rem; margin: .6rem 0; flex-wrap: wrap; }
  .row span { flex: 0 0 13rem; font-size: .9rem; }
  .row.failed em { color: #b3261e; font-size: .9rem; }
  audio { flex: 1 1 18rem; min-width: 14rem; height: 2.5rem; }
</style>
</head>
<body>
  <h1>Který hlas bude učit Mikuláše?</h1>
  <p class="intro">Věty, které pokrývají to nejtěžší z celé aplikace. Poslechni si je
  nejlépe na iPadu a přes ten reproduktor, na kterém to bude doopravdy hrát.</p>
  <ul>
      ${legend}
  </ul>
${sentences}
</body>
</html>
`;
}

function groupTitle(group: string): string {
  return group === 'zvuk'
    ? 'Hláska, nebo název písmene?'
    : 'Základní promluvy';
}

const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

main().catch((err) => {
  console.error(`\n${(err as Error).message}`);
  process.exit(1);
});
