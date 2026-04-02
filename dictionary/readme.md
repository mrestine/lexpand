These are the different dictionaries used to generate puzzles.

`enable.txt`: The source of truth for all the words used in this game, also used in Words With Friends, sourced from https://www.wordgamedictionary.com/dictionary/

`enable3to8.txt`: enable.txt but pared down to all words of length 3-8, which is all this game cares about

`available8.txt`: All 8 letter words used as potential target words during generation

`nogood8.txt`: All 8 letter words that the generator has attempted to generate a puzzle from but cannot because no valid path exists from 3-8 letters
