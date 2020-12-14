import { createSegment } from "./segment";
import { createWord } from "./word";

class Placement {
  constructor({ index, placement, segment, state, word }) {
    // TODO: calculate row, col, down, placedTiles, total
    // TODO: we might need to do the this.init() thing here too
    // TODO: we will need to return `false` from createPlacement if a valid placement can't be made
  }
  getDelta() {
    const { col, down, row, word } = this;
    return { col, down, row, word };
  }
  getNext() {
    const index = this.index ? this.index + 1 : 1;
    if (index < this.total) {
      return new Placement({ index, placement: this });
    }
    let word = this.word.getNext();
    if (word) {
      return new Placement({ placement: this, word });
    }
    let segment = this.segment.getNext();
    if (!segment) {
      return false;
    }
    word = createWord({ placement: this, segment });
    while (!word) {
      segment = segment.getNext();
      if (segment) {
        word = createWord({ placement: this, segment });
      } else {
        return false;
      }
    }
    return new Placement({ placement: this, segment, word });
  }
  getPlacedTiles() {
    return this.placedTiles;
  }
}

export const createPlacement = ({ state }) => {
  const segment = createSegment({ board });
  if (!segment) {
    return false;
  }
  const word = createWord({ state, segment });
  if (!word) {
    return false;
  }
  this.segment = segment;
  this.word = word;
  return new Placement({ segment, state, word });
};
