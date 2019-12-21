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
                    stripMatch[notDir] = stripStr.search(/[a-z]/) - word.search(pattern);
                    // TODO: the notDir assignment is incomplete and broken
                    // we are looking for where in the strip the word starts...
                    stripMatches.push(stripMatch);
                }
            });
            if (tileIndex === stripStrTrimmed.length - 1) {
                resolve(stripMatches);
            }
        }
    });
}
