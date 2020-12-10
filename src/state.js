import { performPlacement } from "./placer.js";

class State {
  constructor(tray, board, columns) {
    this.board = board || new Map();
    this.columns = columns || 1;
    this.tray = tray;
  }

  getBoard() {
    const numRows = this.board.size ? Math.max(...this.board.keys()) + 1 : 1;
    let numColumns = 1;
    this.board.forEach((rowCols) => {
      const rowNumCols = Math.max(...rowCols.keys()) + 1;
      if (rowNumCols > numColumns) {
        numColumns = rowNumCols;
      }
    });
    return [...Array(numRows).keys()].map((rowIndex) => {
      const row = this.board.get(rowIndex);
      const columns = Array(numColumns).fill(" ");
      if (row) {
        row.forEach((col, colIndex) => {
          columns[colIndex] = col;
        });
      }
      return columns;
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
      [...Array(rightTrim).keys()].forEach(() => {
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
    return new Promise(async (resolve) => {
      setTimeout(() => {
        resolve(new RegExp(loop(fullPattern, [fullPattern], 0, 1).join("|")));
      });
    });
  }

  async getSegments() {
    const columns = new Map();
    const segments = new Set();
    await Promise.all([...this.board].map(async ([row, rowCols]) => {
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
      if (tiles) {
        const patterns = await this.getPatterns(tiles);
        segments.add({ row, col: 0, down: false, tiles, patterns });
      }
    }));
    await Promise.all([...columns].map(async ([col, colRows]) => {
      const tiles = [...Array(Math.max(...colRows.keys())).keys()]
        .map((_, index) => {
          if (colRows.has(index + 1)) {
            return colRows.get(index + 1);
          } else {
            return " ";
          }
        })
        .join("");
      if (tiles) {
        const patterns = await this.getPatterns(tiles);
        segments.add({ row: 0, col, down: true, tiles, patterns });
      }
    }));
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
