import { useGame } from '../context/GameContext';
import { STEP_PROPS, type BoxStatus } from '../types';
import { LetterBox } from './LetterBox';

export function ActiveRow({ onFocusRequest }: { onFocusRequest: () => void }) {
  const { puzzle, activeStep, history, typed, error, isDeadEnd } = useGame();
  const theme = STEP_PROPS[history.length].theme;
  const wordLength = (puzzle?.start.length ?? 0) + activeStep + 1;

  return (
    <div className='flex flex-col items-center gap-1.5'>
      <div className='flex gap-1 cursor-text' onClick={onFocusRequest}>
        {Array.from({ length: wordLength }).map((_, i) => {
          const ch = typed[i] ?? '';
          let status: BoxStatus;
          if (i < typed.length) {
            status = 'typing';
          } else if (i === typed.length) {
            status = 'cursor';
          } else {
            status = 'empty';
          }
          return <LetterBox key={i} letter={ch} status={status} />;
        })}
      </div>
      {isDeadEnd ? (
        <p className={`text-[11px] font-medium text-center ${theme.error}`}>
          Uh oh, dead end! None of these letters will make a valid word from
          here.
        </p>
      ) : error ? (
        <p className={`text-[11px] font-medium text-center h-4 ${theme.error}`}>
          {error}
        </p>
      ) : activeStep === 0 ? (
        <p className={`text-[11px] text-center h-4 ${theme.hint}`}>
          type your word. enter to submit
        </p>
      ) : null}
    </div>
  );
}
