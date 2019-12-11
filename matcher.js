const _ = require('lodash');

module.exports = {
    getPattern: function(arr) {
        let pattern = '';
        return pattern;
    },
    findMatchingWords: function(wordlist, pattern) {
        let wordsThatMatch = [];
        _.forEach(wordlist, function(word) {
            if (pattern.test(word)) {
                wordsThatMatch.push(word);
            }
        });
        return wordsThatMatch;
    }
};