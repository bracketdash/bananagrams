import { createSegment } from "./segment";
import { createWord } from "./word";

class Placement {
  constructor(config) {
    config.keys().forEach((key) => {
      this[key] = config[key];
    });
    // TODO: calculate this.row, this.col, this.down, this.placedTiles
  }
  getDelta() {
    const { col, down, row, word } = this;
    return { col, down, row, word };
  }
  getNext() {
    let nextPlacement = false;
    // TODO: create the *next* placement using `this.word` and `this.segment`
    if (nextPlacement) {
      return nextPlacement;
    }
    let word = this.word.getNext();
    if (!word) {
      return false;
    }
    // TODO: create the first placement using `word` and `this.segment`
    if (nextPlacement) {
      return nextPlacement;
    }
    const segment = this.segment.getNext();
    if (!segment) {
      return false;
    }
    const { blacklist, tray, trie } = this;
    word = createWord({ blacklist, segment, tray, trie });
    if (!word) {
      return false;
    }
    // TODO: create the first placement using `word` and `segment`
    if (nextPlacement) {
      return nextPlacement;
    }
    return false;
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
