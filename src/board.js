class Board {
  constructor(rows) {
    this.rows = new Map();
    rows.forEach((cells, row) => {
      const cloneCells = new Map();
      cells.forEach((cell, col) => {
        cloneCells.set(col, cell);
      });
      this.rows.set(row, cloneCells);
    });
  }
  getNext() {
    // TODO
  }
  getArray() {
    // TODO
  }
}

export const createBoard = (rows) => new Board(rows);
