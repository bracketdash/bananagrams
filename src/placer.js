export const performPlacement(state, { row, col, down, word }, dictionary) {
  const boardClone = new Map();
  let columnsClone = state.columns;
  let trayClone = state.tray;
  let error = false;
  let newRow = placement.row;
  let newCol = placement.col;
  let newColumns = state.columns;
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
  state.board.forEach((rowCols, rowKey) => {
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
            const tileRow = boardClone.get(index + 1);
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
  return { trayClone, boardClone, columnsClone };
};
