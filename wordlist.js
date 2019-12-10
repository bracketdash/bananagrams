const _ = require('lodash');

function loop(leftToCrawl, currentPrefix, words, resolve) {
    _.forEach(leftToCrawl, function(nextLevel, newLetter) {
        if (newLetter === '_') {
            words.push(currentPrefix);
            if (currentPrefix === 'zzzs') {
                resolve(words);
            }
        } else {
            loop(nextLevel, currentPrefix + newLetter, words, resolve);
        }
    });
}

module.exports = {
    getWordList: function(trie) {
        return new Promise(function(resolve) {
            let words = [];
            loop(trie, '', words, resolve);
        });
    }
};