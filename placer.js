const _ = require('lodash');

function placeWord(board, word, row, col, dir) {

    let wordLen = {right:0,down:0};
    wordLen[dir] = word.length;

    // add rows to the top if needed
    if (row < 0) {
        _.times(-row, function() {
            board.unshift(_.map(Array(board[0].length), () => ' '));
        });
    }

    // add rows to the bottom if needed
    if (row + wordLen.down > board.length) {
        _.times(row + wordLen.down - board.length, function() {
            board.push(_.map(Array(board[0].length), () => ' '));
        });
    }

    // add columns to the left if needed
    if (col < 0) {
        board = _.map(board, function(boardRow) {
            return _.map(Array(-col), () => ' ').concat(boardRow);
        });
    }

    // add columns to the right if needed
    if (col + wordLen.right > board[0].length) {
        board = _.map(board, function(boardRow) {
            return boardRow.concat(_.map(Array(col + wordLen.right - board[0].length), () => ' '))
        });
    }

    // find the first tile that needs to be edited
    // TODO

    return board;
}

let board = [
    [' ', 'c', ' '],
    ['r', 'o', 'w'],
    [' ', 'l', ' '],
    [' ', 'u', ' '],
    [' ', 'm', ' '],
    [' ', 'n', ' ']
];

board = placeWord(board, 'boom', 4, -2, 'right');

/*
expected return:
[
    [' ', ' ', ' ', 'c', ' '],
    [' ', ' ', 'r', 'o', 'w'],
    [' ', ' ', ' ', 'l', ' '],
    [' ', ' ', ' ', 'u', ' '],
    ['b', 'o', 'o', 'm', ' '],
    [' ', ' ', ' ', 'n', ' ']
];
*/

board = placeWord(board, 'wonder', 1, 2, 'down');

console.log(board);