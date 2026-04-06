import { type ScoreTheme } from '../types';

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
  const accentBg = theme.accent.replace('text-', 'bg-');

  return (
    <div className='flex justify-center gap-6 my-1'>
      {options.split('').map((opt) => {
        const highlight = opt === chosenLetter || opt === correctLetter;

        return (
          <span
            key={opt}
            className={[
              'w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold uppercase transition-all duration-300',
              dimmed
                ? theme.optionDimmed
                : highlight
                  ? `${accentBg} text-stone-500`
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
