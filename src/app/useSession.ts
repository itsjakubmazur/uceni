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
import { DEFAULT_SETTINGS, type ProgressRepository, type Settings } from '../data/ProgressRepository.ts';
import { FALLBACK_TEXTS, makeVariantPicker, say, speechKey } from './speechFor.ts';
import { applyPendingUpdate } from './serviceWorker.ts';

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

export type Phase = 'locked' | 'home' | 'task' | 'map' | 'end' | 'rodice';

export interface SessionApi {
  phase: Phase;
  repo: ProgressRepository;
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
  showMap(): void;
  openParentZone(): void;
  changeSettings(patch: Partial<Settings>): void;
  resetProgress(): void;
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
  const masteredTodayRef = useRef<ItemId[]>([]);
  const [areas, setAreas] = useState<Area[]>(['numbers']);

  // Nastavení čte i funkce, která se nemá překreslovat při každé změně.
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const cursor = useRef(startSession(planSession(10, rng, DEFAULT_CONFIG)));
  const busy = useRef(false);
  const sessionId = useRef<string | null>(null);
  const correctFirstTry = useRef(0);

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
      speakPrompt(next, settingsRef.current.sayLetterNames);
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
      masteredTodayRef.current = [];
      correctFirstTry.current = 0;
      sessionId.current = `s-${Date.now()}`;
      void repo.startSession({
        id: sessionId.current,
        startedAt: Date.now(),
        sessionIndex: state.sessionIndex,
        taskCount: 0,
        correctFirstTry: 0,
        newlyMastered: [],
      });
      setPhase('task');
      pushTask(state, [area]);
      sfx.tap();
    },
    [pushTask, repo, rng, settings.sessionMinutes, state],
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

      if (correct && !helped) correctFirstTry.current += 1;

      if (justMastered) {
        masteredTodayRef.current = [...masteredTodayRef.current, task.itemId];
        setMasteredToday(masteredTodayRef.current);
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
          // Sezení se uzavře až tady: engine posune čítač, na kterém stojí
          // opakovací intervaly, a rodičovská zóna dostane záznam.
          const closed = { ...unlocked, sessionIndex: unlocked.sessionIndex + 1 };
          persist(closed);
          if (sessionId.current) {
            void repo.endSession(sessionId.current, {
              endedAt: Date.now(),
              taskCount: cursor.current.done,
              correctFirstTry: correctFirstTry.current,
              newlyMastered: masteredTodayRef.current,
            });
          }
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

  const showMap = useCallback(() => {
    setPhase('map');
    void audio.say('map.intro');
  }, []);

  const goHome = useCallback(() => {
    audio.stop();
    setPhase('home');
    setTask(null);
    // Na rozcestníku je restart neškodný, takže tady se nasadí čekající verze.
    applyPendingUpdate();
  }, []);

  const openParentZone = useCallback(() => {
    audio.stop();
    setPhase('rodice');
  }, []);

  const changeSettings = useCallback(
    (patch: Partial<Settings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...patch };
        void repo.saveSettings(patch);
        audio.setVolume(next.speechVolume);
        sfx.setVolume(next.effectsVolume);
        return next;
      });
    },
    [repo],
  );

  const resetProgress = useCallback(() => {
    const fresh = initState(ORDER, DEFAULT_CONFIG);
    setState(fresh);
    setMasteredToday([]);
    void repo.resetProgress();
    void repo.saveState(fresh);
  }, [repo]);

  useEffect(() => {
    if (phase === 'task' && mistakes === 2) void audio.say(encourage());
  }, [encourage, mistakes, phase]);

  return {
    phase,
    repo,
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
    showMap,
    openParentZone,
    changeSettings,
    resetProgress,
    goHome,
  };
}

function speakPrompt(task: Task, sayLetterNames: boolean): void {
  audio.stop();
  if (task.kind === 'intro') {
    // Název písmene zazní jen tehdy, když si ho rodič zapnul. Výchozí je
    // vypnuto, protože v pěti letech překáží při skládání slov.
    const extra = sayLetterNames && task.area === 'letters' ? [`${speechKey(task.itemId)}.name`] : [];
    void audio.say(say.intro(task.itemId), 'letter.write', ...extra);
  } else if (task.kind === 'choose') void audio.say(say.where(task.itemId));
  else if (task.kind === 'count') void audio.say('count.prompt');
  else if (task.kind === 'match') void audio.say(`${speechKey(task.itemId)}.pickPicture`);
}
