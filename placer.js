const _ = require('lodash');

function placeWord(board, word, row, col, dir) {
    
    // first resize the board if necessary
    // TODO: abstract these out to keep things DRY
    if (col + word.length > board[0].length) {
        // add columns to the right
        _.times((col + word.length) - board.length, function() {
            let newCol = [];
            _.times(board.length, function() {
                newCol.push(' ');
            });
            board.push(newCol);
        });
    } else if (col < 0) {
        // add columns to the left
        _.times(-col, function() {
            let newCol = [];
            _.times(board.length, function() {
                newCol.push(' ');
            });
            board.push(newCol);
        });
    }
    if (row + word.length > board.length) {
        // add rows to the bottom
        _.times((row + word.length) - board.length, function() {
            let newRow = [];
            _.times(board[0].length, function() {
                newRow.push(' ');
            });
            board.push(newRow);
        });
    } else if (row < 0) {
        // add rows to the top
        _.times(-row, function() {
            let newRow = [];
            _.times(board[0].length, function() {
                newRow.push(' ');
            });
            board.unshift(newRow);
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
console.log(placeWord(board, 'boom', 4, -2, 'row'));

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