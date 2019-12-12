const _ = require('lodash');

const combinator = require('./combinator.js');
const dict = require('./dict.js');
const matcher = require('./matcher.js');
const placer = require('./placer.js');

function placeAndContinue(board, words, disallowedWords, trie, letters, selectedWordIndex) {
    let selectedWord = words[selectedWordIndex];
    board = placer.placeWord(board, selectedWord, 0, 0, 'row');
    if (letters.length - selectedWord.length > 0) {
        matcher.getMatches(trie, letters, disallowedWords, board).then(function(matches) {
            
            console.log(matches);

            if (matches.length) {
                // TODO: placeAndContinue(...)
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
        console.log('SOLUTION FOUND');
        _.forEach(board, function(boardRow) {
            console.log(boardRow.join(' '));
        });
    }
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
            placeAndContinue([[]], words, disallowedWords, trie, letters, 0);
        } else {
            console.log('NO SOLUTION');
        }
    });
}

solve('letters', ['letters']);