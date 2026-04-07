import { useRef, useEffect, useCallback, useState } from 'react';
import { useGame } from '../context/GameContext';
import { STEP_PROPS } from '../types';
import { LetterBox } from './LetterBox';
import { ActiveRow } from './ActiveRow';
import { Tile } from './Tile';
import { StepOptions } from './StepOptions';
import { Connector } from './Connector';
import { Tutorial } from './Tutorial';
import { Header } from './Header';
import { ArchiveModal } from './ArchiveModal';

export default function App() {
  const {
    puzzle,
    loading,
    history,
    activeStep,
    complete,
    typed,
    gaveUp,
    currentDate,
    todayDate,
    setTyped,
    handleSubmit,
    handleBacktrack,
    handleBacktrackTo,
    handleGiveUp,
    loadDate,
  } = useGame();

  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const [showArchive, setShowArchive] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const { scoreLabel, theme } = STEP_PROPS[history.length];
  const wordLength = (puzzle?.start.length ?? 0) + activeStep + 1;
  const isArchiveDate = currentDate !== todayDate;

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

  // Format date for display: "April 3, 2026"
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <>
        <Header
          onArchive={() => setShowArchive(true)}
          onTutorial={() => setShowTutorial(true)}
        />
        <div
          className={`min-h-screen pt-14 bg-gradient-to-br ${theme.background} flex items-center justify-center`}
        >
          <p
            className={`text-sm font-medium uppercase tracking-widest ${theme.subtitle}`}
          >
            Loading...
          </p>
        </div>
      </>
    );
  }

  if (!puzzle) {
    return (
      <>
        <Header
          onArchive={() => setShowArchive(true)}
          onTutorial={() => setShowTutorial(true)}
        />
        <div
          className={`min-h-screen pt-14 bg-gradient-to-br ${theme.background} flex items-center justify-center`}
        >
          <p className={`text-sm font-medium ${theme.error}`}>
            No puzzle found for today. Check back later.
          </p>
        </div>
      </>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${theme.background} flex flex-col items-center pt-14 pb-8 px-4 transition-colors duration-[2000ms]`}
      onClick={focusInput}
    >
      <Header
        onArchive={() => setShowArchive(true)}
        onTutorial={() => setShowTutorial(true)}
        archiveDate={isArchiveDate ? formatDate(currentDate) : undefined}
      />

      <Tutorial show={showTutorial} onClose={() => setShowTutorial(false)} />

      <ArchiveModal
        isOpen={showArchive}
        onClose={() => setShowArchive(false)}
        currentDate={currentDate}
        onSelectDate={loadDate}
      />

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

      {/* Header content */}
      <div className='flex flex-col items-center mt-6 mb-4'>
        <p
          className={`text-sm font-medium transition-colors duration-[2000ms] ${theme.description}`}
        >
          {scoreLabel}
        </p>
      </div>

      {/* Ladder */}
      <div
        data-tutorial='ladder'
        className='flex flex-col items-center w-full max-w-xs'
      >
        <div data-tutorial='start-word'>
          <Tile word={puzzle.start} status='start' />
        </div>
        <Connector theme={theme} />

        {puzzle.steps.map((step, stepIdx) => {
          const isSolved = stepIdx < history.length;
          const isActive = stepIdx === activeStep && !complete;
          const result = history[stepIdx];

          return (
            <div key={stepIdx} className='w-full flex flex-col items-center'>
              <div
                {...(stepIdx === 0 ? { 'data-tutorial': 'step-options' } : {})}
              >
                <StepOptions
                  options={step.options}
                  chosenLetter={result?.letter}
                  dimmed={!isSolved && !isActive && !gaveUp}
                  theme={theme}
                />
              </div>

              {isSolved ? (
                <Tile
                  word={result!.word}
                  status='solved'
                  accentClass={theme.accent}
                  onClick={() => handleBacktrackTo(stepIdx)}
                />
              ) : isActive ? (
                <ActiveRow onFocusRequest={focusInput} />
              ) : (
                <div className='flex gap-1'>
                  {Array.from({
                    length: puzzle.start.length + stepIdx + 1,
                  }).map((_, i) => (
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
        <div className='mt-6 flex gap-3'>
          {history.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleBacktrack();
              }}
              className={`px-5 py-2 font-bold rounded-full text-sm uppercase tracking-widest transition-all ${theme.playAgainBtn}`}
            >
              ← Backtrack
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleGiveUp();
            }}
            className={`px-5 py-2 font-bold rounded-full text-sm uppercase tracking-widest transition-all ${theme.playAgainBtn}`}
          >
            Give up
          </button>
        </div>
      )}

      {gaveUp && !complete && (
        <p className={`mt-6 text-sm font-medium ${theme.completionBody}`}>
          Better luck tomorrow!
        </p>
      )}

      {/* Completion */}
      {complete && (
        <div className='mt-8 flex flex-col items-center gap-3'>
          <p
            className={`font-bold text-xl uppercase tracking-widest ${theme.completionWord}`}
          >
            {history[history.length - 1]?.word}
          </p>
          <p className={`text-sm font-medium ${theme.completionBody}`}>
            {isArchiveDate
              ? 'Nice work on this one!'
              : 'Come back tomorrow for a new puzzle!'}
          </p>
        </div>
      )}
    </div>
  );
}
