export type ItemId = string;
export type Area = 'numbers' | 'letters';

/** 1 seznámení, 2 ze dvou, 3 ze tří až čtyř, 4 přiřazení, 5 obtahování. */
export type Stage = 1 | 2 | 3 | 4 | 5;

export type ItemState = 'locked' | 'learning' | 'mastered';

export interface Attempt {
  itemId: ItemId;
  stage: Stage;
  /** Správně napoprvé. Druhý pokus po nápovědě se do zvládnutí nepočítá. */
  correct: boolean;
  /** Byla zvýrazněná správná možnost. */
  helped: boolean;
  ts: number;
}

export interface ReviewState {
  /** Za kolik sezení se položka vrátí. */
  interval: number;
  /** Index sezení, ve kterém je splatná. */
  dueAtSession: number;
  /** Kolikrát se po zvládnutí znovu spletl. */
  lapses: number;
}

export interface ItemProgress {
  itemId: ItemId;
  area: Area;
  state: ItemState;
  stage: Stage;
  /** Posledních pár pokusů ze stupně 3 a výš, napoprvé. Nejnovější vzadu. */
  recent: boolean[];
  /** Správné po sobě v aktuálním stupni. Řídí postup mezi stupni. */
  stageStreak: number;
  masteredAt?: number;
  review: ReviewState | null;
  unlockedAt?: number;
  updatedAt: number;
  /** Pro budoucí synchronizaci: záznam se od poslední synchronizace změnil. */
  dirty: boolean;
}

export interface EngineState {
  /** Monotónní čítač sezení. Jednotka opakovacích intervalů. */
  sessionIndex: number;
  items: Record<ItemId, ItemProgress>;
}

export interface CurriculumConfig {
  /** Nejvýš tolik rozpracovaných položek naráz v jedné oblasti. */
  maxLearning: number;
  /** Z kolika posledních pokusů se počítá zvládnutí. */
  masteryWindow: number;
  /** Kolik z nich musí být správně. */
  masteryNeeded: number;
  /** Kolik správných po sobě posune položku ze stupně do dalšího. */
  streakToAdvance: Record<Stage, number>;
  /** Intervaly opakování v sezeních. */
  reviewIntervals: number[];
  /** Podíl opakování v sezení, od–do. */
  reviewShare: [number, number];
}

export const DEFAULT_CONFIG: CurriculumConfig = {
  maxLearning: 2,
  masteryWindow: 5,
  masteryNeeded: 4,
  streakToAdvance: { 1: 1, 2: 2, 3: 3, 4: 2, 5: 1 },
  reviewIntervals: [1, 2, 4, 8, 16],
  reviewShare: [0.2, 0.3],
};

export type TaskKind = 'intro' | 'choose' | 'count' | 'match' | 'trace';

export interface Task {
  kind: TaskKind;
  itemId: ItemId;
  area: Area;
  stage: Stage;
  /** Možnosti u výběrových úloh, včetně té správné, už zamíchané. */
  options: ItemId[];
  /** Úloha je opakování zvládnuté položky, ne výuka nové. */
  isReview: boolean;
}
