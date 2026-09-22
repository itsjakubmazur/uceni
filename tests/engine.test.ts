import { describe, expect, it } from 'vitest';
import {
  DEFAULT_CONFIG,
  applyAttempt,
  buildTask,
  createRng,
  dueForReview,
  initState,
  isMastered,
  learningItems,
  nextReview,
  planSession,
  startSession,
  advance,
  nextStep,
  isInterlude,
  availableCount,
  unlockNext,
  type Area,
  type Attempt,
  type EngineState,
  type ItemId,
  type Stage,
} from '../src/engine/index.ts';

const NUMBERS: ItemId[] = ['num:1', 'num:2', 'num:3', 'num:4', 'num:5'];
const LETTERS: ItemId[] = ['let:M', 'let:A', 'let:E'];
const ORDER: Record<Area, readonly ItemId[]> = { numbers: NUMBERS, letters: LETTERS };

const SOURCES = {
  numbers: { order: NUMBERS, confusables: { 'num:6': ['num:9'] } },
  letters: { order: LETTERS, confusables: { 'let:M': ['let:N'] } },
};

const attempt = (itemId: ItemId, stage: Stage, correct: boolean, helped = false): Attempt => ({
  itemId,
  stage,
  correct,
  helped,
  ts: 1000,
});

/** Odpoví n-krát správně ve stupni, aniž by se řešil postup. */
function answer(state: EngineState, id: ItemId, stage: Stage, results: boolean[]): EngineState {
  return results.reduce((s, ok) => applyAttempt(s, attempt(id, stage, ok), DEFAULT_CONFIG), state);
}

describe('odemykání', () => {
  it('začíná s nejvýš dvěma rozpracovanými v každé oblasti', () => {
    const state = initState(ORDER, DEFAULT_CONFIG);
    expect(learningItems(state, ['numbers']).map((p) => p.itemId)).toEqual(['num:1', 'num:2']);
    expect(learningItems(state, ['letters']).map((p) => p.itemId)).toEqual(['let:M', 'let:A']);
  });

  it('drží pořadí — trojka se neodemkne dřív než jednička', () => {
    const state = initState(ORDER, DEFAULT_CONFIG);
    expect(state.items['num:3']!.state).toBe('locked');
  });

  it('odemkne další až po zvládnutí předchozí', () => {
    let state = initState(ORDER, DEFAULT_CONFIG);
    state = answer(state, 'num:1', 3, [true, true, true, true, true]);
    expect(state.items['num:1']!.state).toBe('mastered');

    state = unlockNext(state, ORDER, DEFAULT_CONFIG);
    expect(state.items['num:3']!.state).toBe('learning');
    expect(state.items['num:4']!.state).toBe('locked');
  });
});

describe('zvládnutí', () => {
  it('nastane při čtyřech správných z posledních pěti', () => {
    let state = initState(ORDER, DEFAULT_CONFIG);
    state = answer(state, 'num:1', 3, [true, false, true, true, true]);
    expect(state.items['num:1']!.state).toBe('mastered');
  });

  it('nenastane při třech z pěti', () => {
    let state = initState(ORDER, DEFAULT_CONFIG);
    state = answer(state, 'num:1', 3, [true, false, true, false, true]);
    expect(state.items['num:1']!.state).toBe('learning');
  });

  it('se nepočítá ze stupně 2, kde se dá trefit náhodou', () => {
    let state = initState(ORDER, DEFAULT_CONFIG);
    state = answer(state, 'num:1', 2, [true, true, true, true, true, true]);
    expect(isMastered(state.items['num:1']!, DEFAULT_CONFIG)).toBe(false);
  });

  it('nepočítá odpověď, u které byla nápověda', () => {
    let state = initState(ORDER, DEFAULT_CONFIG);
    for (let i = 0; i < 5; i++) {
      state = applyAttempt(state, attempt('num:1', 3, true, true), DEFAULT_CONFIG);
    }
    expect(state.items['num:1']!.state).toBe('learning');
    expect(state.items['num:1']!.recent).toEqual([false, false, false, false, false]);
  });

  it('potřebuje plné okno, ne dva správné pokusy', () => {
    let state = initState(ORDER, DEFAULT_CONFIG);
    state = answer(state, 'num:1', 3, [true, true]);
    expect(state.items['num:1']!.state).toBe('learning');
  });
});

describe('postup mezi stupni', () => {
  it('posune položku výš po dost správných po sobě', () => {
    let state = initState(ORDER, DEFAULT_CONFIG);
    expect(state.items['num:1']!.stage).toBe(1);
    state = applyAttempt(state, attempt('num:1', 1, true), DEFAULT_CONFIG);
    expect(state.items['num:1']!.stage).toBe(2);
    state = answer(state, 'num:1', 2, [true, true]);
    expect(state.items['num:1']!.stage).toBe(3);
  });

  it('chyba sérii vynuluje, ale stupeň nesnižuje', () => {
    let state = initState(ORDER, DEFAULT_CONFIG);
    state = applyAttempt(state, attempt('num:1', 1, true), DEFAULT_CONFIG);
    state = answer(state, 'num:1', 2, [true, false]);
    expect(state.items['num:1']!.stageStreak).toBe(0);
    expect(state.items['num:1']!.stage).toBe(2);
  });

  it('nepřeleze přes obtahování', () => {
    let state = initState(ORDER, DEFAULT_CONFIG);
    state = {
      ...state,
      items: { ...state.items, 'num:1': { ...state.items['num:1']!, stage: 5 } },
    };
    state = answer(state, 'num:1', 5, [true, true, true, true, true, true]);
    expect(state.items['num:1']!.stage).toBe(5);
  });

  it('projde všemi stupni od seznámení po obtahování', () => {
    let state = initState(ORDER, DEFAULT_CONFIG);
    const seen: number[] = [];
    for (let i = 0; i < 12; i++) {
      const stage = state.items['num:1']!.stage;
      seen.push(stage);
      state = applyAttempt(state, attempt('num:1', stage, true), DEFAULT_CONFIG);
    }
    expect(new Set(seen)).toEqual(new Set([1, 2, 3, 4, 5]));
  });
});

describe('opakování', () => {
  it('po zvládnutí naplánuje první opakování', () => {
    let state = initState(ORDER, DEFAULT_CONFIG);
    state = answer(state, 'num:1', 3, [true, true, true, true, true]);
    expect(state.items['num:1']!.review).toEqual({ interval: 1, dueAtSession: 1, lapses: 0 });
  });

  it('prodlužuje interval při úspěchu', () => {
    const r = { interval: 2, dueAtSession: 5, lapses: 0 };
    expect(nextReview(r, true, 5, DEFAULT_CONFIG).interval).toBe(4);
  });

  it('po chybě se vrací o dva kroky, ne na začátek', () => {
    const r = { interval: 8, dueAtSession: 5, lapses: 0 };
    const after = nextReview(r, false, 5, DEFAULT_CONFIG);
    expect(after.interval).toBe(2);
    expect(after.lapses).toBe(1);
  });

  it('nespadne pod nejkratší interval', () => {
    const r = { interval: 1, dueAtSession: 2, lapses: 3 };
    expect(nextReview(r, false, 2, DEFAULT_CONFIG).interval).toBe(1);
  });

  it('vrátí splatné položky a nesplatné ne', () => {
    let state = initState(ORDER, DEFAULT_CONFIG);
    state = answer(state, 'num:1', 3, [true, true, true, true, true]);
    expect(dueForReview(state, ['numbers'])).toHaveLength(0);
    state = { ...state, sessionIndex: 1 };
    expect(dueForReview(state, ['numbers']).map((p) => p.itemId)).toEqual(['num:1']);
  });
});

describe('stavba úlohy', () => {
  const rng = createRng(42);

  it('dá ve stupni 2 dvě možnosti a jednou z nich je ta správná', () => {
    let state = initState(ORDER, DEFAULT_CONFIG);
    state = applyAttempt(state, attempt('num:1', 1, true), DEFAULT_CONFIG);
    const task = buildTask(state.items['num:1']!, state, SOURCES.numbers, rng);
    expect(task.kind).toBe('choose');
    expect(task.options).toHaveLength(2);
    expect(task.options).toContain('num:1');
  });

  it('nikdy nenabídne položku, kterou dítě ještě nevidělo', () => {
    let state = initState(ORDER, DEFAULT_CONFIG);
    state = applyAttempt(state, attempt('num:1', 1, true), DEFAULT_CONFIG);
    for (let i = 0; i < 40; i++) {
      const task = buildTask(state.items['num:1']!, state, SOURCES.numbers, createRng(i + 1));
      for (const id of task.options) {
        expect(state.items[id]!.state, `${id} je ještě zamčená`).not.toBe('locked');
      }
    }
  });

  it('u seznámení nenabízí nic k výběru', () => {
    const state = initState(ORDER, DEFAULT_CONFIG);
    const task = buildTask(state.items['num:1']!, state, SOURCES.numbers, rng);
    expect(task.kind).toBe('intro');
    expect(task.options).toEqual([]);
  });

  it('u čísel je čtvrtý stupeň počítání, u písmen přiřazení obrázku', () => {
    const state = initState(ORDER, DEFAULT_CONFIG);
    const num = { ...state.items['num:1']!, stage: 4 as Stage };
    const let_ = { ...state.items['let:M']!, stage: 4 as Stage };
    expect(buildTask(num, state, SOURCES.numbers, rng).kind).toBe('count');
    expect(buildTask(let_, state, SOURCES.letters, rng).kind).toBe('match');
  });

  it('přimíchá zaměnitelný znak až u jistější položky', () => {
    const order: ItemId[] = ['let:M', 'let:A', 'let:N'];
    const source = { order, confusables: { 'let:M': ['let:N'] } };
    let state = initState({ numbers: [], letters: order }, DEFAULT_CONFIG);
    state = {
      ...state,
      items: {
        ...state.items,
        'let:N': { ...state.items['let:N']!, state: 'learning' },
        'let:M': { ...state.items['let:M']!, stage: 3, stageStreak: 4 },
      },
    };
    const task = buildTask(state.items['let:M']!, state, source, createRng(7));
    expect(task.options).toContain('let:N');
  });
});

describe('sezení', () => {
  it('spočítá rozpočet úloh z minut, když je dost látky', () => {
    const plan = planSession(10, createRng(1), DEFAULT_CONFIG, 40);
    expect(plan.taskBudget).toBeGreaterThan(30);
    expect(plan.taskBudget).toBeLessThan(60);
  });

  it('zkrátí sezení, když je odemčeno málo položek', () => {
    // Dvě odemčené položky a deset minut by znamenalo dvacet opakování
    // jednoho znaku. První sezení proto musí být krátké.
    const plan = planSession(10, createRng(1), DEFAULT_CONFIG, 2);
    expect(plan.taskBudget).toBeLessThanOrEqual(12);
    expect(plan.maxPerItem).toBeLessThanOrEqual(6);
  });

  it('nechá sezení růst, jak dítěti přibývá látky', () => {
    const budgets = [2, 6, 12, 30].map(
      (n) => planSession(10, createRng(1), DEFAULT_CONFIG, n).taskBudget,
    );
    for (let i = 1; i < budgets.length; i++) {
      expect(budgets[i]!).toBeGreaterThanOrEqual(budgets[i - 1]!);
    }
  });

  it('vyhradí opakování dvacet až třicet procent úloh', () => {
    for (let seed = 1; seed < 30; seed++) {
      const plan = planSession(10, createRng(seed), DEFAULT_CONFIG, 40);
      const share = plan.reviewBudget / plan.taskBudget;
      expect(share).toBeGreaterThanOrEqual(0.19);
      expect(share).toBeLessThanOrEqual(0.31);
    }
  });

  /** Projde celé sezení a vrátí, co po sobě přišlo. */
  function playSession(seed: number, areas: Area[] = ['numbers']) {
    let state = initState(ORDER, DEFAULT_CONFIG);
    let cursor = startSession(
      planSession(10, createRng(seed), DEFAULT_CONFIG, availableCount(state, areas)),
    );
    const rng = createRng(seed + 100);
    const steps: ReturnType<typeof nextStep>[] = [];

    let guard = 0;
    while (cursor.done < cursor.plan.taskBudget && guard++ < 400) {
      const step = nextStep(state, cursor, areas, SOURCES, rng);
      if (!step) break;
      steps.push(step);
      cursor = advance(cursor, step);
      if (!isInterlude(step)) {
        // Dítě odpovídá správně, ať se stupně posouvají jako v reálu.
        state = applyAttempt(
          state,
          attempt(step.itemId, step.stage, true),
          DEFAULT_CONFIG,
        );
        state = unlockNext(state, ORDER, DEFAULT_CONFIG);
      }
    }
    return { steps, cursor, state };
  }

  it('nedá stejnou položku dvakrát za sebou', () => {
    for (let seed = 1; seed < 12; seed++) {
      const { steps } = playSession(seed);
      const tasks = steps.flatMap((s) => (s && !isInterlude(s) ? [s] : []));
      for (let i = 1; i < tasks.length; i++) {
        expect(tasks[i]!.itemId, `seed ${seed}`).not.toBe(tasks[i - 1]!.itemId);
      }
    }
  });

  it('nedá tři stejné druhy úloh za sebou', () => {
    for (let seed = 1; seed < 12; seed++) {
      const { steps } = playSession(seed);
      const kinds = steps.flatMap((s) => (s && !isInterlude(s) ? [s.kind] : []));
      for (let i = 2; i < kinds.length; i++) {
        const three = kinds[i] === kinds[i - 1] && kinds[i - 1] === kinds[i - 2];
        expect(three, `seed ${seed}: ${kinds.slice(i - 2, i + 1).join(',')}`).toBe(false);
      }
    }
  });

  it('počítá dostupnou látku jen v oblasti, která se hraje', () => {
    const state = initState(ORDER, DEFAULT_CONFIG);
    expect(availableCount(state, ['numbers'])).toBe(2);
    expect(availableCount(state, ['letters'])).toBe(2);
    expect(availableCount(state, ['numbers', 'letters'])).toBe(4);
  });

  it('nenechá jednu položku sežrat celé sezení', () => {
    for (let seed = 1; seed < 12; seed++) {
      const { steps, cursor } = playSession(seed);
      const counts = new Map<string, number>();
      for (const s of steps) {
        if (!s || isInterlude(s)) continue;
        counts.set(s.itemId, (counts.get(s.itemId) ?? 0) + 1);
      }
      for (const [id, n] of counts) {
        expect(n, `seed ${seed}: ${id}`).toBeLessThanOrEqual(cursor.plan.maxPerItem);
      }
    }
  });

  it('obtahuje jednu položku nejvýš jednou za sezení', () => {
    for (let seed = 1; seed < 12; seed++) {
      const { steps } = playSession(seed);
      const traces = new Map<string, number>();
      for (const s of steps) {
        if (!s || isInterlude(s) || s.kind !== 'trace') continue;
        traces.set(s.itemId, (traces.get(s.itemId) ?? 0) + 1);
      }
      for (const [id, n] of traces) {
        expect(n, `seed ${seed}: ${id} obtaženo ${n}×`).toBe(1);
      }
    }
  });

  it('seznámí s položkou jen jednou za sezení', () => {
    for (let seed = 1; seed < 12; seed++) {
      const { steps } = playSession(seed);
      const intros = new Map<string, number>();
      for (const s of steps) {
        if (!s || isInterlude(s) || s.kind !== 'intro') continue;
        intros.set(s.itemId, (intros.get(s.itemId) ?? 0) + 1);
      }
      for (const [, n] of intros) expect(n).toBe(1);
    }
  });

  it('proloží sezení mezihrami', () => {
    const { steps, cursor } = playSession(3);
    const interludes = steps.filter((s) => s && isInterlude(s)).length;
    expect(interludes).toBeGreaterThan(1);
    // Nikdy dvě mezihry za sebou.
    for (let i = 1; i < steps.length; i++) {
      if (steps[i] && isInterlude(steps[i]!)) expect(isInterlude(steps[i - 1]!)).toBe(false);
    }
    expect(cursor.plan.interludeEvery).toBeGreaterThanOrEqual(4);
  });

  it('skončí, až je rozpočet vyčerpaný', () => {
    const { cursor } = playSession(5);
    expect(cursor.done).toBe(cursor.plan.taskBudget);
  });

  it('v závěru sezení už nezavádí nic nového', () => {
    let state = initState(ORDER, DEFAULT_CONFIG);
    state = answer(state, 'num:1', 3, [true, true, true, true, true]);
    state = { ...state, sessionIndex: 2 };

    const plan = { taskBudget: 10, reviewBudget: 2, interludeEvery: 5, maxPerItem: 4 };
    const cursor = { ...startSession(plan), done: 9 };
    const step = nextStep(state, cursor, ['numbers'], SOURCES, createRng(11))!;
    expect(isInterlude(step)).toBe(false);
    expect((step as { isReview: boolean }).isReview).toBe(true);
  });

  it('funguje i když ještě není co opakovat', () => {
    const state = initState(ORDER, DEFAULT_CONFIG);
    const cursor = startSession({ taskBudget: 10, reviewBudget: 3, interludeEvery: 5, maxPerItem: 4 });
    const step = nextStep(state, cursor, ['numbers'], SOURCES, createRng(2));
    expect(step).not.toBeNull();
    expect(isInterlude(step!)).toBe(false);
  });
});
