import { macosSayProvider } from './macos-say.ts';
import { elevenLabsProvider } from './elevenlabs.ts';
import type { ProviderOptions, TtsProvider } from './types.ts';

export const PROVIDERS = {
  'macos-say': macosSayProvider,
  elevenlabs: elevenLabsProvider,
} satisfies Record<string, (o?: ProviderOptions) => TtsProvider>;

export type ProviderName = keyof typeof PROVIDERS;

export function createProvider(name: string, opts: ProviderOptions): TtsProvider {
  const factory = PROVIDERS[name as ProviderName];
  if (!factory) {
    throw new Error(`Neznámý provider „${name}". Mám: ${Object.keys(PROVIDERS).join(', ')}`);
  }
  return factory(opts);
}

export type { TtsProvider, ProviderOptions } from './types.ts';
