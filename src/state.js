class State {
  constructor({ board, tray }) {
    this.board = board;
    this.tray = tray;
  }
  getNext() {
    // TODO
  }
  // TODO
}

export const createState = (config) => new State(config);
