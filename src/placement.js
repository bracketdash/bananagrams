class Placement {
  constructor({ blacklist, board, tray, trie }) {
    this.blacklist = blacklist;
    this.board = board;
    this.tray = tray;
    this.trie = trie;
  }
  getNext() {
    // TODO
  }
  getPlacedTiles() {
    // TODO
  }
  init() {
    // TODO
  }
}

export const createPlacement = (config) => {
  const placement = new Placement(config);
  if (!placement.init()) {
    return false;
  } 
  return placement;
};
