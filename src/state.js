// State is instantiated in: solve.js (Solve.start)
// The following methods are called in solve.js (Solve.solve): getAdvanced, getNext, getPrev, isSolved
// The following methods are called in solve.js (Solve.update): getBoard, getTray
// All other methods are only used in this file
// It represents a possible state of the solve and provides state traversal functionality

class State {
  constructor({ blacklist, board, tray }) {
    this.blacklist = blacklist;
    this.board = board;
    this.tray = tray;
  }
  getAdvanced() {
    // TODO
  }
  getBoard() {
    return this.board;
  }
  getNext() {
    // TODO
  }
  getPrev() {
    // TODO
  }
  getTray() {
    return this.tray;
  }
  isSolved() {
    return this.tray.isEmpty();
  }
}

export const createState = (config) => new State(config);
