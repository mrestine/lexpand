import { useRef, useEffect, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { STEP_PROPS } from '../types';
import { LetterBox } from './LetterBox';
import { ActiveRow } from './ActiveRow';
import { Tile } from './Tile';
import { StepOptions } from './StepOptions';
import { Connector } from './Connector';

export default function App() {
  const {
    puzzle,
    loading,
    history,
    activeStep,
    complete,
    error,
    typed,
    gaveUp,
    setTyped,
    handleSubmit,
    handleBacktrack,
    handleBacktrackTo,
    handleGiveUp,
    handleReset,
  } = useGame();

  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const { scoreLabel, theme } = STEP_PROPS[history.length];
  const wordLength = (puzzle?.start.length ?? 0) + activeStep + 1;

  useEffect(() => {
    if (!complete) hiddenInputRef.current?.focus();
  }, [activeStep, complete]);

  const focusInput = useCallback(() => {
    hiddenInputRef.current?.focus();
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
      setTyped(raw.slice(0, wordLength));
    },
    [wordLength, setTyped],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') handleSubmit(typed);
    },
    [typed, handleSubmit],
  );

  if (loading) {
    return (
      <div
        className={`min-h-screen bg-gradient-to-br ${theme.background} flex items-center justify-center`}
      >
        <p className={`text-sm font-medium uppercase tracking-widest ${theme.subtitle}`}>
          Loading…
        </p>
      </div>
    );
  }

  if (!puzzle) {
    return (
      <div
        className={`min-h-screen bg-gradient-to-br ${theme.background} flex items-center justify-center`}
      >
        <p className={`text-sm font-medium ${theme.error}`}>
          No puzzle found for today. Check back later.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${theme.background} flex flex-col items-center py-8 px-4 transition-all duration-[2000ms]`}
      onClick={focusInput}
    >
      {/* Hidden input */}
      <input
        ref={hiddenInputRef}
        value={typed}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className='fixed bottom-0 left-0 w-px h-px opacity-0 pointer-events-none'
        inputMode='text'
        enterKeyHint='go'
        autoCapitalize='characters'
        autoComplete='off'
        autoCorrect='off'
        spellCheck={false}
        aria-label='Type your word'
        tabIndex={0}
        disabled={complete}
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
      <p
        className={`text-sm font-medium mb-4 transition-colors duration-[2000ms] ${theme.description}`}
      >
        {scoreLabel}
      </p>

      {/* Ladder */}
      <div className='flex flex-col items-center w-full max-w-xs'>
        <Tile word={puzzle.start} status='start' />
        <Connector theme={theme} />

        {puzzle.steps.map((step, stepIdx) => {
          const isSolved = stepIdx < history.length;
          const isActive = stepIdx === activeStep && !complete;
          const result = history[stepIdx];

          return (
            <div key={stepIdx} className='w-full flex flex-col items-center'>
              <StepOptions
                options={step.options}
                chosenLetter={result?.letter}
                dimmed={!isSolved && !isActive && !gaveUp}
                accentClass={theme.accent}
                theme={theme}
              />

              {isSolved ? (
                <Tile
                  word={result!.word}
                  status='solved'
                  accentClass={theme.accent}
                  onClick={() => handleBacktrackTo(stepIdx)}
                />
              ) : isActive ? (
                <ActiveRow
                  wordLength={wordLength}
                  typed={typed}
                  error={error}
                  theme={theme}
                  onFocusRequest={focusInput}
                />
              ) : (
                <div className='flex gap-1'>
                  {Array.from({ length: puzzle.start.length + stepIdx + 1 }).map((_, i) => (
                    <LetterBox
                      key={i}
                      letter=''
                      status='pending'
                      pendingStyle={theme.pendingBox}
                    />
                  ))}
                </div>
              )}

              {stepIdx < puzzle.steps.length - 1 && <Connector theme={theme} />}
            </div>
          );
        })}
      </div>

      {/* Controls */}
      {!complete && !gaveUp && (
        <div className='mt-6 flex gap-6'>
          {history.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleBacktrack();
              }}
              className={`text-xs font-medium uppercase tracking-widest transition-colors ${theme.backtrackkBtn}`}
            >
              ← Backtrack
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleGiveUp();
            }}
            className={`text-xs font-medium uppercase tracking-widest transition-colors ${theme.backtrackkBtn}`}
          >
            Give up
          </button>
        </div>
      )}

      {gaveUp && !complete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleReset();
          }}
          className={`mt-6 px-6 py-2 font-bold rounded-full text-sm uppercase tracking-widest transition-all ${theme.playAgainBtn}`}
        >
          Try again
        </button>
      )}

      {/* Completion */}
      {complete && (
        <div className='mt-8 flex flex-col items-center gap-3'>
          <p className={`font-bold text-xl uppercase tracking-widest ${theme.completionWord}`}>
            {history[history.length - 1]?.word}
          </p>
          <p className={`text-sm font-medium ${theme.completionBody}`}>
            Come back tomorrow for a new puzzle!
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleReset();
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
