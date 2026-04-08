import { useGame } from '../context/GameContext';
import { STEP_PROPS, TRANSITION_DURATION_MS, TRANSITION_CLASS } from '../types';

const TOTAL = STEP_PROPS.length; // 6
const INACTIVE_COLOR = '#d6d3d1'; // stone-300

export function ScoreDisplay() {
  const { activeStep } = useGame();
  const score = activeStep; // 0–5
  const { scoreLabel, theme } = STEP_PROPS[score];
  const activeColor = theme.scoreColor;

  return (
    <div className='flex flex-col items-center gap-2'>
      {/* Number line */}
      <div className='relative w-36 h-3'>
        {/* Inactive background track */}
        <div
          className='absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 rounded-full'
          style={{ backgroundColor: INACTIVE_COLOR }}
        />

        {/* Active progress track */}
        <div
          className='absolute left-0 top-1/2 -translate-y-1/2 h-1 rounded-full'
          style={{
            width: score === 0 ? '0%' : `${(score / (TOTAL - 1)) * 100}%`,
            backgroundColor: activeColor,
            transition: `width ${TRANSITION_DURATION_MS}ms linear, background-color ${TRANSITION_DURATION_MS}ms linear`,
          }}
        />

        {/* Dots */}
        {STEP_PROPS.map((_, i) => (
          <div
            key={i}
            className='absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 w-3 h-3 rounded-full'
            style={{
              left: `${(i / (TOTAL - 1)) * 100}%`,
              backgroundColor: i <= score ? activeColor : INACTIVE_COLOR,
              transition: `background-color ${TRANSITION_DURATION_MS}ms linear`,
            }}
          />
        ))}
      </div>

      {/* Label */}
      <p
        className={`text-m font-medium uppercase tracking-widest transition-colors ${TRANSITION_CLASS} ${theme.subtitle}`}
      >
        {scoreLabel}
      </p>
    </div>
  );
}
