import { createBoard } from "./board";
import { createState } from "./state";

// Solve is instantiated in: solver.js (Solver.solve)
// Solve.onUpdate and Solve.start are called in: solver.js (Solver.solve)
// All other methods are only used in this file
// It crawls through all the possible states and manages updates to the UI

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
      tray: this.tray,
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
    const nextStepTimeout = setTimeout(() => this.step(nextState));
    if (!this.update(nextState, message)) {
      clearTimeout(nextStepTimeout);
    }
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
