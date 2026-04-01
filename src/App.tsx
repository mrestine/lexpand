import { useState, useRef, useEffect, useCallback } from 'react';
import { DAILY_PUZZLE } from './puzzle';
import {
  initialState,
  submitWord,
  backtrack,
  backtrackTo,
  scoreLabel,
  scoreDescription,
  SCORE_BACKGROUNDS,
  SCORE_ACCENT,
  SCORE_THEME,
  type GameState,
  type ScoreTheme,
} from './gameState';

// ─── Letter box ───────────────────────────────────────────────────────────────

type BoxStatus =
  | 'start'    // dark tile — the starting word
  | 'solved'   // completed rung word
  | 'typing'   // filled letter in the active input row
  | 'cursor'   // next-to-type position in the active row
  | 'empty'    // unfilled position in the active row (after cursor)
  | 'pending'  // future rung placeholder
  | 'target';  // target word placeholder

function LetterBox({
  letter,
  status,
  // optional override for pending/target (theme-aware)
  pendingStyle,
  targetStyle,
}: {
  letter: string;
  status: BoxStatus;
  pendingStyle?: string;
  targetStyle?: string;
}) {
  const base =
    'w-9 h-9 flex items-center justify-center rounded font-bold text-sm uppercase tracking-wide transition-all duration-300 select-none';

  const staticStyles: Partial<Record<BoxStatus, string>> = {
    start:  'bg-stone-800 text-white shadow-md',
    solved: 'bg-white/80 border-2 border-current text-current shadow-sm',
    typing: 'bg-white border-2 border-current text-current shadow-md',
    cursor: 'bg-white/90 border-2 border-current shadow-md ring-2 ring-current/40 animate-pulse',
    empty:  'bg-white/30 border-2 border-current/25',
  };

  const resolvedStyle =
    status === 'pending'
      ? (pendingStyle ?? 'bg-black/[0.06] border border-black/10')
      : status === 'target'
        ? (targetStyle ?? 'bg-black/[0.04] border border-black/[0.07]')
        : (staticStyles[status] ?? '');

  return (
    <div className={`${base} ${resolvedStyle}`}>
      {status === 'cursor' || status === 'empty'
        ? ''
        : status === 'pending' || status === 'target'
          ? '·'
          : letter}
    </div>
  );
}

// ─── Tile (fixed word — start or solved) ─────────────────────────────────────

function Tile({
  word,
  status,
  accentClass,
  onClick,
}: {
  word: string;
  status: 'start' | 'solved';
  accentClass?: string;
  onClick?: () => void;
}) {
  return (
    // accentClass drives border-current / text-current on child LetterBoxes
    <div
      className={`flex gap-1 justify-center items-center ${accentClass ?? ''} ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
      onClick={onClick}
    >
      {word
        .toUpperCase()
        .split('')
        .map((ch, i) => (
          <LetterBox key={i} letter={ch} status={status} />
        ))}
    </div>
  );
}

// ─── Active input row ─────────────────────────────────────────────────────────

function ActiveRow({
  wordLength,
  typed,
  error,
  theme,
  onFocusRequest,
}: {
  wordLength: number;
  typed: string;
  error: string | null;
  theme: ScoreTheme;
  onFocusRequest: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex gap-1 cursor-text" onClick={onFocusRequest}>
        {Array.from({ length: wordLength }).map((_, i) => {
          const ch = typed[i] ?? '';
          let status: BoxStatus;
          if (i < typed.length) status = 'typing';
          else if (i === typed.length) status = 'cursor';
          else status = 'empty';
          return <LetterBox key={i} letter={ch} status={status} />;
        })}
      </div>
      {error ? (
        <p className={`text-[11px] font-medium h-4 ${theme.error}`}>{error}</p>
      ) : (
        <p className={`text-[11px] h-4 ${theme.hint}`}>type your word · enter to submit</p>
      )}
    </div>
  );
}

// ─── Rung options row ─────────────────────────────────────────────────────────

function RungOptions({
  options,
  chosenLetter,
  correctLetter,
  dimmed,
  accentClass,
  theme,
}: {
  options: [string, string, string];
  chosenLetter?: string;
  correctLetter?: string;  // set on give-up to reveal the right answer
  dimmed: boolean;
  accentClass: string;
  theme: ScoreTheme;
}) {
  const accentBg = accentClass.replace('text-', 'bg-').replace('-700', '-500');

  return (
    <div className="flex justify-center gap-6 my-1">
      {options.map((opt) => {
        const highlight = opt === chosenLetter || opt === correctLetter;

        return (
          <span
            key={opt}
            className={[
              'w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold uppercase transition-all duration-300',
              dimmed
                ? theme.optionDimmed
                : highlight
                  ? `${accentBg} text-white`
                  : 'bg-white/60 text-stone-700 shadow-sm',
            ].join(' ')}
          >
            {opt}
          </span>
        );
      })}
    </div>
  );
}

// ─── Connector ────────────────────────────────────────────────────────────────

function Connector({ theme }: { theme: ScoreTheme }) {
  return <div className={`w-px h-4 mx-auto ${theme.connector}`} />;
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [state, setState] = useState<GameState>(initialState);
  const [typed, setTyped] = useState('');
  const [gaveUp, setGaveUp] = useState(false);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const puzzle = DAILY_PUZZLE;
  const depth = state.history.length;
  const label = scoreLabel(depth);
  const description = scoreDescription(depth);
  const bgGradient = SCORE_BACKGROUNDS[label];
  const accentClass = SCORE_ACCENT[label];
  const theme = SCORE_THEME[label];

  const wordLength = puzzle.startWord.length + state.activeRung + 1;

  useEffect(() => {
    if (!state.complete) hiddenInputRef.current?.focus();
  }, [state.activeRung, state.complete]);

  const focusInput = useCallback(() => {
    hiddenInputRef.current?.focus();
  }, []);

  const handleSubmit = useCallback((word: string) => {
    if (!word) return;
    setTyped('');
    setState((s) => submitWord(s, word));
  }, []);

  const handleBacktrack = useCallback(() => {
    setTyped('');
    setGaveUp(false);
    setState((s) => backtrack(s));
  }, []);

  const handleBacktrackTo = useCallback((rungIndex: number) => {
    setTyped('');
    setGaveUp(false);
    setState((s) => backtrackTo(s, rungIndex));
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
      setTyped(raw.slice(0, wordLength));
    },
    [wordLength],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') handleSubmit(typed);
    },
    [typed, handleSubmit],
  );

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${bgGradient} flex flex-col items-center py-8 px-4 transition-all duration-[2000ms]`}
      onClick={focusInput}
    >
      {/* Hidden input */}
      <input
        ref={hiddenInputRef}
        value={typed}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className="fixed bottom-0 left-0 w-px h-px opacity-0 pointer-events-none"
        inputMode="text"
        enterKeyHint="go"
        autoCapitalize="characters"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        aria-label="Type your word"
        tabIndex={0}
        disabled={state.complete}
      />

      {/* Header */}
      <h1
        className={`text-4xl font-black uppercase tracking-[0.2em] mb-1 transition-colors duration-[2000ms] ${theme.title}`}
      >
        Lexpand
      </h1>
      <p
        className={`text-xs font-medium uppercase tracking-widest mb-2 transition-colors duration-[2000ms] ${theme.subtitle}`}
      >
        Grow the word · Find the path
      </p>

      <p className={`text-sm font-medium mb-4 transition-colors duration-[2000ms] ${theme.description}`}>
        {description}
      </p>

      {/* Ladder */}
      <div className="flex flex-col items-center w-full max-w-xs">
        <Tile word={puzzle.startWord} status="start" />
        <Connector theme={theme} />

        {puzzle.rungs.map((rung, rungIdx) => {
          const isSolved = rungIdx < state.history.length;
          const isActive = rungIdx === state.activeRung && !state.complete;
          const result = state.history[rungIdx];
          const chosenLetter = result?.letter;

          return (
            <div key={rungIdx} className="w-full flex flex-col items-center">
              <RungOptions
                options={rung.options}
                chosenLetter={chosenLetter}
                correctLetter={gaveUp ? rung.correctLetter : undefined}
                dimmed={!isSolved && !isActive && !gaveUp}
                accentClass={accentClass}
                theme={theme}
              />

              {isSolved ? (
                <Tile
                  word={result!.word}
                  status="solved"
                  accentClass={accentClass}
                  onClick={() => handleBacktrackTo(rungIdx)}
                />
              ) : isActive ? (
                <ActiveRow
                  wordLength={wordLength}
                  typed={typed}
                  error={state.error}
                  theme={theme}
                  onFocusRequest={focusInput}
                />
              ) : (
                <div className="flex gap-1">
                  {Array.from({
                    length: puzzle.startWord.length + rungIdx + 1,
                  }).map((_, i) => (
                    <LetterBox
                      key={i}
                      letter=""
                      status="pending"
                      pendingStyle={theme.pendingBox}
                    />
                  ))}
                </div>
              )}

              {rungIdx < puzzle.rungs.length - 1 && <Connector theme={theme} />}
            </div>
          );
        })}
      </div>

      {/* Controls */}
      {!state.complete && !gaveUp && (
        <div className="mt-6 flex gap-6">
          {state.history.length > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); handleBacktrack(); }}
              className={`text-xs font-medium uppercase tracking-widest transition-colors ${theme.backtrackkBtn}`}
            >
              ← Backtrack
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); setGaveUp(true); }}
            className={`text-xs font-medium uppercase tracking-widest transition-colors ${theme.backtrackkBtn}`}
          >
            Give up
          </button>
        </div>
      )}

      {gaveUp && !state.complete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setTyped('');
            setGaveUp(false);
            setState(initialState());
          }}
          className={`mt-6 px-6 py-2 font-bold rounded-full text-sm uppercase tracking-widest transition-all ${theme.playAgainBtn}`}
        >
          Try again
        </button>
      )}

      {/* Completion */}
      {state.complete && (
        <div className="mt-8 flex flex-col items-center gap-3">
          <p className={`font-bold text-xl uppercase tracking-widest ${theme.completionWord}`}>
            {puzzle.targetWord}
          </p>
          <p className={`text-sm font-medium ${theme.completionBody}`}>
            Come back tomorrow for a new puzzle!
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setTyped('');
              setGaveUp(false);
              setState(initialState());
            }}
            className={`mt-2 px-6 py-2 font-bold rounded-full text-sm uppercase tracking-widest transition-all ${theme.playAgainBtn}`}
          >
            Play again
          </button>
        </div>
      )}
    </div>
  );
}
