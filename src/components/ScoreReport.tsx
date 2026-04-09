import { STEP_PROPS, type ScoreDistribution } from '../types';

export function ScoreReport({
  distribution,
  userScore,
}: {
  distribution: ScoreDistribution;
  userScore: number; // activeStep at time of completion/give-up
}) {
  const baseline = distribution.distribution[0] ?? 0;
  if (baseline === 0) {
    return null;
  }

  return (
    <div className='flex flex-col gap-1.5 w-60 mt-3'>
      {([1, 2, 3, 4, 5] as const).map((score) => {
        const count = distribution.distribution[score] ?? 0;
        const pct = Math.round((count / baseline) * 100);
        const isUser = score === userScore;
        const { theme } = STEP_PROPS[score];

        return (
          <div key={score} className='flex items-center gap-2'>
            <span
              className={`text-[12px] w-24 text-right shrink-0 text-stone-${isUser ? '900 font-semibold' : '600'}`}
            >
              {STEP_PROPS[score].scoreLabel}
            </span>
            <div className='flex-1 h-4 w-24 rounded-full overflow-hidden bg-black/10'>
              <div
                className='h-full rounded-full transition-all duration-700'
                style={{
                  width: `${pct}%`,
                  backgroundColor: theme.scoreColor,
                  opacity: isUser ? 1 : 0.5,
                }}
              />
            </div>
            <span
              className={`text-[12px] w-8 shrink-0 text-stone-${isUser ? '900 font-semibold' : '600'}`}
            >
              {pct}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
