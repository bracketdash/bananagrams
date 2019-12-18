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
            disallowedWords: disallowedWords,
            history: [{
                board: [[]],
                letters: letters,
                matches: matches,
                matchIndex: 0
            }],
            historyIndex: 0,
            trie: trie,
            callback: callback
        });
    } else {
        // END
        callback({
            message: 'No possible solution. Wait for a pull.',
            board: [[]],
            letters: letters
        });
    }
}

function solveLoop(solveState) {
    var currentState = solveState.history[solveState.historyIndex];
    var currentMatch = currentState.matches[currentState.matchIndex];
    var callbackMessage = '';
    if (!currentMatch) {
        if (solveState.historyIndex > 0) {
            callbackMessage = 'Out of words to try! Backing up again...';
            console.log(callbackMessage);
            solveState.callback({
                message: callbackMessage,
                board: solveState.history[solveState.historyIndex-1].board,
                letters: solveState.history[solveState.historyIndex-1].letters
            });
            solveState.history[solveState.historyIndex-1].matchIndex += 1;
            setTimeout(function() {
                if (window.stop) {
                    window.stop = false;
                    return;
                }
                solveLoop({
                    disallowedWords: solveState.disallowedWords,
                    history: solveState.history.slice(0,-1),
                    historyIndex: solveState.historyIndex - 1,
                    trie: solveState.trie,
                    callback: solveState.callback
                });
            });
        } else {
            // END
            callbackMessage = 'No possible solution. Wait for a pull.';
            console.log(callbackMessage);
            solveState.callback({
                message: callbackMessage,
                board: currentState.board,
                letters: currentState.letters
            });
        }
        return;
    }
    var newBoard = placeWord(currentState.board, currentMatch);
    var newLetters = getNewLetters(currentState.letters, currentState.board, newBoard, currentMatch);
    if (!isBoardValid(newBoard, solveState.disallowedWords, solveState.trie)) {
        callbackMessage = 'Oops! Invalid board created. Backing up and trying the next word...';
        console.log(callbackMessage);
        solveState.callback({
            message: callbackMessage,
            board: newBoard,
            letters: newLetters
        });
        currentState.matchIndex = currentState.matchIndex + 1;
        setTimeout(function() {
            if (window.stop) {
                window.stop = false;
                return;
            }
            solveLoop({
                disallowedWords: solveState.disallowedWords,
                history: solveState.history,
                historyIndex: solveState.historyIndex,
                trie: solveState.trie,
                callback: solveState.callback
            });
        });
        return;
    }
    if (newLetters.length) {
        getMatches(newLetters, solveState.disallowedWords, newBoard, solveState.trie, function(matches) {
            if (matches.length) {
                callbackMessage = matches.length + ' matches found! Saving placement and trying the first match...';
                console.log(callbackMessage);
                solveState.callback({
                    message: callbackMessage,
                    board: newBoard,
                    letters: newLetters
                });
                solveState.history.push({
                    board: newBoard,
                    letters: newLetters,
                    matches: _.reverse(_.sortBy(matches, (match) => match.word.length)),
                    matchIndex: 0
                });
                setTimeout(function() {
                    if (window.stop) {
                        window.stop = false;
                        return;
                    }
                    solveLoop({
                        disallowedWords: solveState.disallowedWords,
                        history: solveState.history,
                        historyIndex: solveState.historyIndex + 1,
                        trie: solveState.trie,
                        callback: solveState.callback
                    });
                });
            } else {
                callbackMessage = 'No matches. Backing up and trying the next word...';
                console.log(callbackMessage);
                solveState.callback({
                    message: callbackMessage,
                    board: currentState.board,
                    letters: currentState.letters
                });
                currentState.matchIndex = currentState.matchIndex + 1;
                setTimeout(function() {
                    if (window.stop) {
                        window.stop = false;
                        return;
                    }
                    solveLoop({
                        disallowedWords: solveState.disallowedWords,
                        history: solveState.history,
                        historyIndex: solveState.historyIndex,
                        trie: solveState.trie,
                        callback: solveState.callback
                    });
                });
            }
        });
    } else {
        callbackMessage = 'SOLVED!';
        console.log(callbackMessage);
        solveState.callback({
            message: callbackMessage,
            board: newBoard,
            letters: ''
        });
    }
}
