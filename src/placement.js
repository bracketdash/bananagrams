import { createSegment } from "./segment";
import { createWord } from "./word";

class Placement {
  constructor({ blacklist, board, segment, tray, trie, word }) {
    this.blacklist = blacklist;
    this.board = board;
    this.segment = segment;
    this.tray = tray;
    this.trie = trie;
    this.word = word;
  }
  getNext() {
    // TODO: create the next placement for the current word and segment
    // TODO: if no placement can be made, try making the first placement for the next word for the current segment
    // TODO: if no placement can be made, try making the first placement for the first word for the next segment
    // TODO: if we're also out of segments, return false;
  }
  getPlacedTiles() {
    // TODO: return an array of letters that would be added to the board
  }
  init() {
    const { blacklist, board, tray, trie } = this;
    const segment = createSegment({ board });
    if (!segment) {
      return false;
    }
    const word = createWord({ blacklist, segment, tray, trie });
    if (!word) {
      return false;
    }
    this.segment = segment;
    this.word = word;
    // TODO: create the first placement
  }
}

export const createPlacement = (config) => {
  const placement = new Placement(config);
  if (!placement.init()) {
    return false;
  } 
  return placement;
};
