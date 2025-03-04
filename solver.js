function crawlBoard(board, rowCallback, colCallback) {
  const numCols = board[0].length;
  const columns = Array.from({ length: numCols }, () => []);
  for (let rowIndex = 0; rowIndex < board.length; rowIndex++) {
    const boardRow = board[rowIndex];
    rowCallback(boardRow, rowIndex);
    for (let colIndex = 0; colIndex < boardRow.length; colIndex++) {
      columns[colIndex].push(boardRow[colIndex]);
    }
  }
  for (let colIndex = 0; colIndex < numCols; colIndex++) {
    colCallback(columns[colIndex], colIndex);
  }
}

function moddedPatternReplacer(_, captured) {
  const num = parseInt(captured, 10);
  return num < 2 ? "" : ".{0," + (num - 1) + "}";
}

const gplRegexA = /[a-z]+[^a-z]+[a-z]+/;
const gplRegexB = /^[^a-z]*[a-z]+/;
const gplRegexC = /^\.\{([0-9]*)\}/;
const gplRegexD = /[a-z]+[^a-z]*$/;
const gplRegexE = /\.\{([0-9]*)\}$/;

function getPatternLoop(fullPattern, patterns, leftTrim, rightTrim) {
  let allDone = false;
  let moddedPattern = fullPattern;
  let needsLeftTrimIteration = false;
  for (let i = 0; i < leftTrim; i++) {
    if (gplRegexA.test(moddedPattern)) {
      moddedPattern = moddedPattern
        .replace(gplRegexB, "")
        .replace(gplRegexC, moddedPatternReplacer);
    } else {
      allDone = true;
    }
  }
  for (let j = 0; j < rightTrim; j++) {
    if (gplRegexA.test(moddedPattern)) {
      moddedPattern = moddedPattern
        .replace(gplRegexD, "")
        .replace(gplRegexE, moddedPatternReplacer);
    } else if (!allDone && !needsLeftTrimIteration) {
      needsLeftTrimIteration = true;
    }
  }
  if (leftTrim > 0) {
    moddedPattern = "^" + moddedPattern;
  }
  if (rightTrim > 0) {
    moddedPattern += "$";
  }
  if (allDone) {
    return patterns;
  }
  if (needsLeftTrimIteration) {
    return getPatternLoop(fullPattern, patterns, leftTrim + 1, 0);
  } else {
    patterns.push(moddedPattern);
  }
  return getPatternLoop(fullPattern, patterns, leftTrim, rightTrim + 1);
}

const whitespaceRegex = /\s+/g;

function getPattern(stripArr) {
  const fullPattern =
    ".*" +
    stripArr
      .join("")
      .trim()
      .replace(whitespaceRegex, (match) => ".{" + match.length + "}") +
    ".*";
  return new RegExp(getPatternLoop(fullPattern, [fullPattern], 0, 1).join("|"));
}

function narrowWordsBy(wordlist, letters) {
  return wordlist.filter((word) => {
    let lettersLeft = letters;
    for (let i = 0; i < word.length; i++) {
      lettersLeft = lettersLeft.replace(word[i], "");
    }
    if (letters.length - lettersLeft.length != word.length) {
      return false;
    }
    return true;
  });
}

function getIndexOfWordInStripLoop(pattern, word, strip, index) {
  const wordLength = word.length;
  let spliced = [...strip];
  if (index === "first") {
    index = -wordLength + 1;
    for (let i = 0; i < strip.length; i++) {
      if (strip[i] === " ") {
        index += 1;
      } else {
        break;
      }
    }
  }
  if (index < 0) {
    spliced.splice(0, wordLength + index, ...word);
  } else {
    spliced.splice(index, wordLength, ...word);
  }
  const splicedStr = spliced.join("");
  if (pattern.test(splicedStr)) {
    if (splicedStr === strip.join("")) {
      return false;
    }
    return index;
  } else {
    return getIndexOfWordInStripLoop(pattern, word, strip, index + 1);
  }
}

function getMatchesLoop(
  strip,
  stripdex,
  dir,
  notDir,
  letters,
  wordlist,
  matches,
  callback
) {
  const stripStr = strip.join("");
  const stripStrTrimmed = stripStr.trim();
  if (!stripStrTrimmed) {
    return;
  }
  const pattern = getPattern(strip);
  const stripStrTrimmedLength = stripStrTrimmed.length;

  for (let i = 0; i < stripStrTrimmedLength; i++) {
    const tileOnBoard = stripStrTrimmed[i];
    if (tileOnBoard !== " ") {
      const words = narrowWordsBy(wordlist, letters + tileOnBoard);
      for (let j = 0; j < words.length; j++) {
        const word = words[j];
        if (pattern.test(word)) {
          const indexOfWordInStripLoop = getIndexOfWordInStripLoop(
            new RegExp(stripStr.replaceAll(" ", ".")),
            word.split(""),
            strip,
            "first"
          );
          if (indexOfWordInStripLoop !== false) {
            const stripMatch = { word, dir };
            stripMatch[dir] = stripdex;
            stripMatch[notDir] = indexOfWordInStripLoop;
            matches.push(stripMatch);
          }
        }
      }
      if (callback && i === stripStrTrimmedLength - 1) {
        callback();
      }
    }
  }
}

function calculatePoints(board, { row, col, dir, word }) {
  const wordLength = word.length;
  const rows = board.length;
  const cols = board[0].length;
  let points = 7;
  if (row > 0 && row < rows) {
    if (dir === "col" && row + wordLength < rows) {
      points -= 3;
    } else {
      points -= 1;
    }
  }
  if (col > 0 && col < cols) {
    if (dir === "row" && col + wordLength < cols) {
      points -= 3;
    } else {
      points -= 1;
    }
  }
  return points;
}

function getMatches(letters, board, wordlist, resolve) {
  const matches = [];
  crawlBoard(
    board,
    (boardRow, boardRowIndex) => {
      getMatchesLoop(
        boardRow,
        boardRowIndex,
        "row",
        "col",
        letters,
        wordlist,
        matches
      );
    },
    (boardColumn, boardColumnIndex) => {
      getMatchesLoop(
        boardColumn,
        boardColumnIndex,
        "col",
        "row",
        letters,
        wordlist,
        matches,
        () => {
          if (boardColumnIndex === board[0].length - 1) {
            resolve(
              matches.sort(
                (a, b) => calculatePoints(board, a) - calculatePoints(board, b)
              )
            );
          }
        }
      );
    }
  );
}

function hasWordInTrie(trie, chars) {
  let current = trie;
  for (const char of chars) {
    if (!(char in current)) {
      return false;
    }
    current = current[char];
  }
  return true;
}

function isStripValid(strip, trie, blacklist) {
  return strip
    .join("")
    .trim()
    .split(whitespaceRegex)
    .every(
      (word) =>
        word.length <= 1 ||
        (hasWordInTrie(trie, [...word, "_"]) && !blacklist.includes(word))
    );
}

function isBoardValid(board, trie, blacklist) {
  let valid = true;
  crawlBoard(
    board,
    (strip) => {
      if (!isStripValid(strip, trie, blacklist)) {
        valid = false;
      }
    },
    (strip) => {
      if (!isStripValid(strip, trie, blacklist)) {
        valid = false;
      }
    }
  );
  return valid;
}

function placeWord(oldBoard, { dir, word, row, col }) {
  const isVertical = dir === "col";
  const wordLength = word.length;
  let board = oldBoard.map((row) => [...row]);
  if (row < 0) {
    board.unshift(
      ...Array.from({ length: -row }, () => Array(board[0].length).fill(" "))
    );
    row = 0;
  }
  while (row + (isVertical ? wordLength : 0) > board.length) {
    board.push(Array(board[0].length).fill(" "));
  }
  if (col < 0) {
    board = board.map((row) => [...Array(-col).fill(" "), ...row]);
    col = 0;
  }
  while (col + (isVertical ? 0 : wordLength) > board[0].length) {
    board = board.map((row) => [
      ...row,
      ...Array(wordLength + col - row.length).fill(" "),
    ]);
  }
  for (let i = 0; i < wordLength; i++) {
    board[row][col] = word[i];
    if (isVertical) {
      row++;
    } else {
      col++;
    }
  }
  return board;
}

function getNewLetters(incomingLetters, oldBoard, newBoard, { dir, row, col }) {
  const isRow = dir === "row";
  const newStrip = isRow ? newBoard[row] : newBoard.map((row) => row[col]);
  const oldStrip = isRow ? oldBoard[row] : oldBoard.map((row) => row[col]);
  const letterSet = new Set(oldStrip);
  let newLetters = incomingLetters;
  for (const letter of newStrip) {
    if (!letterSet.has(letter)) {
      newLetters = newLetters.replace(letter, "");
    }
  }
  return newLetters;
}

// TODO: Continue optimizations from here down
function solveLoop(solveState) {
  var currentState = solveState.history[solveState.historyIndex];
  var currentMatch = currentState.matches[currentState.matchIndex];
  var newBoard;
  var newLetters;
  if (
    !solveState.callback({
      blacklist: solveState.blacklist,
      board: currentState.board,
      originalLetters: solveState.originalLetters,
      tray: currentState.letters,
    })
  ) {
    return;
  }
  if (!currentMatch) {
    if (solveState.historyIndex > 0) {
      solveState.historyIndex -= 1;
      solveState.history[solveState.historyIndex].matchIndex += 1;
      solveState.history = solveState.history.slice(0, -1);
      setTimeout(function () {
        solveLoop(solveState);
      });
    } else {
      solveState.callback({
        message: "No possible solution. Wait for a pull.",
        board: currentState.board,
        tray: currentState.letters,
        end: true,
      });
    }
    return;
  }
  newBoard = placeWord(currentState.board, currentMatch);
  newLetters = getNewLetters(
    currentState.letters,
    currentState.board,
    newBoard,
    currentMatch
  );
  if (!isBoardValid(newBoard, solveState.trie, solveState.blacklist)) {
    currentState.matchIndex += 1;
    setTimeout(function () {
      solveLoop(solveState);
    });
    return;
  }
  if (newLetters.length) {
    getMatches(newLetters, newBoard, solveState.words, function (matches) {
      if (matches.length) {
        solveState.history.push({
          board: newBoard,
          letters: newLetters,
          matches: matches,
          matchIndex: 0,
        });
        solveState.historyIndex += 1;
        setTimeout(function () {
          solveLoop(solveState);
        });
      } else {
        currentState.matchIndex = currentState.matchIndex + 1;
        setTimeout(function () {
          solveLoop(solveState);
        });
      }
    });
  } else {
    solveState.callback({
      message: "SOLVED!",
      board: newBoard,
      tray: "",
      end: true,
    });
  }
}

function makeWordsWithLoop(branch, letters, prefix, words, resolve) {
  var newPrefix = "";
  var lastLeaf = true;
  for (const letter of [...new Set(letters)]) {
    if (branch[letter]) {
      if (lastLeaf) {
        lastLeaf = false;
      }
      newPrefix = prefix + letter;
      if (branch[letter]["_"]) {
        words.push(newPrefix);
      }
      makeWordsWithLoop(
        branch[letter],
        letters.replace(letter, ""),
        newPrefix,
        words,
        resolve
      );
    }
  }
  if (lastLeaf) {
    resolve(words);
  }
}

function makeWordsWith(letters, trie, disallowedWords) {
  var words = [];
  makeWordsWithLoop(trie, letters, "", [], function (result) {
    words = result;
  });
  if (disallowedWords) {
    words = words.filter((word) => !disallowedWords.includes(word));
  }
  return words;
}

function solve(incomingLetters, blacklist, trie, callback) {
  var board = [[]];
  var letters = incomingLetters.toLowerCase();
  var words = makeWordsWith(
    letters,
    trie,
    blacklist.map((disallowedWord) => disallowedWord.toLowerCase())
  );
  if (words.length) {
    solveLoop({
      blacklist: blacklist,
      callback: callback,
      history: [
        {
          board: board,
          letters: letters,
          matches: words.map((word) => ({
            word: word,
            dir: "row",
            row: 0,
            col: 0,
          })),
          matchIndex: 0,
        },
      ],
      historyIndex: 0,
      originalLetters: incomingLetters,
      trie: trie,
      words: words,
    });
  } else {
    callback({
      message: "No possible solution. Wait for a pull.",
      board: board,
      tray: letters,
      end: true,
    });
  }
}
