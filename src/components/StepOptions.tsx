import { type ScoreTheme } from '../types';

export function StepOptions({
  options,
  chosenLetter,
  correctLetter,
  dimmed,
  accentClass,
  theme,
}: {
  options: string;
  chosenLetter?: string;
  correctLetter?: string; // set on give-up to reveal the right answer
  dimmed: boolean;
  accentClass: string;
  theme: ScoreTheme;
}) {
  const accentBg = accentClass.replace('text-', 'bg-').replace('-700', '-500');

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
