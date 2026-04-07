import { type ScoreTheme, TRANSITION_CLASS } from '../types';

export function StepOptions({
  options,
  chosenLetter,
  correctLetter,
  dimmed,
  theme,
}: {
  options: string;
  chosenLetter?: string;
  correctLetter?: string; // set on give-up to reveal the right answer
  dimmed: boolean;
  theme: ScoreTheme;
}) {
  return (
    <div className='flex justify-center gap-6 my-1'>
      {options.split('').map((opt) => {
        const highlight = opt === chosenLetter || opt === correctLetter;

        return (
          <span
            key={opt}
            className={[
              `w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold uppercase transition-all ${TRANSITION_CLASS}`,
              dimmed
                ? theme.optionDimmed
                : highlight
                  ? 'bg-white/60 text-stone-700 shadow-sm'
                  : theme.optionActive,
            ].join(' ')}
          >
            {opt}
          </span>
        );
      })}
    </div>
  );
}
