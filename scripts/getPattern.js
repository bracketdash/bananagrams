function getPattern(stripArr) {
    var fullPattern = '.*' + _.trim(stripArr.join('')).replace(/\s+/g, function(match) {
        return '.{' + match.length + '}';
    }) + '.*';
    return new RegExp(getPatternLoop(fullPattern, [fullPattern], 0, 1).join('|'));
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
