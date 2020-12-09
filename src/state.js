import { performPlacement } from "./placer.js";

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
  
  getStateAfterPlacement(placement, dictionary) {
    const config = performPlacement(this, placement, dictionary);
    if (!config) {
      return false;
    }
    const { trayClone, boardClone, columnsClone } = config;
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
