const _ = require('lodash');

module.exports = {
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