function getPatternsLoop(fullPattern, patterns, leftTrim, rightTrim) {
    var allDone = false;
    var needsLeftTrimIteration = false;
    var moddedPattern = fullPattern;
    _.times(leftTrim, function() {
        if (/[a-z][^a-z]*[a-z]/.test(moddedPattern)) {
            moddedPattern = moddedPattern.replace(/^[^a-z]*[a-z]/, '').replace(/^\.\{([0-9]*)\}/, function(match, captured) {
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
        if (/[a-z][^a-z]*[a-z]/.test(moddedPattern)) {
            moddedPattern = moddedPattern.replace(/[a-z][^a-z]*$/, '').replace(/\.\{([0-9]*)\}$/, function(match, captured) {
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
    if (allDone) {
        return patterns;
    }
    if (needsLeftTrimIteration) {
        return getPatternsLoop(fullPattern, patterns, leftTrim+1, 0);
    } else {
        patterns.push(moddedPattern);
    }
    return getPatternsLoop(fullPattern, patterns, leftTrim, rightTrim+1);
}

function getPatterns(stripArr) {
    var fullPattern = '.*' + _.trim(stripArr.join('')).replace(/\s+/g, function(match) {
        return '.{' + match.length + '}';
    }) + '.*';
    return getPatternsLoop(fullPattern, [fullPattern], 0, 1);
}
