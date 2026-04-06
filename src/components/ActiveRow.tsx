import { useGame } from '../context/GameContext';
import { STEP_PROPS, type BoxStatus } from '../types';
import { LetterBox } from './LetterBox';

export function ActiveRow({ onFocusRequest }: { onFocusRequest: () => void }) {
  const { puzzle, activeStep, history, typed, error } = useGame();
  const theme = STEP_PROPS[history.length].theme;
  const wordLength = (puzzle?.start.length ?? 0) + activeStep + 1;

  return (
    <div className='flex flex-col items-center gap-1.5'>
      <div className='flex gap-1 cursor-text' onClick={onFocusRequest}>
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
        <p className={`text-[11px] h-4 ${theme.hint}`}>
          type your word · enter to submit
        </p>
      )}
    </div>
  );
}
