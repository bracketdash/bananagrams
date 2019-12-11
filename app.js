const _ = require('lodash');

const combinator = require('./combinator.js');
const dict = require('./dict.js');
const matcher = require('./matcher.js');
const placer = require('./placer.js');

function getDecoratedMatches(matches, ) {
    // TODO
}

function solve(letters, disallowedWords) {
    const trie = dict.getTrie();
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
            // PLACEMENT:
            board = placer.placeWord([[]], words[0], 0, 0, 'right');
            if (letters.length - words[0].length > 0) {

                let columns = [];
                _.times(board[0].length, function() {
                    columns.push([]);
                });

                let lettersLeft = letters;
                _.forEach(words[0], function(selectedWordLetter) {
                    lettersLeft = lettersLeft.replace(selectedWordLetter, '');
                });

                let getMatches = new Promise(function(resolve) {
                    let matches = [];
                    combinator.makeWordsWith(trie, lettersLeft).then(function(wordsWithLettersLeft) {
                        if (disallowedWords) {
                            wordsWithLettersLeft = _.difference(wordsWithLettersLeft, disallowedWords);
                        }
                        _.forEach(board, function(boardRow, boardRowIndex) {
                            matches = matches.concat(
                                getDecoratedMatches(
                                    matcher.findMatchingWords(
                                        wordsWithLettersLeft,
                                        matcher.getPattern(boardRow)
                                    ),
                                    boardRow,
                                    boardRowIndex
                                )
                            );
                            _.forEach(boardRow, function(boardCol, boardColIndex) {
                                columns[boardColIndex].push(boardCol);
                            });
                        });
                        _.forEach(columns, function(boardColumn, boardColumnIndex) {
                            matches = matches.concat(
                                getDecoratedMatches(
                                    matcher.findMatchingWords(
                                        wordsWithLettersLeft,
                                        matcher.getPattern(boardRow)
                                    ),
                                    boardColumn,
                                    boardColumnIndex
                                )
                            );
                            if (boardColumnIndex === columns.length - 1) {
                                resolve(matches);
                            }
                        });
                    });
                });
                getMatches.then(function(matches) {
                    // TODO: getDecoratedMatches()
                    // TODO: matcher.getPattern()
                    console.log(matches);

                    /*
                    if there are matches
                        GOTO PLACEMENT AND CONTINUE
                    if there are no matches
                        remove the last placed word from the board
                        GOTO PLACEMENT
                            if there  are more words that we haven't tried
                                place the next word in the set on the board
                                CONTINUE FROM NEXT LINE
                            if there are no more words left to try
                                EXIT (NO SOLUTION)
                    */

                });

                // print board for testing
                _.forEach(board, function(boardRow) {
                    console.log(boardRow.join(' '));
                });
            } else {
                console.log('SOLUTION FOUND');
                _.forEach(board, function(boardRow) {
                    console.log(boardRow.join(' '));
                });
            }
        } else {
            console.log('NO SOLUTION');
        }
    });
}

solve('letters', ['letters']);