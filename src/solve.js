import { createBoard } from "./board";
import { createState } from "./state";

class Solve {
  constructor({ blacklist, tray, trie }) {
    this.blacklist = blacklist;
    this.tray = tray;
    this.trie = trie;
  }
  onUpdate(updateFn) {
    this.updateFn = updateFn;
  }
  start() {
    this.start = new Date().getTime();
    this.step(createState({
      blacklist: this.blacklist,
      board: createBoard(new Map()),
      tray: this.trie,
    }));
    return this.start;
  }
  step(state) {
    if (state.isSolved()) {
      this.update(state, "Solution found!");
      return;
    }
    if (!this.tryNextStep(state.getAdvanced(), "Advancing state...")) {
      if (!this.tryNextStep(state.getNext(), "Trying next state...")) {
        let prevState = state.getPrev();
        while (prevState) {
          if (this.tryNextStep(prevState.getNext(), "Trying previous next state...") {
            return;
          }
          prevState = prevState.getPrev();
        }
        this.update(state, "No solutions possible!");
      }
    }
  }
  tryNextStep(maybeNextState, message) {
    if (!maybeNextState) {
      return false;
    }
    setTimeout(() => this.step(nextState));
    this.update(nextState, message);
    return true;
  }
  update(state, message) {
    return this.updateFn({
      board: state.getBoard(),
      message,
      tray: state.getTray(),
    }, this.start);
  }
}

export const createSolve = (config) => new Solve(config);
