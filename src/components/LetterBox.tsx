import { BoxStatus, TRANSITION_CLASS } from '../types';

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
  // Only theme-stable tiles need the slow transition (theme color shifts between rows)
  const isStaticTile =
    status === 'start' || status === 'solved' || status === 'pending';
  const base = `w-9 h-9 flex items-center justify-center rounded font-bold text-sm uppercase tracking-wide select-none${isStaticTile ? ` transition-colors ${TRANSITION_CLASS}` : ''}`;

  const staticStyles: Partial<Record<BoxStatus, string>> = {
    start: 'bg-stone-200 text-stone-700 shadow-md',
    solved: 'bg-white/80 border-2 border-current text-current shadow-sm',
    typing: 'bg-white/80 border-2 border-current text-current shadow-md',
    cursor: 'bg-white/80 border-2 border-current ring-2 ring-current/40',
    empty: 'bg-white/80 border-2 border-current text-current shadow-md',
  };

  const resolvedStyle =
    status === 'pending'
      ? (pendingStyle ?? 'bg-black/[0.06] border border-black/10')
      : status === 'target'
        ? (targetStyle ?? 'bg-black/[0.04] border border-black/[0.07]')
        : (staticStyles[status] ?? '');

  return (
    <div className={`${base} ${resolvedStyle}`}>
      {status === 'cursor' ? (
        <span className='cursor-blink text-current font-light'>|</span>
      ) : status === 'empty' || status === 'pending' || status === 'target' ? (
        ''
      ) : (
        letter
      )}
    </div>
  );
}
