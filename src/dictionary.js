import { createTrie } from "./trie";

const has = function (trieMap, key) {
  return !!trieMap && (key.length > 1 ? has(trieMap.get(key[0]), key.slice(1)) : trieMap.has(key));
};

const trie = createTrie();
const trieMap = trie.getMap();

class Dictionary {
  constructor() {}
  
  getPossiblePlacements({ tray, rowSegments, colSegments }) {
    // TODO
  }
}

export const createDictionary = () => new Dictionary();

export const isAWord = (str) => {
  const chars = str.split("");
  chars.push("_");
  return has(trieMap, chars);
};
