/** Rozhraní pro syntézu řeči. Každý provider je za ním zaměnitelný. */

export interface SynthesizeRequest {
  readonly text: string;
  /** Cílový soubor bez přípony — provider doplní tu, kterou umí. */
  readonly outPathWithoutExt: string;
}

export interface SynthesizeResult {
  /** Skutečná cesta k vytvořenému souboru (včetně přípony). */
  readonly path: string;
  readonly bytes: number;
}

export interface TtsProvider {
  readonly name: string;
  /** Jméno hlasu, ladění tempa apod. — vstupuje do hashe v manifestu. */
  readonly signature: Record<string, string | number>;
  /** Ověří, že se dá provider použít. Vyhodí srozumitelnou chybu, když ne. */
  preflight(): Promise<void>;
  synthesize(req: SynthesizeRequest): Promise<SynthesizeResult>;
}

export interface ProviderOptions {
  voice?: string;
  /** Slova za minutu u macOS `say`, jinak relativní tempo. */
  rate?: number;
  /** Delší pauza mezi větami v milisekundách, kde to provider umí. */
  sentencePauseMs?: number;
}
