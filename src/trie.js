import wordsTxt from "./assets/words.txt";

class Trie {
  constructor() {
    this.nodes = new Map();
    this.syms = new Map();
    this.symCount = 0;
    this.alphaMap = new Map();
    const firstAlphas = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    firstAlphas.forEach((char, index) => {
      this.alphaMap.set(char, index);
    });
  }
  
  downloadAndBuild() {
    return new Promise((resolve, _) => {
      fetch(wordsTxt.slice(1)).then(async (response) => {
        const wordsStr = await response.text();
        const nodesArr = wordsStr.split(";");
        const pattern = new RegExp("([0-9A-Z]+):([0-9A-Z]+)");
        nodesArr.some((node, index) => {
          const m = pattern.exec(node);
          if (!m) {
            this.symCount = index;
            return true;
          }
          this.syms.set(m[1], this.fromAlphaCode(m[2]));
          return false;
        });
        nodesArr.slice(this.symCount, nodesArr.length).forEach((val, index) => {
          this.nodes.set(index, val);
        });
        resolve();
      });
    });
  }

  fromAlphaCode(s) {
    if (this.alphaMap.has(s)) {
      return this.alphaMap.get(s);
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
    this.alphaMap.set(s, n);
    return n;
  }
  
  traverse({ onFullWord, prefixGate }) {
    const loop = (index, pref) => {
      if (pref && !prefixGate(pref)) {
        return;
      }
      let node = this.nodes.get(index);
      if (node[0] === "!") {
        onFullWord(pref);
        node = node.slice(1);
      }
      const matches = node.split(/([A-Z0-9,]+)/g);
      let i = 0;
      while (i < matches.length) {
        const str = matches[i];
        if (!str) {
          continue;
        }
        const ref = matches[i + 1];
        const have = pref + str;
        if (ref === "," || ref === undefined) {
          onFullWord(have);
          continue;
        }
        if (this.syms.has(ref)) {
          loop(this.syms.get(ref), have);
        } else {
          loop((index + this.fromAlphaCode(ref) + 1 - this.symCount), have);
        }
        i += 2;
      }
    };
    loop(0, "");
  }
}

export const createTrie = () => new Trie();
