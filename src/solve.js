import { createBoard } from "./board";
import { createState } from "./state";

class Solve {
  constructor({ blacklist, tray, trie }) {
    this.blacklist = blacklist;
    this.states = new Map();
    this.tray = tray;
    this.trie = trie;
  }
  update(state, message) {
    return this.updateFn({
      board: state.getBoard(),
      message,
      tray: state.getTray(),
    }, this.start);
  }
  onUpdate(updateFn) {
    this.updateFn = updateFn;
  }
  start() {
    const now = new Date().getTime();
    this.start = now;
    this.states.set("0", createState({
      board: createBoard(new Map()),
      tray: this.trie,
    }));
    this.step("0");
    return now;
  }
  step(key) {
    const state = this.states.get(key);
    if (state.isSolved()) {
      this.update(state, "Solution found!");
      return;
    }
    let newKey = "";
    const advancedState = state.getAdvanced();
    if (advancedState) {
      // TODO: 3:5 => 3:5:0
      // TODO: take the next step with this state; call this.step(newKey)
      this.update(advancedState, "Advancing state...");
      return;
    }
    const nextState = state.getNext();
    if (nextState) {
      // TODO: 3:5:0 => 3:5:1
      // TODO: take the next step with this state; call this.step(newKey)
      this.update(nextState, "Trying next state...");
      return;
    }
    let prevState = state.getPrev();
    let prevNextState = false;
    while (!prevNextState) {
      prevNextState = prevState.getNext();
      if (prevNextState) {
        // TODO: assign newKey --  3:5:1 => 3:6
        this.states.set(newKey, prevNextState);
        this.step(newKey);
        this.update(prevNextState, "Trying previous next state...");
        return;
      }
      if (/* there are no colons left in the newKey */) {
        // TODO: update with no solutions posssible
        return;
      }
      prevState = prevState.getPrev();
    }
  }
}

export const createSolve = (config) => new Solve(config);
