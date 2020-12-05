import { createTrie } from "./trie";

class WordList {
  constructor() {
    this.trie = createTrie();
  }
  
  getPossiblePlacements({ tray, rowSegments, colSegments }) {
    // TODO
  }
  
  isAWord(str) {
    const has = function (trieMap, key) {
      return !!trieMap && (key.length > 1 ? has(trieMap.get(key[0]), key.slice(1)) : trieMap.has(key));
    };
    const chars = str.split("");
    chars.push("_");
    return has(this.trie.getMap(), chars);
  }
}

export const createWordList = () => new WordList();
