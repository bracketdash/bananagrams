function crawlBoard(board, rowCallback, colCallback) {
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
    });
}

function getPatternLoop(fullPattern, patterns, leftTrim, rightTrim) {
    var allDone = false;
    var needsLeftTrimIteration = false;
    var moddedPattern = fullPattern;
    _.times(leftTrim, function() {
        if (/[a-z]+[^a-z]+[a-z]+/.test(moddedPattern)) {
            moddedPattern = moddedPattern.replace(/^[^a-z]*[a-z]+/, '');
            moddedPattern = moddedPattern.replace(/^\.\{([0-9]*)\}/, function(match, captured) {
                var num = parseInt(captured);
                if (num < 2) {
                    return '';
                }
                return '.{0,' + (num-1) + '}';
            });
        } else {
            allDone = true;
        }
    });
    _.times(rightTrim, function() {
        if (/[a-z]+[^a-z]+[a-z]+/.test(moddedPattern)) {
            moddedPattern = moddedPattern.replace(/[a-z]+[^a-z]*$/, '');
            moddedPattern = moddedPattern.replace(/\.\{([0-9]*)\}$/, function(match, captured) {
                var num = parseInt(captured);
                if (num < 2) {
                    return '';
                }
                return '.{0,' + (num-1) + '}';
            });
        } else {
            needsLeftTrimIteration = true;
        }
    });
    if (leftTrim > 0) {
        moddedPattern = '^' + moddedPattern;
    }
    if (rightTrim > 0) {
        moddedPattern = moddedPattern + '$';
    }
    if (allDone) {
        return patterns;
    }
    if (needsLeftTrimIteration) {
        return getPatternLoop(fullPattern, patterns, leftTrim+1, 0);
    } else {
        patterns.push(moddedPattern);
    }
    return getPatternLoop(fullPattern, patterns, leftTrim, rightTrim+1);
}

function getPattern(stripArr) {
    var fullPattern = '.*' + _.trim(stripArr.join('')).replace(/\s+/g, function(match) {
        return '.{' + match.length + '}';
    }) + '.*';
    return new RegExp(getPatternLoop(fullPattern, [fullPattern], 0, 1).join('|'));
}

function narrowWordsBy(wordlist, letters) {
    return _.filter(wordlist, function(word) {
       var lettersLeft = letters;
        _.forEach(word.split(''), function(letter) {
            lettersLeft = lettersLeft.replace(letter, '');
        });
        if (letters.length - lettersLeft.length != word.length) {
            return false;
        }
        return true;
    });
}

function getIndexOfWordInStripLoop(pattern, word, strip, index) {
    var spliced = _.clone(strip);
    if (index === 'first') {
        index = -word.length+1;
        _.some(strip, function(tile) {
            if (tile === ' ') {
                index += 1;
            } else {
                return true;
            }
        });
    }
    if (index < 0) {
        Array.prototype.splice.apply(spliced, [0, word.length+index].concat(word));
    } else {
        Array.prototype.splice.apply(spliced, [index, word.length].concat(word));
    }
    if (pattern.test(spliced.join(''))) {
        if (spliced.join('') === strip.join('')) {
            return false;
        }
        return index;
    } else {
        return getIndexOfWordInStripLoop(pattern, word, strip, index+1);
    }
}

function getMatchesLoop(strip, stripdex, dir, notDir, letters, wordlist, matches, callback) {
    var pattern;
    var stripStr = strip.join('');
    var stripStrTrimmed = _.trim(stripStr);
    if (!stripStrTrimmed) {
        return;
    }
    pattern = getPattern(strip);
    _.forEach(stripStrTrimmed.split(''), function(tileOnBoard, tileIndex) {
        if (tileOnBoard !== ' ') {
            var words = narrowWordsBy(wordlist, letters + tileOnBoard);
            _.forEach(words, function(word) {
                if (pattern.test(word)) {
                    var stripMatch = {
                        word: word,
                        dir: dir
                    };
                    stripMatch[dir] = stripdex;
                    stripMatch[notDir] = getIndexOfWordInStripLoop(new RegExp(stripStr.replace(/\s/g, '.')), word.split(''), strip, 'first');
                    if (stripMatch[notDir] !== false) {
                        matches.push(stripMatch);
                    }
                }
            });
            if (!!callback && tileIndex === stripStrTrimmed.length - 1) {
                callback();
            }
        }
    });
}

function getMatches(letters, board, wordlist, resolve) {
    var matches = [];
    crawlBoard(board, function(boardRow, boardRowIndex) {
        getMatchesLoop(boardRow, boardRowIndex, 'row', 'col', letters, wordlist, matches);
    }, function(boardColumn, boardColumnIndex) {
        getMatchesLoop(boardColumn, boardColumnIndex, 'col', 'row', letters, wordlist, matches, function() {
            if (boardColumnIndex === board[0].length-1) {
                matches = _.sortBy(matches, function(match) {
                    var points = 100;
                    if (match.row > 0 && match.row < board.length) {
                        points -= 1;
                        if (match.dir === 'col' && match.row + match.word.length < board.length) {
                            points -= 2;
                        }
                    }
                    if (match.col > 0 && match.col < board[0].length) {
                        points -= 1;
                        if (match.dir === 'row' && match.col + match.word.length < board[0].length) {
                            points -= 2;
                        }
                    }
                    return points;
                });
                resolve(matches);
            }
        });
    });
}

function isBoardValid(board, trie, blacklist) {
    var valid = true;
    crawlBoard(board, function(boardRow) {
        var words = _.split(_.trim(boardRow.join('')), /\s+/);
        _.forEach(words, function(word) {
            if (word.length > 1 && (!_.has(trie, (word + '_').split('')) || _.indexOf(blacklist, word) > -1)) {
                valid = false;
            }
        });
    }, function(boardColumn) {
        var words = _.split(_.trim(boardColumn.join('')), /\s+/);
        _.forEach(words, function(word) {
            if (word.length > 1 && (!_.has(trie, (word + '_').split('')) || _.indexOf(blacklist, word) > -1)) {
                valid = false;
            }
        });
    });
    return valid;
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

function makeWordsWithLoop(branch, letters, prefix, words, resolve) {
    var newPrefix = '';
    var lastLeaf = true;
    _.forEach(_.uniq(letters), function(letter) {
        if (!!branch[letter]) {
            if (lastLeaf) {
                lastLeaf = false;
            }
            newPrefix = prefix + letter;
            if (branch[letter]['_']) {
                words.push(newPrefix);
            }
            makeWordsWithLoop(branch[letter], _.replace(letters, letter, ''), newPrefix, words, resolve);
        }
    });
    if (lastLeaf) {
        resolve(words);
    }
}

function makeWordsWith(letters, trie, disallowedWords) {
    var words = [];
    makeWordsWithLoop(trie, letters, '', [], function(result) {
        words = result;
    });
    if (disallowedWords) {
        words = _.difference(words, disallowedWords);
    }
    return words;
}

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
                    return { word: word, dir: 'row', row: 0, col: 0 };
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
