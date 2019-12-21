function solve(letters, disallowedWords, trie, callback) {
    letters = letters.toLowerCase();
    disallowedWords = _.map(disallowedWords, function(disallowedWord) {
        return disallowedWord.toLowerCase();
    });
    var words = makeWordsWith(letters, trie, disallowedWords);
    var matches;
    if (words.length) {
        words = words.sort(function(a, b) {
            if (a.length > b.length) {
                return -1;
            } else if (a.length < b.length) {
                return 1;
            } else {
                return 0;
            }
        });
        matches = _.map(words, function(word) {
            return {
                word: word,
                dir: 'row',
                row: 0,
                col: 0
            };
        });
        solveLoop({
            history: [{
                board: [[]],
                letters: letters,
                matches: matches,
                matchIndex: 0
            }],
            historyIndex: 0,
            trie: trie,
            words: words,
            callback: callback
        });
    } else {
        callback({
            message: 'No possible solution. Wait for a pull.',
            board: [[]],
            letters: letters,
            end: true
        });
    }
}

function solveLoop(solveState) {
    var currentState = solveState.history[solveState.historyIndex];
    var currentMatch = currentState.matches[currentState.matchIndex];
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
    var newBoard = placeWord(currentState.board, currentMatch);
    var newLetters = getNewLetters(currentState.letters, currentState.board, newBoard, currentMatch);
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
                    matches: _.reverse(_.sortBy(matches, (match) => match.word.length)),
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
