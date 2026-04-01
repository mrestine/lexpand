import { DAILY_PUZZLE, inferLetter, isValidWord, letterKey } from './puzzle';

export type ScoreLabel =
  | 'START'
  | 'YOU GOT ONE'
  | 'GOOD'
  | 'GREAT'
  | 'EXCELLENT'
  | 'PERFECT';

export interface RungResult {
  word: string; // word the player typed
  letter: string; // which letter was chosen
  rungIndex: number;
}

export interface GameState {
  history: RungResult[]; // solved rungs in order
  currentLetters: string; // letters available right now
  activeRung: number; // 0-based index of the rung the player is currently on
  complete: boolean;
  error: string | null;
}

export function scoreLabel(depth: number): ScoreLabel {
  if (depth >= 5) return 'PERFECT';
  if (depth === 4) return 'EXCELLENT';
  if (depth === 3) return 'GREAT';
  if (depth === 2) return 'GOOD';
  if (depth === 1) return 'YOU GOT ONE';
  return 'START';
}

export function scoreDescription(depth: number): string {
  if (depth >= 5) return 'PERFECT — you found the path!';
  if (depth === 4) return 'EXCELLENT — one step away';
  if (depth === 3) return 'GREAT — halfway there';
  if (depth === 2) return 'GOOD — keep going';
  if (depth === 1) return 'YOU GOT ONE — keep going';
  return 'Grow the word · Find the path';
}

export const SCORE_BACKGROUNDS: Record<ScoreLabel, string> = {
  START: 'from-[#f7f4ef] to-[#ede9e0]',
  'YOU GOT ONE': 'from-amber-100 to-amber-200',
  GOOD: 'from-yellow-100 to-yellow-300',
  GREAT: 'from-green-100 to-green-300',
  EXCELLENT: 'from-teal-100 to-teal-300',
  PERFECT: 'from-violet-200 to-purple-400',
};

// Accent drives solved-tile border/text colour (always on a white/80 tile bg)
export const SCORE_ACCENT: Record<ScoreLabel, string> = {
  START: 'text-stone-700',
  'YOU GOT ONE': 'text-amber-700',
  GOOD: 'text-yellow-700',
  GREAT: 'text-green-700',
  EXCELLENT: 'text-teal-700',
  PERFECT: 'text-violet-700',
};

// Per-state theme for all text/decoration on the page background itself
export interface ScoreTheme {
  title: string          // h1
  subtitle: string       // tagline / subtitle
  description: string    // score description line
  hint: string           // "type your word" hint
  error: string          // validation error
  connector: string      // bg class for connector line
  backtrackkBtn: string  // backtrack / give up button text + hover
  optionDimmed: string   // letter circle — future (unreached) rung
  pendingBox: string     // border + bg for future-rung placeholder boxes
  completionWord: string // large word reveal on completion
  completionBody: string // "come back tomorrow" text
  playAgainBtn: string   // play again / try again button
}

export const SCORE_THEME: Record<ScoreLabel, ScoreTheme> = {
  START: {
    title: 'text-stone-800',
    subtitle: 'text-stone-500',
    description: 'text-stone-500',
    hint: 'text-stone-400',
    error: 'text-red-600',
    connector: 'bg-stone-400/40',
    backtrackkBtn: 'text-stone-400 hover:text-stone-700',
    optionDimmed: 'bg-stone-200/80 text-stone-400',
    pendingBox: 'bg-black/[0.06] border border-black/10',
    completionWord: 'text-stone-800',
    completionBody: 'text-stone-500',
    playAgainBtn: 'bg-stone-800/10 hover:bg-stone-800/20 text-stone-700',
  },
  'YOU GOT ONE': {
    title: 'text-amber-950',
    subtitle: 'text-amber-700',
    description: 'text-amber-700',
    hint: 'text-amber-600',
    error: 'text-red-700',
    connector: 'bg-amber-500/35',
    backtrackkBtn: 'text-amber-600 hover:text-amber-900',
    optionDimmed: 'bg-amber-200/70 text-amber-400',
    pendingBox: 'bg-amber-400/[0.12] border border-amber-500/20',
    completionWord: 'text-amber-950',
    completionBody: 'text-amber-700',
    playAgainBtn: 'bg-amber-900/10 hover:bg-amber-900/20 text-amber-950',
  },
  GOOD: {
    title: 'text-yellow-950',
    subtitle: 'text-yellow-700',
    description: 'text-yellow-700',
    hint: 'text-yellow-600',
    error: 'text-red-700',
    connector: 'bg-yellow-600/35',
    backtrackkBtn: 'text-yellow-600 hover:text-yellow-950',
    optionDimmed: 'bg-yellow-200/70 text-yellow-400',
    pendingBox: 'bg-yellow-500/[0.12] border border-yellow-600/20',
    completionWord: 'text-yellow-950',
    completionBody: 'text-yellow-700',
    playAgainBtn: 'bg-yellow-900/10 hover:bg-yellow-900/20 text-yellow-950',
  },
  GREAT: {
    title: 'text-green-950',
    subtitle: 'text-green-700',
    description: 'text-green-700',
    hint: 'text-green-600',
    error: 'text-red-700',
    connector: 'bg-green-500/40',
    backtrackkBtn: 'text-green-600 hover:text-green-950',
    optionDimmed: 'bg-green-200/70 text-green-400',
    pendingBox: 'bg-green-500/[0.12] border border-green-600/20',
    completionWord: 'text-green-950',
    completionBody: 'text-green-700',
    playAgainBtn: 'bg-green-900/10 hover:bg-green-900/20 text-green-950',
  },
  EXCELLENT: {
    title: 'text-teal-950',
    subtitle: 'text-teal-700',
    description: 'text-teal-700',
    hint: 'text-teal-600',
    error: 'text-red-700',
    connector: 'bg-teal-500/40',
    backtrackkBtn: 'text-teal-600 hover:text-teal-950',
    optionDimmed: 'bg-teal-200/70 text-teal-400',
    pendingBox: 'bg-teal-500/[0.12] border border-teal-600/20',
    completionWord: 'text-teal-950',
    completionBody: 'text-teal-700',
    playAgainBtn: 'bg-teal-900/10 hover:bg-teal-900/20 text-teal-950',
  },
  PERFECT: {
    title: 'text-white',
    subtitle: 'text-white/70',
    description: 'text-white/70',
    hint: 'text-white/45',
    error: 'text-red-200',
    connector: 'bg-white/25',
    backtrackkBtn: 'text-white/55 hover:text-white/90',
    optionDimmed: 'bg-white/15 text-white/25',
    pendingBox: 'bg-white/20 border border-white/35',
    completionWord: 'text-white',
    completionBody: 'text-white/70',
    playAgainBtn: 'bg-white/20 hover:bg-white/30 text-white',
  },
};

export function initialState(): GameState {
  return {
    history: [],
    currentLetters: DAILY_PUZZLE.startWord,
    activeRung: 0,
    complete: false,
    error: null,
  };
}

export function submitWord(state: GameState, input: string): GameState {
  const word = input.trim().toUpperCase();
  const rung = DAILY_PUZZLE.rungs[state.activeRung];

  if (!rung) return { ...state, error: 'No more rungs.' };

  // Check letter key matches one of the 3 options
  const letter = inferLetter(state.currentLetters, word, rung.options);
  if (!letter) {
    return {
      ...state,
      error:
        'Use your current letters plus exactly one of the offered letters.',
    };
  }

  // Validate the word
  const letters = state.currentLetters.toUpperCase() + letter;
  if (!isValidWord(DAILY_PUZZLE, letters, word)) {
    return {
      ...state,
      error: `"${word}" is not a valid word for those letters.`,
    };
  }

  const result: RungResult = { word, letter, rungIndex: state.activeRung };
  const newHistory = [...state.history, result];
  const isComplete = state.activeRung >= DAILY_PUZZLE.rungs.length - 1;

  return {
    ...state,
    history: newHistory,
    currentLetters: word,
    activeRung: isComplete ? state.activeRung : state.activeRung + 1,
    complete: isComplete,
    error: null,
  };
}

export function backtrack(state: GameState): GameState {
  if (state.history.length === 0) return state;

  const newHistory = state.history.slice(0, -1);
  const previousWord =
    newHistory.length > 0
      ? newHistory[newHistory.length - 1]!.word
      : DAILY_PUZZLE.startWord;

  return {
    ...state,
    history: newHistory,
    currentLetters: previousWord,
    activeRung: state.activeRung > 0 ? state.activeRung - 1 : 0,
    complete: false,
    error: null,
  };
}

export function backtrackTo(state: GameState, rungIndex: number): GameState {
  // rungIndex is the rung we want to go back TO (0 = before rung 0 was solved)
  const newHistory = state.history.slice(0, rungIndex);
  const previousWord =
    newHistory.length > 0
      ? newHistory[newHistory.length - 1]!.word
      : DAILY_PUZZLE.startWord;

  return {
    ...state,
    history: newHistory,
    currentLetters: previousWord,
    activeRung: rungIndex,
    complete: false,
    error: null,
  };
}

/** Key built from sorted letters of current set, used for lookup */
export { letterKey };
