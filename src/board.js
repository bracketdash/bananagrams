class Board {
  constructor({ numCols, numRows, rows }) {
    this.numCols = numCols || 1;
    this.numRows = numRows || 1;
    this.rows = rows || new Map([[0, new Map([[0, " "]])]]);
  }
  getArray() {
    return [...Array(this.numRows).keys()].map((rowIndex) => {
      const row = this.board.get(rowIndex);
      const columns = Array(this.numCols).fill(" ");
      if (row) {
        row.forEach((col, colIndex) => {
          columns[colIndex] = col;
        });
      }
      return columns;
    });
  }
  getNext(placement) {
    const rows = new Map();
    // TODO: apply the placement (can assume valid placement; invalid placements won't make it to this stage)
    let numCols = 1;
    const numRows = Math.max(...rows.keys()) + 1;
    return new Board({ numCols, numRows, rows });
  }
}

export const createBoard = (config) => new Board(config);
