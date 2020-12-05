import { isAWord } from "./wordList";

class BoardState {
  constructor(tray, board, columns) {
    this.board = board || new Map([ [1, new Map([ [1, " "] ])] ]);
    this.columns = columns || 1;
    this.tray = tray;
  }
  
  getBoard() {
    const board = [];
    this.board.forEach((row) => {
      // TODO: fill in empty columns with " " and pad right to `this.columns` if necessary
    });
    // TODO: fill in any empty rows with `this.columns` empty columns
    return board;
  }
  
  getCols() { // TODO: rename to be more accurate
    // TODO: see below (but for columns)
  }
  
  getRows() { // TODO: rename to be more accurate
    /* TODO
    return something like [{
      row index,
      col where `tiles` starts,
      how many blank cols left (or 0 for no blockers),
      how many blank cols right (or 0 for no blockers),
      tiles: "c-t"
    }, ...]
    note - we should return each segment - there can be more than one per row
    */
  }
  
  getStateAfterPlacement({ row, col, down, word }) {
    const boardClone = this.board; // TODO: create a deep clone
    let columnsClone = this.columns;
    let trayClone = this.tray;
    let error = false;
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
          // TODO: check the whole row using `isAWord` to make sure we aren't creating any invalid words
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
          // TODO: check the whole column using `isAWord` to make sure we aren't creating any invalid words
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
    return new BoardState(trayClone, boardClone, columnsClone);
  }
  
  getTray() {
    return this.tray;
  }
  
  isSolution() {
    return !this.tray;
  }
}

export const createBoardState = (tray) => new BoardState(tray);
