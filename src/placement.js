import { createSegment } from "./segment";
import { createWord } from "./word";

class Placement {
  constructor({ segment, word }) {
    this.segment = segment;
    this.word = word;
    // TODO
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
  // TODO: methods to support Board.getNext()
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
  return new Placement({ segment, word });
};
