import { LetterBox } from './LetterBox';

/**
 * tiles that represent a fixed tile, for start or solved row
 * @param param0
 * @returns
 */
export function Tile({
  word,
  status,
  accentClass,
  onClick,
}: {
  word: string;
  status: 'start' | 'solved';
  accentClass?: string;
  onClick?: () => void;
}) {
  return (
    // accentClass drives border-current / text-current on child LetterBoxes
    <div
      className={`flex gap-1 justify-center items-center ${accentClass ?? ''} ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
      onClick={onClick}
    >
      {word
        .toUpperCase()
        .split('')
        .map((ch, i) => (
          <LetterBox key={i} letter={ch} status={status} />
        ))}
    </div>
  );
}
