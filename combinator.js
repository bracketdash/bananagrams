const _ = require('lodash');

function loop(trie, letters, prefix, words, resolve) {
    let newPrefix = '';
    let lastLeaf = true;
    _.forEach(letters, function(letter) {
        if (!!trie[letter]) {
            if (lastLeaf) {
                lastLeaf = false;
            }
            newPrefix = prefix + letter;
            if (trie[letter]['_']) {
                words.push(newPrefix);
            }
            loop(trie[letter], _.replace(letters, letter, ''), newPrefix, words, resolve);
        }
    });
    if (lastLeaf) {
        resolve(words);
    }
}

module.exports = {
    makeWordsWith: function(trie, letters) {
        return new Promise(function(resolve) {
            loop(trie, letters, '', [], resolve);
        });
    }
};
