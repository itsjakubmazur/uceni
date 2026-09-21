import type { Attempt, EngineState } from '../engine/types.ts';

export interface Settings {
  sessionMinutes: number;
  areas: { numbers: boolean; letters: boolean };
  /** Název písmene („Říká se mu em.") je učivo 2. třídy, proto výchozí false. */
  sayLetterNames: boolean;
  speechVolume: number;
  effectsVolume: number;
}

export const DEFAULT_SETTINGS: Settings = {
  sessionMinutes: 10,
  areas: { numbers: true, letters: true },
  sayLetterNames: false,
  speechVolume: 1,
  effectsVolume: 0.7,
};

export interface SessionRecord {
  id: string;
  startedAt: number;
  endedAt?: number;
  sessionIndex: number;
  taskCount: number;
  correctFirstTry: number;
  newlyMastered: string[];
}

export interface SpeechFlag {
  speechId: string;
  editedText?: string;
  ts: number;
}

export interface ExportBundle {
  version: 1;
  state: EngineState;
  settings: Settings;
  sessions: SessionRecord[];
  attempts: Attempt[];
  speechFlags: SpeechFlag[];
}

/**
 * Jediné rozhraní, kterým aplikace sahá na uložený postup.
 *
 * Zbytek kódu nesmí vědět, jestli za tím je IndexedDB, paměť nebo jednou
 * Supabase. Proto tu není nic, co by prozrazovalo úložiště — žádné
 * transakce, žádné dotazy, jen snímek stavu a zápisy.
 */
export interface ProgressRepository {
  load(): Promise<{ state: EngineState | null; settings: Settings }>;
  saveState(state: EngineState): Promise<void>;
  saveSettings(settings: Partial<Settings>): Promise<void>;

  recordAttempt(attempt: Attempt): Promise<void>;
  startSession(record: SessionRecord): Promise<void>;
  endSession(id: string, patch: Partial<SessionRecord>): Promise<void>;
  listSessions(limit?: number): Promise<SessionRecord[]>;

  flagSpeech(flag: SpeechFlag): Promise<void>;
  listSpeechFlags(): Promise<SpeechFlag[]>;
  clearSpeechFlags(): Promise<void>;

  exportAll(): Promise<ExportBundle>;
  importAll(bundle: ExportBundle): Promise<void>;
  resetProgress(): Promise<void>;
}
