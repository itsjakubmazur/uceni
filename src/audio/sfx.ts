/**
 * Efektové zvuky syntetizované ve Web Audio.
 *
 * Žádné stažené samply. Všechno jsou měkké tóny z pentatoniky laděné do světa:
 * dřevo, papír a lampa, ne piano a ne bzučák. Útok je pomalý (8 ms), aby nic
 * neklaplo, a dozvuk krátký, aby zvuky nepřekážely řeči.
 *
 * Chyba nemá vlastní „špatně" zvuk. Dostane tlumené dřevěné ťuknutí, které
 * nehodnotí — hodnocení nese hlas, a ten po chybě nabízí další pokus.
 */

/** Pentatonika v D — ladí s teplou paletou a nikdy nezní kysele. */
const SCALE = [293.66, 329.63, 392.0, 440.0, 587.33, 659.25, 783.99];

export class Sfx {
  private ctx: AudioContext | null = null;
  private bus: GainNode | null = null;
  private step = 0;

  attach(ctx: AudioContext, volume = 0.7): void {
    this.ctx = ctx;
    this.bus = ctx.createGain();
    this.bus.gain.value = volume;
    this.bus.connect(ctx.destination);
  }

  setVolume(value: number): void {
    if (this.bus) this.bus.gain.value = value;
  }

  /** Klepnutí na dlaždici. Krátké, neutrální, nic neslibuje. */
  tap(): void {
    this.tone(SCALE[2]!, 0.16, 'triangle', 0.18);
  }

  /** Klepnutí při počítání. Každý další předmět je o stupeň výš. */
  countStep(index: number): void {
    const note = SCALE[Math.min(index, SCALE.length - 1)]!;
    this.tone(note, 0.22, 'sine', 0.24);
  }

  /** Správná odpověď. Krátký vzestupný akord, pokaždé z jiného místa stupnice. */
  correct(): void {
    const base = this.step++ % 3;
    [0, 2, 4].forEach((offset, i) => {
      const note = SCALE[Math.min(base + offset, SCALE.length - 1)]!;
      this.tone(note, 0.4, 'sine', 0.2, i * 0.07);
    });
  }

  /** Chyba. Dřevěné ťuknutí, žádný sestup, žádné bzučení. */
  nudge(): void {
    this.tone(174.61, 0.12, 'triangle', 0.14);
    this.tone(233.08, 0.1, 'sine', 0.06, 0.03);
  }

  /** Rozsvícení lampičky na rampě. Zvládnutá položka. */
  lampLit(): void {
    [SCALE[0]!, SCALE[2]!, SCALE[4]!, SCALE[6]!].forEach((note, i) => {
      this.tone(note, 0.9, 'sine', 0.16, i * 0.11);
    });
  }

  private tone(
    freq: number,
    duration: number,
    type: OscillatorType,
    peak: number,
    delay = 0,
  ): void {
    if (!this.ctx || !this.bus) return;
    const start = this.ctx.currentTime + delay;

    const osc = this.ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;

    // Měkký útok a exponenciální dozvuk. Lineární obálka zní jako pípnutí.
    const env = this.ctx.createGain();
    env.gain.setValueAtTime(0.0001, start);
    env.gain.exponentialRampToValueAtTime(peak, start + 0.008);
    env.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    // Jemné tlumení výšek, aby tón zněl jako dřevo, ne jako sklo.
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 2600;

    osc.connect(env).connect(filter).connect(this.bus);
    osc.start(start);
    osc.stop(start + duration + 0.05);
  }
}

export const sfx = new Sfx();
