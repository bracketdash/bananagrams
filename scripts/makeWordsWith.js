function makeWordsWithLoop(branch, letters, prefix, words, resolve) {
    var newPrefix = '';
    var lastLeaf = true;
    _.forEach(_.uniq(letters), function(letter) {
        if (!!branch[letter]) {
            if (lastLeaf) {
                lastLeaf = false;
            }
            newPrefix = prefix + letter;
            if (branch[letter]['_']) {
                words.push(newPrefix);
            }
            makeWordsWithLoop(branch[letter], _.replace(letters, letter, ''), newPrefix, words, resolve);
        }
    });
    if (lastLeaf) {
        resolve(words);
    }
}

function makeWordsWith(letters, trie, disallowedWords) {
    var words = [];
    makeWordsWithLoop(trie, letters, '', [], function(result) {
        words = result;
    });
    if (disallowedWords) {
        words = _.difference(words, disallowedWords);
    }
    return words;
}
