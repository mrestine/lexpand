import { useRef, useEffect, useCallback, useState } from 'react';
import { useGame } from '../context/GameContext';
import { STEP_PROPS, TRANSITION_CLASS } from '../types';
import { LetterBox } from './LetterBox';
import { ActiveRow } from './ActiveRow';
import { Tile } from './Tile';
import { StepOptions } from './StepOptions';
import { Connector } from './Connector';
import { Tutorial } from './Tutorial';
import { Header } from './Header';
import { ScoreDisplay } from './ScoreDisplay';
import { ScoreReport } from './ScoreReport';
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
    handleTyped,
    handleSubmit,
    handleBacktrack,
    handleBacktrackTo,
    handleGiveUp,
    loadDate,
  } = useGame();

  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const [showArchive, setShowArchive] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const { theme } = STEP_PROPS[activeStep];
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
      handleTyped(raw.slice(0, wordLength));
    },
    [wordLength, handleTyped],
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
          archiveDate={isArchiveDate ? formatDate(currentDate) : undefined}
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
          archiveDate={isArchiveDate ? formatDate(currentDate) : undefined}
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
      className={`min-h-screen bg-gradient-to-br ${theme.background} flex flex-col items-center pt-14 pb-8 px-4 transition-colors ${TRANSITION_CLASS}`}
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

      {/* Score */}
      <div className='mt-6 mb-4'>
        <ScoreDisplay />
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
          const isSolved = stepIdx < activeStep;
          const isActive = stepIdx === activeStep && !complete && !gaveUp;
          const result = history[stepIdx];

          return (
            <div key={stepIdx} className='relative w-full flex flex-col items-center'>
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
                <>
                  <input
                    ref={hiddenInputRef}
                    value={typed}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    className='absolute top-1/2 left-0 w-px h-px opacity-0 pointer-events-none caret-transparent'
                    inputMode='text'
                    enterKeyHint='go'
                    autoCapitalize='characters'
                    autoComplete='off'
                    autoCorrect='off'
                    spellCheck={false}
                    aria-label='Type your word'
                    tabIndex={0}
                  />
                  <ActiveRow onFocusRequest={focusInput} />
                </>
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
          {activeStep > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleBacktrack();
              }}
              className={`px-5 py-2 font-bold rounded-full text-sm uppercase tracking-widest transition-all ${theme.actionBtn}`}
            >
              ← Backtrack
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleGiveUp();
            }}
            className={`px-5 py-2 font-bold rounded-full text-sm uppercase tracking-widest transition-all ${theme.actionBtn}`}
          >
            Give up
          </button>
        </div>
      )}

      {/* Completion */}
      {gaveUp || complete ? (
        <div className='mt-8 flex flex-col items-center gap-3'>
          <p className={`text-m font-medium ${theme.subtitle}`}>
            {complete ? (
              isArchiveDate ? (
                'Nice work on this one!'
              ) : (
                'Come back tomorrow for a new puzzle!'
              )
            ) : (
              <>
                <div className='text-center max-w-xs mb-2'>
                  Possible solution{puzzle.target.length > 1 ? 's' : ''}:{' '}
                  {puzzle.target.map((t) => t.toUpperCase()).join(', ')}
                </div>
                <div className='text-center'>Better luck tomorrow!</div>
              </>
            )}
          </p>
          <ScoreReport userScore={activeStep} />
        </div>
      ) : null}
    </div>
  );
}
