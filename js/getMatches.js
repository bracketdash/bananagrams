function getMatches(letters, board, wordlist, resolve) {
    var matches = [];
    crawlBoard(board, function(boardRow, boardRowIndex) {
        getMatchesLoop(boardRow, boardRowIndex, 'row', letters, wordlist, function(rowMatches) {
            if (rowMatches.length) {
                matches = matches.concat(rowMatches);
            }
        });
    }, function(boardColumn, boardColumnIndex) {
        getMatchesLoop(boardColumn, boardColumnIndex, 'col', letters, wordlist, function(columnMatches) {
            if (columnMatches.length) {
                matches = matches.concat(columnMatches);
            }
            if (boardColumnIndex === board[0].length-1) {
                resolve(matches);
            }
        });
    });
}

function getMatchesLoop(strip, stripdex, dir, letters, wordlist, resolve) {
    var notDir = dir === 'row' ? 'col' : 'row';
    var stripStr = strip.join('');
    var stripStrTrimmed = _.trim(stripStr);
    if (!stripStrTrimmed) {
        return [];
    }
    var pattern = getPattern(strip);
    var stripMatches = [];
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
                        stripMatches.push(stripMatch);
                    }
                }
            });
            if (tileIndex === stripStrTrimmed.length - 1) {
                resolve(stripMatches);
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
