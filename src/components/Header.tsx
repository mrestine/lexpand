export function Header({
  onArchive,
  onTutorial,
  archiveDate,
}: {
  onArchive: () => void;
  onTutorial: () => void;
  archiveDate?: string;
}) {
  return (
    <header className='fixed top-0 inset-x-0 z-30 h-14 bg-white border-b border-stone-100 flex items-center px-4'>
      <span className='flex-1 text-xl font-black uppercase tracking-[0.2em] text-stone-800'>
        Lexpand
      </span>
      {archiveDate && (
        <span className='absolute left-1/2 -translate-x-1/2 text-xs font-semibold text-stone-500 tracking-wide'>
          {archiveDate}
        </span>
      )}
      <div className='flex items-center gap-1'>
        <button
          onClick={onTutorial}
          className='w-9 h-9 flex items-center justify-center rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors'
          aria-label='How to play'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 20 20'
            fill='currentColor'
            className='w-5 h-5'
          >
            <path
              fillRule='evenodd'
              d='M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0ZM8.94 6.94a.75.75 0 1 1-1.061-1.061 3 3 0 1 1 2.871 5.026v.345a.75.75 0 0 1-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 1 0 8.94 6.94ZM10 15a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z'
              clipRule='evenodd'
            />
          </svg>
        </button>
        <button
          onClick={onArchive}
          className='w-9 h-9 flex items-center justify-center rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors'
          aria-label='Archive'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 20 20'
            fill='currentColor'
            className='w-5 h-5'
          >
            <path
              fillRule='evenodd'
              d='M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z'
              clipRule='evenodd'
            />
          </svg>
        </button>
      </div>
    </header>
  );
}
