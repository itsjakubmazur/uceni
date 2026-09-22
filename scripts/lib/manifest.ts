import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

export interface ManifestEntry {
  /** Hash textu + nastavení hlasu. Změní se text → klip se přegeneruje. */
  readonly hash: string;
  /** Název souboru včetně přípony, relativně k adresáři s audiem. */
  readonly file: string;
  /**
   * Text, ze kterého klip vznikl.
   *
   * Drží se tu proto, aby šlo i bez přístupu k hlasu poznat, co se doopravdy
   * změnilo. Bez toho hlásil běh nanečisto, že se přegeneruje všechno, jen
   * protože si mimo macOS neumí zjistit jméno hlasu.
   */
  readonly text?: string;
  readonly provider: string;
  readonly voice: string;
  readonly bytes: number;
  readonly generatedAt: string;
}

export type Manifest = Record<string, ManifestEntry>;

export function hashLine(text: string, signature: Record<string, string | number>): string {
  const payload = JSON.stringify({ text, signature });
  return createHash('sha256').update(payload).digest('hex').slice(0, 16);
}

export async function readManifest(path: string): Promise<Manifest> {
  try {
    return JSON.parse(await readFile(path, 'utf8')) as Manifest;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return {};
    throw err;
  }
}

export async function writeManifest(path: string, manifest: Manifest): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
  await writeFile(path, `${JSON.stringify(sorted, null, 2)}\n`, 'utf8');
}

/**
 * Bezpečný název souboru z ID promluvy.
 *
 * České znaky v názvech souborů jsou past: macOS je na disku ukládá rozloženě
 * (NFD), Linux a HTTP je očekávají složené (NFC). Soubor vygenerovaný na Macu
 * by se pak z Vercelu nenačetl. Proto jdou na disk jen ASCII názvy a mapování
 * ID → soubor drží manifest.
 */
const TRANSLIT: Record<string, string> = {
  Č: 'C_', Ř: 'R_', Š: 'S_', Ž: 'Z_', Ě: 'E_', Ů: 'U_', Á: 'A_', É: 'E1',
  Í: 'I_', Ó: 'O_', Ú: 'U1', Ý: 'Y_', Ď: 'D_', Ť: 'T_', Ň: 'N_',
};

export function safeFileBase(id: string): string {
  return [...id]
    .map((ch) => TRANSLIT[ch.toUpperCase()] ?? ch)
    .join('')
    .replace(/[^A-Za-z0-9._-]/g, '-');
}
