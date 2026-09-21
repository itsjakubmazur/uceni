/**
 * Přehrávání promluv.
 *
 * Za běhu se přehrávají jen předgenerované soubory z /audio. Web Speech API je
 * nouzová záloha pro případ, že by soubor chyběl — v hotové aplikaci by k tomu
 * nemělo dojít, protože všechno je v offline cache.
 *
 * Safari na iPadu nepustí zvuk, dokud uživatel na stránku nesáhne. Proto se
 * `unlock()` volá při prvním doteku a do té doby appka mlčí.
 */

export interface SpeechManifestEntry {
  file: string;
  hash: string;
  voice: string;
  bytes: number;
}

export type SpeechManifest = Record<string, SpeechManifestEntry>;

const AUDIO_BASE = '/audio';

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private manifest: SpeechManifest = {};
  private buffers = new Map<string, AudioBuffer>();
  private playing: AudioBufferSourceNode | null = null;
  /** Fronta zajišťuje, že se promluvy nikdy nepřekrývají. */
  private queue: Promise<void> = Promise.resolve();
  private token = 0;

  get unlocked(): boolean {
    return this.ctx !== null && this.ctx.state === 'running';
  }

  async init(): Promise<void> {
    const res = await fetch(`${AUDIO_BASE}/manifest.json`);
    if (res.ok) this.manifest = (await res.json()) as SpeechManifest;
  }

  /** Volá se z prvního doteku. Bez toho iOS zvuk nepustí. */
  async unlock(): Promise<void> {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.master.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') await this.ctx.resume();

    // Tichý tón odemkne výstup i v případech, kdy resume samo nestačí.
    const silent = this.ctx.createBufferSource();
    silent.buffer = this.ctx.createBuffer(1, 1, 22050);
    silent.connect(this.master!);
    silent.start(0);
  }

  get context(): AudioContext | null {
    return this.ctx;
  }

  setVolume(value: number): void {
    if (this.master) this.master.gain.value = value;
  }

  /** Hlasitost právě znějící řeči, 0–1. Řídí pusu maskota. */
  level(): number {
    if (!this.analyser) return 0;
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteTimeDomainData(data);
    let sum = 0;
    for (const v of data) sum += (v - 128) ** 2;
    return Math.min(1, Math.sqrt(sum / data.length) / 40);
  }

  has(id: string): boolean {
    return id in this.manifest;
  }

  /** Přednačte klipy další úlohy, ať mezi úlohami není ticho. */
  async preload(ids: readonly string[]): Promise<void> {
    await Promise.all(ids.map((id) => this.buffer(id).catch(() => null)));
  }

  /** Zařadí promluvy za sebe. Vrací se, až doznějí. */
  say(...ids: string[]): Promise<void> {
    const mine = ++this.token;
    this.queue = this.queue.then(async () => {
      for (const id of ids) {
        if (mine !== this.token) return;
        await this.playOne(id);
      }
    });
    return this.queue;
  }

  /** Utne, co zrovna hraje. Používá se při přechodu na další úlohu. */
  stop(): void {
    this.token++;
    if (this.playing) {
      try {
        this.playing.stop();
      } catch {
        // už dohrál sám
      }
      this.playing = null;
    }
  }

  private async playOne(id: string): Promise<void> {
    if (!this.ctx || !this.master) return;
    let buffer: AudioBuffer | null = null;
    try {
      buffer = await this.buffer(id);
    } catch {
      this.fallback(id);
      return;
    }

    await new Promise<void>((resolve) => {
      const source = this.ctx!.createBufferSource();
      source.buffer = buffer!;
      source.connect(this.master!);
      source.onended = () => {
        if (this.playing === source) this.playing = null;
        resolve();
      };
      this.playing = source;
      source.start();
    });
  }

  private async buffer(id: string): Promise<AudioBuffer> {
    const cached = this.buffers.get(id);
    if (cached) return cached;

    const entry = this.manifest[id];
    if (!entry) throw new Error(`Promluva „${id}" není v manifestu.`);
    if (!this.ctx) throw new Error('Zvuk ještě není odemčený.');

    const res = await fetch(`${AUDIO_BASE}/${entry.file}`);
    if (!res.ok) throw new Error(`Soubor pro „${id}" se nenačetl.`);
    const decoded = await this.ctx.decodeAudioData(await res.arrayBuffer());
    this.buffers.set(id, decoded);
    return decoded;
  }

  /** Nouzový hlas z prohlížeče. Zní hůř, ale dítě nezůstane bez odpovědi. */
  private fallback(id: string): void {
    const text = this.fallbackTexts[id];
    if (!text || typeof speechSynthesis === 'undefined') return;
    console.warn(`Chybí audio pro „${id}", používám prohlížečový hlas.`);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'cs-CZ';
    utterance.rate = 0.9;
    speechSynthesis.speak(utterance);
  }

  private fallbackTexts: Record<string, string> = {};

  /** Texty pro nouzový hlas. Předává je aplikace z content/speech.ts. */
  setFallbackTexts(texts: Record<string, string>): void {
    this.fallbackTexts = texts;
  }
}

export const audio = new AudioEngine();
