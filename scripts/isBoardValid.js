function isBoardValid(board, trie) {
    var valid = true;
    crawlBoard(board, function(boardRow) {
        var words = _.split(_.trim(boardRow.join('')), /\s+/);
        _.forEach(words, function(word) {
            if (word.length > 1 && !_.has(trie, (word + '_').split(''))) {
                valid = false;
            }
        });
    }, function(boardColumn) {
        var words = _.split(_.trim(boardColumn.join('')), /\s+/);
        _.forEach(words, function(word) {
            if (word.length > 1 && !_.has(trie, (word + '_').split(''))) {
                valid = false;
            }
        });
    });
    return valid;
}
