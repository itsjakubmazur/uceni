import { buildTask, kindsFor, type DistractorSource } from './taskFactory.ts';
import { dueForReview, learningItems, stalestMastered, type Rng } from './scheduler.ts';
import type { Area, CurriculumConfig, EngineState, ItemId, Task, TaskKind } from './types.ts';

/**
 * Průběh sezení.
 *
 * Sezení není proud úloh, ale **sled scén**. Rozdíl je poznat okamžitě:
 * proud úloh znamená, že se dvě rozpracované položky střídají donekonečna
 * a jakmile jedna doleze na obtahování, kreslí se pořád dokola. Sled scén
 * má tvar — něco nového, procvičení promíchané s tím, co už umí, chvíle
 * hry, návrat k něčemu známému, závěr.
 *
 * Pravidla proti monotonii jsou tvrdá a hlídané testy:
 * - stejná položka nejvýš `maxPerItem` krát za sezení a nikdy dvakrát po sobě,
 * - stejný druh úlohy nejvýš dvakrát po sobě,
 * - obtahování nejvýš jednou na položku za sezení,
 * - seznámení nejvýš jednou na položku za sezení,
 * - po každých `interludeEvery` úlohách přijde mezihra, ve které se nic
 *   nevyhodnocuje a jde si jen hrát.
 */

/** Odhad délky jedné úlohy včetně promluvy a reakce. */
const SECONDS_PER_TASK = 14;

export interface SessionPlan {
  /** Kolik úloh se do rozpočtu zhruba vejde. */
  taskBudget: number;
  /** Kolik z nich má být opakování. */
  reviewBudget: number;
  /** Po kolika úlohách přijde mezihra. */
  interludeEvery: number;
  /** Kolikrát nejvýš smí jedna položka za sezení přijít. */
  maxPerItem: number;
}

/**
 * Délka sezení se řídí dvěma věcmi a rozhoduje ta přísnější: časem, který
 * rodič nastavil, a **množstvím látky, kterou dítě má odemčenou**.
 *
 * Bez toho druhého vychází nesmysl: deset minut je zhruba třiačtyřicet úloh
 * a na začátku jsou odemčené dvě položky, takže jedno písmeno přijde dvacetkrát
 * za sebou. První sezení proto trvají pár minut a delší se stanou sama, jak
 * dítěti přibývá, z čeho vybírat.
 */
export function planSession(
  minutes: number,
  rng: Rng,
  config: CurriculumConfig,
  availableItems: number,
): SessionPlan {
  const byTime = Math.round((minutes * 60) / SECONDS_PER_TASK);
  const byMaterial = Math.max(6, availableItems * REPEATS_PER_ITEM);
  const taskBudget = Math.max(6, Math.min(byTime, byMaterial));

  const [lo, hi] = config.reviewShare;
  const share = lo + rng() * (hi - lo);

  return {
    taskBudget,
    reviewBudget: Math.round(taskBudget * share),
    // Mezihra po čtyřech až pěti úlohách. Míň by tříštilo soustředění,
    // víc by z toho zase byla cvičebnice.
    interludeEvery: rng() < 0.5 ? 4 : 5,
    maxPerItem: Math.max(3, Math.ceil(taskBudget / Math.max(1, availableItems))),
  };
}

/** Kolikrát se smí jedna položka za sezení zopakovat, než to začne být nuda. */
const REPEATS_PER_ITEM = 5;

export interface SessionCursor {
  plan: SessionPlan;
  done: number;
  reviewsDone: number;
  /** Poslední dvě položky, aby se nestřídaly pořád dvě dokola. */
  recentItems: ItemId[];
  /** Poslední dva druhy úloh, aby nešly tři stejné za sebou. */
  recentKinds: TaskKind[];
  /** Kolikrát už položka za sezení přišla. */
  seen: Record<ItemId, number>;
  /** Druhy úloh, které položka za tohle sezení už měla. */
  kindsByItem: Record<ItemId, TaskKind[]>;
  /** Kolik úloh uběhlo od poslední mezihry. */
  sinceInterlude: number;
}

export function startSession(plan: SessionPlan): SessionCursor {
  return {
    plan,
    done: 0,
    reviewsDone: 0,
    recentItems: [],
    recentKinds: [],
    seen: {},
    kindsByItem: {},
    sinceInterlude: 0,
  };
}

export function isSessionOver(cursor: SessionCursor): boolean {
  return cursor.done >= cursor.plan.taskBudget;
}

/** Mezihra: chvíle hry mezi úlohami. Nic se nevyhodnocuje, nedá se v ní chybovat. */
export interface Interlude {
  kind: 'interlude';
  /** Který druh hry přijde. Střídají se, aby nezevšedněly. */
  variant: number;
}

export type Step = Task | Interlude;

export const isInterlude = (step: Step): step is Interlude => step.kind === 'interlude';

/**
 * Další krok sezení.
 *
 * Opakování se rozprostírá po celém sezení, ne na konec — dítě má cítit, že
 * se vrací k tomu, co umí, mezi tím, co se teprve učí. V poslední pětině
 * sezení už se nové položky nezavádějí a chodí jen to, co dítě zvládá, aby
 * sezení skončilo úspěchem.
 */
export function nextStep(
  state: EngineState,
  cursor: SessionCursor,
  areas: readonly Area[],
  sources: Record<Area, DistractorSource>,
  rng: Rng,
): Step | null {
  if (cursor.sinceInterlude >= cursor.plan.interludeEvery && cursor.done < cursor.plan.taskBudget) {
    return { kind: 'interlude', variant: Math.floor(rng() * 3) };
  }

  const learning = learningItems(state, areas);
  const due = dueForReview(state, areas);

  const remaining = cursor.plan.taskBudget - cursor.done;
  const reviewsLeft = cursor.plan.reviewBudget - cursor.reviewsDone;
  const inClosingStretch = remaining <= Math.ceil(cursor.plan.taskBudget * 0.2);

  const wantReview =
    (reviewsLeft > 0 && rng() < reviewsLeft / Math.max(1, remaining)) ||
    inClosingStretch ||
    learning.length === 0;

  const reviewPool = due.length ? due : [stalestMastered(state, areas)].filter((p) => p !== null);
  // Nejdřív položky, které dnes ještě nebyly, pak ty s nejmenším počtem opakování.
  const learnPool = [...learning].sort(
    (a, b) => (cursor.seen[a.itemId] ?? 0) - (cursor.seen[b.itemId] ?? 0),
  );

  const order = wantReview ? [reviewPool, learnPool] : [learnPool, reviewPool];

  /*
    Pravidla se uvolňují po stupních, ne najednou.

    Když je odemčená jen hrstka položek, nejdou všechna splnit zároveň —
    a je lepší zopakovat položku o jednou víc, než vyrobit tři stejné druhy
    úloh za sebou. Co se neuvolní nikdy: stejná položka dvakrát po sobě
    a opakované seznámení nebo obtahování téhož znaku.
  */
  for (const relax of RELAXATIONS) {
    for (const pool of order) {
      for (const candidate of pool) {
        if (!itemAllowed(candidate.itemId, cursor, relax)) continue;
        const isReview = candidate.state === 'mastered';

        for (const kind of kindsFor(candidate)) {
          const task = buildTask(candidate, state, sources[candidate.area], rng, isReview, kind);
          if (kindAllowed(task, cursor, relax)) return task;
        }
      }
    }
  }

  return null;
}

/**
 * Stupně uvolnění pravidel, od nejpřísnějšího.
 *
 * Obě omezení se uvolňují nezávisle, protože každé bolí jinak: zopakovat
 * položku o jednou víc si dítě nevšimne, tři stejné úlohy za sebou ho
 * přestanou bavit okamžitě.
 */
const RELAXATIONS = [
  { ignoreMaxPerItem: false, ignoreKindStreak: false },
  { ignoreMaxPerItem: true, ignoreKindStreak: false },
  { ignoreMaxPerItem: false, ignoreKindStreak: true },
  { ignoreMaxPerItem: true, ignoreKindStreak: true },
] as const;

type Relax = (typeof RELAXATIONS)[number];

function itemAllowed(itemId: ItemId, cursor: SessionCursor, relax: Relax): boolean {
  // Tohle se neuvolňuje nikdy: dvakrát po sobě totéž je ta nejhorší nuda.
  if (cursor.recentItems[0] === itemId) return false;
  if (relax.ignoreMaxPerItem) return true;
  return (cursor.seen[itemId] ?? 0) < cursor.plan.maxPerItem;
}

function kindAllowed(task: Task, cursor: SessionCursor, relax: Relax): boolean {
  const already = cursor.kindsByItem[task.itemId] ?? [];

  // Seznámení a obtahování jsou jednorázové zážitky, ne drilovací úlohy.
  // Tohle se neuvolňuje ani v nouzi.
  if ((task.kind === 'trace' || task.kind === 'intro') && already.includes(task.kind)) return false;

  // Obtahování má smysl až potom, co s položkou dítě dnes něco dělalo.
  if (task.kind === 'trace' && already.length === 0 && cursor.done > 0) return false;

  if (relax.ignoreKindStreak) return true;

  const kinds = cursor.recentKinds;
  return !(kinds.length >= 2 && kinds[0] === task.kind && kinds[1] === task.kind);
}

export function advance(cursor: SessionCursor, step: Step): SessionCursor {
  if (isInterlude(step)) {
    return { ...cursor, sinceInterlude: 0 };
  }

  return {
    ...cursor,
    done: cursor.done + 1,
    reviewsDone: cursor.reviewsDone + (step.isReview ? 1 : 0),
    recentItems: [step.itemId, ...cursor.recentItems].slice(0, 2),
    recentKinds: [step.kind, ...cursor.recentKinds].slice(0, 2),
    seen: { ...cursor.seen, [step.itemId]: (cursor.seen[step.itemId] ?? 0) + 1 },
    kindsByItem: {
      ...cursor.kindsByItem,
      [step.itemId]: [...(cursor.kindsByItem[step.itemId] ?? []), step.kind],
    },
    sinceInterlude: cursor.sinceInterlude + 1,
  };
}

export interface SessionSummary {
  taskCount: number;
  correctFirstTry: number;
  newlyMastered: string[];
  itemsTouched: string[];
}

/** Co se dneska naučil — podklad pro laskavé ukončení sezení. */
export function summarize(
  before: EngineState,
  after: EngineState,
  cursor: SessionCursor,
): SessionSummary {
  const newlyMastered = Object.values(after.items)
    .filter((p) => p.state === 'mastered' && before.items[p.itemId]?.state !== 'mastered')
    .map((p) => p.itemId);

  const itemsTouched = Object.values(after.items)
    .filter((p) => p.updatedAt !== before.items[p.itemId]?.updatedAt)
    .map((p) => p.itemId);

  return {
    taskCount: cursor.done,
    correctFirstTry: 0,
    newlyMastered,
    itemsTouched,
  };
}
