const fs = require('fs');
const _ = require('lodash');

function getTrie() {
    let trie = fs.readFileSync('./trie.txt', 'utf8');
    return trie.substring(0,100);
    trie = trie.replace(/:/g, ':{').split(',');
    // a:a:_:1
    // h:_
    // e:d:_
    // i:n:g:_
    // s:_
    // l:_
    // i:i:_
    // s:_
    // s:_
    // r:d:v:a:r:k:_
    // s:_
    _.forEach(trie, function(chunk) {
        let brackets = trie.match(/{/g).length;
    });


    trie = trie.replace(/,/g, '},');

    trie = trie.replace(/_/g, '_:1');
    trie = '{' + trie.replace(/([a-z]|_)/g, "\"$1\"");
    endingBrackets = trie.match(/{/g).length - trie.match(/}/g).length;
    // return trie.match(/}/g).length;
    // return trie.substring(trie.length-100, trie.length);
}

console.log(getTrie());