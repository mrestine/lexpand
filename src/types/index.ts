export interface Step {
  options: string; // 3-char lowercase e.g. "sln"
}
export interface PuzzleData {
  start: string;
  target: string[];
  steps: Step[];
  dictionary: Record<string, string[]>;
}

export type BoxStatus =
  | 'start' // dark tile — the starting word
  | 'solved' // completed step word
  | 'typing' // filled letter in the active input row
  | 'cursor' // next-to-type position in the active row
  | 'empty' // unfilled position in the active row (after cursor)
  | 'pending' // future step placeholder
  | 'target'; // target word placeholder

export type ScoreLabel =
  | 'START'
  | 'YOU GOT ONE'
  | 'GOOD'
  | 'GREAT'
  | 'EXCELLENT'
  | 'PERFECT';

export interface StepResult {
  word: string;
  letter: string;
  stepIndex: number;
}

export interface ScoreTheme {
  background: string;
  accent: string;
  scoreColor: string;
  subtitle: string;
  hint: string;
  error: string;
  connector: string;
  optionActive: string;
  optionDimmed: string;
  pendingBox: string;
  actionBtn: string;
}

export interface StepProperty {
  scoreLabel: ScoreLabel;
  theme: ScoreTheme;
}

export const ARCHIVE_START = '2026-04-01';

export const TRANSITION_DURATION_MS = 1400;
export const TRANSITION_CLASS = `duration-[${TRANSITION_DURATION_MS}ms]`;

export interface SavedGameState {
  history: StepResult[];
  activeStep: number;
  complete: boolean;
  gaveUp: boolean;
}

export type PuzzleProgress = 'none' | 'started' | 'complete' | 'gave_up';

export function getLocalDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function getProgressForDate(date: string): PuzzleProgress {
  const raw = localStorage.getItem(`lexpand_game_${date}`);
  if (!raw) return 'none';
  try {
    const state = JSON.parse(raw) as SavedGameState;
    if (state.complete) return 'complete';
    if (state.gaveUp) return 'gave_up';
    if (state.history?.length > 0) return 'started';
  } catch {
    /* ignore */
  }
  return 'none';
}

export const STEP_PROPS: StepProperty[] = [
  {
    scoreLabel: 'START',
    theme: {
      background: 'from-[#f7f4ef] to-[#ede9e0]',
      accent: 'text-stone-700',
      scoreColor: '#1c1917',
      subtitle: 'text-stone-500',
      hint: 'text-stone-400',
      error: 'text-red-600',
      connector: 'bg-stone-400/40',
      optionActive: 'bg-stone-300 text-stone-700',
      optionDimmed: 'bg-stone-300/80 text-stone-500',
      pendingBox: 'bg-black/[0.06] border border-black/10',
      actionBtn: 'bg-stone-800/10 hover:bg-stone-800/20 text-stone-700',
    },
  },
  {
    scoreLabel: 'YOU GOT ONE',
    theme: {
      background: 'from-orange-200 to-orange-300',
      accent: 'text-orange-700',
      scoreColor: '#7c2d12',
      subtitle: 'text-orange-700',
      hint: 'text-orange-600',
      error: 'text-red-700',
      connector: 'bg-orange-500/35',
      optionActive: 'bg-orange-300 text-orange-900',
      optionDimmed: 'bg-orange-200/70 text-orange-500',
      pendingBox: 'bg-orange-400/[0.12] border border-orange-500/20',
      actionBtn: 'bg-orange-900/10 hover:bg-orange-900/20 text-orange-950',
    },
  },
  {
    scoreLabel: 'GOOD',
    theme: {
      background: 'from-yellow-200 to-yellow-400',
      accent: 'text-yellow-700',
      scoreColor: '#713f12',
      subtitle: 'text-yellow-800',
      hint: 'text-yellow-700',
      error: 'text-red-700',
      connector: 'bg-yellow-600/35',
      optionActive: 'bg-yellow-300 text-yellow-900',
      optionDimmed: 'bg-yellow-300/70 text-yellow-600',
      pendingBox: 'bg-yellow-500/[0.12] border border-yellow-600/20',
      actionBtn: 'bg-yellow-900/10 hover:bg-yellow-900/20 text-yellow-950',
    },
  },
  {
    scoreLabel: 'GREAT',
    theme: {
      background: 'from-green-100 to-green-300',
      accent: 'text-green-700',
      scoreColor: '#14532d',
      subtitle: 'text-green-700',
      hint: 'text-green-600',
      error: 'text-red-700',
      connector: 'bg-green-500/40',
      optionActive: 'bg-green-300 text-green-800',
      optionDimmed: 'bg-green-200/70 text-green-500',
      pendingBox: 'bg-green-500/[0.12] border border-green-600/20',
      actionBtn: 'bg-green-900/10 hover:bg-green-900/20 text-green-950',
    },
  },
  {
    scoreLabel: 'EXCELLENT',
    theme: {
      background: 'from-teal-100 to-teal-300',
      accent: 'text-teal-700',
      scoreColor: '#134e4a',
      subtitle: 'text-teal-700',
      hint: 'text-teal-600',
      error: 'text-red-700',
      connector: 'bg-teal-500/40',
      optionActive: 'bg-teal-300 text-teal-800',
      optionDimmed: 'bg-teal-200/70 text-teal-500',
      pendingBox: 'bg-teal-500/[0.12] border border-teal-600/20',
      actionBtn: 'bg-teal-900/10 hover:bg-teal-900/20 text-teal-950',
    },
  },
  {
    scoreLabel: 'PERFECT',
    theme: {
      background: 'from-violet-200 to-purple-400',
      accent: 'text-violet-700',
      scoreColor: '#4c1d95',
      subtitle: 'text-stone-900',
      hint: 'text-white/45',
      error: 'text-red-200',
      connector: 'bg-white/25',
      optionActive: 'bg-violet-300 text-violet-900',
      optionDimmed: 'bg-white/25 text-white/40',
      pendingBox: 'bg-white/20 border border-white/35',
      actionBtn: 'bg-white/20 hover:bg-white/30 text-white',
    },
  },
];
