import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DEFAULT_CONFIG,
  advance,
  applyAttempt,
  availableCount,
  createRng,
  initState,
  isInterlude,
  nextStep,
  planSession,
  startSession,
  unlockNext,
  type Area,
  type EngineState,
  type Interlude,
  type ItemId,
  type Step,
  type Task,
} from '../engine/index.ts';
import { NUMBERS } from '../content/items.numbers.ts';
import { LETTERS } from '../content/items.letters.ts';
import { VARIANT_GROUPS } from '../content/speech.ts';
import { audio } from '../audio/AudioEngine.ts';
import { director } from '../audio/director.ts';
import { sfx } from '../audio/sfx.ts';
import { createIdbRepository } from '../data/idbRepository.ts';
import { DEFAULT_SETTINGS, type ProgressRepository, type Settings } from '../data/ProgressRepository.ts';
import { FALLBACK_TEXTS, say, speechKey } from './speechFor.ts';
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

export type Phase = 'locked' | 'home' | 'task' | 'interlude' | 'map' | 'end' | 'rodice';

export interface SessionApi {
  phase: Phase;
  repo: ProgressRepository;
  task: Task | null;
  interlude: Interlude | null;
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
  finishInterlude(): void;
  showMap(): void;
  openParentZone(): void;
  changeSettings(patch: Partial<Settings>): void;
  resetProgress(): void;
  goHome(): void;
}

export function useSession(): SessionApi {
  const repo = useMemo(() => createIdbRepository(), []);
  const rng = useMemo(() => createRng(Date.now() & 0xffff), []);

  const [phase, setPhase] = useState<Phase>('locked');
  const [state, setState] = useState<EngineState | null>(null);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [task, setTask] = useState<Task | null>(null);
  const [interlude, setInterlude] = useState<Interlude | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [masteredToday, setMasteredToday] = useState<ItemId[]>([]);
  const [areas, setAreas] = useState<Area[]>(['numbers']);

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const cursor = useRef(startSession(planSession(10, rng, DEFAULT_CONFIG, 2)));
  const busy = useRef(false);
  const sessionId = useRef<string | null>(null);
  const correctFirstTry = useRef(0);
  const masteredTodayRef = useRef<ItemId[]>([]);
  /** Položky, u kterých už dnes zazněla celá otázka. Podruhé stačí kratší pobídnutí. */
  const heardFullPrompt = useRef<Set<ItemId>>(new Set());

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
    director.say('ui.welcome');
  }, [settings.effectsVolume, settings.speechVolume]);

  /**
   * Řekne, co má dítě dělat.
   *
   * Poprvé v sezení celá otázka, podruhé už jen krátké pobídnutí. Desetkrát
   * za sebou „Kde je písmeno od Mikuláše?" je přesně ten druh opakování,
   * po kterém aplikace přestane bavit.
   */
  const speakPrompt = useCallback((step: Task) => {
    audio.stop();
    const first = !heardFullPrompt.current.has(step.itemId);
    heardFullPrompt.current.add(step.itemId);

    if (step.kind === 'intro') {
      const names = settingsRef.current.sayLetterNames && step.area === 'letters';
      director.sayAlways(
        say.intro(step.itemId),
        'letter.write',
        ...(names ? [`${speechKey(step.itemId)}.name`] : []),
      );
      return;
    }

    if (step.kind === 'choose') {
      if (first) director.sayAlways(say.where(step.itemId));
      else director.sayAlways(say.word(step.itemId));
      return;
    }

    if (step.kind === 'match') {
      director.sayAlways(`${speechKey(step.itemId)}.pickPicture`);
      return;
    }

    if (step.kind === 'count') {
      // Pokyn k počítání stačí jednou za čas, ne u každého počítání.
      director.say('count.prompt');
    }
  }, []);

  const pushStep = useCallback(
    (from: EngineState, active: Area[]) => {
      const step: Step | null = nextStep(from, cursor.current, active, SOURCES, rng);

      if (!step) {
        setPhase('end');
        return;
      }

      if (isInterlude(step)) {
        cursor.current = advance(cursor.current, step);
        setInterlude(step);
        setPhase('interlude');
        return;
      }

      setTask(step);
      setInterlude(null);
      setPhase('task');
      setMistakes(0);
      speakPrompt(step);
      void audio.preload([say.this(step.itemId), ...VARIANT_GROUPS.praise.slice(0, 3)]);
    },
    [rng, speakPrompt],
  );

  const chooseArea = useCallback(
    (area: Area) => {
      if (!state) return;
      const active: Area[] = [area];
      setAreas(active);

      director.reset();
      heardFullPrompt.current = new Set();
      cursor.current = startSession(
        planSession(settings.sessionMinutes, rng, DEFAULT_CONFIG, availableCount(state, active)),
      );
      masteredTodayRef.current = [];
      setMasteredToday([]);
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

      sfx.tap();
      pushStep(state, active);
    },
    [pushStep, repo, rng, settings.sessionMinutes, state],
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

      window.setTimeout(
        () => {
          busy.current = false;
          if (cursor.current.done >= cursor.current.plan.taskBudget) {
            setPhase('end');
            director.sayAlways('session.end.great');
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
          pushStep(unlocked, areas);
        },
        justMastered ? 1500 : 850,
      );
    },
    [areas, persist, pushStep, repo, state, task],
  );

  const answer = useCallback(
    (optionId: ItemId) => {
      if (!task || busy.current) return;

      if (optionId === task.itemId) {
        busy.current = true;
        sfx.correct();
        // Pochvala nezazní pokaždé. První zvládnutá položka v sezení ano.
        director.praise(VARIANT_GROUPS.praise, masteredTodayRef.current.length === 0);
        settle(true, mistakes > 0);
        return;
      }

      // Chyba nikdy není červená. Hlas pojmenuje, co dítě vybralo,
      // a hned nabídne další pokus.
      sfx.nudge();
      director.sayAlways(say.this(optionId), say.tryFind(task.itemId));
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
    [mistakes, settle, task],
  );

  const finishIntro = useCallback(() => {
    if (busy.current) return;
    busy.current = true;
    settle(true, false);
  }, [settle]);

  const finishCount = useCallback(() => {
    if (busy.current) return;
    busy.current = true;
    director.praise(VARIANT_GROUPS.praise);
    settle(true, false);
  }, [settle]);

  const finishInterlude = useCallback(() => {
    if (!state) return;
    pushStep(state, areas);
  }, [areas, pushStep, state]);

  const showMap = useCallback(() => {
    setPhase('map');
    director.say('map.intro');
  }, []);

  const goHome = useCallback(() => {
    audio.stop();
    setPhase('home');
    setTask(null);
    setInterlude(null);
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
    masteredTodayRef.current = [];
    setMasteredToday([]);
    void repo.resetProgress();
    void repo.saveState(fresh);
  }, [repo]);

  useEffect(() => {
    if (phase === 'task' && mistakes === 2) director.encourage(VARIANT_GROUPS.encourage);
  }, [mistakes, phase]);

  return {
    phase,
    repo,
    task,
    interlude,
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
    finishInterlude,
    showMap,
    openParentZone,
    changeSettings,
    resetProgress,
    goHome,
  };
}
