/**
 * Vygeneruje audio ke všem promluvám z content/speech.ts.
 *
 *   npm run audio                      # doplní, co chybí nebo se změnilo
 *   npm run audio -- --force           # přegeneruje všechno
 *   npm run audio -- --only=letter.M.intro,praise.3
 *   npm run audio -- --voice="Zuzana (Premium)" --rate=150
 *   npm run audio -- --provider=elevenlabs
 *   npm run audio:dry                  # jen ukáže, co by se dělo
 *
 * Klipy, které už existují a jejichž text se nezměnil, se přeskakují — takže
 * když později prohodíš slovo u jednoho písmene, přegeneruje se pár souborů,
 * ne celá sada.
 */

import { join, relative } from 'node:path';
import { SPEECH } from '../src/content/speech.ts';
import { createProvider } from './tts/index.ts';
import { hashLine, readManifest, safeFileBase, writeManifest, type Manifest } from './lib/manifest.ts';
import { parseArgs, loadEnvLocal } from './lib/args.ts';

const AUDIO_DIR = 'public/audio';
const MANIFEST = join(AUDIO_DIR, 'manifest.json');

async function main(): Promise<void> {
  loadEnvLocal();
  const args = parseArgs(process.argv.slice(2));

  const providerName = str(args.provider) ?? 'macos-say';
  const provider = createProvider(providerName, {
    voice: str(args.voice),
    rate: args.rate ? Number(args.rate) : undefined,
    sentencePauseMs: args.pause ? Number(args.pause) : undefined,
  });

  const dry = args.dry === true;
  const force = args.force === true;
  const only = str(args.only)?.split(',').map((s) => s.trim());

  if (!dry) await provider.preflight();

  const manifest: Manifest = await readManifest(MANIFEST);
  const lines = only ? SPEECH.filter((l) => only.includes(l.id)) : SPEECH;

  if (only && lines.length !== only.length) {
    const missing = only.filter((id) => !SPEECH.some((l) => l.id === id));
    throw new Error(`Tyhle promluvy v content/speech.ts nejsou: ${missing.join(', ')}`);
  }

  const todo = lines.filter((line) => {
    if (force) return true;
    const entry = manifest[line.id];
    return !entry || entry.hash !== hashLine(line.text, provider.signature);
  });

  console.log(`Promluv celkem: ${SPEECH.length}`);
  console.log(`Ke zpracování:  ${todo.length}${force ? ' (--force)' : ''}`);
  console.log(`Provider:       ${provider.name} ${JSON.stringify(provider.signature)}`);

  if (!todo.length) {
    console.log('\nVšechno je aktuální, není co dělat.');
    return;
  }

  if (dry) {
    for (const line of todo) console.log(`  ${line.id}  „${line.text}"`);
    console.log('\n(--dry: nic se nevygenerovalo)');
    return;
  }

  let done = 0;
  let failed = 0;

  for (const line of todo) {
    const label = `[${String(++done).padStart(3)}/${todo.length}] ${line.id}`;
    try {
      const result = await provider.synthesize({
        text: line.text,
        outPathWithoutExt: join(AUDIO_DIR, safeFileBase(line.id)),
      });
      manifest[line.id] = {
        hash: hashLine(line.text, provider.signature),
        file: relative(AUDIO_DIR, result.path),
        provider: provider.name,
        voice: String(provider.signature.voice ?? ''),
        bytes: result.bytes,
        generatedAt: new Date().toISOString(),
      };
      console.log(`${label}  ${(result.bytes / 1024).toFixed(0)} kB  „${line.text}"`);
    } catch (err) {
      failed++;
      console.error(`${label}  CHYBA: ${(err as Error).message}`);
    }
    // Průběžně, ať výpadek uprostřed neznamená generovat všechno znovu.
    if (done % 20 === 0) await writeManifest(MANIFEST, manifest);
  }

  await writeManifest(MANIFEST, manifest);

  const total = Object.values(manifest).reduce((a, e) => a + e.bytes, 0);
  console.log(`\nHotovo. Vygenerováno ${done - failed}, chyb ${failed}.`);
  console.log(`Audio celkem: ${(total / 1024 / 1024).toFixed(1)} MB v ${AUDIO_DIR}/`);
  if (failed) process.exitCode = 1;
}

function str(v: string | true | undefined): string | undefined {
  return typeof v === 'string' ? v : undefined;
}

main().catch((err) => {
  console.error(`\n${(err as Error).message}`);
  process.exit(1);
});
