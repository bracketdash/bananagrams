function solve(incomingLetters, disallowedWords, trie, callback) {
    var board = [[]];
    var letters = incomingLetters.toLowerCase();
    var words = makeWordsWith(letters, trie, _.map(disallowedWords, function(disallowedWord) {
        return disallowedWord.toLowerCase();
    }));
    if (words.length) {
        solveLoop({
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
            trie: trie,
            words: words
        });
    } else {
        callback({
            message: 'No possible solution. Wait for a pull.',
            board: board,
            letters: letters,
            end: true
        });
    }
}

function solveLoop(solveState) {
    var currentState = solveState.history[solveState.historyIndex];
    var currentMatch = currentState.matches[currentState.matchIndex];
    var newBoard;
    var newLetters;
    if (!currentMatch) {
        if (solveState.historyIndex > 0) {
            solveState.historyIndex -= 1;
            solveState.history[solveState.historyIndex].matchIndex += 1;
            solveState.history = solveState.history.slice(0,-1);
            solveLoop(solveState);
        } else {
            solveState.callback({
                message: 'No possible solution. Wait for a pull.',
                board: currentState.board,
                letters: currentState.letters,
                end: true
            });
        }
        return;
    }
    newBoard = placeWord(currentState.board, currentMatch);
    newLetters = getNewLetters(currentState.letters, currentState.board, newBoard, currentMatch);
    if (!isBoardValid(newBoard, solveState.trie)) {
        currentState.matchIndex += 1;
        solveLoop(solveState);
        return;
    }
    if (newLetters.length) {
        getMatches(newLetters, newBoard, solveState.words, function(matches) {
            if (matches.length) {
                solveState.callback({
                    board: newBoard,
                    letters: newLetters
                });
                solveState.history.push({
                    board: newBoard,
                    letters: newLetters,
                    matches: matches,
                    matchIndex: 0
                });
                solveState.historyIndex += 1;
                setTimeout(function() {
                    if (window.stop) {
                        window.stop = false;
                        return;
                    }
                    solveLoop(solveState);
                });
            } else {
                currentState.matchIndex = currentState.matchIndex + 1;
                solveLoop(solveState);
            }
        });
    } else {
        solveState.callback({
            message: 'SOLVED!',
            board: newBoard,
            letters: '',
            end: true
        });
    }
}
