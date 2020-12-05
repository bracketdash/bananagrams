import { createTrie } from "./trie";
import { fromAlphaCode } from "./alpha";

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
    // TODO: modify the below to only return words that can be made with the tray
    const all = [];
    const crawl = (index, pref) => {
      let node = this.trie.nodes.get(index);
      if (node[0] === '!') {
        all.push(pref);
        node = node.slice(1);
      }
      const matches = node.split(/([A-Z0-9,]+)/g);
      for (let i = 0; i < matches.length; i += 2) {
        const str = matches[i];
        if (!str) {
          continue;
        }
        const ref = matches[i + 1];
        const have = pref + str;
        if (ref === ',' || ref === undefined) {
          all.push(have);
          continue;
        }
        crawl(this.indexFromRef(ref, index), have);
      }
    };
    crawl(0, '');
    return all;
  }

  has(trie, key) {
    return !!trie && (key.length > 1 ? this.has(trie.get(key[0]), key.slice(1)) : trie.has(key));
  }
  
  indexFromRef(ref, index) {
    const dnode = fromAlphaCode(ref);
    if (dnode < this.trie.symCount) {
      return this.trie.syms.get(dnode);
    }
    return index + dnode + 1 - this.trie.symCount;
  }

  isAWord(str) {
    const chars = str.split("");
    chars.push("_");
    return this.has(this.trie, chars);
  }
}

export const createDictionary = () => new Dictionary();
