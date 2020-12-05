import { createTrie } from "./trie";

class Dictionary {
  constructor() {
    const trie = createTrie();
    this.trie = trie.getMap();
  }
  
  getPossiblePlacements({ tray, rowSegments, colSegments }) {
    // TODO
  }
  
  has(trie, key) {
    return !!trie && (key.length > 1 ? has(trie.get(key[0]), key.slice(1)) : trie.has(key));
  }
  
  isAWord(str) {
    const chars = str.split("");
    chars.push("_");
    return this.has(trieMap, chars);
  }
}

export const createDictionary = () => new Dictionary();
