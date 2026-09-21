import type { Attempt, EngineState } from '../engine/types.ts';
import {
  DEFAULT_SETTINGS,
  type ExportBundle,
  type ProgressRepository,
  type SessionRecord,
  type Settings,
  type SpeechFlag,
} from './ProgressRepository.ts';

/** Paměťová implementace pro testy a náhledy. Stejné rozhraní, žádné úložiště. */
export function createMemoryRepository(): ProgressRepository {
  let state: EngineState | null = null;
  let settings: Settings = { ...DEFAULT_SETTINGS };
  const sessions: SessionRecord[] = [];
  const attempts: Attempt[] = [];
  let flags: SpeechFlag[] = [];

  return {
    async load() {
      return { state, settings };
    },
    async saveState(next) {
      state = next;
    },
    async saveSettings(patch) {
      settings = { ...settings, ...patch };
    },
    async recordAttempt(attempt) {
      attempts.push(attempt);
    },
    async startSession(record) {
      sessions.push(record);
    },
    async endSession(id, patch) {
      const i = sessions.findIndex((s) => s.id === id);
      if (i >= 0) sessions[i] = { ...sessions[i]!, ...patch };
    },
    async listSessions(limit = 30) {
      return sessions.slice(-limit).reverse();
    },
    async flagSpeech(flag) {
      flags = [...flags.filter((f) => f.speechId !== flag.speechId), flag];
    },
    async listSpeechFlags() {
      return flags;
    },
    async clearSpeechFlags() {
      flags = [];
    },
    async exportAll() {
      return { version: 1, state: state!, settings, sessions, attempts, speechFlags: flags };
    },
    async importAll(bundle: ExportBundle) {
      state = bundle.state;
      settings = bundle.settings;
    },
    async resetProgress() {
      state = null;
      sessions.length = 0;
      attempts.length = 0;
    },
  };
}
