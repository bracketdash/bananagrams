const _ = require('lodash');

const combinator = require('./combinator.js');

function getStripMatches(words, strip, stripdex, dir) {
    let notDir = dir === 'row' ? 'col' : 'row';
    let pattern = _.trim(strip.join('')).replace(/\s/g, '.');
    let stripMatches = [];
    _.forEach(words, function(word) {
        if (pattern.test(word)) {
            // TODO: wordPlacedInStrip
            let wordPlacedInStrip = 'TODO';
            let stripMatch = {word, dir};
            stripMatch[dir] = stripdex;
            stripMatch[notDir] = wordPlacedInStrip.indexOf(matchingWord);
            stripMatches.push(match);
        }
    });
    return stripMatches;
}

module.exports = {
    getMatches: function(trie, lettersLeft, disallowedWords, board) {
        return new Promise(function(resolve) {
            let columns = [];
            _.times(board[0].length, function() {
                columns.push([]);
            });
            let matches = [];
            combinator.makeWordsWith(trie, lettersLeft).then(function(wordsWithLettersLeft) {
                if (disallowedWords) {
                    wordsWithLettersLeft = _.difference(wordsWithLettersLeft, disallowedWords);
                }
                _.forEach(board, function(boardRow, boardRowIndex) {
                    matches = matches.concat(getStripMatches(wordsWithLettersLeft, boardRow, boardRowIndex, 'row'));
                    _.forEach(boardRow, function(boardCol, boardColIndex) {
                        columns[boardColIndex].push(boardCol);
                    });
                });
                _.forEach(columns, function(boardColumn, boardColumnIndex) {
                    matches = matches.concat(getStripMatches(wordsWithLettersLeft, boardColumn, boardColumnIndex, 'col'));
                    if (boardColumnIndex === columns.length - 1) {
                        resolve(matches);
                    }
                });
            });
        });
    }
};
