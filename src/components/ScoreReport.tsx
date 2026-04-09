import { useGame } from '../context/GameContext';
import { STEP_PROPS } from '../types';

export function ScoreReport({
  userScore,
}: {
  userScore: number; // activeStep at time of completion/give-up
}) {
  const { scoreDistribution, scoresLoading } = useGame();
  const baseline = scoreDistribution?.distribution[0] ?? 0;
  if (scoresLoading) {
    return (
      <div className='flex gap-1.5 mt-4'>
        {[0, 150, 300].map((delay) => (
          <div
            key={delay}
            className='w-2 h-2 rounded-full bg-black/20 animate-bounce'
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    );
  }
  if (!scoreDistribution || baseline === 0) {
    return (
      <div className='mt-3 text-sm text-stone-500'>No scores available.</div>
    );
  }

  return (
    <div className='flex flex-col gap-1.5 w-60 mt-3'>
      {([1, 2, 3, 4, 5] as const).map((score) => {
        const count = scoreDistribution.distribution[score] ?? 0;
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
