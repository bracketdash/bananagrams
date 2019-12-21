function placeWord(oldBoard, match) {
    var board = _.cloneDeep(oldBoard);
    var word = match.word;
    var row = match.row;
    var col = match.col;
    var dir = match.dir;
    var wordLen = {row:0,col:0};
    wordLen[dir] = word.length;
    if (row < 0 || row + wordLen.col > board.length) {
        var newRow = _.map(Array(board[0].length), () => ' ');
        if (row < 0) {
            _.times(-row, () => board.unshift(_.clone(newRow)));
            row = 0;
        }
        if (row + wordLen.col > board.length) {
            _.times(row + wordLen.col - board.length, () => board.push(_.clone(newRow)));
        }
    }
    if (col < 0 || col + wordLen.row > board[0].length) {
        if (col < 0) {
            board = _.map(board, (boardRow) => _.map(Array(-col), () => ' ').concat(boardRow));
            col = 0;
        }
        if (col + wordLen.row > board[0].length) {
            board = _.map(board, (boardRow) => boardRow.concat(_.map(Array(col + wordLen.row - board[0].length), () => ' ')));
        }
    }
    board[row][col] = word[0];
    _.forEach(word.substring(1), function(letter) {
        if (dir === 'col') {
            row += 1;
        } else {
            col += 1;
        }
        board[row][col] = letter;
    });
    return board;
}
