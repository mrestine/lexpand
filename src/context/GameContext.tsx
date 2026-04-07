import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { PuzzleData, StepResult, SavedGameState } from '../types';
import { getLocalDateString } from '../types';

const GAME_KEY = (date: string) => `lexpand_game_${date}`;

function saveGame(date: string, state: SavedGameState) {
  localStorage.setItem(GAME_KEY(date), JSON.stringify(state));
}

function loadGame(date: string): SavedGameState | null {
  const raw = localStorage.getItem(GAME_KEY(date));
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as SavedGameState;
  } catch {
    return null;
  }
}

function letterKey(s: string) {
  return s.toLowerCase().split('').sort().join('');
}

async function fetchPuzzle(date: string): Promise<PuzzleData> {
  const res = await fetch(`/puzzles/${date}.json`);
  if (!res.ok) throw new Error(`No puzzle found for ${date}`);
  return res.json() as Promise<PuzzleData>;
}

interface GameContextValue {
  puzzle: PuzzleData | null;
  loading: boolean;
  history: StepResult[];
  activeStep: number;
  complete: boolean;
  isDeadEnd: boolean;
  error: string | null;
  typed: string;
  gaveUp: boolean;
  currentDate: string;
  todayDate: string;
  setTyped: (v: string) => void;
  handleSubmit: (word: string) => void;
  handleBacktrack: () => void;
  handleBacktrackTo: (stepIndex: number) => void;
  handleGiveUp: () => void;
  handleReset: () => void;
  loadDate: (date: string) => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [todayDate] = useState(getLocalDateString);
  const [currentDate, setCurrentDate] = useState(getLocalDateString);

  const [puzzle, setPuzzle] = useState<PuzzleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<StepResult[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typed, setTyped] = useState('');
  const [gaveUp, setGaveUp] = useState(false);

  // Load puzzle and restore saved state whenever currentDate changes
  useEffect(() => {
    setLoading(true);
    setPuzzle(null);
    setError(null);
    setTyped('');

    const saved = loadGame(currentDate);
    setHistory(saved?.history ?? []);
    setActiveStep(saved?.activeStep ?? 0);
    setComplete(saved?.complete ?? false);
    setGaveUp(saved?.gaveUp ?? false);

    fetchPuzzle(currentDate)
      .then(setPuzzle)
      .catch((err) => console.error('Failed to load puzzle:', err))
      .finally(() => setLoading(false));
  }, [currentDate]);

  // Persist game state whenever it changes (only after puzzle is loaded)
  useEffect(() => {
    if (!puzzle) return;
    saveGame(currentDate, { history, activeStep, complete, gaveUp });
  }, [puzzle, currentDate, history, activeStep, complete, gaveUp]);

  const currentLetters =
    history.length > 0
      ? history[history.length - 1]!.word
      : (puzzle?.start ?? '');

  const isDeadEnd =
    !complete &&
    !!puzzle?.steps[activeStep]?.options
      .split('')
      .every(
        (opt) =>
          (
            puzzle.dictionary[
              [...history.map((r) => r.letter), opt].join('')
            ] ?? []
          ).length === 0,
      );

  const handleSubmit = useCallback(
    (input: string) => {
      if (!input || !puzzle) return;
      const word = input.trim().toUpperCase();
      const step = puzzle.steps[activeStep];
      if (!step) return;

      const letter =
        step.options
          .split('')
          .find((opt) => letterKey(currentLetters + opt) === letterKey(word)) ??
        null;

      if (!letter) {
        setError(
          'Use your current letters plus exactly one of the offered letters.',
        );
        return;
      }

      const path = [...history.map((r) => r.letter), letter].join('');
      const wordList = puzzle.dictionary[path] ?? [];
      if (!wordList.includes(word.toLowerCase())) {
        setError(`"${word}" is not a valid word for those letters.`);
        return;
      }

      const result: StepResult = { word, letter, stepIndex: activeStep };
      const isComplete = activeStep >= puzzle.steps.length - 1;

      setHistory((h) => [...h, result]);
      setActiveStep((s) => (isComplete ? s : s + 1));
      setComplete(isComplete);
      setError(null);
      setTyped('');
    },
    [activeStep, currentLetters, history, puzzle],
  );

  const handleBacktrack = useCallback(() => {
    setHistory((h) => h.slice(0, -1));
    setActiveStep((s) => (s > 0 ? s - 1 : 0));
    setComplete(false);
    setError(null);
    setTyped('');
    setGaveUp(false);
  }, []);

  const handleBacktrackTo = useCallback((stepIndex: number) => {
    setHistory((h) => h.slice(0, stepIndex));
    setActiveStep(stepIndex);
    setComplete(false);
    setError(null);
    setTyped('');
    setGaveUp(false);
  }, []);

  const handleGiveUp = useCallback(() => {
    setGaveUp(true);
  }, []);

  const handleReset = useCallback(() => {
    localStorage.removeItem(GAME_KEY(currentDate));
    setHistory([]);
    setActiveStep(0);
    setComplete(false);
    setError(null);
    setTyped('');
    setGaveUp(false);
  }, [currentDate]);

  const loadDate = useCallback((date: string) => {
    setCurrentDate(date);
  }, []);

  return (
    <GameContext.Provider
      value={{
        puzzle,
        loading,
        history,
        activeStep,
        complete,
        isDeadEnd,
        error,
        typed,
        gaveUp,
        currentDate,
        todayDate,
        setTyped,
        handleSubmit,
        handleBacktrack,
        handleBacktrackTo,
        handleGiveUp,
        handleReset,
        loadDate,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within a GameProvider');
  return ctx;
}
