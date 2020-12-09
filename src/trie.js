import wordsTxt from "./assets/words.txt";

const alphaMap = new Map();
const firstAlphas = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
firstAlphas.forEach((char, index) => {
  alphaMap.set(char, index);
});
const fromAlphaCode = (s) => {
  if (alphaMap.has(s)) {
    return alphaMap.get(s);
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
};

class Trie {
  constructor() {
    this.nodes = new Map();
    
    // TODO: refactor downloadAndBuild() then remove everything below
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
        
        // TODO: preprocess nodes more here
        /*
        Each node => { full: true, matches: new Set([{ str, full, next }, ..]) }
        
        Old loop:
        
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
              loop((index + fromAlphaCode(ref) + 1 - this.symCount), have);
            }
            i += 2;
          }
        };
        */
        
        nodesArr.some((node, index) => {
          const m = pattern.exec(node);
          if (!m) {
            // TODO: we may not need this.symCount anymore if we are selectively adding to `this.nodes` here
            this.symCount = index;
            return true;
          }
          // TODO: since this.syms is going to be local to this function, we can make it a const
          this.syms.set(m[1], fromAlphaCode(m[2]));
          return false;
        });
        // TODO: set nodes as we go above instead of slicing
        nodesArr.slice(this.symCount, nodesArr.length).forEach((val, index) => {
          this.nodes.set(index, val);
        });
        resolve();
      });
    });
  }
  
  traverse({ onFullWord, prefixGate }) {
    const loop = (index, pref) => {
      if (pref && !prefixGate(pref)) {
        return;
      }
      const { full, matches } = this.nodes.get(index);
      if (full) {
        onFullWord(pref);
      }
      matches.forEach(({ str, full, next }) => {
        const have = pref + str;
        if (full) {
          onFullWord(have);
          return;
        }
        loop(next, have);
      });
    };
    loop(0, "");
  }
}

export const createTrie = () => new Trie();
