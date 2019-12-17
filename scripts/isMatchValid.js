function isMatchValid(match, board) {
    var index;
    var spliceAt;
    var strip;
    if (match.dir === 'row') {
        index = match.row;
        spliceAt = match.col;
        strip = _.clone(board[index]);
    } else {
        index = match.col;
        spliceAt = match.row;
        strip = [];
        _.forEach(board, function(row) {
            strip.push(row[index]);
        });
    }
    var ogStrip = _.clone(strip);
    if (spliceAt < 0) {
        Array.prototype.splice.apply(strip, [0, (spliceAt + match.word.length)].concat(match.word.split('')));
        strip = strip.slice(-spliceAt);
        spliceAt = 0;
    } else {
        Array.prototype.splice.apply(strip, [spliceAt, match.word.length].concat(match.word.split('')));
    }
    if (spliceAt < 0) {
        strip = strip.slice(-spliceAt);
    }
    var valid = true;
    _.forEach(ogStrip, function(square, stripdex) {
        if (square != ' ' && square != strip[stripdex + spliceAt]) {
            valid = false;
        }
    });
    return valid;
}
