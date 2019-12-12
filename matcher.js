const _ = require('lodash');

const combinator = require('./combinator.js');

module.exports = {
    findMatchingWords: function(wordlist, pattern) {
        let wordsThatMatch = [];
        _.forEach(wordlist, function(word) {
            if (pattern.test(word)) {
                wordsThatMatch.push(word);
            }
        });
        return wordsThatMatch;
    },
    getStripMatches: function(wordsWithLettersLeft, strip, stripdex, dir) {
        let pattern = _.trim(strip.join('')).replace(/\s/g, '.');
        let matchingWords = this.findMatchingWords(wordsWithLettersLeft, pattern);
        let notDir = dir === 'row' ? 'col' : 'row';
        let matches = _.map(matchingWords, function(matchingWord) {
            // TODO: wordPlacedInStrip
            let wordPlacedInStrip = 'TODO';
            let match = {
                word: matchingWord,
                dir: dir
            };
            match[dir] = stripdex;
            match[notDir] = wordPlacedInStrip.indexOf(matchingWord);
            return match;
        });
        return matches;
    },
    getMatches: function(trie, lettersLeft, disallowedWords, board) {
        var matcher = this;
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
                    matches = matches.concat(matcher.getStripMatches(wordsWithLettersLeft, boardRow, boardRowIndex, 'row'));
                    _.forEach(boardRow, function(boardCol, boardColIndex) {
                        columns[boardColIndex].push(boardCol);
                    });
                });
                _.forEach(columns, function(boardColumn, boardColumnIndex) {
                    matches = matches.concat(matcher.getStripMatches(wordsWithLettersLeft, boardColumn, boardColumnIndex, 'col'));
                    if (boardColumnIndex === columns.length - 1) {
                        resolve(matches);
                    }
                });
            });
        });
    }
};
