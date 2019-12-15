function makeWordsWithLoop(trie, letters, prefix, words, resolve) {
    var newPrefix = '';
    var lastLeaf = true;
    _.forEach(_.uniq(letters), function(letter) {
        if (!!trie[letter]) {
            if (lastLeaf) {
                lastLeaf = false;
            }
            newPrefix = prefix + letter;
            if (trie[letter]['_']) {
                words.push(newPrefix);
            }
            makeWordsWithLoop(trie[letter], _.replace(letters, letter, ''), newPrefix, words, resolve);
        }
    });
    if (lastLeaf) {
        resolve(words);
    }
}

function makeWordsWith(letters, trie) {
    return new Promise(function(resolve) {
        makeWordsWithLoop(trie, letters, '', [], resolve);
    });
}
