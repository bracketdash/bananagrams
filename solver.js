// Bananagrams Solver
// ENTRY POINT: solve(...)

const _ = require('lodash');
const fs = require('fs');
const trie = getTrie();

// check if the board contains only valid words

function getBoardValidity(board, disallowedWords) {
    return new Promise(function(resolve) {
        crawlBoard(board, function(boardRow) {
            let words = _.split(_.trim(boardRow.join('')), /\s+/);
            _.forEach(words, function(word) {
                if (word.length > 1 && (!_.has(trie, (word + '_').split('')) || _.indexOf(disallowedWords, word) > -1)) {
                    resolve(false);
                }
            });
        }, function(boardColumn, boardColumnIndex) {
            let words = _.split(_.trim(boardColumn.join('')), /\s+/);
            _.forEach(words, function(word) {
                if (word.length > 1 && (!_.has(trie, (word + '_').split('')) || _.indexOf(disallowedWords, word) > -1)) {
                    resolve(false);
                }
            });
        }, function() {
            resolve(true);
        });
    });
}

// run functions on each row and column

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
        if (boardColumnIndex === columns.length - 1) {
            doneCallback();
        }
    });
}

// get words that can be added to the board with the given letters

function getMatchesLoop(words, strip, stripdex, dir) {
    let notDir = dir === 'row' ? 'col' : 'row';
    let stripStr = strip.join('');
    if (!_.trim(stripStr)) {
        return [];
    }
    let pattern = new RegExp(_.trim(stripStr).replace(/\s/g, '.'));
    let stripMatches = [];
    _.forEach(words, function(word) {
        if (pattern.test(word)) {
            let stripMatch = {word, dir};
            stripMatch[dir] = stripdex;
            stripMatch[notDir] = stripStr.search(/[a-z]/) - word.search(pattern);
            stripMatches.push(stripMatch);
        }
    });
    return stripMatches;
}

function getMatches(letters, disallowedWords, board) {
    return new Promise(function(resolve) {
        makeWordsWith(letters).then(function(wordsWithLetters) {
            let matches = [];
            if (disallowedWords) {
                wordsWithLetters = _.difference(wordsWithLetters, disallowedWords);
            }
            crawlBoard(board, function(boardRow, boardRowIndex) {
                matches = matches.concat(getMatchesLoop(wordsWithLetters, boardRow, boardRowIndex, 'row'));
            }, function(boardColumn, boardColumnIndex) {
                matches = matches.concat(getMatchesLoop(wordsWithLetters, boardColumn, boardColumnIndex, 'col'));
            }, function() {
                console.log('matches.length inside getMatches: ' + matches.length);
                resolve(matches);
            });
        });
    });
}

// load and build our word prefix tree

function getTrie() {
    let trie = fs.readFileSync('./trie.txt', 'utf8');
    trie = trie.replace(/([a-z])/g,"\"$1\":{");
    trie = trie.replace(/([0-9])/g, function(num) {
        let brackets = '';
        _.times(parseInt(num), function() {
            brackets += '}';
        });
        return '"_":1' + brackets + ',';
    });
    trie = trie.replace(/([A-Z])/g, function(num) {
        num = num.charCodeAt() - 55;
        let brackets = '';
        _.times(num, function() {
            brackets += '}';
        });
        return '"_":1' + brackets + ',';
    });
    trie = JSON.parse('{' + trie + '"_":1}}}}}}}}');
    return trie;
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

function placeWord(board, word, row, col, dir) {
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
    console.log(' ');
    console.log(' ' + _.repeat('_', board[0].length*2) + '_');
    _.forEach(board, function(boardRow) {
        console.log('| ' + boardRow.join(' ') + ' |');
    });
    console.log(' ' + _.repeat('-', board[0].length*2) + '-');
    console.log('Tiles left: ' + (letters.length ? letters : '(none)'));
    console.log(' ');
}

// generate a solution board given a set of letters
// optionally provide a set of disallowed words (e.g. your friends won't accept something the solver generates)

function solveLoop(board, incomingMatches, disallowedWords, letters, selectedMatchIndex, solveResolve) {
    let match = incomingMatches[selectedMatchIndex];
    if (!match) {
        console.log('NO SOLUTION YET! :(');
        printBoard(board, letters);
        solveResolve({
            solved: false,
            board: board,
            letters: letters
        });
        return;
    }
    console.log('Placing "' + match.word + '"...');
    let newBoard = placeWord(board, match.word, match.row, match.col, match.dir);
    // TODO: this is causing some sort of infinite loop...
    // TODO: Looks like this is still letting everything through...
    // TODO: skipping for now - just means some of the final solutions won't be valid until we fix this
    /*
    getBoardValidity(newBoard, disallowedWords).then(function(valid) {
        if (!valid) {
            console.log('Couldn\'t place word. Trying next one...');
            solveLoop(board, incomingMatches, disallowedWords, letters, (selectedMatchIndex + 1), solveResolve);
        }
    });
    */
    _.forEach(match.word, function(matchWordLetter) {
        letters = letters.replace(matchWordLetter, '');
    });
    printBoard(newBoard, letters);
    if (letters.length) {
        getMatches(letters, disallowedWords, newBoard).then(function(matches) {
            console.log(matches.length + ' matches found.');
            if (matches.length) {
                matches = _.reverse(_.sortBy(matches, (match) => match.word.length));
                solveLoop(newBoard, matches, disallowedWords, letters, 0, solveResolve);
            } else {
                console.log('Removing last word added and trying next word...');
                solveLoop(board, incomingMatches, disallowedWords, (letters + match.word), (selectedMatchIndex + 1), solveResolve);
            }
        });
    } else {
        console.log('SOLUTION FOUND!');
        solveResolve({
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
                solveLoop([[]], _.map(words, function(word) {
                    return {
                        word: word,
                        dir: 'row',
                        row: 0,
                        col: 0
                    };
                }), disallowedWords, letters, 0, solveResolve);
            } else {
                console.log('NO SOLUTION! Not enough letters or too many disallowed words.');
                solveResolve({
                    solved: false,
                    board: [],
                    letters: letters
                });
            }
        });
    });
}

module.exports = {solve};
