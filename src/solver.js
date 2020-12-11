import { createBlacklist } from "./blacklist";
import { createSolve } from "./solve";
import { createTray } from "./tray";
import { createTrie } from "./trie";

/*
this.trie = new Trie();
this.trie.init() => Promise (ready: Boolean) -- downloads and builds the trie
this.trie.step(
  index, pref, matchIndex, // position info
  function(str: String, isFullWord: Boolean, nextPosition: Position): Boolean
);
*/

class Solver {
  constructor() {
    // TODO
  }
  onUpdate(callback) {
    this.updateCallback = callback;
  }
  solve(tray, blacklist) {
    // TODO
  }
  // TODO
}

export const createSolver = () => new Solver();
