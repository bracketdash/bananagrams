const _ = require('lodash');

module.exports = {
    placeWord: function(board, word, row, col, dir) {

        let wordLen = {right:0,down:0};
        wordLen[dir] = word.length;

        // add rows if needed
        if (row < 0 || row + wordLen.down > board.length) {
            let newRow = _.map(Array(board[0].length), () => ' ');
            if (row < 0) {
                _.times(-row, () => board.unshift(newRow));
                row = 0;
            }
            if (row + wordLen.down > board.length) {
                _.times(row + wordLen.down - board.length, () => board.push(newRow));
            }
        }

        // add columns if needed
        if (col < 0 || col + wordLen.right > board[0].length) {
            if (col < 0) {
                board = _.map(board, (boardRow) => _.map(Array(-col), () => ' ').concat(boardRow));
                col = 0;
            }
            if (col + wordLen.right > board[0].length) {
                board = _.map(board, (boardRow) => boardRow.concat(_.map(Array(col + wordLen.right - board[0].length), () => ' ')));
            }
        }

        // place the letters on the board
        board[row][col] = word[0];
        _.forEach(word.substring(1), function(letter) {
            if (dir === 'down') {
                row += 1;
            } else {
                col += 1;
            }
            board[row][col] = letter;
        });

        return board;
    }
};