import { get, set, del, createStore } from 'idb-keyval';
import type { Attempt, EngineState } from '../engine/types.ts';
import {
  DEFAULT_SETTINGS,
  type ExportBundle,
  type ProgressRepository,
  type SessionRecord,
  type Settings,
  type SpeechFlag,
} from './ProgressRepository.ts';

const store = createStore('mikulas', 'postup');

const KEY = {
  state: 'state',
  settings: 'settings',
  sessions: 'sessions',
  attempts: 'attempts',
  flags: 'speechFlags',
} as const;

/**
 * IndexedDB přes idb-keyval.
 *
 * Záznamy o pokusech se ořezávají — pro engine je rozhodující jen posledních
 * pár pokusů u každé položky a ty drží stav sám. Historie je tu kvůli
 * rodičovské zóně, ne kvůli výpočtu, takže nemá cenu ji držet donekonečna.
 */
const ATTEMPT_LOG_LIMIT = 2000;

export function createIdbRepository(): ProgressRepository {
  const readList = async <T>(key: string): Promise<T[]> => (await get<T[]>(key, store)) ?? [];

  const append = async <T>(key: string, value: T, limit?: number): Promise<void> => {
    const list = await readList<T>(key);
    list.push(value);
    await set(key, limit ? list.slice(-limit) : list, store);
  };

  return {
    async load() {
      const [state, settings] = await Promise.all([
        get<EngineState>(KEY.state, store),
        get<Settings>(KEY.settings, store),
      ]);
      return { state: state ?? null, settings: { ...DEFAULT_SETTINGS, ...settings } };
    },

    async saveState(state) {
      await set(KEY.state, state, store);
    },

    async saveSettings(patch) {
      const current = (await get<Settings>(KEY.settings, store)) ?? DEFAULT_SETTINGS;
      await set(KEY.settings, { ...current, ...patch }, store);
    },

    async recordAttempt(attempt: Attempt) {
      await append(KEY.attempts, attempt, ATTEMPT_LOG_LIMIT);
    },

    async startSession(record) {
      await append(KEY.sessions, record);
    },

    async endSession(id, patch) {
      const list = await readList<SessionRecord>(KEY.sessions);
      await set(
        KEY.sessions,
        list.map((s) => (s.id === id ? { ...s, ...patch } : s)),
        store,
      );
    },

    async listSessions(limit = 30) {
      const list = await readList<SessionRecord>(KEY.sessions);
      return list.slice(-limit).reverse();
    },

    async flagSpeech(flag) {
      const list = await readList<SpeechFlag>(KEY.flags);
      const without = list.filter((f) => f.speechId !== flag.speechId);
      await set(KEY.flags, [...without, flag], store);
    },

    async listSpeechFlags() {
      return readList<SpeechFlag>(KEY.flags);
    },

    async clearSpeechFlags() {
      await del(KEY.flags, store);
    },

    async exportAll(): Promise<ExportBundle> {
      const [state, settings, sessions, attempts, speechFlags] = await Promise.all([
        get<EngineState>(KEY.state, store),
        get<Settings>(KEY.settings, store),
        readList<SessionRecord>(KEY.sessions),
        readList<Attempt>(KEY.attempts),
        readList<SpeechFlag>(KEY.flags),
      ]);
      return {
        version: 1,
        state: state!,
        settings: { ...DEFAULT_SETTINGS, ...settings },
        sessions,
        attempts,
        speechFlags,
      };
    },

    async importAll(bundle) {
      await Promise.all([
        set(KEY.state, bundle.state, store),
        set(KEY.settings, bundle.settings, store),
        set(KEY.sessions, bundle.sessions, store),
        set(KEY.attempts, bundle.attempts, store),
        set(KEY.flags, bundle.speechFlags, store),
      ]);
    },

    async resetProgress() {
      await Promise.all([
        del(KEY.state, store),
        del(KEY.sessions, store),
        del(KEY.attempts, store),
      ]);
    },
  };
}
