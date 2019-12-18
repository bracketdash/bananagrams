function isMatchValid(match, ogStrip) {
    var strip;
    var spliceAt;
    if (_.trim(ogStrip.join('')).indexOf(match.word) > -1) {
        return false;
    }
    strip = _.clone(ogStrip);
    if (match.dir === 'row') {
        spliceAt = match.col;
    } else {
        spliceAt = match.row;
    }
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
