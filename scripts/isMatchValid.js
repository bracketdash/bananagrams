function isMatchValid(match, board) {
    var index;
    var strip;
    if (match.dir === 'row') {
        index = match.row;
        strip = _.clone(board[index]);
    } else {
        index = match.col;
        strip = [];
        _.forEach(board, function(row) {
            strip.push(row[index]);
        });
    }
    var ogStrip = _.clone(strip);
    Array.prototype.splice.apply(strip, [0, (index + match.word.length)].concat(match.word.split('')));
    if (index < 0) {
        strip = strip.slice(-index);
    }
    var valid = true;
    _.forEach(ogStrip, function(square, stripdex) {
        if (square != ' ' && square != strip[stripdex + index]) {
            valid = false;
        }
    });
    return valid;
}
