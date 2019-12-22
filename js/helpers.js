function crawlBoard(board, rowCallback, colCallback) {
    var columns = [];
    _.times(board[0].length, function() {
        columns.push([]);
    });
    _.forEach(board, function(boardRow, boardRowIndex) {
        rowCallback(boardRow, boardRowIndex);
        _.forEach(boardRow, function(boardCol, boardColIndex) {
            columns[boardColIndex].push(boardCol);
        });
    });
    _.forEach(columns, function(boardColumn, boardColumnIndex) {
        colCallback(boardColumn, boardColumnIndex);
    });
}

function getNewLetters(incomingLetters, oldBoard, newBoard, match) {
    let newLetters = incomingLetters;
    var newStrip = [];
    var oldStrip = [];
    if (match.dir === 'row') {
        newStrip = newBoard[match.row];
        oldStrip = oldBoard[match.row];
    } else {
        newStrip = _.map(newBoard, function(row) {
            return row[match.col];
        });
        oldStrip = _.map(oldBoard, function(row) {
            return row[match.col];
        });
    }
    let lettersToBeRemoved = _.difference(newStrip, oldStrip);
    _.forEach(lettersToBeRemoved, function(letterToBeRemoved) {
        newLetters = newLetters.replace(letterToBeRemoved, '');
    });
    return newLetters;
}

function isBoardValid(board, trie, blacklist) {
    var valid = true;
    crawlBoard(board, function(boardRow) {
        var words = _.split(_.trim(boardRow.join('')), /\s+/);
        _.forEach(words, function(word) {
            if (word.length > 1 && (!_.has(trie, (word + '_').split('')) || _.indexOf(blacklist, word) > -1)) {
                valid = false;
            }
        });
    }, function(boardColumn) {
        var words = _.split(_.trim(boardColumn.join('')), /\s+/);
        _.forEach(words, function(word) {
            if (word.length > 1 && (!_.has(trie, (word + '_').split('')) || _.indexOf(blacklist, word) > -1)) {
                valid = false;
            }
        });
    });
    return valid;
}
