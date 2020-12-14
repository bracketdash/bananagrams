import { createBoard } from "./board";
import { createState } from "./state";

// Instantiated once per solve (each time the user changes the tray or blacklist)
// Traverses the possible states until a solution is found or we find out no solution is possible

class Solve {
  constructor({ blacklist, solver, tray, update }) {
    this.blacklist = blacklist;
    this.solver = solver;
    this.tray = tray;
    this.update = update;
  }
  handleUpdate(state, message) {
    const boardArr = state.getBoard().getArray();
    const remainingTray = state.getTray().getString();
    return this.update({ boardArr, message, remainingTray }, this.start);
  }
  start() {
    this.start = new Date().getTime();
    this.step(
      createState({
        board: createBoard({}),
        solve: this,
      })
    );
    return this.start;
  }
  step(state) {
    if (state.isSolved()) {
      this.handleUpdate(state, "Solution found!");
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
        this.handleUpdate(state, "No solutions possible!");
      }
    }
  }
  tryNextStep(maybeNextState, message) {
    if (!maybeNextState) {
      return false;
    }
    const nextStepTimeout = setTimeout(() => this.step(maybeNextState));
    if (!this.handleUpdate(maybeNextState, message)) {
      clearTimeout(nextStepTimeout);
    }
    return true;
  }
}

export const createSolve = (config) => {
  const solve = new Solve(config);
  return solve.start();
};
