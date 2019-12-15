function isBoardValid(board, disallowedWords) {
    var valid = true;
    crawlBoard(board, function(boardRow) {
        var words = _.split(_.trim(boardRow.join('')), /\s+/);
        _.forEach(words, function(word) {
            if (word.length > 1 && (!_.has(trie, (word + '_').split('')) || _.indexOf(disallowedWords, word) > -1)) {
                valid = false;
            }
        });
    }, function(boardColumn, boardColumnIndex) {
        var words = _.split(_.trim(boardColumn.join('')), /\s+/);
        _.forEach(words, function(word) {
            if (word.length > 1 && (!_.has(trie, (word + '_').split('')) || _.indexOf(disallowedWords, word) > -1)) {
                valid = false;
            }
        });
    });
    return valid;
}

function crawlBoard(board, rowCallback, colCallback, doneCallback) {
    var columns = [];
    _.times(board[0].length, function() {
        columns.push([]);
    });
    _.forEach(board, function(boardRow, boardRowIndex) {
        rowCallback(boardRow, boardRowIndex);
        _.forEach(boardRow, function(boardCol, boardColIndex) {
            columns[boardColIndex].push(boardCol);
        });
    });
    _.forEach(columns, function(boardColumn, boardColumnIndex) {
        colCallback(boardColumn, boardColumnIndex);
        if (doneCallback && boardColumnIndex === columns.length - 1) {
            doneCallback();
        }
    });
}

function getMatchesLoop(strip, stripdex, dir, letters, disallowedWords) {
    return new Promise(function(resolve) {
        var notDir = dir === 'row' ? 'col' : 'row';
        var stripStr = strip.join('');
        var stripStrTrimmed = _.trim(stripStr);
        if (!stripStrTrimmed) {
            return [];
        }
        var pattern = new RegExp(stripStrTrimmed.replace(/\s/g, '.'));
        // TODO: BUG - this pattern ignores words that might only attach to one of the edge tiles in the strip
        var stripMatches = [];
        _.forEach(stripStrTrimmed.split(''), function(tileOnBoard, tileIndex) {
            if (tileOnBoard !== ' ') {
                makeWordsWith(letters + tileOnBoard).then(function(wordsWithLetters) {
                    var words = wordsWithLetters;
                    if (disallowedWords) {
                        words = _.difference(words, disallowedWords);
                    }
                    _.forEach(words, function(word) {
                        if (pattern.test(word)) {
                            var stripMatch = {
                                word: word,
                                dir: dir
                            };
                            stripMatch[dir] = stripdex;
                            stripMatch[notDir] = stripStr.search(/[a-z]/) - word.search(pattern);
                            stripMatches.push(stripMatch);
                        }
                    });
                    if (tileIndex === stripStrTrimmed.length - 1) {
                        resolve(stripMatches);
                    }
                });
            }
        });
    });
}

function getMatches(letters, disallowedWords, board) {
    return new Promise(function(resolve) {
        var matches = [];
        crawlBoard(board, function(boardRow, boardRowIndex) {
            getMatchesLoop(boardRow, boardRowIndex, 'row', letters, disallowedWords).then(function(loopResults) {
                var rowMatches = _.filter(loopResults, function(match) {
                    if (isMatchValid(match, board)) {
                        return true;
                    }
                    return false;
                });
                if (rowMatches.length) {
                    matches = matches.concat(rowMatches);
                }
            });
        }, function(boardColumn, boardColumnIndex) {
            getMatchesLoop(boardColumn, boardColumnIndex, 'col', letters, disallowedWords).then(function(loopResults) {
                var columnMatches = _.filter(loopResults, function(match) {
                    if (isMatchValid(match, board)) {
                        return true;
                    }
                    return false;
                });
                if (columnMatches.length) {
                    matches = matches.concat(columnMatches);
                }
                if (boardColumnIndex === board[0].length-1) {
                    resolve(matches);                    
                }
            });
        });
    });
}

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

function makeWordsWithLoop(trie, letters, prefix, words, resolve) {
    var newPrefix = '';
    var lastLeaf = true;
    _.forEach(_.uniq(letters), function(letter) {
        if (!!trie[letter]) {
            if (lastLeaf) {
                lastLeaf = false;
            }
            newPrefix = prefix + letter;
            if (trie[letter]['_']) {
                words.push(newPrefix);
            }
            makeWordsWithLoop(trie[letter], _.replace(letters, letter, ''), newPrefix, words, resolve);
        }
    });
    if (lastLeaf) {
        resolve(words);
    }
}

function makeWordsWith(letters) {
    return new Promise(function(resolve) {
        makeWordsWithLoop(trie, letters, '', [], resolve);
    });
}

function placeWord(oldBoard, match) {
    var board = _.cloneDeep(oldBoard);
    var word = match.word;
    var row = match.row;
    var col = match.col;
    var dir = match.dir;
    var wordLen = {row:0,col:0};
    wordLen[dir] = word.length;
    if (row < 0 || row + wordLen.col > board.length) {
        var newRow = _.map(Array(board[0].length), () => ' ');
        if (row < 0) {
            _.times(-row, () => board.unshift(_.clone(newRow)));
            row = 0;
        }
        if (row + wordLen.col > board.length) {
            _.times(row + wordLen.col - board.length, () => board.push(_.clone(newRow)));
        }
    }
    if (col < 0 || col + wordLen.row > board[0].length) {
        if (col < 0) {
            board = _.map(board, (boardRow) => _.map(Array(-col), () => ' ').concat(boardRow));
            col = 0;
        }
        if (col + wordLen.row > board[0].length) {
            board = _.map(board, (boardRow) => boardRow.concat(_.map(Array(col + wordLen.row - board[0].length), () => ' ')));
        }
    }
    board[row][col] = word[0];
    _.forEach(word.substring(1), function(letter) {
        if (dir === 'col') {
            row += 1;
        } else {
            col += 1;
        }
        board[row][col] = letter;
    });
    return board;
}

// TODO: move up to be alphabetical
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

function solveLoop(solveState) {
    var currentState = solveState.history[solveState.historyIndex];
    var currentMatch = currentState.matches[currentState.matchIndex];
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
    var newBoard = placeWord(currentState.board, currentMatch);
    if (!isBoardValid(newBoard, solveState.disallowedWords)) {
        currentState.matchIndex = currentState.matchIndex + 1;
        setTimeout(function() {
            solveLoop({
                disallowedWords: solveState.disallowedWords,
                history: solveState.history,
                historyIndex: solveState.historyIndex,
                solveResolve: solveState.solveResolve,
                progressCallback: solveState.progressCallback
            });
        });
        return;
    }
    var newLetters = getNewLetters(currentState.letters, currentState.board, newBoard, currentMatch);
    solveState.progressCallback(newBoard, newLetters);
    if (newLetters.length) {
        getMatches(newLetters, solveState.disallowedWords, newBoard).then(function(matches) {
            if (matches.length) {
                matches = _.reverse(_.sortBy(matches, (match) => match.word.length));
                solveState.history.push({
                    board: newBoard,
                    letters: newLetters,
                    matches: matches,
                    matchIndex: 0
                });
                setTimeout(function() {
                    solveLoop({
                        disallowedWords: solveState.disallowedWords,
                        history: solveState.history,
                        historyIndex: solveState.historyIndex + 1,
                        solveResolve: solveState.solveResolve,
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

function solve(letters, disallowedWords, progressCallback) {
    return new Promise(function(solveResolve) {
        letters = letters.toLowerCase();
        disallowedWords = _.map(disallowedWords, function(disallowedWord) {
            return disallowedWord.toLowerCase();
        });
        makeWordsWith(letters).then(function(words) {
            var matches;
            if (disallowedWords) {
                words = _.difference(words, disallowedWords);
            }
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
    });
}

window.solve = solve;
