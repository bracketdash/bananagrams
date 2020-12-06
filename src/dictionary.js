import words from "./words.txt";

class Dictionary {
  constructor() {
    const nodesArr = words.split(";");
    const pattern = new RegExp('([0-9A-Z]+):([0-9A-Z]+)');
    const syms = new Map();
    let symCount = 0;
    
    nodesArr.forEach((node, index) => {
      const match = pattern.exec(node);
      if (!match) {
        symCount = index;
        break;
      }
      syms.set(this.fromAlphaCode(match[1]), this.fromAlphaCode(match[2]);
    });
    
    const nodes = new Map(nodesArr.slice(symCount, nodesArr.length).map((val, index) => {
      return [index, val];
    }));
    
    this.trie = { nodes, syms, symCount };
  }
  
  canBeMadeFromTray(tray, word) {
    let can = true;
    let temp = tray;
    word.split("").forEach((letter) => {
      if (temp.includes(letter)) {
        temp = temp.replace(letter, "");
      } else {
        can = false;
      }
    });
    return can;
  }
  
  fromAlphaCode(s) {
    const seq = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (seq[s] !== undefined) {
      return seq.indexOf(s);
    }

    const BASE = 36;
    let n = 0;
    let places = 1;
    let range = BASE;
    let pow = 1;

    while(places < s.length) {
      n += range;
      places++;
      range *= BASE;
    }

    for (let i = s.length - 1; i >= 0; i--) {
      let d = s.charCodeAt(i) - 48;
      if (d > 10) {
        d -= 7;
      }
      n += d * pow;
      pow *= BASE;
    }
    return n;
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
    const dnode = this.fromAlphaCode(ref);
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
