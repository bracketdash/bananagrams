import { createTrie } from "./trie";
import { fromAlphaCode } from "./alpha";

class Dictionary {
  constructor() {
    const trie = createTrie();
    this.trie = trie.getMap();
  }
  
  canBeMadeFromTray(tray, word) {
    // TODO
  }

  getPossiblePlacements({ tray, rowSegments, colSegments }) {
    const placements = new Set();
    const words = this.getWordsFromTray(tray);
    
    const segmentCrawler = (segment, down) => {
      // TODO: match a regex built from the segment against `words`
      matches.forEach((word) => {
        // TODO: for each matching word, find possible placements for it within the segment
        // placements.add({ row, col, down, word });
      });
    };
    
    rowSegments.forEach((rowSegment) => {
      segmentCrawler(rowSegment, 0);
    });
    colSegments.forEach((colSegment) => {
      segmentCrawler(colSegment, 1);
    });
    
    return placements;
  }

  getWordsFromTray(tray) {
    const words = new Set();
    const crawl = (index, pref) => {
      let node = this.trie.nodes.get(index);
      if (node[0] === '!') {
        if (this.canBeMadeFromTray(tray, pref)) {
          words.add(pref);
        }
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
          if (this.canBeMadeFromTray(tray, have)) {
            words.add(have);
          }
          continue;
        }
        crawl(this.indexFromRef(ref, index), have);
      }
    };
    crawl(0, '');
    return words;
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
