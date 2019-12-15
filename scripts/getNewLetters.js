function getNewLetters(incomingLetters, oldBoard, newBoard, match) {
    let newLetters = incomingLetters;
    var oldStrip;
    if (match.dir === 'row') {
        oldStrip = newBoard[match.row];
    } else {
        // TODO: build the column and assign to oldStrip
    }
    // TODO: make newStrip
    let lettersToBeRemoved = [];
    // TODO: use _.difference between the old and new strips to find the letters that should be removed
    _.forEach(lettersToBeRemoved, function(letterToBeRemoved) {
        newLetters = newLetters.replace(letterToBeRemoved, '');
    });
    return newLetters;
}
