import { createDictionary } from "./dictionary";
import { createState } from "./state";

/*

Slight refactor...

Files:
- index.js
- utilities.js
- (1 for each class below)
- assets/*

CLASSES

Solver
  Instantiated in: (root)
  Public methods:
    solve
    onReady
    onUpdate
  Props on this: TODO
Trie
  Instantiated in: Solver.constructor()
  Public methods:
    init() => Promise()
    getNextWord(index, pref) => word
  Props on this: TODO
Solve
  (a solve instance, will return a solve instance ID we can assign to `this.running`, or rename to `this.solveId`)
  Instantiated in: Solver.solve()
  Public methods:
    init() => solveId
  Props on this: TODO
Tray
  Instantiated in: Solve.constructor()
  Public methods: TODO
  Props on this: TODO
Blacklist
  Instantiated in: Solve.constructor()
  Public methods: TODO
  Props on this: TODO
Segment
  Instantiated in: Solve.solve()
  Public methods: TODO
  Props on this: TODO
State
  Instantiated in: Solve.solve()
  Public methods: TODO
  Props on this: TODO
Board
  Instantiated in: State.constructor()
  Public methods: TODO
  Props on this: TODO
Placement
  Instantiated in: Solve.solve()
  Public methods: TODO
  Props on this: TODO
WordList
  Instantiated in: Solve.solve()
  Public methods: TODO
  Props on this: TODO

*/

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
