import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DEFAULT_CONFIG,
  advance,
  applyAttempt,
  createRng,
  initState,
  nextTask,
  planSession,
  startSession,
  unlockNext,
  type Area,
  type EngineState,
  type ItemId,
  type Task,
} from '../engine/index.ts';
import { NUMBERS } from '../content/items.numbers.ts';
import { LETTERS } from '../content/items.letters.ts';
import { audio } from '../audio/AudioEngine.ts';
import { sfx } from '../audio/sfx.ts';
import { createIdbRepository } from '../data/idbRepository.ts';
import { DEFAULT_SETTINGS, type Settings } from '../data/ProgressRepository.ts';
import { FALLBACK_TEXTS, makeVariantPicker, say } from './speechFor.ts';

const ORDER: Record<Area, readonly ItemId[]> = {
  numbers: NUMBERS.map((n) => n.id),
  letters: LETTERS.map((l) => l.id),
};

const SOURCES = {
  numbers: {
    order: ORDER.numbers,
    confusables: Object.fromEntries(
      NUMBERS.map((n) => [n.id, n.confusables.map((v) => `num:${v}` as ItemId)]),
    ),
  },
  letters: {
    order: ORDER.letters,
    confusables: Object.fromEntries(
      LETTERS.map((l) => [l.id, l.confusables.map((g) => `let:${g}` as ItemId)]),
    ),
  },
};

export type Phase = 'locked' | 'home' | 'task' | 'end';

export interface SessionApi {
  phase: Phase;
  task: Task | null;
  state: EngineState | null;
  settings: Settings;
  litCount: number;
  /** Kolikrát se u aktuální úlohy spletl. Po dvou se zvýrazní správná možnost. */
  mistakes: number;
  masteredToday: ItemId[];
  begin(): Promise<void>;
  chooseArea(area: Area): void;
  answer(optionId: ItemId): void;
  finishIntro(): void;
  finishCount(): void;
  goHome(): void;
}

export function useSession(): SessionApi {
  const repo = useMemo(() => createIdbRepository(), []);
  const rng = useMemo(() => createRng(Date.now() & 0xffff), []);
  const praise = useMemo(() => makeVariantPicker('praise'), []);
  const encourage = useMemo(() => makeVariantPicker('encourage'), []);

  const [phase, setPhase] = useState<Phase>('locked');
  const [state, setState] = useState<EngineState | null>(null);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [task, setTask] = useState<Task | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [masteredToday, setMasteredToday] = useState<ItemId[]>([]);
  const [areas, setAreas] = useState<Area[]>(['numbers']);

  const cursor = useRef(startSession(planSession(10, rng, DEFAULT_CONFIG)));
  const busy = useRef(false);

  useEffect(() => {
    void (async () => {
      audio.setFallbackTexts(FALLBACK_TEXTS);
      await audio.init();
      const loaded = await repo.load();
      setSettings(loaded.settings);
      setState(loaded.state ?? initState(ORDER, DEFAULT_CONFIG));
    })();
  }, [repo]);

  const litCount = useMemo(() => {
    if (!state) return 0;
    return Object.values(state.items).filter((p) => p.state === 'mastered').length;
  }, [state]);

  const persist = useCallback(
    (next: EngineState) => {
      setState(next);
      void repo.saveState(next);
    },
    [repo],
  );

  /** První dotek odemkne zvuk. Do té doby aplikace mlčí, Safari jinak nepustí nic. */
  const begin = useCallback(async () => {
    await audio.unlock();
    if (audio.context) sfx.attach(audio.context, settings.effectsVolume);
    audio.setVolume(settings.speechVolume);
    setPhase('home');
    void audio.say('ui.welcome');
  }, [settings.effectsVolume, settings.speechVolume]);

  const pushTask = useCallback(
    (from: EngineState, active: Area[]) => {
      const next = nextTask(from, cursor.current, active, SOURCES, rng);
      if (!next) {
        setPhase('end');
        return;
      }
      setTask(next);
      setMistakes(0);
      speakPrompt(next);
      void audio.preload([say.this(next.itemId), 'praise.1', 'praise.2']);
    },
    [rng],
  );

  const chooseArea = useCallback(
    (area: Area) => {
      if (!state) return;
      setAreas([area]);
      cursor.current = startSession(planSession(settings.sessionMinutes, rng, DEFAULT_CONFIG));
      setMasteredToday([]);
      setPhase('task');
      pushTask(state, [area]);
      sfx.tap();
    },
    [pushTask, rng, settings.sessionMinutes, state],
  );

  const settle = useCallback(
    (correct: boolean, helped: boolean) => {
      if (!state || !task) return;
      const before = state;
      const attempted = applyAttempt(
        before,
        { itemId: task.itemId, stage: task.stage, correct, helped, ts: Date.now() },
        DEFAULT_CONFIG,
      );
      const unlocked = unlockNext(attempted, ORDER, DEFAULT_CONFIG);

      const justMastered =
        before.items[task.itemId]?.state !== 'mastered' &&
        unlocked.items[task.itemId]?.state === 'mastered';

      if (justMastered) {
        setMasteredToday((ids) => [...ids, task.itemId]);
        sfx.lampLit();
      }

      persist(unlocked);
      void repo.recordAttempt({
        itemId: task.itemId,
        stage: task.stage,
        correct,
        helped,
        ts: Date.now(),
      });

      cursor.current = advance(cursor.current, task);

      window.setTimeout(() => {
        busy.current = false;
        if (cursor.current.done >= cursor.current.plan.taskBudget) {
          setPhase('end');
          void audio.say('session.end.great');
          return;
        }
        pushTask(unlocked, areas);
      }, justMastered ? 1500 : 900);
    },
    [areas, persist, pushTask, repo, state, task],
  );

  const answer = useCallback(
    (optionId: ItemId) => {
      if (!task || busy.current) return;

      if (optionId === task.itemId) {
        busy.current = true;
        sfx.correct();
        audio.stop();
        void audio.say(praise());
        settle(true, mistakes > 0);
        return;
      }

      // Chyba nikdy není červená. Hlas pojmenuje, co dítě vybralo,
      // a hned nabídne další pokus.
      sfx.nudge();
      audio.stop();
      void audio.say(say.this(optionId), say.tryFind(task.itemId));
      setMistakes((m) => {
        const next = m + 1;
        if (next >= 3) {
          // Po třetí chybě se úloha vyřeší jako ukázka, ať dítě neuvízne.
          busy.current = true;
          window.setTimeout(() => settle(false, true), 1400);
        }
        return next;
      });
    },
    [mistakes, praise, settle, task],
  );

  const finishIntro = useCallback(() => {
    if (busy.current) return;
    busy.current = true;
    settle(true, false);
  }, [settle]);

  const finishCount = useCallback(() => {
    if (busy.current) return;
    busy.current = true;
    void audio.say(praise());
    settle(true, false);
  }, [praise, settle]);

  const goHome = useCallback(() => {
    audio.stop();
    setPhase('home');
    setTask(null);
  }, []);

  useEffect(() => {
    if (phase === 'task' && mistakes === 2) void audio.say(encourage());
  }, [encourage, mistakes, phase]);

  return {
    phase,
    task,
    state,
    settings,
    litCount,
    mistakes,
    masteredToday,
    begin,
    chooseArea,
    answer,
    finishIntro,
    finishCount,
    goHome,
  };
}

function speakPrompt(task: Task): void {
  audio.stop();
  if (task.kind === 'intro') void audio.say(say.intro(task.itemId));
  else if (task.kind === 'choose') void audio.say(say.where(task.itemId));
  else if (task.kind === 'count') void audio.say('count.prompt');
}
