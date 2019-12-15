function isBoardValid(board, disallowedWords) {
    var valid = true;
    crawlBoard(board, function(boardRow) {
        var words = _.split(_.trim(boardRow.join('')), /\s+/);
        _.forEach(words, function(word) {
            if (word.length > 1 && (!_.has(trie, (word + '_').split('')) || _.indexOf(disallowedWords, word) > -1)) {
                valid = false;
            }
        });
    }, function(boardColumn) {
        var words = _.split(_.trim(boardColumn.join('')), /\s+/);
        _.forEach(words, function(word) {
            if (word.length > 1 && (!_.has(trie, (word + '_').split('')) || _.indexOf(disallowedWords, word) > -1)) {
                valid = false;
            }
        });
    });
    return valid;
}
