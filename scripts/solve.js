function solve(letters, disallowedWords, trie, progressCallback) {
    return new Promise(function(solveResolve) {
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
                solveResolve: solveResolve,
                trie: trie,
                progressCallback: progressCallback
            });
        } else {
            solveResolve({
                solved: false,
                board: [[]],
                letters: letters
            });
        }
    });
}

function solveLoop(solveState) {
    var currentState = solveState.history[solveState.historyIndex];
    var currentMatch = currentState.matches[currentState.matchIndex];
    console.log('solveLoop', solveState.historyIndex, currentState.matchIndex);
    if (!currentMatch) {
        if (solveState.historyIndex > 0) {
            solveState.progressCallback(
                solveState.history[solveState.historyIndex-1].board,
                solveState.history[solveState.historyIndex-1].letters
            );
            solveState.history[solveState.historyIndex-1].matchIndex += 1;
            setTimeout(function() {
                solveLoop({
                    disallowedWords: solveState.disallowedWords,
                    history: solveState.history.slice(0,-1),
                    historyIndex: solveState.historyIndex - 1,
                    solveResolve: solveState.solveResolve,
                    trie: solveState.trie,
                    progressCallback: solveState.progressCallback
                });
            });
        } else {
            solveState.solveResolve({
                solved: false,
                board: currentState.board,
                letters: currentState.letters
            });
        }
        return;
    }
    console.log('Placing: ' + currentMatch.word.toUpperCase());
    var newBoard = placeWord(currentState.board, currentMatch);
    if (!isBoardValid(newBoard, solveState.disallowedWords, solveState.trie)) {
        currentState.matchIndex = currentState.matchIndex + 1;
        setTimeout(function() {
            solveLoop({
                disallowedWords: solveState.disallowedWords,
                history: solveState.history,
                historyIndex: solveState.historyIndex,
                solveResolve: solveState.solveResolve,
                trie: solveState.trie,
                progressCallback: solveState.progressCallback
            });
        });
        return;
    }
    var newLetters = getNewLetters(currentState.letters, currentState.board, newBoard, currentMatch);
    solveState.progressCallback(newBoard, newLetters);
    if (newLetters.length) {
        getMatches(newLetters, solveState.disallowedWords, newBoard, solveState.trie).then(function(matches) {
            if (matches.length) {
                matches = _.reverse(_.sortBy(matches, (match) => match.word.length));
                solveState.history.push({
                    board: newBoard,
                    letters: newLetters,
                    matches: matches,
                    matchIndex: 0
                });
                // BUG: Getting stuck in an infinite loop here...
                setTimeout(function() {
                    solveLoop({
                        disallowedWords: solveState.disallowedWords,
                        history: solveState.history,
                        historyIndex: solveState.historyIndex + 1,
                        solveResolve: solveState.solveResolve,
                        trie: solveState.trie,
                        progressCallback: solveState.progressCallback
                    });
                });
            } else {
                solveState.progressCallback(currentState.board, currentState.letters);
                currentState.matchIndex = currentState.matchIndex + 1;
                setTimeout(function() {
                    solveLoop({
                        disallowedWords: solveState.disallowedWords,
                        history: solveState.history,
                        historyIndex: solveState.historyIndex,
                        solveResolve: solveState.solveResolve,
                        trie: solveState.trie,
                        progressCallback: solveState.progressCallback
                    });
                });
            }
        });
    } else {
        solveState.solveResolve({
            solved: true,
            board: newBoard
        });
    }
}
