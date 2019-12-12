const _ = require('lodash');

const combinator = require('./combinator.js');

function getStripMatches(words, strip, stripdex, dir) {
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

module.exports = {
    getMatches: function(trie, letters, disallowedWords, board) {
        return new Promise(function(resolve) {
            let columns = [];
            _.times(board[0].length, function() {
                columns.push([]);
            });
            let matches = [];
            combinator.makeWordsWith(trie, letters).then(function(wordsWithLetters) {
                if (disallowedWords) {
                    wordsWithLetters = _.difference(wordsWithLetters, disallowedWords);
                }
                _.forEach(board, function(boardRow, boardRowIndex) {
                    matches = matches.concat(getStripMatches(wordsWithLetters, boardRow, boardRowIndex, 'row'));
                    _.forEach(boardRow, function(boardCol, boardColIndex) {
                        columns[boardColIndex].push(boardCol);
                    });
                });
                _.forEach(columns, function(boardColumn, boardColumnIndex) {
                    matches = matches.concat(getStripMatches(wordsWithLetters, boardColumn, boardColumnIndex, 'col'));
                    if (boardColumnIndex === columns.length - 1) {
                        resolve(matches);
                    }
                });
            });
        });
    }
};
