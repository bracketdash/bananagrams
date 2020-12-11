class Segment {
  constructor({ board }) {
    this.board = board;
  }
  getNext() {
    // TODO
  }
}

export const createSegment = (config) => new Segment(config);
