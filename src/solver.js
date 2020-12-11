import { createBlacklist } from "./blacklist";
import { createSolve } from "./solve";
import { createTray } from "./tray";
import { createTrie } from "./trie";

class Solver {
  constructor() {
    this.solveStart = 0;
    this.trie = createTrie();
    this.trie.init().then(() => {
      this.updateFn({ ready: true });
    });
  }
  handleRawUpdate({ board, message, tray }) {
    const update = {};
    if (board) {
      update.boardArr = board.getArray();
    }
    if (message) {
      update.message = message;
    }
    if (tray) {
      update.remainingTray = tray.getString();
    }
    this.updateFn(update);
  }
  onUpdate(updateFn) {
    this.updateFn = updateFn;
  }
  solve({ blacklistStr, trayStr }) {
    const blacklist = createBlacklist(blacklistStr);
    const tray = createTray(trayStr);
    const trie = this.trie;
    const solve = createSolve({ blacklist, tray, trie });
    this.solveStart = solve.start();
    solve.onUpdate((rawUpdate, start) => {
      if (start !== this.solveStart) {
        return false;
      }
      this.handleRawUpdate(rawUpdate);
      return true;
    });
  }
}

export const createSolver = () => new Solver();
