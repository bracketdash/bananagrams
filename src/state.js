// State is instantiated in: solve.js (Solve.start)
// The following methods are called in solver.js (Solver.solve): getAdvanced, getNext, getPrev, isSolved
// The following methods are called in solver.js (Solver.update): getBoard, getTray
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
    // TODO
  }
  getNext() {
    // TODO
  }
  getPrev() {
    // TODO
  }
  getTray() {
    // TODO
  }
  isSolved() {
    return this.tray.isEmpty();
  }
}

export const createState = (config) => new State(config);
