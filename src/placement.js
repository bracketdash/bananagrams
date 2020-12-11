import { createSegment } from "./segment";
import { createWord } from "./word";

class Placement {
  constructor(config) {
    config.keys().forEach((key) => {
      // TODO: calculate if missing: row, col, down, placedTiles, total
      // TODO: we might need to do the this.init() thing here too
      // TODO: we will need to return `false` from createPlacement if a valid placement can't be made
      this[key] = config[key];
    });
  }
  getDelta() {
    const { col, down, row, word } = this;
    return { col, down, row, word };
  }
  getNext() {
    const { blacklist, board, total, tray, trie } = this;
    const index = this.index ? this.index + 1 : 1;
    if (index < total) {
      return new Placement({ blacklist, board, index, segment: this.segment, total, tray, trie, word: this.word });
    }
    let word = this.word.getNext();
    if (word) {
      return new Placement({ blacklist, board, segment: this.segment, tray, trie, word });
    }
    let segment = this.segment.getNext();
    if (!segment) {
      return false;
    }
    word = createWord({ blacklist, segment, tray, trie });
    while (!word) {
      segment = segment.getNext();
      if (segment) {
        word = createWord({ blacklist, segment, tray, trie });
      } else {
        return false;
      }
    }
    return new Placement({ blacklist, board, segment, tray, trie, word });
  }
  getPlacedTiles() {
    return this.placedTiles;
  }
}

export const createPlacement = ({ blacklist, board, tray, trie }) => {
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
  return new Placement({ blacklist, board, segment, tray, trie, word });
};
