function decompress(compressed) {
  let decompressed = compressed;
  decompressed = decompressed.replace(/([A-Z])/g, (c) => c.toLowerCase() + "$");
  decompressed = decompressed.replace(/([a-z])/g, '"$1":{');
  decompressed = decompressed.replace(/([0-9]+)/g, "$1,").slice(0, -1);
  decompressed = decompressed.replace(/\$([^0-9])/g, "$,$1");
  const getEndBrackets = (c) => "}".repeat(parseInt(c, 10));
  decompressed = decompressed.replace(/([0-9]+)/g, getEndBrackets);
  decompressed = decompressed.replaceAll("$", '"$":1');
  return JSON.parse(decompressed);
}

const trie = decompress(compressedTrie);

// Cancellation flag checked by long-running functions (cooperative cancel).
// Worker sets this via globalThis.__solverCancelled = true when a cancel
// request is received. Defaults to false.
if (typeof globalThis.__solverCancelled === 'undefined') {
  globalThis.__solverCancelled = false;
}

// Caches to improve performance and avoid repeated work during a single solve
const patternCache = new Map(); // stripKey -> RegExp
const narrowCache = new Map(); // sortedLettersKey -> filtered words array
const wordCountCache = new Map(); // word -> {counts: Uint8Array(26), len: number}
const prunedCache = new Map(); // lettersKey|stripKey -> filtered words respecting strip

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
  const stripKey = stripArr.join("");
  if (patternCache.has(stripKey)) return patternCache.get(stripKey);

  const fullPattern =
    ".*" +
    stripArr
      .join("")
      .trim()
      .replace(whitespaceRegex, (match) => ".{" + match.length + "}") +
    ".*";
  const regex = new RegExp(getPatternLoop(fullPattern, [fullPattern], 0, 1).join("|"));
  patternCache.set(stripKey, regex);
  return regex;
}

function narrowWordsBy(wordlist, letters) {
  // Normalize letters key (order-independent) so caching is effective.
  const key = letters.split("").sort().join("");
  if (narrowCache.has(key)) return narrowCache.get(key);

  const lettersCounts = getLetterCounts(letters);

  const filtered = wordlist.filter((word) => {
    let meta = wordCountCache.get(word);
    if (!meta) {
      const counts = getLetterCounts(word);
      meta = { counts, len: word.length };
      wordCountCache.set(word, meta);
    }
    if (meta.len > letters.length) return false;
    // Check counts: every letter in word must be <= available letters
    for (let i = 0; i < 26; i++) {
      if (meta.counts[i] > lettersCounts[i]) return false;
    }
    return true;
  });

  narrowCache.set(key, filtered);
  return filtered;
}

function getLetterCounts(s) {
  const counts = new Uint8Array(26);
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i) - 97;
    if (c >= 0 && c < 26) counts[c]++;
  }
  return counts;
}

function getIndexOfWordInStripLoop(pattern, word, strip, index) {
  const wordLength = word.length;
  // Convert recursive search into an iterative one so it always terminates.
  // Determine start index when "first" is requested: align the word to the
  // first non-space in the strip (keeping same behavior as before).
  let startIndex;
  if (index === "first") {
    startIndex = -wordLength + 1;
    for (let i = 0; i < strip.length; i++) {
      if (strip[i] === " ") {
        startIndex += 1;
      } else {
        break;
      }
    }
  } else {
    startIndex = index;
  }

  const maxIndex = strip.length; // placing word at or beyond this will append
  const stripJoined = strip.join("");
  for (let i = startIndex; i <= maxIndex; i++) {
    let spliced = [...strip];
    if (i < 0) {
      // negative i: replace from 0 up to wordLength + i
      spliced.splice(0, wordLength + i, ...word);
    } else {
      spliced.splice(i, wordLength, ...word);
    }
    const splicedStr = spliced.join("");
    if (pattern.test(splicedStr)) {
      // If nothing changed compared to the original strip, treat as no-op
      if (splicedStr === stripJoined) {
        return false;
      }
      return i;
    }
  }
  // Not found in any valid placement
  return false;
}

function getMatchesLoop(
  strip,
  stripdex,
  dir,
  notDir,
  letters,
  wordlist,
  matches,
  trieArg = trie,
  blacklistArg = [],
  callback
) {
  const stripStr = strip.join("");
  const stripStrTrimmed = stripStr.trim();
  if (!stripStrTrimmed) {
    return;
  }
  const pattern = getPattern(strip);
  const stripStrTrimmedLength = stripStrTrimmed.length;
  // reuse a simple placement regex for checking placements (dot for spaces)
  const placementRegex = new RegExp(stripStr.replaceAll(" ", "."));

  for (let i = 0; i < stripStrTrimmedLength; i++) {
    if (globalThis.__solverCancelled) return;
    const tileOnBoard = stripStrTrimmed[i];
    if (tileOnBoard !== " ") {
      // Use the trie to generate only words buildable from available letters
      // (letters + tileOnBoard). Cache results per sorted-letters key to
      // avoid recomputation within a solve.
      const lettersForThis = letters + tileOnBoard;
      // Generate candidate words pruned by the strip so incompatible prefixes
      // are not explored. makeWordsWithPruned uses its own cache.
      const words = makeWordsWithPruned(lettersForThis, trieArg, blacklistArg, strip);
      for (let j = 0; j < words.length; j++) {
        if (globalThis.__solverCancelled) return;
        const word = words[j];
        if (pattern.test(word)) {
          const indexOfWordInStripLoop = getIndexOfWordInStripLoop(
            placementRegex,
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

function getMatches(letters, board, wordlist, resolve, trieArg = trie, blacklistArg = []) {
  const matches = [];
  // Clear per-solve narrow cache because cached results depend on the provided
  // wordlist and available letters; avoid returning words from a previous run.
  narrowCache.clear();
  // We'll pass trieArg and blacklistArg through to getMatchesLoop via closure.
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
        matches,
        trieArg,
        blacklistArg
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
        trieArg,
        blacklistArg,
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

// Validate a single strip (row or column). We allow single-letter segments
// only when they are part of a perpendicular word of length >= 2. The
// optional `context` object should be provided when called from
// `isBoardValid` and contains { board, dir, index } where `dir` is either
// 'row' or 'col' and `index` is the strip index in that orientation.
function isStripValid(strip, trie, blacklist, context) {
  const board = context && context.board;
  const dir = context && context.dir; // 'row' or 'col'
  const idx = context && typeof context.index === 'number' ? context.index : null;

  // Walk the strip and validate each contiguous word segment, but keep
  // track of positions so we can check perpendicular words for single
  // letter segments.
  for (let i = 0; i < strip.length; ) {
    if (strip[i] === " ") {
      i++;
      continue;
    }
    // start of a word
    const start = i;
    while (i < strip.length && strip[i] !== " ") i++;
    const end = i - 1;
    const word = strip.slice(start, end + 1).join("");
    if (word.length >= 2) {
      if (!hasWordInTrie(trie, [...word, "$"]) || blacklist.includes(word)) return false;
    } else {
      // Single-letter segment: allow only if it is part of a perpendicular
      // word of length >= 2. If we don't have board/context info, treat
      // single-letter as invalid (conservative).
      let perpLen = 1;
      if (board && dir && idx !== null) {
        if (dir === "row") {
          // perpendicular is column at column index = start..end (only one)
          const colIndex = start;
          // count contiguous letters vertically including this row (idx)
          let r = idx - 1;
          while (r >= 0 && board[r][colIndex] !== " ") {
            perpLen++;
            r--;
          }
          r = idx + 1;
          while (r < board.length && board[r][colIndex] !== " ") {
            perpLen++;
            r++;
          }
        } else if (dir === "col") {
          // perpendicular is row at row index = start..end (only one)
          const rowIndex = start;
          let c = idx - 1;
          while (c >= 0 && board[rowIndex][c] !== " ") {
            perpLen++;
            c--;
          }
          c = idx + 1;
          while (c < board[0].length && board[rowIndex][c] !== " ") {
            perpLen++;
            c++;
          }
        }
      }
      if (perpLen < 2) return false;
      // Additionally, ensure the perpendicular word (if any) itself is valid
      // by checking trie membership when possible. This is conservative but
      // keeps the board valid.
      if (board && dir && idx !== null && perpLen >= 2) {
        let perpWord = "";
        if (dir === "row") {
          const colIndex = start;
          let c = 0;
          // find top of perpendicular word
          let r = idx;
          while (r > 0 && board[r - 1][colIndex] !== " ") r--;
          // collect letters downward
          while (r < board.length && board[r][colIndex] !== " ") {
            perpWord += board[r][colIndex];
            r++;
          }
        } else if (dir === "col") {
          const rowIndex = start;
          let c = 0;
          // find leftmost of perpendicular word
          let col = idx;
          while (col > 0 && board[rowIndex][col - 1] !== " ") col--;
          // collect letters rightward
          while (col < board[0].length && board[rowIndex][col] !== " ") {
            perpWord += board[rowIndex][col];
            col++;
          }
        }
        if (perpWord && (!hasWordInTrie(trie, [...perpWord, "$"]) || blacklist.includes(perpWord))) return false;
      }
    }
  }
  return true;
}

function isBoardValid(board, trie, blacklist) {
  let valid = true;
  crawlBoard(
    board,
    (strip, rowIndex) => {
      if (!isStripValid(strip, trie, blacklist, { board, dir: 'row', index: rowIndex })) {
        valid = false;
      }
    },
    (strip, colIndex) => {
      if (!isStripValid(strip, trie, blacklist, { board, dir: 'col', index: colIndex })) {
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

function makeWordsWithLoop(branch, letters, prefix, words, resolve) {
  let lastLeaf = true;
  for (const letter of [...new Set(letters)]) {
    if (branch[letter]) {
      if (lastLeaf) {
        lastLeaf = false;
      }
      const newPrefix = prefix + letter;
      if (branch[letter]["$"]) {
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
  let words = [];
  makeWordsWithLoop(trie, letters, "", [], (result) => {
    words = result;
  });
  return disallowedWords
    ? words.filter((word) => !disallowedWords.includes(word))
    : words;
}

// Faster trie traversal using letter counts (avoids string.replace and
// minimizes allocations). This generates all words from `trie` that can be
// built from `letters` (each letter used at most as many times as provided).
function makeWordsWithFast(letters, trie, disallowedWords) {
  const counts = getLetterCounts(letters);
  const results = [];

  function dfs(node, prefix) {
    // Cooperative cancellation check.
    if (globalThis.__solverCancelled) return;
    if (node['$']) results.push(prefix);
    for (const ch in node) {
      if (globalThis.__solverCancelled) return;
      if (ch === '$') continue;
      const idx = ch.charCodeAt(0) - 97;
      if (idx < 0 || idx >= 26) continue;
      if (counts[idx] > 0) {
        counts[idx]--;
        dfs(node[ch], prefix + ch);
        counts[idx]++;
      }
    }
  }

  dfs(trie, "");
  return disallowedWords ? results.filter((w) => !disallowedWords.includes(w)) : results;
}

// Generate words buildable from `letters` that are compatible with at least
// one placement on `strip` (i.e., their prefixes don't conflict with fixed
// letters on the strip). This prunes trie branches early.
function makeWordsWithPruned(letters, trie, disallowedWords, strip) {
  const counts = getLetterCounts(letters);
  const stripKey = strip.join("");
  const lettersKey = letters.split("").sort().join("");
  const cacheKey = lettersKey + "|" + stripKey;
  if (prunedCache.has(cacheKey)) return prunedCache.get(cacheKey);

  const results = [];

  function prefixCompatible(prefix) {
    // For a given prefix, determine if there exists a placement index i
    // such that for all j in prefix, strip[i+j] is either a space or equals prefix[j].
    const pLen = prefix.length;
    const minI = -pLen + 1;
    const maxI = strip.length - 1;
    for (let i = minI; i <= maxI; i++) {
      let ok = true;
      for (let j = 0; j < pLen; j++) {
        const idx = i + j;
        if (idx >= 0 && idx < strip.length) {
          const ch = strip[idx];
          if (ch !== ' ' && ch !== prefix[j]) {
            ok = false;
            break;
          }
        }
      }
      if (ok) return true;
    }
    return false;
  }

  function dfs(node, prefix) {
    if (globalThis.__solverCancelled) return;
    // Early prune: if current prefix cannot fit anywhere on the strip, stop.
    if (prefix && !prefixCompatible(prefix)) return;
    if (node['$']) results.push(prefix);
    for (const ch in node) {
      if (globalThis.__solverCancelled) return;
      if (ch === '$') continue;
      const idx = ch.charCodeAt(0) - 97;
      if (idx < 0 || idx >= 26) continue;
      if (counts[idx] > 0) {
        counts[idx]--;
        dfs(node[ch], prefix + ch);
        counts[idx]++;
      }
    }
  }

  dfs(trie, "");
  const filtered = disallowedWords ? results.filter((w) => !disallowedWords.includes(w)) : results;
  prunedCache.set(cacheKey, filtered);
  return filtered;
}

function solveLoop(solveState) {
  const currentState = solveState.history[solveState.historyIndex];
  const currentMatch = currentState.matches[currentState.matchIndex];
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
      setTimeout(() => {
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
  const newBoard = placeWord(currentState.board, currentMatch);
  const newLetters = getNewLetters(
    currentState.letters,
    currentState.board,
    newBoard,
    currentMatch
  );
  if (!isBoardValid(newBoard, solveState.trie, solveState.blacklist)) {
    currentState.matchIndex += 1;
    setTimeout(() => {
      solveLoop(solveState);
    });
    return;
  }
  if (newLetters.length) {
    getMatches(
      newLetters,
      newBoard,
      solveState.words,
      (matches) => {
        if (matches.length) {
          solveState.history.push({
            board: newBoard,
            letters: newLetters,
            matches: matches,
            matchIndex: 0,
          });
          solveState.historyIndex += 1;
          setTimeout(() => {
            solveLoop(solveState);
          });
        } else {
          currentState.matchIndex = currentState.matchIndex + 1;
          setTimeout(() => {
            solveLoop(solveState);
          });
        }
      },
      solveState.trie,
      solveState.blacklist
    );
  } else {
    solveState.callback({
      message: "SOLVED!",
      board: newBoard,
      tray: "",
      end: true,
    });
  }
}

function solve(letters, blacklist, trie, callback) {
  const board = [[]];
  const words = makeWordsWith(letters, trie, blacklist);
  if (words.length) {
    solveLoop({
      blacklist,
      callback,
      history: [
        {
          board,
          letters,
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
      originalLetters: letters,
      trie,
      words,
    });
  } else {
    callback({
      message: "No possible solution. Wait for a pull.",
      board,
      tray: letters,
      end: true,
    });
  }
}
