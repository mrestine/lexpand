import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type {
  PuzzleData,
  StepResult,
  SavedGameState,
  ScoreDistribution,
} from '../types';
import { getLocalDateString } from '../types';

const GAME_KEY = (date: string) => `lexpand_game_${date}`;
const CLIENT_ID_KEY = 'lexpand_client_id';

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

function getOrCreateClientId(): string {
  const stored = localStorage.getItem(CLIENT_ID_KEY);
  if (stored) return stored;
  const id = crypto.randomUUID();
  localStorage.setItem(CLIENT_ID_KEY, id);
  return id;
}

function letterKey(s: string) {
  return s.toLowerCase().split('').sort().join('');
}

async function fetchPuzzle(date: string): Promise<PuzzleData> {
  const res = await fetch(`/puzzles/${date}.json`);
  if (!res.ok) throw new Error(`No puzzle found for ${date}`);
  return res.json() as Promise<PuzzleData>;
}

function submitScore(
  clientId: string,
  date: string,
  score: number,
  token?: string,
) {
  // Fire-and-forget — non-blocking
  fetch('/api/score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientId,
      date,
      score,
      ...(token ? { token } : {}),
    }),
  }).catch(() => {
    // Silently ignore — scoring is best-effort
  });
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
  scoreDistribution: ScoreDistribution | null;
  handleTyped: (v: string) => void;
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
  const [clientId] = useState(getOrCreateClientId);

  const [puzzle, setPuzzle] = useState<PuzzleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<StepResult[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typed, setTyped] = useState('');
  const [gaveUp, setGaveUp] = useState(false);
  const [highestScoreSent, setHighestScoreSent] = useState(-1);
  const [scoreDistribution, setScoreDistribution] =
    useState<ScoreDistribution | null>(null);

  // Load puzzle and restore saved state whenever currentDate changes
  useEffect(() => {
    setLoading(true);
    setPuzzle(null);
    setError(null);
    setTyped('');
    setScoreDistribution(null);

    const saved = loadGame(currentDate);
    setHistory(saved?.history ?? []);
    setActiveStep(saved?.activeStep ?? 0);
    setComplete(saved?.complete ?? false);
    setGaveUp(saved?.gaveUp ?? false);
    setHighestScoreSent(saved?.highestScoreSent ?? -1);

    fetchPuzzle(currentDate)
      .then(setPuzzle)
      .catch((err) => console.error('Failed to load puzzle:', err))
      .finally(() => setLoading(false));
  }, [currentDate]);

  // Persist game state whenever it changes (only after puzzle is loaded)
  useEffect(() => {
    if (!puzzle) return;
    saveGame(currentDate, {
      history,
      activeStep,
      complete,
      gaveUp,
      highestScoreSent,
    });
  }, [puzzle, currentDate, history, activeStep, complete, gaveUp]);

  // Fetch score distribution when the game ends
  useEffect(() => {
    if (!complete && !gaveUp) return;
    const delay = setTimeout(() => {
      fetch(`/api/scores?date=${currentDate}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data) setScoreDistribution(data as ScoreDistribution);
        })
        .catch(() => {});
    }, 800); // brief delay to let final score submission commit
    return () => clearTimeout(delay);
  }, [complete, gaveUp, currentDate]);

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
      if (!input || !puzzle) {
        return;
      }
      const word = input.trim().toUpperCase();
      const step = puzzle.steps[activeStep];
      if (!step) {
        return;
      }

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
      const newScore = activeStep + 1;

      // Report a new high score if applicable
      if (newScore > highestScoreSent) {
        const token = puzzle.scoreTokens?.[activeStep];
        if (token) {
          submitScore(clientId, currentDate, newScore, token);
        }
      }
      setHighestScoreSent(newScore);

      setHistory((h) => [...h, result]);
      setActiveStep((s) => s + 1);
      setComplete(isComplete);
      setError(null);
      setTyped('');
    },
    [
      activeStep,
      clientId,
      currentDate,
      currentLetters,
      highestScoreSent,
      history,
      puzzle,
    ],
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

  const handleTyped = useCallback((v: string) => {
    if (v.length === 1 && highestScoreSent < 0) {
      submitScore(clientId, currentDate, 0);
      setHighestScoreSent(0);
    }
    setTyped(v);
  }, [clientId, currentDate, highestScoreSent]);

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
    setHighestScoreSent(-1);
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
        scoreDistribution,
        handleTyped,
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
