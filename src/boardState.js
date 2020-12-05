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
