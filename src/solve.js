import { createBoard } from "./board";
import { createState } from "./state";

// Instantiated once per solve (each time the user changes the tray or blacklist)
// Traverses the possible states until a solution is found or we find out no solution is possible

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
    this.step(
      createState({
        blacklist: this.blacklist,
        board: createBoard({}),
        tray: this.tray,
        trie: this.trie,
      })
    );
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
          if (this.tryNextStep(prevState.getNext(), "Trying previous next state...")) {
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
    const nextStepTimeout = setTimeout(() => this.step(maybeNextState));
    if (!this.update(maybeNextState, message)) {
      clearTimeout(nextStepTimeout);
    }
    return true;
  }
  update(state, message) {
    return this.updateFn(
      {
        board: state.getBoard(),
        message,
        tray: state.getTray(),
      },
      this.start
    );
  }
}

export const createSolve = (config) => new Solve(config);
