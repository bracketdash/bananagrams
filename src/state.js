class State {
  constructor(tray, board, columns) {
    this.board = board || new Map();
    this.columns = columns || 1;
    this.tray = tray;
  }

  getBoard() {
    const numRows = Math.max(...this.board.keys());
    let numColumns = 0;
    return Array(numRows)
      .fill(true)
      .map((_, rowIndex) => {
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

  getSegments() {
    // TODO: return something like Set([{ row, col, down, pattern }])
  }

  getStateAfterPlacement({ row, col, down, word }, dictionary) {
    const boardClone = new Map();
    this.board.forEach((rowCols, rowKey) => {
      const cols = new Map();
      rowCols.forEach((col, colKey) => {
        cols.set(colKey, col);
      });
      boardClone.set(rowKey, cols);
    });
    let columnsClone = this.columns;
    let trayClone = this.tray;
    let error = false;
    // TODO: handle negative row and col values
    // TODO: add rows as needed to fit "down" words
    if (down) {
      word.split("").forEach((letter, index) => {
        if (error) {
          return;
        }
        const originalValue = row.get(col);
        const row = boardClone.get(row + index);
        if (originalValue) {
          if (originalValue !== letter) {
            error = true;
            return;
          }
        } else {
          let lastSpaceWasEmpty = false;
          const rowWords = Array(this.columns).fill(null).map((_, index) => {
            const cell = row.get(index + 1);
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
          }).trim().split(" ");
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
        row.set(col, letter);
      });
    } else {
      const row = boardClone.get(row);
      word.split("").forEach((letter, index) => {
        if (error) {
          return;
        }
        const colPlusIndex = col + index;
        const originalValue = row.get(colPlusIndex);
        if (originalValue) {
          if (originalValue !== letter) {
            error = true;
            return;
          }
        } else {
          let lastSpaceWasEmpty = false;
          // TODO: produce colWords (see rowWords above)
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
        row.set(colPlusIndex, letter);
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
