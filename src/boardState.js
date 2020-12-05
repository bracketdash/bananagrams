class BoardState {
  constructor(tray) {
    this.board = new Map([ [1, new Map([ [1, " "] ])] ]);
    this.tray = tray;
  }
  
  getBoard() {
    const board = [];
    this.board.forEach((row) => {
      board.push(Array.from(row.values()));
    });
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
  
  getStateAfterPlacement(placement) {
    // TODO
  }
  
  getTray() {
    return this.tray;
  }
  
  isSolution() {
    return !this.tray;
  }
}

export const createBoardState = (tray) => new BoardState(tray);
