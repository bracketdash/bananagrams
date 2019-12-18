function getMatches(letters, disallowedWords, board, trie, resolve) {
    var matches = [];
    crawlBoard(board, function(boardRow, boardRowIndex) {
        getMatchesLoop(
            boardRow, boardRowIndex, 'row',
            letters, disallowedWords, trie,
            function(loopResults) {
                var rowMatches = _.filter(loopResults, function(match) {
                    if (isMatchValid(match, boardRow)) {
                        return true;
                    }
                    return false;
                });
                if (rowMatches.length) {
                    matches = matches.concat(rowMatches);
                }
            }
        );
    }, function(boardColumn, boardColumnIndex) {
        getMatchesLoop(
            boardColumn, boardColumnIndex, 'col',
            letters, disallowedWords, trie,
            function(loopResults) {
                var columnMatches = _.filter(loopResults, function(match) {
                    if (isMatchValid(match, boardColumn)) {
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
    var pattern = new RegExp('.*' + stripStrTrimmed.replace(/\s/g, '.') + '.*').toPartialMatchRegex();
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
                    stripMatches.push(stripMatch);
                }
            });
            if (tileIndex === stripStrTrimmed.length - 1) {
                resolve(stripMatches);
            }
        }
    });
}

// https://stackoverflow.com/questions/22483214/regex-check-if-input-still-has-chances-to-become-matching/41580048#41580048
RegExp.prototype.toPartialMatchRegex = function() {
    "use strict";
    
    var re = this,
        source = this.source,
        i = 0;
    
    function process () {
        var result = "",
            tmp;

        function appendRaw(nbChars) {
            result += source.substr(i, nbChars);
            i += nbChars;
        };
        
        function appendOptional(nbChars) {
            result += "(?:" + source.substr(i, nbChars) + "|$)";
            i += nbChars;
        };

        while (i < source.length) {
            switch (source[i])
            {
                case "\\":
                    switch (source[i + 1])
                    {
                        case "c":
                            appendOptional(3);
                            break;
                            
                        case "x":
                            appendOptional(4);
                            break;
                            
                        case "u":
                            if (re.unicode) {
                                if (source[i + 2] === "{") {
                                    appendOptional(source.indexOf("}", i) - i + 1);
                                } else {
                                    appendOptional(6);
                                }
                            } else {
                                appendOptional(2);
                            }
                            break;
                            
                        default:
                            appendOptional(2);
                            break;
                    }
                    break;
                    
                case "[":
                    tmp = /\[(?:\\.|.)*?\]/g;
                    tmp.lastIndex = i;
                    tmp = tmp.exec(source);
                    appendOptional(tmp[0].length);
                    break;
                    
                case "|":
                case "^":
                case "$":
                case "*":
                case "+":
                case "?":
                    appendRaw(1);
                    break;
                    
                case "{":
                    tmp = /\{\d+,?\d*\}/g;
                    tmp.lastIndex = i;
                    tmp = tmp.exec(source);
                    if (tmp) {
                        appendRaw(tmp[0].length);
                    } else {
                        appendOptional(1);
                    }
                    break;
                    
                case "(":
                    if (source[i + 1] == "?") {
                        switch (source[i + 2])
                        {
                            case ":":
                                result += "(?:";
                                i += 3;
                                result += process() + "|$)";
                                break;
                                
                            case "=":
                                result += "(?=";
                                i += 3;
                                result += process() + ")";
                                break;
                                
                            case "!":
                                tmp = i;
                                i += 3;
                                process();
                                result += source.substr(tmp, i - tmp);
                                break;
                        }
                    } else {
                        appendRaw(1);
                        result += process() + "|$)";
                    }
                    break;
                    
                case ")":
                    ++i;
                    return result;
                    
                default:
                    appendOptional(1);
                    break;
            }
        }
        
        return result;
    }
    
    return new RegExp(process(), this.flags);
};
