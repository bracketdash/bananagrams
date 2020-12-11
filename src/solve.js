import { createBoard } from "./board";
import { createState } from "./state";

class Solve {
  constructor({ blacklist, tray, trie }) {
    this.blacklist = blacklist;
    this.states = new Map();
    this.tray = tray;
    this.trie = trie;
  }
  update(update) {
    return this.updateFn(update, this.start);
  }
  onUpdate(updateFn) {
    this.updateFn = updateFn;
  }
  start() {
    const now = new Date().getTime();
    this.start = now;
    this.states.set(0, createState({
      board: createBoard(new Map()),
      tray: this.trie,
    }));
    this.step("0");
    return now;
  }
  step(key) {
    // TODO
  }
}

export const createSolve = (config) => new Solve(config);
