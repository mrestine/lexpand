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
  title: string;
  subtitle: string;
  description: string;
  hint: string;
  error: string;
  connector: string;
  backtrackkBtn: string;
  optionDimmed: string;
  pendingBox: string;
  completionWord: string;
  completionBody: string;
  playAgainBtn: string;
}

export interface StepProperty {
  scoreLabel: ScoreLabel;
  theme: ScoreTheme;
}

export const STEP_PROPS: StepProperty[] = [
  {
    scoreLabel: 'START',
    theme: {
      background: 'from-[#f7f4ef] to-[#ede9e0]',
      accent: 'text-stone-700',
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
  },
  {
    scoreLabel: 'YOU GOT ONE',
    theme: {
      background: 'from-amber-100 to-amber-200',
      accent: 'text-amber-700',
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
  },
  {
    scoreLabel: 'GOOD',
    theme: {
      background: 'from-yellow-100 to-yellow-300',
      accent: 'text-yellow-700',
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
  },
  {
    scoreLabel: 'GREAT',
    theme: {
      background: 'from-green-100 to-green-300',
      accent: 'text-green-700',
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
  },
  {
    scoreLabel: 'EXCELLENT',
    theme: {
      background: 'from-teal-100 to-teal-300',
      accent: 'text-teal-700',
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
  },
  {
    scoreLabel: 'PERFECT',
    theme: {
      background: 'from-violet-200 to-purple-400',
      accent: 'text-violet-700',
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
  },
];
