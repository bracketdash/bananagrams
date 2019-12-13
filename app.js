// Bananagrams Solver
// ENTRY POINT: solve()

const _ = require('lodash');
const fs = require('fs');
const trie = getTrie();

// get words that can be added to the board with the given letters

function getMatchesLoop(words, strip, stripdex, dir) {
    let notDir = dir === 'row' ? 'col' : 'row';
    let stripStr = strip.join('');
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
        let columns = [];
        _.times(board[0].length, function() {
            columns.push([]);
        });
        let matches = [];
        makeWordsWith(letters).then(function(wordsWithLetters) {
            if (disallowedWords) {
                wordsWithLetters = _.difference(wordsWithLetters, disallowedWords);
            }
            _.forEach(board, function(boardRow, boardRowIndex) {
                matches = matches.concat(getMatchesLoop(wordsWithLetters, boardRow, boardRowIndex, 'row'));
                _.forEach(boardRow, function(boardCol, boardColIndex) {
                    columns[boardColIndex].push(boardCol);
                });
            });
            _.forEach(columns, function(boardColumn, boardColumnIndex) {
                matches = matches.concat(getMatchesLoop(wordsWithLetters, boardColumn, boardColumnIndex, 'col'));
                if (boardColumnIndex === columns.length - 1) {
                    resolve(matches);
                }
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

// get the full word list (not used but here for any future utility)

function getWordListLoop(trie, currentPrefix, words, resolve) {
    _.forEach(trie, function(nextLevel, newLetter) {
        if (newLetter === '_') {
            words.push(currentPrefix);
            if (currentPrefix === 'zzzs') {
                resolve(words);
            }
        } else {
            getWordListLoop(nextLevel, currentPrefix + newLetter, words, resolve);
        }
    });
}

function getWordList() {
    return new Promise(function(resolve) {
        let words = [];
        getWordListLoop(trie, '', words, resolve);
    });
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

// remove the last word added and try the next match from that set

function removeLastWordAndTryNextMatch(/* TODO */) {
    console.log('Removing the last word added to the board...');
    console.log('(UNDER CONSTRUCTION)');
    // TODO: Remove the last placed word from the board
    console.log('Trying the next match from that set...');
    console.log('(UNDER CONSTRUCTION: This is the end of the script for now.)');
    /*
    TODO:
    solveLoop(...) except..
        if there  are more words that we haven't tried
            place the next word in the set on the board
        if there are no more words left to try
            EXIT (NO SOLUTION)
    */
}

// generate a solution board given a set of letters
// optionally provide a set of disallowed words (e.g. your friends won't accept something the solver generates)

function solveLoop(board, incomingMatches, disallowedWords, letters, selectedMatchIndex) {
    let match = incomingMatches[selectedMatchIndex];
    if (!match) {
        console.log('NO SOLUTION YET! :(');
        printBoard(board, letters);
        return;
    }
    console.log('Placing "' + match.word + '"...');
    board = placeWord(board, match.word, match.row, match.col, match.dir);
    _.forEach(match.word, function(matchWordLetter) {
        letters = letters.replace(matchWordLetter, '');
    });
    printBoard(board, letters);
    /*
    TODO:
    check the board to make sure all words are valid
    (just in case placing this word created additional words)
    if the board is invalid, removeLastWordAndTryNextMatch(TODO)
    */
    if (letters.length) {
        getMatches(letters, disallowedWords, board).then(function(matches) {
            console.log(matches.length + ' matches found.');
            if (matches.length) {
                matches = _.reverse(_.sortBy(matches, (match) => match.word.length));
                solveLoop(board, matches, disallowedWords, letters, 0);
            } else {
                removeLastWordAndTryNextMatch(/* TODO */);
            }
        });
    } else {
        console.log('SOLUTION FOUND!');
    }
}

function solve(letters, disallowedWords) {
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
            }), disallowedWords, letters, 0);
        } else {
            console.log('NO SOLUTION! Not enough letters or too many disallowed words.');
        }
    });
}

solve('somemoreletterstoworkwith');
