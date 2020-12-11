export const performPlacement = (state, placement, dictionary) => {
  const boardClone = new Map();
  let columnsClone = state.columns;
  let trayClone = state.tray;
  let error = false;
  let newRow = placement.row;
  let newCol = placement.col;
  let newColumns = state.columns;
  let rowsToAdd = 0;
  let colsToAdd = 0;
  if (placement.row < 0) {
    rowsToAdd = -placement.row;
    newRow = 0;
  }
  if (placement.col < 0) {
    colsToAdd = -placement.col;
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
  if (placement.down) {
    placement.word.split("").forEach((letter, index) => {
      if (error) {
        return;
      }
      const newRowPlusIndex = newRow + index;
      if (!boardClone.has(newRowPlusIndex)) {
        boardClone.set(newRowPlusIndex, new Map());
      }
      const tileRow = boardClone.get(newRowPlusIndex);
      const originalValue = tileRow.get(newCol);
      if (originalValue) {
        if (originalValue !== letter) {
          error = true;
          return;
        }
      } else {
        tileRow.set(newCol, letter);
        let lastSpaceWasEmpty = false;
        const rowWords = [...Array(newColumns).keys()]
          .map((index) => {
            const cell = tileRow.get(index);
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
          if (rowWord.length > 1 && !dictionary.isAWord(rowWord)) {
            error = true;
          }
        });
        if (error) {
          return;
        }
        trayClone = trayClone.replace(letter, "");
      }
    });
  } else {
    const tileRow = boardClone.get(newRow);
    placement.word.split("").forEach((letter, index) => {
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
