import { type ScoreTheme } from '../types';

export function Connector({ theme }: { theme: ScoreTheme }) {
  return <div className={`w-px h-4 mx-auto ${theme.connector}`} />;
}
