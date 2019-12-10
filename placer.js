const _ = require('lodash');

function placeWord(board, location, word) {
    // TODO
}

let board = [
    [' ', 'c', ' '],
    ['r', 'o', 'w'],
    [' ', 'l', ' '],
    [' ', 'u', ' '],
    [' ', 'm', ' '],
    [' ', 'n', ' ']
];
console.log(placeWord(board, [-2, 4], 'boom'));

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