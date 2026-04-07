import { useState } from 'react';
import {
  ARCHIVE_START,
  getLocalDateString,
  getProgressForDate,
  type PuzzleProgress,
} from '../types';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function toDateString(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function ProgressDot({ progress }: { progress: PuzzleProgress }) {
  if (progress === 'none') {
    return null;
  }
  const color =
    progress === 'complete'
      ? 'bg-green-500'
      : progress === 'started'
        ? 'bg-amber-400'
        : 'bg-stone-400';
  return <span className={`w-1.5 h-1.5 rounded-full ${color}`} />;
}

export function ArchiveModal({
  isOpen,
  onClose,
  currentDate,
  onSelectDate,
}: {
  isOpen: boolean;
  onClose: () => void;
  currentDate: string;
  onSelectDate: (date: string) => void;
}) {
  const today = getLocalDateString();
  const todayD = new Date(today + 'T00:00:00');

  const [display, setDisplay] = useState(() => {
    const d = new Date(currentDate + 'T00:00:00');
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  if (!isOpen) return null;

  const { year, month } = display;
  const archiveD = new Date(ARCHIVE_START + 'T00:00:00');

  const canGoPrev =
    year > archiveD.getFullYear() ||
    (year === archiveD.getFullYear() && month > archiveD.getMonth());
  const canGoNext =
    year < todayD.getFullYear() ||
    (year === todayD.getFullYear() && month < todayD.getMonth());

  const prevMonth = () =>
    setDisplay((d) =>
      d.month === 0
        ? { year: d.year - 1, month: 11 }
        : { year: d.year, month: d.month - 1 },
    );
  const nextMonth = () =>
    setDisplay((d) =>
      d.month === 11
        ? { year: d.year + 1, month: 0 }
        : { year: d.year, month: d.month + 1 },
    );

  // Build calendar cells
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      {/* Backdrop */}
      <div className='absolute inset-0 bg-black/40' onClick={onClose} />

      {/* Modal */}
      <div className='relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5'>
        {/* Header row */}
        <div className='flex items-center justify-between mb-4'>
          <button
            onClick={prevMonth}
            disabled={!canGoPrev}
            className='w-8 h-8 flex items-center justify-center rounded-full text-stone-500 hover:bg-stone-100 disabled:opacity-25 disabled:pointer-events-none transition-colors'
            aria-label='Previous month'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 20 20'
              fill='currentColor'
              className='w-4 h-4'
            >
              <path
                fillRule='evenodd'
                d='M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z'
                clipRule='evenodd'
              />
            </svg>
          </button>
          <span className='font-semibold text-stone-800 text-sm'>
            {MONTHS[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            disabled={!canGoNext}
            className='w-8 h-8 flex items-center justify-center rounded-full text-stone-500 hover:bg-stone-100 disabled:opacity-25 disabled:pointer-events-none transition-colors'
            aria-label='Next month'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 20 20'
              fill='currentColor'
              className='w-4 h-4'
            >
              <path
                fillRule='evenodd'
                d='M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z'
                clipRule='evenodd'
              />
            </svg>
          </button>
        </div>

        {/* Day-of-week headers */}
        <div className='grid grid-cols-7 mb-1'>
          {DAYS.map((d) => (
            <div
              key={d}
              className='text-center text-[11px] font-medium text-stone-400 py-1'
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className='grid grid-cols-7 gap-y-1'>
          {cells.map((day, i) => {
            if (!day) return <div key={i} />;
            const dateStr = toDateString(year, month, day);
            const isDisabled = dateStr < ARCHIVE_START || dateStr > today;
            const isSelected = dateStr === currentDate;
            const isToday = dateStr === today;
            const progress = isDisabled ? 'none' : getProgressForDate(dateStr);

            return (
              <button
                key={i}
                disabled={isDisabled}
                onClick={() => {
                  onSelectDate(dateStr);
                  onClose();
                }}
                className={[
                  'relative flex flex-col items-center justify-center h-10 rounded-xl text-sm font-medium transition-colors',
                  isDisabled
                    ? 'text-stone-200 pointer-events-none'
                    : isSelected
                      ? 'bg-stone-800 text-white'
                      : isToday
                        ? 'bg-stone-100 text-stone-800 hover:bg-stone-200'
                        : 'text-stone-700 hover:bg-stone-100',
                ].join(' ')}
              >
                <span>{day}</span>
                <ProgressDot progress={progress} />
              </button>
            );
          })}
        </div>

        {/* Today button */}
        <div className='mt-4 flex justify-center'>
          <button
            onClick={() => {
              onSelectDate(today);
              onClose();
            }}
            className='text-xs font-semibold uppercase tracking-widest text-stone-500 hover:text-stone-800 transition-colors'
          >
            Today
          </button>
        </div>
      </div>
    </div>
  );
}
