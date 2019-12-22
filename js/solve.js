function solve(incomingLetters, blacklist, trie, callback) {
    var board = [[]];
    var letters = incomingLetters.toLowerCase();
    var words = makeWordsWith(letters, trie, _.map(blacklist, function(disallowedWord) {
        return disallowedWord.toLowerCase();
    }));
    if (words.length) {
        solveLoop({
            blacklist: blacklist,
            callback: callback,
            history: [{
                board: board,
                letters: letters,
                matches: _.map(words, function(word) {
                    return { word: word, dir: 'col', row: 0, col: 0 };
                }),
                matchIndex: 0
            }],
            historyIndex: 0,
            originalLetters: incomingLetters,
            trie: trie,
            words: words
        });
    } else {
        callback({
            message: 'No possible solution. Wait for a pull.',
            board: board,
            tray: letters,
            end: true
        });
    }
}

function solveLoop(solveState) {
    var currentState = solveState.history[solveState.historyIndex];
    var currentMatch = currentState.matches[currentState.matchIndex];
    var newBoard;
    var newLetters;
    if (!solveState.callback({
        blacklist: solveState.blacklist,
        board: currentState.board,
        originalLetters: solveState.originalLetters,
        tray: currentState.letters
    })) {
        return;
    }
    if (!currentMatch) {
        if (solveState.historyIndex > 0) {
            solveState.historyIndex -= 1;
            solveState.history[solveState.historyIndex].matchIndex += 1;
            solveState.history = solveState.history.slice(0,-1);
            setTimeout(function() {
                solveLoop(solveState);
            });
        } else {
            solveState.callback({
                message: 'No possible solution. Wait for a pull.',
                board: currentState.board,
                tray: currentState.letters,
                end: true
            });
        }
        return;
    }
    newBoard = placeWord(currentState.board, currentMatch);
    newLetters = getNewLetters(currentState.letters, currentState.board, newBoard, currentMatch);
    if (!isBoardValid(newBoard, solveState.trie, solveState.blacklist)) {
        currentState.matchIndex += 1;
        setTimeout(function() {
            solveLoop(solveState);
        });
        return;
    }
    if (newLetters.length) {
        getMatches(newLetters, newBoard, solveState.words, function(matches) {
            if (matches.length) {
                solveState.history.push({
                    board: newBoard,
                    letters: newLetters,
                    matches: matches,
                    matchIndex: 0
                });
                solveState.historyIndex += 1;
                setTimeout(function() {
                    solveLoop(solveState);
                });
            } else {
                currentState.matchIndex = currentState.matchIndex + 1;
                setTimeout(function() {
                    solveLoop(solveState);
                });
            }
        });
    } else {
        solveState.callback({
            message: 'SOLVED!',
            board: newBoard,
            tray: '',
            end: true
        });
    }
}
