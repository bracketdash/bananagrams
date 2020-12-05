import { createBoardState } from "./boardState";
import { createWordList } from "./wordList";

class Solver {
  constructor() {
    this.boardStates = new Map();
    this.running = false;
    this.wordList = createWordList();
  }
  
  getPossibleNextStates(boardState) {
    // TODO: get an initial set of words based on the tray, then narrow based on the board and tiles
  }
  
  solve(tray, blacklist) {
    const emptyBoard = createBoardState(tray);
    const possibleNextStates = this.getPossibleNextStates(createBoardState(tray));
    this.boardStates.clear();
    if (possibleNextStates.size) {
      let iteration = 1;
      let solution = false;
      possibleNextStates.forEach((possibleNextState) => {
        if (solution) {
          return;
        }
        if (possibleNextState.isSolution()) {
          solution = possibleNextState;
          return;
        }
        this.boardStates.set(iteration.toString(), possibleNextState);
        iteration++;
      });
      if (solution) {
        this.running = false;
        // TODO: solution found
        return;
      }
      this.running = Symbol();
      this.tryBoardState(this.running, "1");
    } else {
      this.running = false;
      // TODO: no solution
    }
  }
  
  tryBoardState(running, key) {
    if (this.running !== false && this.running !== running) {
      return;
    }
    
    if (!this.boardStates.has(key)) {
      const splitKey = key.split(":");
      const splitKeyLen = splitKey.length;
      if (splitKeyLen < 2) {
        this.running = false;
        // TODO: no solution
        return;
      }
      splitKey[splitKeyLen-2] = parseInt(splitKey[splitKeyLen-2]) + 1;
      splitKey[splitKeyLen-1] = 0;
      this.tryBoardState(running, splitKey.join(":"));
      return;
    }
    
    const boardState = this.boardStates.get(key);
    const possibleNextStates = this.getPossibleNextStates(boardState);
    boardState.setPossibleNextStates(possibleNextStates);
    if (possibleNextStates.size) {
      let iteration = 1;
      let solution = false;
      possibleNextStates.forEach((possibleNextState) => {
        if (solution) {
          return;
        }
        if (possibleNextState.isSolution()) {
          solution = possibleNextState;
          return;
        }
        this.boardStates.set(`${key}:${iteration.toString()}`, possibleNextState);
        iteration++;
      });
      if (solution) {
        this.running = false;
        // TODO: solution found
        return;
      }
      
      const splitKey = key.split(":");
      const lastIndex = splitKey.length - 1;
      splitKey[lastIndex] = parseInt(splitKey[lastIndex]) + 1;
      this.tryBoardState(running, splitKey.join(":"));
    }
  }
}

export const createSolver = () => new Solver();
