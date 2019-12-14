const fs = require('fs');
const _ = require('lodash');
let wordlist = fs.readFileSync('wordlist.txt', 'utf8');
wordlist = wordlist.split(',');
let trie = {};

function loop(triePart, word, index) {
    if (index === word.length-1) {
        triePart[word[index]] = {_:1};
    } else {
        triePart[word[index]] = {};
        loop(triePart[word[index]], word, index+1);
    }
}

_.forEach(wordlist, function(word) {
    var triePart = {};
    loop(triePart, word, 0);
    _.defaultsDeep(trie, triePart);
});

trie = JSON.stringify(trie);

trie = trie.replace(/"/g, '');
trie = trie.replace(/{/g, '');
trie = trie.replace(/:1/g, '');
trie = trie.replace(/:/g, '');
trie = trie.replace(/(}+)/g, function(capture) {
    return capture.length;
});

console.log(trie);
