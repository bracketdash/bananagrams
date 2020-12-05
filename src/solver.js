import { createBoardState } from "./boardState";
import { createWordList } from "./wordList";

class Solver {
  constructor() {
    this.boardStates = new Map();
    this.running = false;
    this.wordList = createWordList();
  }
  
  getPossibleNextStates(boardState) {
    // TODO
  }
  
  solve(tray, blacklist) {
    const emptyBoard = createBoardState(tray);
    const possibleNextStates = this.getPossibleNextStates(createBoardState(tray));
    this.boardStates.clear();
    if (possibleNextStates.size) {
      let iteration = 1;
      possibleNextStates.forEach((possibleNextState) => {
        this.boardStates.set(iteration.toString(), possibleNextState);
        iteration++;
      });
      this.running = Symbol();
      this.tryBoardState(this.running, "0", 0);
    } else {
      // TODO: no solution
    }
  }
  
  tryBoardState(running, key, loop) {
    if (this.running !== false && this.running !== running) {
      return;
    }
    const boardState = loop ? this.boardStates.get(`${key}:${loop}`) : this.boardStates.get(key);
    if (!loop) {
      if (boardState.isSolved()) {
        // TODO: solved!
        return;
      }
      
      // TODO: get the possible next states for this state and try the first one
      
      const possibleNextStates = this.getPossibleNextStates(boardState);
      boardState.setPossibleNextStates(possibleNextStates);
      if (possibleNextStates.size) {
        let iteration = 1;
        possibleNextStates.forEach((possibleNextState) => {
          this.boardStates.set(`${key}:${iteration.toString()}`, possibleNextState);
          iteration++;
        });
        if (this.boardStates.has(`${key}:${loop+1}`)) {
          this.tryBoardState(running, `${key}:${loop+1}`, 0);
        }
        // TODO
      }
      
      // TODO
      return;
    } else if (boardState) {
      // TODO
    } else {
      // TODO: we've exhausted the list of possible states from the last state, backtrack and try the next state
      // TODO: if we get to a place where we are out of root-level states to try, we need to give a no solution
    }
  }
}

export const createSolver = () => new Solver();
