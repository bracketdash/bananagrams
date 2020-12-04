/*

- redesign ui to make status messages prominent until a solution is found

---
// wordList.js

import compressedWordList from "./compressedWordList";
import createWordList from "./createWordList";
const wordList = createWordList(compressedWordList); // => WordList
wordList.getPossibleWordsFromTray("trayletters"); // => Set(word indexes)
wordList.narrowWordsByBoard(Set(word indexes), boardState); // => Set(word indexes)
wordList.getWordsFromIndexes(Set(word indexes)); // => Set(words)
// other wordList.methods()
console.log(wordList); =>
    WordList({
        words: Map([ [1 => "word" ], .. ])
        trays: Map([ [
            (alphabetized tray letters) =>
                Set(indexes that reference words that can be made with the tray letters)
        ], .. ])
        letters: Map([ [
            `${position of letter in word}:${letter}` =>
                Set(indexes that reference words with the provided letter at the given position)
        ], .. ])
    });

---
// boardState.js

import createBoardState from "./createBoardState";
const boardState = createBoardState(); // => BoardState
boardState.tryAddWord({ row, col, dir, word });
// other boardState.methods()
console.log(boardState); =>
    BoardState({
        rows: Map([ [ 1 => Set([`${position of tile in row}:${letter}`, .. ]) ], .. ])
        cols: Map([ [ 1 => Set([`${position of tile in col}:${letter}`, .. ]) ], .. ])
    })

---
// solver.js

import { createSolver } from "./createSolver";
const solver = createSolver(); // => Solver
solver.getValidNextStates(stateKey); // => Map([ [ stateKey => { tray, boardState } ], .. ])
solver.solve("trayletters", wordBlacklist);
// other solver.methods()
console.log(solver); =>
    Solver({
        stateKey: `${index of first word on the board in list of possible words}:${next word}:..`
        states: Map([ [ stateKey => { tray, boardState } ], .. ])
    })

*/
