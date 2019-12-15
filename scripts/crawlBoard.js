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
