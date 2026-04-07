import { useEffect, useState } from 'react';

const STORAGE_KEY = 'lexpand_tutorial_seen';
const PADDING = 10;

interface TutorialStep {
  target: string;
  content: string;
}

const steps: TutorialStep[] = [
  {
    target: 'start-word',
    content: 'The game starts with a 3 letter word.',
  },
  {
    target: 'step-options',
    content:
      'Choose one of the 3 letters to add to the mix, and rearrange them to make a 4 letter word.',
  },
  {
    target: 'ladder',
    content:
      'Continue building words along the path all the way up to 8 letters.',
  },
  {
    target: 'ladder',
    content:
      'There might be multiple possible paths to different 8 letter words, but some paths may lead to dead ends!',
  },
];

export function Tutorial({
  show,
  onClose,
}: {
  show?: boolean;
  onClose?: () => void;
}) {
  const [step, setStep] = useState(() =>
    show || !localStorage.getItem(STORAGE_KEY) ? 0 : -1,
  );
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (show) {
      setStep(0);
      setRect(null);
    }
  }, [show]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, 'true');
  }, []);

  useEffect(() => {
    if (step < 0 || step >= steps.length) return;
    const el = document.querySelector(
      `[data-tutorial="${steps[step].target}"]`,
    );
    if (el) setRect(el.getBoundingClientRect());
  }, [step]);

  if (step < 0 || step >= steps.length || !rect) return null;

  const top = rect.top - PADDING;
  const left = rect.left - PADDING;
  const width = rect.width + PADDING * 2;
  const height = rect.height + PADDING * 2;
  const isLast = step === steps.length - 1;

  return (
    <div className='fixed inset-0 z-40 pointer-events-none [clip-path:inset(0)]'>
      {/* Spotlight — box-shadow acts as overlay, rounded-xl clips it to rounded corners */}
      <div
        className='absolute rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] pointer-events-none'
        style={{ top, left, width, height }}
      />

      {/* Tooltip card */}
      <div
        className='absolute pointer-events-auto bg-white rounded-xl p-4 shadow-xl w-64'
        style={{ top: top + height + 12, left }}
      >
        <p className='text-sm text-stone-700 leading-snug'>
          {steps[step].content}
        </p>

        {/* Step dots */}
        <div className='flex justify-center gap-2 mt-3 mb-4'>
          {steps.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                i === step ? 'bg-stone-700' : 'bg-stone-300'
              }`}
            />
          ))}
        </div>

        <div className='flex items-center justify-between'>
          <button
            onClick={() => {
              setStep(-1);
              onClose?.();
            }}
            className='text-xs text-stone-400 hover:text-stone-600 transition-colors'
          >
            Skip
          </button>
          <button
            onClick={() => {
              const next = step + 1;
              setStep(next);
              if (next >= steps.length) onClose?.();
            }}
            className='text-sm font-semibold text-stone-700 hover:text-stone-900 transition-colors'
          >
            {isLast ? 'Done' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}
