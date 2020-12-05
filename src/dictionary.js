import { createTrie } from "./trie";

class Dictionary {
  constructor() {
    const trie = createTrie();
    this.trie = trie.getMap();
  }

  getPossiblePlacements({ tray, rowSegments, colSegments }) {
    const placements = new Set();
    const words = this.getWordsFromTray(tray);
    // TODO: for each segment, match a regex against `words`
    // TODO: for each matching word, create a "placement" object and add it to `placements`
    return placements;
  }

  getWordsFromTray(tray) {
    // TODO
  }

  has(trie, key) {
    return !!trie && (key.length > 1 ? this.has(trie.get(key[0]), key.slice(1)) : trie.has(key));
  }

  isAWord(str) {
    const chars = str.split("");
    chars.push("_");
    return this.has(this.trie, chars);
  }
}

export const createDictionary = () => new Dictionary();
