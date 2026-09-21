/**
 * ElevenLabs — připraveno pro případ, že by systémový hlas nestačil.
 *
 * Klíč patří výhradně do .env.local a nikdy do klientského kódu:
 * tenhle soubor běží v Node při generování, ne v prohlížeči.
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { ProviderOptions, SynthesizeRequest, SynthesizeResult, TtsProvider } from './types.ts';

/** Ženský hlas z veřejné knihovny. Přepiš přes --voice, až si vybereš svůj. */
const DEFAULT_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL';
const MODEL = 'eleven_multilingual_v2';

export function elevenLabsProvider(opts: ProviderOptions = {}): TtsProvider {
  const voice = opts.voice ?? DEFAULT_VOICE_ID;

  return {
    name: 'elevenlabs',
    signature: { voice, model: MODEL },

    async preflight() {
      if (!process.env.ELEVENLABS_API_KEY) {
        throw new Error('Chybí ELEVENLABS_API_KEY. Vlož ho do .env.local (do gitu se nedostane).');
      }
    },

    async synthesize({ text, outPathWithoutExt }: SynthesizeRequest): Promise<SynthesizeResult> {
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
        method: 'POST',
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY!,
          'content-type': 'application/json',
          accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: MODEL,
          voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.2 },
        }),
      });

      if (!res.ok) {
        throw new Error(`ElevenLabs vrátil ${res.status}: ${await res.text()}`);
      }

      const out = `${outPathWithoutExt}.mp3`;
      const buf = Buffer.from(await res.arrayBuffer());
      await mkdir(dirname(out), { recursive: true });
      await writeFile(out, buf);
      return { path: out, bytes: buf.byteLength };
    },
  };
}
