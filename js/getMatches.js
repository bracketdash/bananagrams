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
