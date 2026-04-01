export interface Rung {
  options: [string, string, string];
  correctLetter: string;
  // deadEndDepth: how far that path would have gone (for post-solve annotation)
  deadEnds: Record<string, number>;
}

export interface Puzzle {
  startWord: string;
  targetWord: string;
  rungs: Rung[];
  // validWords: sorted letter key -> Set of valid words
  validWords: Record<string, string[]>;
}

// Hand-verified ATE → CANISTER puzzle
export const DAILY_PUZZLE: Puzzle = {
  startWord: 'ATE',
  targetWord: 'CANISTER',
  rungs: [
    {
      options: ['S', 'L', 'N'],
      correctLetter: 'S',
      deadEnds: { L: 5, N: 4 },
    },
    {
      options: ['R', 'C', 'P'],
      correctLetter: 'R',
      deadEnds: { C: 6, P: 6 },
    },
    {
      options: ['C', 'D', 'N'],
      correctLetter: 'C',
      deadEnds: { D: 7, N: 7 },
    },
    {
      options: ['I', 'O', 'L'],
      correctLetter: 'I',
      deadEnds: { O: 8, L: 8 },
    },
    {
      options: ['N', 'D', 'P'],
      correctLetter: 'N',
      deadEnds: { D: 8, P: 8 },
    },
  ],
  validWords: {
    // ATE + S = AEST
    AEST: ['EATS', 'ETAS', 'SATE', 'TEAS', 'ATES', 'SETA', 'EAST'],
    // ATE + L = AELT
    AELT: ['LATE', 'TALE', 'TEAL', 'LEAT', 'TELA', 'ALEW'],
    // ATE + N = AENT
    AENT: ['ANTE', 'ETNA', 'NEAT', 'NAET'],

    // EATS + R = AERST
    AERST: [
      'RATES',
      'STARE',
      'TEARS',
      'ASTER',
      'TARES',
      'RESAT',
      'ARETS',
      'TASER',
      'EARST',
    ],
    // EATS + C = ACEST
    ACEST: ['CASTE', 'TACES', 'CATES', 'SCEAT'],
    // EATS + P = AEPST
    AEPST: ['PASTE', 'TAPES', 'PATES', 'SEPTA', 'PEATS', 'TAPES'],

    // RATES + C = ACERST
    ACERST: [
      'CARETS',
      'REACTS',
      'TRACES',
      'CRATES',
      'CARTES',
      'CASTER',
      'RECAST',
    ],
    // RATES + D = ADERST
    ADERST: ['STARED', 'TRADES', 'TREADS', 'DATERS'],
    // RATES + N = AENRST
    AENRST: ['ANTRES', 'ASTERN', 'STERNA'],

    // CARETS + I = ACEIRST
    ACEIRST: ['RACIEST', 'STEARIC'],
    // CARETS + O = ACEORST
    ACEORST: ['COATERS', 'RECOATS'],
    // CARETS + L = ACELRST
    ACELRST: ['CLARETS', 'SCARLET'],

    // RACIEST + N = ACEINRST
    ACEINRST: ['CANISTER', 'CERATINS', 'SCANTIER', 'NACRITES', 'TACRINES'],
    // RACIEST + D = ACDEIRST (dead end — no valid 8-letter words)
    ACDEIRST: [],
    // RACIEST + P = ACEIPRST (dead end — no valid 8-letter words)
    ACEIPRST: [],
  },
};

/** Sort letters of a word to produce a canonical key */
export function letterKey(letters: string): string {
  return letters.toUpperCase().split('').sort().join('');
}

/** Given current letter set and typed word, infer which of the 3 option letters was used */
export function inferLetter(
  currentLetters: string,
  typedWord: string,
  options: [string, string, string],
): string | null {
  const typed = typedWord.toUpperCase();
  const current = currentLetters.toUpperCase();

  for (const opt of options) {
    const candidate = current + opt;
    if (letterKey(candidate) === letterKey(typed)) {
      return opt;
    }
  }
  return null;
}

/** Check if typed word is valid for the given letter set */
export function isValidWord(
  puzzle: Puzzle,
  letters: string,
  word: string,
): boolean {
  const key = letterKey(letters);
  const wordList = puzzle.validWords[key];
  if (!wordList) return false;
  return wordList.includes(word.toUpperCase());
}
