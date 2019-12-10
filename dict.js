const fs = require('fs');
const _ = require('lodash');

function getTrie() {
    let trie = fs.readFileSync('./trie.txt', 'utf8');
    trie = trie.replace(/([a-z])/g,"\"$1\":{");
    trie = trie.replace(/([0-9])/g, function(num) {
        let brackets = '';
        _.times(parseInt(num), function() {
            brackets += '}';
        });
		return '"_":1' + brackets + ',';
    });
    trie = trie.replace(/([A-Z])/g, function(letter) {
        let num = letter.charCodeAt() - 55;
        let brackets = '';
        _.times(num, function() {
            brackets += '}';
        });
		return '"_":1' + brackets + ',';
	});
    trie = JSON.parse('{' + trie + '"_":1}}}}}}}}');
    return trie;
}

console.log(getTrie());