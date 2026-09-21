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

export const DEFAULT_VOICE = 'Zuzana';
export const DEFAULT_RATE = 160;

export function macosSayProvider(opts: ProviderOptions = {}): TtsProvider {
  const voice = opts.voice ?? DEFAULT_VOICE;
  const rate = opts.rate ?? DEFAULT_RATE;
  const pause = opts.sentencePauseMs ?? 0;

  return {
    name: 'macos-say',
    signature: { voice, rate, pause },

    async preflight() {
      if (process.platform !== 'darwin') {
        throw new Error(
          'Provider „macos-say" běží jen na macOS. Na jiném systému zvol jiný provider.',
        );
      }
      const { stdout } = await run('say', ['-v', '?']);
      const available = stdout
        .split('\n')
        .map((line) => line.match(/^(.+?)\s{2,}([a-z]{2}_[A-Z]{2})/))
        .filter((m): m is RegExpMatchArray => m !== null)
        .map((m) => ({ name: m[1]!.trim(), locale: m[2]! }));

      if (!available.some((v) => v.name === voice)) {
        const czech = available.filter((v) => v.locale.startsWith('cs')).map((v) => v.name);
        throw new Error(
          `Hlas „${voice}" není v systému nainstalovaný.\n` +
            `České hlasy, které vidím: ${czech.length ? czech.join(', ') : '(žádné)'}\n` +
            'Stáhneš je v Nastavení → Zpřístupnění → Čtení a mluvení → Hlas systému → Spravovat hlasy.',
        );
      }
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
