import { BoxStatus } from '../types';

export function LetterBox({
  letter,
  status,
  // optional override for pending/target (theme-aware)
  pendingStyle,
  targetStyle,
}: {
  letter: string;
  status: BoxStatus;
  pendingStyle?: string;
  targetStyle?: string;
}) {
  const base =
    'w-9 h-9 flex items-center justify-center rounded font-bold text-sm uppercase tracking-wide transition-all duration-300 select-none';

  const staticStyles: Partial<Record<BoxStatus, string>> = {
    start: 'bg-stone-200 text-stone-700 shadow-md',
    solved: 'bg-white/80 border-2 border-current text-current shadow-sm',
    typing: 'bg-white border-2 border-current text-current shadow-md',
    cursor:
      'bg-white/90 border-2 border-current shadow-md ring-2 ring-current/40 animate-pulse',
    empty: 'bg-white/30 border-2 border-current/25',
  };

  const resolvedStyle =
    status === 'pending'
      ? (pendingStyle ?? 'bg-black/[0.06] border border-black/10')
      : status === 'target'
        ? (targetStyle ?? 'bg-black/[0.04] border border-black/[0.07]')
        : (staticStyles[status] ?? '');

  return (
    <div className={`${base} ${resolvedStyle}`}>
      {status === 'cursor' || status === 'empty'
        ? ''
        : status === 'pending' || status === 'target'
          ? ''
          : letter}
    </div>
  );
}
