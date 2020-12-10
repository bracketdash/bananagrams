import { createDictionary } from "./dictionary";
import { createState } from "./state";

// TODO: Revisit our async/await/promise chains app-wide

class Solver {
  constructor() {
    this.boardStates = new Map();
    this.dictionary = createDictionary();
    this.running = false;
    this.dictionary.onReady(() => {
      this.readyCallback();
      this.update("Ready!");
    });
  }

  async getPossibleNextStates(boardState, blacklist) {
    const possibleNextStates = new Set();
    const tray = boardState.getTray();
    const segments = await boardState.getSegments();
    // TODO: only get the next possible placement instead of all of them at once
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

  async solve(tray, blacklist) {
    const blacklistSet = new Set(blacklist.split(",").map((w) => w.trim()));
    const emptyBoard = createState(tray);
    // TODO: only get the next state instead of all of them at once
    // TODO: avoid using an await here so we can make solve() a regular function
    // TODO: try to make solve() smaller and move most of the logic into `tryBoardState`
    const possibleNextStates = await this.getPossibleNextStates(emptyBoard, blacklistSet);
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
      this.tryBoardState(this.running, "1", blacklistSet);
    } else {
      this.running = false;
      this.update("No solutions possible!", emptyBoard);
    }
  }

  async tryBoardState(running, key, blacklist) {
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
      setTimeout(() => {
        this.tryBoardState(running, splitKey.join(":"));
      });
      return;
    }
    const boardState = this.boardStates.get(key);
    this.update("", boardState);
    const possibleNextStates = await this.getPossibleNextStates(boardState, blacklist);
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
      setTimeout(() => {
        this.tryBoardState(running, splitKey.join(":"));
      });
    }
  }

  update(message, boardState) {
    const config = { message };
    if (boardState) {
      config.tray = boardState.getTray();
      config.board = boardState.getBoard();
    } else {
      config.tray = "";
      config.board = [[" "]];
    }
    this.updateCallback(config);
  }
}

export const createSolver = () => new Solver();
