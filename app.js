const _ = require('lodash');

const combinator = require('./combinator.js');
const dict = require('./dict.js');
const matcher = require('./matcher.js');
const placer = require('./placer.js');

function printBoard(board) {
    _.forEach(board, function(boardRow) {
        console.log(boardRow.join(' '));
    });
}

function placeAndContinue(board, incomingMatches, disallowedWords, trie, letters, selectedMatchIndex) {
    let match = incomingMatches[selectedMatchIndex];
    if (!match) {
        console.log('NO SOLUTION! Tiles left: ' + letters.join(' '));
        printBoard(board);
        return;
    }
    console.log('Placing:');
    console.log(match);
    board = placer.placeWord(board, match.word, match.row, match.col, match.dir);
    _.forEach(match.word, function(matchWordLetter) {
        letters = letters.replace(matchWordLetter, '');
    });
    printBoard(board);
    console.log('Tiles left: ' + letters);
    if (letters.length) {
        console.log('Getting matches...');
        const getMatchesStartTime = new Date().getTime();
        matcher.getMatches(trie, letters, disallowedWords, board).then(function(matches) {
            console.log(matches.length + ' matches found in ' + (new Date().getTime() - getMatchesStartTime) + 'ms');
            if (matches.length) {
                matches = _.reverse(_.sortBy(matches, (match) => match.length));
                console.log('Looping back...');
                setTimeout(function() {
                    placeAndContinue(board, matches, disallowedWords, trie, letters, 0);
                });
            } else {
                /*
                TODO:
                remove the last placed word from the board
                GOTO PLACEMENT
                    if there  are more words that we haven't tried
                        place the next word in the set on the board
                        CONTINUE FROM NEXT LINE
                    if there are no more words left to try
                        EXIT (NO SOLUTION)
                */
            }
        });
    } else {
        console.log('SOLUTION FOUND!');
        printBoard(board);
    }
}

function solve(letters, disallowedWords) {
    console.log('Decompressing dictionary...');
    const trieStartTime = new Date().getTime();
    const trie = dict.getTrie();
    letters = letters.toLowerCase();
    disallowedWords = _.map(disallowedWords, (disallowedWord) => disallowedWord.toLowerCase());
    setTimeout(function() {
        console.log('Dictionary decompressed in ' + (new Date().getTime() - trieStartTime) + 'ms');
        combinator.makeWordsWith(trie, letters).then(function(words) {
            if (disallowedWords) {
                words = _.difference(words, disallowedWords);
            }
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
                console.log(words.length + ' initial word combos generated...');
                placeAndContinue([[]], _.map(words, function(word) {
                    return {
                        word: word,
                        dir: 'row',
                        row: 0,
                        col: 0
                    };
                }), disallowedWords, trie, letters, 0);
            } else {
                console.log('NO SOLUTION! Not enough letters or too many disallowed words.');
            }
        });
    });
}

solve('someletterstoworkwith');
