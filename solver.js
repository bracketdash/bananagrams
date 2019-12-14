// Bananagrams Solver
// ENTRY POINT: solve(...)

const _ = require('lodash');
const fs = require('fs');
const trie = getTrie();

// check if the board contains only valid words

function isBoardValid(board, disallowedWords) {
    let valid = true;
    crawlBoard(board, function(boardRow) {
        let words = _.split(_.trim(boardRow.join('')), /\s+/);
        _.forEach(words, function(word) {
            if (word.length > 1 && (!_.has(trie, (word + '_').split('')) || _.indexOf(disallowedWords, word) > -1)) {
                valid = false;
            }
        });
    }, function(boardColumn, boardColumnIndex) {
        let words = _.split(_.trim(boardColumn.join('')), /\s+/);
        _.forEach(words, function(word) {
            if (word.length > 1 && (!_.has(trie, (word + '_').split('')) || _.indexOf(disallowedWords, word) > -1)) {
                valid = false;
            }
        });
    });
    return valid;
}

// run functions on each row and column, and when done crawling

function crawlBoard(board, rowCallback, colCallback, doneCallback) {
    let columns = [];
    _.times(board[0].length, function() {
        columns.push([]);
    });
    _.forEach(board, function(boardRow, boardRowIndex) {
        rowCallback(boardRow, boardRowIndex);
        _.forEach(boardRow, function(boardCol, boardColIndex) {
            columns[boardColIndex].push(boardCol);
        });
    });
    _.forEach(columns, function(boardColumn, boardColumnIndex) {
        colCallback(boardColumn, boardColumnIndex);
        if (doneCallback && boardColumnIndex === columns.length - 1) {
            doneCallback();
        }
    });
}

// get words that can be added to the board with the given letters

function getMatchesLoop(strip, stripdex, dir, letters, disallowedWords) {
    return new Promise(function(resolve) {
        let notDir = dir === 'row' ? 'col' : 'row';
        let stripStr = strip.join('');
        let stripStrTrimmed = _.trim(stripStr);
        if (!stripStrTrimmed) {
            return [];
        }
        let pattern = new RegExp(stripStrTrimmed.replace(/\s/g, '.'));
        // TODO: BUG - this pattern ignore words that might only attach to one of the edge tiles in the strip
        let stripMatches = [];
        _.forEach(stripStrTrimmed.split(''), function(tileOnBoard, tileIndex) {
            if (tileOnBoard !== ' ') {
                makeWordsWith(letters + tileOnBoard).then(function(wordsWithLetters) {
                    let words = wordsWithLetters;
                    if (disallowedWords) {
                        words = _.difference(words, disallowedWords);
                    }
                    _.forEach(words, function(word) {
                        if (pattern.test(word)) {
                            let stripMatch = {word, dir};
                            stripMatch[dir] = stripdex;
                            stripMatch[notDir] = stripStr.search(/[a-z]/) - word.search(pattern);
                            stripMatches.push(stripMatch);
                        }
                    });
                    if (tileIndex === stripStrTrimmed.length - 1) {
                        resolve(stripMatches);
                    }
                });
            }
        });
    });
}

function getMatches(letters, disallowedWords, board) {
    return new Promise(function(resolve) {
        let matches = [];
        crawlBoard(board, function(boardRow, boardRowIndex) {
            getMatchesLoop(boardRow, boardRowIndex, 'row', letters, disallowedWords).then(function(loopResults) {
                let rowMatches = _.filter(loopResults, function(match) {
                    if (isMatchValid(match, board)) {
                        return true;
                    }
                    return false;
                });
                if (rowMatches.length) {
                    matches = matches.concat(rowMatches);
                }
            });
        }, function(boardColumn, boardColumnIndex) {
            getMatchesLoop(boardColumn, boardColumnIndex, 'col', letters, disallowedWords).then(function(loopResults) {
                let columnMatches = _.filter(loopResults, function(match) {
                    if (isMatchValid(match, board)) {
                        return true;
                    }
                    return false;
                });
                if (columnMatches.length) {
                    matches = matches.concat(columnMatches);
                }
                if (boardColumnIndex === board[0].length-1) {
                    resolve(matches);                    
                }
            });
        });
    });
}

// load and build the word prefix tree

function getTrie() {
    let trie = fs.readFileSync('./trie.txt', 'utf8');
    trie = trie.replace(/([a-z])/g, "\"$1\":{");
    trie = trie.replace(/([0-9]+)/g, function(num) {
        let brackets = '';
        _.times(parseInt(num), function() {
            brackets += '}';
        });
        return brackets;
    });
    trie = trie.replace(/_/g, '"_":1');
    trie = JSON.parse('{' + trie);
    return trie;
}

// make sure a match does not overwrite letters on the board

function isMatchValid(match, board) {
    let index;
    let strip;
    if (match.dir === 'row') {
        index = match.row;
        strip = _.clone(board[index]);
    } else {
        index = match.col;
        strip = [];
        _.forEach(board, function(row) {
            strip.push(row[index]);
        });
    }
    let ogStrip = _.clone(strip);
    Array.prototype.splice.apply(strip, [0, (index + match.word.length)].concat(match.word.split('')));
    if (index < 0) {
        strip = strip.slice(-index);
    }
    let valid = true;
    _.forEach(ogStrip, function(square, stripdex) {
        if (square != ' ' && square != strip[stripdex + index]) {
            valid = false;
        }
    });
    return valid;
}

// gets words that can be made with the given letters

function makeWordsWithLoop(trie, letters, prefix, words, resolve) {
    let newPrefix = '';
    let lastLeaf = true;
    _.forEach(_.uniq(letters), function(letter) {
        if (!!trie[letter]) {
            if (lastLeaf) {
                lastLeaf = false;
            }
            newPrefix = prefix + letter;
            if (trie[letter]['_']) {
                words.push(newPrefix);
            }
            makeWordsWithLoop(trie[letter], _.replace(letters, letter, ''), newPrefix, words, resolve);
        }
    });
    if (lastLeaf) {
        resolve(words);
    }
}

function makeWordsWith(letters) {
    return new Promise(function(resolve) {
        makeWordsWithLoop(trie, letters, '', [], resolve);
    });
}

// place a word on the board

function placeWord(oldBoard, match) {
    let board = _.cloneDeep(oldBoard);
    let word = match.word;
    let row = match.row;
    let col = match.col;
    let dir = match.dir;
    let wordLen = {row:0,col:0};
    wordLen[dir] = word.length;
    if (row < 0 || row + wordLen.col > board.length) {
        let newRow = _.map(Array(board[0].length), () => ' ');
        if (row < 0) {
            _.times(-row, () => board.unshift(_.clone(newRow)));
            row = 0;
        }
        if (row + wordLen.col > board.length) {
            _.times(row + wordLen.col - board.length, () => board.push(_.clone(newRow)));
        }
    }
    if (col < 0 || col + wordLen.row > board[0].length) {
        if (col < 0) {
            board = _.map(board, (boardRow) => _.map(Array(-col), () => ' ').concat(boardRow));
            col = 0;
        }
        if (col + wordLen.row > board[0].length) {
            board = _.map(board, (boardRow) => boardRow.concat(_.map(Array(col + wordLen.row - board[0].length), () => ' ')));
        }
    }
    board[row][col] = word[0];
    _.forEach(word.substring(1), function(letter) {
        if (dir === 'col') {
            row += 1;
        } else {
            col += 1;
        }
        board[row][col] = letter;
    });
    return board;
}

// print the board in the console

function printBoard(board, letters) {
    _.forEach(board, function(boardRow) {
        console.log(boardRow.join(' '));
    });
    console.log(letters.length ? letters.split('').join(' ') : ' ');
    console.log(' ');
}

// generate a solution board given a set of letters
// optionally provide a set of disallowed words (e.g. your friends won't accept something the solver generates)

function solveLoop(solveState) {
    let currentState = solveState.history[solveState.historyIndex];
    let currentMatch = currentState.matches[currentState.matchIndex];
    if (!currentMatch) {
        console.log('Ran out of matches to try, backing up a placement...');
        if (solveState.historyIndex > 0) {
            printBoard(
                currentState.board, currentState.letters,
                solveState.history[solveState.historyIndex-1].board,
                solveState.history[solveState.historyIndex-1].letters
            );
            solveState.history[solveState.historyIndex-1].matchIndex += 1;
            solveLoop({
                disallowedWords: solveState.disallowedWords,
                history: solveState.history.slice(0,-1),
                historyIndex: solveState.historyIndex - 1,
                solveResolve: solveState.solveResolve
            });
        } else {
            console.log('Can\'t back up (no previous state). No solution.');
            solveState.solveResolve({
                solved: false,
                board: currentState.board,
                letters: currentState.letters
            });
        }
        return;
    }
    console.log('Placing "' + currentMatch.word + '"...');
    let newBoard = placeWord(currentState.board, currentMatch);
    if (!isBoardValid(newBoard, solveState.disallowedWords)) {
        console.log('Could not place word. Trying next one...');
        currentState.matchIndex = currentState.matchIndex + 1;
        solveLoop({
            disallowedWords: solveState.disallowedWords,
            history: solveState.history,
            historyIndex: solveState.historyIndex,
            solveResolve: solveState.solveResolve
        });
        return;
    }
    let newLetters = currentState.letters;
    _.forEach(currentMatch.word, function(matchWordLetter) {
        newLetters = newLetters.replace(matchWordLetter, '');
    });
    printBoard(currentState.board, currentState.letters, newBoard, newLetters);
    if (newLetters.length) {
        getMatches(newLetters, solveState.disallowedWords, newBoard).then(function(matches) {
            console.log(matches.length + ' matches found.');
            if (matches.length) {
                matches = _.reverse(_.sortBy(matches, (match) => match.word.length));
                solveState.history.push({
                    board: newBoard,
                    letters: newLetters,
                    matches: matches,
                    matchIndex: 0
                });
                solveLoop({
                    disallowedWords: solveState.disallowedWords,
                    history: solveState.history,
                    historyIndex: solveState.historyIndex + 1,
                    solveResolve: solveState.solveResolve
                });
            } else {
                console.log('Removing last word added and trying next word...');
                printBoard(newBoard, newLetters, currentState.board, currentState.letters);
                currentState.matchIndex = currentState.matchIndex + 1;
                solveLoop({
                    disallowedWords: solveState.disallowedWords,
                    history: solveState.history,
                    historyIndex: solveState.historyIndex,
                    solveResolve: solveState.solveResolve
                });
            }
        });
    } else {
        console.log('SOLUTION FOUND!');
        solveState.solveResolve({
            solved: true,
            board: newBoard
        });
    }
}

function solve(letters, disallowedWords) {
    return new Promise(function(solveResolve) {
        letters = letters.toLowerCase();
        disallowedWords = _.map(disallowedWords, (disallowedWord) => disallowedWord.toLowerCase());
        makeWordsWith(letters).then(function(words) {
            if (disallowedWords) {
                words = _.difference(words, disallowedWords);
            }
            console.log(words.length + ' initial words generated.');
            if (words.length) {
                words = words.sort(function(a, b) {
                    if (a.length > b.length) {
                        return -1;
                    } else if (a.length < b.length) {
                        return 1;
                    } else {
                        return 0;
                    }
                });
                let matches = _.map(words, function(word) {
                    return {
                        word: word,
                        dir: 'row',
                        row: 0,
                        col: 0
                    };
                });
                solveLoop({
                    disallowedWords,
                    history: [{
                        board: [[]],
                        letters,
                        matches,
                        matchIndex: 0
                    }],
                    historyIndex: 0,
                    solveResolve
                });
            } else {
                console.log('NO SOLUTION! Not enough letters or too many disallowed words.');
                solveResolve({
                    solved: false,
                    board: [[]],
                    letters: letters
                });
            }
        });
    });
}

if (module) {
    module.exports = {solve};
} else if (window) {
    window.solver = {solve: solve};
    // TODO: this won't work until we handle getting the compressed trie differently
}
