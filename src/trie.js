import wordsTxt from "./assets/words.txt";

class Trie {
  constructor() {
    this.nodes = new Map();
    this.syms = new Map();
    this.symCount = 0;
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
          this.syms.set(this.fromAlphaCode(m[1]), this.fromAlphaCode(m[2]));
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
        const dnode = this.fromAlphaCode(ref);
        loop((dnode < this.symCount ? this.syms.get(dnode) : index + dnode + 1 - this.symCount), have);
        i += 2;
      }
    };
    loop(0, "");
  }
}

export const createTrie = () => new Trie();
