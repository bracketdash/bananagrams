import { createDictionary } from "./dictionary";
import { createState } from "./state";

class Solver {
  constructor() {
    this.boardStates = new Map();
    this.dictionary = createDictionary();
    this.running = false;
    
    this.dictionary.onReady(() => {
      this.readyCallback();
    });
  }

  getPossibleNextStates(boardState, blacklist) {
    const possibleNextStates = new Set();
    const tray = boardState.getTray();
    const segments = boardState.getSegments();
    const possiblePlacements = this.dictionary.getPossiblePlacements(tray, blacklist, segments);
    
    possiblePlacements.forEach((possiblePlacement) => {
      const stateAfterPlacement = boardState.getStateAfterPlacement(possiblePlacement, this.dictionary);
      if (stateAfterPlacement) {
        possibleNextStates.add(stateAfterPlacement);
      }
    });
    return possibleNextStates;
  }
  
  onReady(callback) {
    this.readyCallback = callback;
  }
  
  onUpdate(callback) {
    this.updateCallback = callback;
  }

  update(message, boardState) {
    const config = { message };
    if (boardState) {
      config.tray = boardState.getTray();
      config.board = boardState.getBoard();
    } else {
      config.tray = "";
      config.board = [[]];
    }
    this.updateCallback(config);
  }

  solve(tray, blacklist) {
    const emptyBoard = createState(tray);
    const possibleNextStates = this.getPossibleNextStates(emptyBoard, blacklist);
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
        this.update("Solution found!", solution);
        return;
      }
      this.running = Symbol();
      this.tryBoardState(this.running, "1");
    } else {
      this.running = false;
      this.update("No solutions possible!", emptyBoard);
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
        this.update("No solutions possible!");
        return;
      }
      splitKey[splitKeyLen - 2] = parseInt(splitKey[splitKeyLen - 2]) + 1;
      splitKey[splitKeyLen - 1] = 0;
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
        this.update("Solution found!", solution);
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
