const _ = require('lodash');

const combinator = require('./combinator.js');
const dict = require('./dict.js');
const placer = require('./placer.js');

function solve(letters, disallowedWords) {
    combinator.makeWordsWith(dict.getTrie(), letters).then(function(words) {
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
            // next line referred to as PLACEMENT in comments below
            board = placer.placeWord([[]], words[0], 0, 0, 'right');
            if (letters.length - words[0].length > 0) {

                /*
                for each row and column on the board
                    [matcher.js] find words that could fit
                remove disallowed words
                if words can be found
                    GOTO PLACEMENT AND CONTINUE
                if words could not be found
                    remove the last placed word from the board
                    GOTO PLACEMENT
                        if there  are more words that we haven't tried
                            place the next word in the set on the board
                            CONTINUE FROM NEXT LINE
                        if there are no more words left to try
                            EXIT (NO SOLUTION)
                */

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