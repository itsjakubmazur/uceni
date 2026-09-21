/**
 * macOS `say` + `afconvert`. Žádný účet, žádná síť, žádná karta.
 *
 * Hlas Zuzana (ideálně prémiová varianta) je rodilá čeština, takže Ř, Č a Ž
 * vysloví správně — což je přesně to, na čem cizojazyčné modely padají.
 *
 * Výstup je m4a/AAC, ne mp3: macOS neumí mp3 kódovat bez doinstalování lame
 * nebo ffmpeg, kdežto `afconvert` je v systému vždycky. Safari i iOS přehrají
 * m4a bez problémů a aplikace si příponu bere z manifestu, takže na formátu
 * nezáleží.
 */

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { stat, unlink, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { ProviderOptions, SynthesizeRequest, SynthesizeResult, TtsProvider } from './types.ts';

const run = promisify(execFile);

/** Vybráno poslechem na iPadu: pomalejší tempo s delším tichem mezi větami. */
export const DEFAULT_RATE = 145;
export const DEFAULT_SENTENCE_PAUSE_MS = 300;

/** Prémiová varianta zní výrazně líp než základní, tak ji hledáme první. */
const QUALITY_ORDER = ['premium', 'enhanced', ''];

async function listVoices(): Promise<{ name: string; locale: string }[]> {
  const { stdout } = await run('say', ['-v', '?']);
  return stdout
    .split('\n')
    .map((line) => line.match(/^(.+?)\s{2,}([a-z]{2}_[A-Z]{2})/))
    .filter((m): m is RegExpMatchArray => m !== null)
    .map((m) => ({ name: m[1]!.trim(), locale: m[2]! }));
}

export function macosSayProvider(opts: ProviderOptions = {}): TtsProvider {
  const rate = opts.rate ?? DEFAULT_RATE;
  const pause = opts.sentencePauseMs ?? DEFAULT_SENTENCE_PAUSE_MS;

  // Když hlas nezadáš, vybere se při preflightu nejlepší dostupný český.
  // Do hashe v manifestu jde až ten vybraný, takže výměna hlasu přegeneruje audio.
  let voice = opts.voice ?? '';

  return {
    name: 'macos-say',
    get signature() {
      return { voice: voice || '(vybere se automaticky)', rate, pause };
    },

    async preflight() {
      if (process.platform !== 'darwin') {
        throw new Error(
          'Provider „macos-say" běží jen na macOS. Na jiném systému zvol jiný provider.',
        );
      }

      const available = await listVoices();
      const czech = available.filter((v) => v.locale.startsWith('cs'));

      if (voice) {
        if (!available.some((v) => v.name === voice)) {
          throw new Error(
            `Hlas „${voice}" není v systému nainstalovaný.\n` +
              `České hlasy, které vidím: ${czech.map((v) => v.name).join(', ') || '(žádné)'}\n` +
              'Stáhneš je v Nastavení → Zpřístupnění → Čtení a mluvení → Hlas systému → Spravovat hlasy.',
          );
        }
        return;
      }

      if (!czech.length) {
        throw new Error(
          'Nenašel jsem v systému žádný český hlas.\n' +
            'Stáhni ho v Nastavení → Zpřístupnění → Čtení a mluvení → Hlas systému → Spravovat hlasy → Čeština.',
        );
      }

      const best = QUALITY_ORDER.map((tier) =>
        czech.find((v) => v.name.toLowerCase().includes(tier)),
      ).find((v): v is { name: string; locale: string } => v !== undefined);

      voice = best!.name;
      console.log(`Hlas: ${voice}`);
    },

    async synthesize({ text, outPathWithoutExt }: SynthesizeRequest): Promise<SynthesizeResult> {
      const out = `${outPathWithoutExt}.m4a`;
      const raw = join(tmpdir(), `mikulas-${randomUUID()}.aiff`);
      await mkdir(dirname(out), { recursive: true });

      // `[[slnc N]]` je příkaz pro syntezátor, ne text. Novější hlasy ho můžou ignorovat.
      const spoken = pause > 0 ? text.replace(/([.!?])\s+/g, `$1 [[slnc ${pause}]] `) : text;

      try {
        await run('say', ['-v', voice, '-r', String(rate), '-o', raw, '--', spoken]);
        await run('afconvert', ['-f', 'm4af', '-d', 'aac', '-b', '64000', raw, out]);
        const { size } = await stat(out);
        return { path: out, bytes: size };
      } finally {
        await unlink(raw).catch(() => {});
      }
    },
  };
}
