function getMatches(letters, disallowedWords, board, trie, resolve) {
    var matches = [];
    crawlBoard(board, function(boardRow, boardRowIndex) {
        getMatchesLoop(
            boardRow, boardRowIndex, 'row',
            letters, disallowedWords, trie,
            function(rowMatches) {
                if (rowMatches.length) {
                    matches = matches.concat(rowMatches);
                }
            }
        );
    }, function(boardColumn, boardColumnIndex) {
        getMatchesLoop(
            boardColumn, boardColumnIndex, 'col',
            letters, disallowedWords, trie,
            function(columnMatches) {
                if (columnMatches.length) {
                    matches = matches.concat(columnMatches);
                }
                if (boardColumnIndex === board[0].length-1) {
                    resolve(matches);
                }
            }
        );
    });
}

// NEW BUG - "eye" matching against "eye" with an index of -2, creating "eyeye" (invalid)

function getMatchesLoop(strip, stripdex, dir, letters, disallowedWords, trie, resolve) {
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
            var words = makeWordsWith(letters + tileOnBoard, trie, disallowedWords);
            _.forEach(words, function(word) {
                if (pattern.test(word)) {
                    var stripMatch = {
                        word: word,
                        dir: dir
                    };
                    stripMatch[dir] = stripdex;
                    stripMatch[notDir] = getIndexOfWordInStripLoop(new RegExp(stripStr.replace(/\s/g, '.')), word.split(''), strip, 'first');
                    stripMatches.push(stripMatch);
                }
            });
            if (tileIndex === stripStrTrimmed.length - 1) {
                resolve(stripMatches);
            }
        }
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
    if (index > 20) {
        console.log('Couldn\'t find "' + word.join('') + '" in "' + strip.join('') + '"');
        return 0;
    }
    if (pattern.test(spliced.join(''))) {
        return index;
    } else {
        return getIndexOfWordInStripLoop(pattern, word, strip, index+1);
    }
}
