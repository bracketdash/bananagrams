import wordsTxt from "./assets/words.txt";

class Trie {
  constructor() {
    this.nodes = new Map();
  }

  downloadAndBuild() {
    return new Promise((resolve, _) => {
      const alphaMap = new Map();
      const firstAlphas = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
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
        alphaMap.set(s, n);
        return n;
      };
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
          syms.set(m[1], fromAlphaCode(m[2]));
          return false;
        });
        nodesArr.slice(symCount).forEach((node, index) => {
          this.nodes.set(index, node);
          // TODO: node => { full: true, matches: new Set([{ str, full, next }, ..]) }
          /*
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
