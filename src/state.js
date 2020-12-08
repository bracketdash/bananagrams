class State {
  constructor(tray, board, columns) {
    this.board = board || new Map();
    this.columns = columns || 1;
    this.tray = tray;
  }

  getBoard() {
    const numRows = this.board.size ? Math.max(...this.board.keys()) : 0;
    let numColumns = 0;
    return [...Array(numRows).keys()].map((_, rowIndex) => {
      const row = this.board.get(rowIndex + 1);
      if (row) {
        const rowColumns = Math.max(numColumns, ...row.keys());
        if (rowColumns > numColumns) {
          numColumns = rowColumns;
        }
        const columns = Array(numColumns).fill(" ");
        row.forEach((col, colIndex) => {
          columns[colIndex - 1] = col;
        });
        return columns;
      } else {
        return Array(numColumns).fill(" ");
      }
    });
  }

  getPatterns(tiles) {
    const fullPattern = `.*${tiles.replace(/\s+/g, (m) => `.{${m.length}}`)}.*`;
    const moddedPatternTest = /[a-z]+[^a-z]+[a-z]+/;
    const loop = (fullPattern, patterns, leftTrim, rightTrim) => {
      let allDone = false;
      let needsLeftTrimIteration = false;
      let moddedPattern = fullPattern;
      [...Array(leftTrim).keys()].forEach(() => {
        if (moddedPatternTest.test(moddedPattern)) {
          moddedPattern = moddedPattern.replace(/^[^a-z]*[a-z]+/, "");
          moddedPattern = moddedPattern.replace(/^\.\{([0-9]*)\}/, function (_, captured) {
            const num = parseInt(captured);
            if (num < 2) {
              return "";
            }
            return ".{0," + (num - 1) + "}";
          });
        } else {
          allDone = true;
        }
      });
      [...Array(leftTrim).keys()].forEach(() => {
        if (moddedPatternTest.test(moddedPattern)) {
          moddedPattern = moddedPattern.replace(/[a-z]+[^a-z]*$/, "");
          moddedPattern = moddedPattern.replace(/\.\{([0-9]*)\}$/, function (_, captured) {
            const num = parseInt(captured);
            if (num < 2) {
              return "";
            }
            return ".{0," + (num - 1) + "}";
          });
        } else {
          needsLeftTrimIteration = true;
        }
      });
      if (leftTrim > 0) {
        moddedPattern = "^" + moddedPattern;
      }
      if (rightTrim > 0) {
        moddedPattern = moddedPattern + "$";
      }
      if (allDone) {
        return patterns;
      }
      if (needsLeftTrimIteration) {
        return loop(fullPattern, patterns, leftTrim + 1, 0);
      } else {
        patterns.push(moddedPattern);
      }
      return loop(fullPattern, patterns, leftTrim, rightTrim + 1);
    };
    return new RegExp(loop(fullPattern, [fullPattern], 0, 1).join("|"));
  }

  getSegments() {
    const columns = new Map();
    const segments = new Set();
    this.board.forEach((rowCols, row) => {
      rowCols.forEach((col, colKey) => {
        if (!columns.has(colKey)) {
          columns.set(colKey, new Map());
        }
        columns.get(colKey).set(row, col);
      });
      const tiles = [...Array(Math.max(...rowCols.keys())).keys()]
        .map((index) => {
          if (rowCols.has(index + 1)) {
            return rowCols.get(index + 1);
          } else {
            return " ";
          }
        })
        .join("");
      const patterns = this.getPatterns(tiles);
      segments.add({ row, col: 0, down: false, tiles, patterns });
    });
    columns.forEach((colRows, col) => {
      const tiles = [...Array(Math.max(...colRows.keys())).keys()]
        .map((_, index) => {
          if (colRows.has(index + 1)) {
            return colRows.get(index + 1);
          } else {
            return " ";
          }
        })
        .join("");
      const patterns = this.getPatterns(tiles);
      segments.add({ row: 0, col, down: true, tiles, patterns });
    });
    return segments;
  }
  
  // TODO: move `getStateAfterPlacement` to a separate file
  getStateAfterPlacement({ row, col, down, word }, dictionary) {
    const boardClone = new Map();
    let columnsClone = this.columns;
    let trayClone = this.tray;
    let error = false;
    let newRow = row;
    let newCol = col;
    let newColumns = this.columns;
    let rowsToAdd = 0;
    let colsToAdd = 0;
    if (row < 0) {
      rowsToAdd = -row;
      newRow = 0;
    }
    if (col < 0) {
      colsToAdd = -col;
      newCol = 0;
      newColumns += colsToAdd;
    }
    this.board.forEach((rowCols, rowKey) => {
      const cols = new Map();
      rowCols.forEach((col, colKey) => {
        cols.set(colsToAdd + colKey, col);
      });
      boardClone.set(rowsToAdd + rowKey, cols);
    });
    if (down) {
      word.split("").forEach((letter, index) => {
        if (error) {
          return;
        }
        if (!boardClone.has(newRow + index)) {
          boardClone.set(newRow + index, new Map());
        }
        const tileRow = boardClone.get(newRow + index);
        const originalValue = tileRow.get(newCol);
        if (originalValue) {
          if (originalValue !== letter) {
            error = true;
            return;
          }
        } else {
          let lastSpaceWasEmpty = false;
          const rowWords = [...Array(newColumns).keys()]
            .map((_, index) => {
              const cell = tileRow.get(index + 1);
              if (cell) {
                if (lastSpaceWasEmpty) {
                  lastSpaceWasEmpty = false;
                }
                return cell;
              }

              let result = " ";
              if (lastSpaceWasEmpty) {
                result = "";
              } else {
                lastSpaceWasEmpty = true;
              }
              return result;
            })
            .join("")
            .trim()
            .split(" ");
          rowWords.forEach((rowWord) => {
            if (!dictionary.isAWord(rowWord)) {
              error = true;
            }
          });
          if (error) {
            return;
          }
          trayClone = trayClone.replace(letter, "");
        }
        tileRow.set(newCol, letter);
      });
    } else {
      const tileRow = boardClone.get(row);
      word.split("").forEach((letter, index) => {
        if (error) {
          return;
        }
        const colPlusIndex = newCol + index;
        const originalValue = tileRow.get(colPlusIndex);
        if (originalValue) {
          if (originalValue !== letter) {
            error = true;
            return;
          }
        } else {
          const numRows = Math.max(...this.board.keys());
          let lastSpaceWasEmpty = false;
          const colWords = [...Array(numRows).keys()]
            .map((_, index) => {
              const tileRow = this.board.get(index + 1);
              const cell = tileRow.get(colPlusIndex);
              if (cell) {
                if (lastSpaceWasEmpty) {
                  lastSpaceWasEmpty = false;
                }
                return cell;
              }

              let result = " ";
              if (lastSpaceWasEmpty) {
                result = "";
              } else {
                lastSpaceWasEmpty = true;
              }
              return result;
            })
            .join("")
            .trim()
            .split(" ");
          colWords.forEach((colWord) => {
            if (!dictionary.isAWord(colWord)) {
              error = true;
            }
          });
          if (error) {
            return;
          }
          trayClone = trayClone.replace(letter, "");
        }
        tileRow.set(colPlusIndex, letter);
        if (colPlusIndex > columnsClone) {
          columnsClone = colPlusIndex;
        }
      });
    }
    if (error) {
      return false;
    }
    return new State(trayClone, boardClone, columnsClone);
  }

  getTray() {
    return this.tray;
  }

  isSolution() {
    return !this.tray;
  }
}

export const createState = (tray) => new State(tray);
