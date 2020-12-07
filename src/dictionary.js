import wordsTxt from "./assets/words.txt";

class Dictionary {
  constructor() {
    this.trie = {};
    fetch(wordsTxt.slice(1)).then(async (response) => {
      const wordsStr = await response.text();
      const nodesArr = wordsStr.split(";");
      const pattern = new RegExp("([0-9A-Z]+):([0-9A-Z]+)");
      const syms = new Map();
      let symCount = 0;

      nodesArr.some((node, index) => {
        const m = pattern.exec(node);
        if (!m) {
          symCount = index;
          return true;
        }
        syms.set(this.fromAlphaCode(m[1]), this.fromAlphaCode(m[2]));
        return false;
      });

      const nodes = new Map(
        nodesArr.slice(symCount, nodesArr.length).map((val, index) => {
          return [index, val];
        })
      );

      Object.assign(this.trie, { nodes, syms, symCount });
      
      this.readyCallback();
    });
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
    const seq = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (seq.includes(s)) {
      return seq.indexOf(s);
    }

    const BASE = 36;
    let n = 0;
    let places = 1;
    let range = BASE;
    let pow = 1;

    while (places < s.length) {
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

  getPossiblePlacements(tray, segments) {
    const placements = new Set();
    this.getWordsFromTray(tray).forEach((word) => {
      segments.forEach((segment) => {
        if (!segment.pattern.test(word)) {
          return;
        }
        // TODO: find possible placements for it within the segment
        // TODO: placements.add({ row, col, down, word });
      });
    });
    return placements;
  }

  getWordsFromTray(tray) {
    const words = new Set();
    const crawl = (index, pref) => {
      let node = this.trie.nodes.get(index);
      
      if (node[0] === "!") {
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
        if (ref === "," || ref === undefined) {
          if (this.canBeMadeFromTray(tray, have)) {
            words.add(have);
          }
          continue;
        }
        crawl(this.indexFromRef(ref, index), have);
      }
    };
    crawl(0, "");
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
  
  onReady(callback) {
    this.readyCallback = callback;
  }
}

export const createDictionary = () => new Dictionary();
