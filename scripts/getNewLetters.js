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
