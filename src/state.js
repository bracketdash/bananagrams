import { createPlacement } from "./placement";

class State {
  constructor({ blacklist, board, parent, placement, tray, trie }) {
    this.blacklist = blacklist;
    this.board = board;
    this.parent = parent;
    this.placement = placement;
    this.tray = tray;
    this.trie = trie;
  }
  getAdvanced() {
    const { blacklist, tray, trie } = this;
    const placement = createPlacement({ blacklist, board: this.board, tray, trie });
    if (!placement) {
      return false;
    }
    const board = this.board.getNext(placement);
    if (!board) {
      return false;
    }
    return new State({
      blacklist,
      board,
      parent: this,
      placement,
      tray: tray.getNext(placement.getPlacedTiles()),
    });
  }
  getBoard() {
    return this.board;
  }
  getNext() {
    const parent = this.parent;
    const placement = parent.getPlacement().getNext();
    if (!placement) {
      return false;
    }
    const board = this.board.getNext(placement);
    if (!board) {
      return false;
    }
    return new State({
      blacklist: this.blacklist,
      board,
      parent,
      placement,
      tray: this.tray.getNext(placement.getPlacedTiles()),
    });
  }
  getPlacement() {
    return this.placement;
  }
  getPrev() {
    return this.previous;
  }
  getTray() {
    return this.tray;
  }
  isSolved() {
    return this.tray.isEmpty();
  }
}

export const createState = (config) => new State(config);
