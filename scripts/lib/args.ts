import { readFileSync } from 'node:fs';

/** Primitivní parser `--klic=hodnota` a `--prepinac`. */
export function parseArgs(argv: readonly string[]): Record<string, string | true> {
  const out: Record<string, string | true> = {};
  for (const arg of argv) {
    if (!arg.startsWith('--')) continue;
    const [key, ...rest] = arg.slice(2).split('=');
    out[key!] = rest.length ? rest.join('=') : true;
  }
  return out;
}

export function loadEnvLocal(): void {
  // Malý náhradník za dotenv, ať kvůli jednomu souboru nepřibývá závislost.
  for (const file of ['.env.local', '.env']) {
    let raw: string;
    try {
      raw = readFileSync(file, 'utf8');
    } catch {
      continue;
    }
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      const value = m[2]!.replace(/^['"]|['"]$/g, '');
      process.env[m[1]!] ??= value;
    }
  }
}
