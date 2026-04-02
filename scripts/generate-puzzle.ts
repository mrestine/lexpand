/**
 * +------------------------+
 * |    PUZZLE GENERATOR    |
 * +------------------------+
 *
 * This script generates a puzzle json for a given date.
 * The json includes the target word, starting word, and all available steps.
 *
 * usage: npm run generate <yyyy-mm-dd>
 *
 * The script should be deterministic and always generate the same word for a given date.
 * If a puzzle already exists in puzzles/ for the given date, no puzzle is generated.
 */

import {
  readFileSync,
  writeFileSync,
  appendFileSync,
  existsSync,
  mkdirSync,
} from 'fs'; // writeFileSync used for puzzle output
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const ALPHA = 'abcdefghijklmnopqrstuvwxyz'.split('');
const DISTRACTOR_PROBS = [1.0, 0.75, 0.5, 0.25, 0.0];

// ── Types ──────────────────────────────────────────────────────────────────

interface ChainPath {
  keys: string[]; // [key3, key4, ..., key8] — sorted letter keys at each level
  letters: string[]; // [l1, l2, l3, l4, l5]   — letter added at each forward step
}

interface Step {
  options: string; // 3-char lowercase string e.g. "sln"
}

interface Puzzle {
  start: string;
  target: string[];
  steps: Step[];
  dictionary: Record<string, string[]>;
}

// returns the alphabetized letters of a word, good for anagrams
function letterKey(word: string): string {
  return word.split('').sort().join('');
}

// avoiding Math.random() so that a given date returns the same puzzle
// specifically, this is using xorshift32. no need for true randomness
function seededRng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return (): number => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 0x100000000;
  };
}

// generate a seed for the rng using today's date.
function dateSeed(date: string): number {
  return date
    .split('')
    .reduce((acc, c, i) => acc + c.charCodeAt(0) * (i + 1), 0);
}

// avoiding Array.shuffle() for use of Math.random()
// this Fisher-Yates shuffle will use the seededRng() a date-determined shuffle
function shuffled<T>(arr: T[], rng: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Starting with a target 8 letter word, this will step backwards to length 7, 6, ... 3
 * It will remove a letter from the target word, and test anagrams against the dictionary
 * If the word cannot be used (all removed letters have no valid anagrams), add to nogood8.txt
 * If the word can be used (there is a path), add to used8.txt
 * Either way, remove from available8.txt to avoid repeat words.
 *
 * @param targetWord an 8 letter target word to build a potential puzzle from
 * @param anagramIndex ?
 * @returns the list of correct letters to get from 3 to 8
 */
function findPaths(
  targetWord: string,
  anagramIndex: Map<string, string[]>,
): ChainPath[] {
  const results: ChainPath[] = [];
  const targetKey = letterKey(targetWord);
  const revKeys: string[] = [targetKey];
  const revLetters: string[] = [];

  function dfs(): void {
    const curr = revKeys[revKeys.length - 1];

    // end case, word length is 3
    if (curr.length === 3) {
      results.push({
        keys: revKeys.slice().reverse(),
        letters: revLetters.slice().reverse(),
      });
      return;
    }

    // pull a letter and test the unseen anagrams
    const seen = new Set<string>();
    for (let i = 0; i < curr.length; i++) {
      const letter = curr[i];
      const shorter = curr.slice(0, i) + curr.slice(i + 1);
      if (seen.has(shorter)) {
        continue;
      }
      seen.add(shorter);
      if (anagramIndex.has(shorter)) {
        revKeys.push(shorter);
        revLetters.push(letter);
        dfs();
        revKeys.pop();
        revLetters.pop();
      }
    }
  }

  dfs();
  return results;
}

/**
 * Chooses the distractor letter for the chosen path from 3-8
 * It will add a new letter to the given set, and check all anagrams to add to wordForming or not
 * Using the step probability (decreasing with progressing), it will choose a valid path if possible
 * It will not pick the same letter as the solution or repeat distractor letters.
 *
 * @param currentKey the current word to try
 * @param correctLetter the correct letter for the step
 * @param anagramIndex a mapping of available anagrams
 * @param stepIndex the step number
 * @param rng the seeded rng function to use
 * @returns
 */
function pickDistractors(
  currentKey: string,
  correctLetter: string,
  anagramIndex: Map<string, string[]>,
  stepIndex: number,
  rng: () => number,
): [string, string] {
  const prob = DISTRACTOR_PROBS[stepIndex];
  const wordForming: string[] = [];
  const nonWordForming: string[] = [];

  // test adding all unused letters to the current set, find all valid anagrams
  for (const l of ALPHA) {
    if (l === correctLetter) {
      continue;
    }
    if (anagramIndex.has(letterKey(currentKey + l))) {
      wordForming.push(l);
    } else {
      nonWordForming.push(l);
    }
  }

  // chooses a random distractor from either the wordForming pool or the nonWordForming pool
  const picks: string[] = [];
  for (let i = 0; i < 2; i++) {
    let pool: string[];
    if (rng() < prob && wordForming.length > 0) {
      pool = wordForming;
    } else if (nonWordForming.length > 0) {
      pool = nonWordForming;
    } else {
      pool = wordForming; // fallback if no non-word-forming letters remain
    }
    const letter = pool.splice(Math.floor(rng() * pool.length), 1)[0];
    picks.push(letter);
  }

  return [picks[0], picks[1]];
}

/**
 * MAIN takes a date as an arg to generate a puzzle for a given date.
 * It tries to be deterministic using seeded RNG to always generate the same puzzle for a date
 * @returns
 */
function main(): void {
  const dateArg = process.argv[2] ?? new Date().toISOString().slice(0, 10);
  const outDir = join(__dir, '../puzzles');
  const outPath = join(outDir, `${dateArg}.json`);

  // Don't generate a puzzle if one already exists
  if (existsSync(outPath)) {
    console.log(`Puzzle for ${dateArg} already exists — skipping.`);
    return;
  }
  mkdirSync(outDir, { recursive: true });

  // generate the seeded RNG function
  const rng = seededRng(dateSeed(dateArg));

  // read available8 - a dictionary of 8-letter, lowercase words
  const available8Path = join(__dir, '../dictionary/available8.txt');
  let available8 = readFileSync(available8Path, 'utf-8')
    .split('\n')
    .map((w) => w.trim())
    .filter(Boolean);

  // skip words with no valid paths - they'll never produce a puzzle
  const nogood8Path = join(__dir, '../dictionary/nogood8.txt');
  const nogoodWords = new Set(
    existsSync(nogood8Path)
      ? readFileSync(nogood8Path, 'utf-8')
          .split('\n')
          .map((w) => w.trim())
          .filter(Boolean)
      : [],
  );
  const candidates = shuffled(available8, rng).filter(
    (w) => !nogoodWords.has(w),
  );

  // purge available8 from memory
  available8 = [];

  // read entire enable3to8.txt and build the anagram map
  const anagramIndex = new Map<string, string[]>();
  for (const line of readFileSync(
    join(__dir, '../dictionary/enable3to8.txt'),
    'utf-8',
  ).split('\n')) {
    const word = line.trim();
    // skip if it's not a word (prob unnecessary)
    if (!word || !/^[a-z]+$/.test(word)) {
      continue;
    }

    // add the letters of the word (ATE -> AET) to the anagram map
    const key = letterKey(word);
    const abucket = anagramIndex.get(key);
    if (abucket) {
      abucket.push(word);
    } else {
      anagramIndex.set(key, [word]);
    }
  }

  let selectedPath: ChainPath | null = null;
  let selectedWord: string | null = null;

  for (const targetWord of candidates) {
    // DFS for a candidate target word
    const paths = findPaths(targetWord, anagramIndex);

    // if paths.length is 0, add the 8 letter word to nogood8.txt, try with a new word
    if (paths.length === 0) {
      appendFileSync(nogood8Path, targetWord + '\n');
      continue;
    }

    // if there are more than one available paths, choose one (RNG for now).
    // TODO: how to choose a path? word popularity would be good... maybe for now let me choose one?
    let pathChoice = Math.floor(rng() * paths.length);
    selectedPath = paths[pathChoice];
    selectedWord = targetWord;
    console.log(
      `${paths.length} paths available. choosing path ${pathChoice} with target "${selectedWord}"`,
    );
    break;
  }

  // The end of all possible puzzles. I wonder how long it will take to get here...
  if (!selectedPath || !selectedWord) {
    console.error('No suitable word found — all candidates exhausted.');
    process.exit(1);
  }

  const path = selectedPath;
  const steps: Step[] = [];

  // pick the distractors for each step and generate the step object
  for (let i = 0; i < path.letters.length; i++) {
    const correctLetter = path.letters[i];
    const currentKey = path.keys[i];
    const [d1, d2] = pickDistractors(
      currentKey,
      correctLetter,
      anagramIndex,
      i,
      rng,
    );
    const options = shuffled([correctLetter, d1, d2], rng).join('');
    steps.push({ options });
  }

  // recursively validate the puzzle by brute forcing all combinations
  // build the dictionary using only available characters
  const dictionary: Record<string, string[]> = {};
  function walk(stepIdx: number, pathSoFar: string, currentKey: string): void {
    for (const letter of steps[stepIdx].options.split('')) {
      const nextKey = letterKey(currentKey + letter);
      const p = pathSoFar + letter;
      dictionary[p] = anagramIndex.get(nextKey) ?? [];
      if (stepIdx < steps.length - 1 && dictionary[p].length > 0) {
        walk(stepIdx + 1, p, nextKey);
      }
    }
  }
  walk(0, '', path.keys[0]);

  // collect all valid 8-letter words reachable via any path (correct or distractor)
  const target = [
    ...new Set(
      Object.entries(dictionary)
        .filter(
          ([key, words]) => key.length === steps.length && words.length > 0,
        )
        .flatMap(([, words]) => words),
    ),
  ];

  // the full puzzle object. the start word is just the first of possible paths
  const puzzle: Puzzle = {
    start: (anagramIndex.get(path.keys[0]) ?? [selectedWord])[0],
    target,
    steps,
    dictionary,
  };

  writeFileSync(outPath, JSON.stringify(puzzle, null, 2));
  console.log(`Wrote ${outPath}`);
  console.log(`  ${puzzle.start} -> ${puzzle.target.join(', ')}`);
  console.log(`  Steps: ${puzzle.steps.map((s) => s.options).join('  ')}`);
}

main();
