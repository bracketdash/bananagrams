import wordsTxt from "./assets/words.txt";

class Trie {
  constructor() {
    this.nodes = new Map();
  }
  init() {
    return new Promise((resolve) => {
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
        nodesArr.slice(symCount).forEach((nodeStr, index) => {
          const node = {
            matches: new Set(),
          };
          if (nodeStr[0] === "!") {
            node.full = true;
            nodeStr = nodeStr.slice(1);
          }
          const matches = nodeStr.split(/([A-Z0-9,]+)/g);
          let i = 0;
          while (i < matches.length) {
            const str = matches[i];
            if (!str) {
              i += 2;
              continue;
            }
            const ref = matches[i + 1];
            if (ref === "," || ref === undefined) {
              node.matches.add({ str, full: true });
              i += 2;
              continue;
            }
            const next = syms.has(ref) ? syms.get(ref) : index + fromAlphaCode(ref) + 1 - symCount;
            node.matches.add({ str, next });
            i += 2;
          }
          this.nodes.set(index, node);
        });
        resolve();
      });
    });
  }
  step({ index, matches, matchIndex, pref }) {
    const config = { index, pref };
    if (typeof matchIndex === "undefined") {
      const node = this.nodes.get(index || 0);
      if (node.full) {
        config.word = pref;
      }
      if (node.matches) {
        config.matches = node.matches;
        config.matchIndex = 0;
      } else {
        config.matchIndex = -1;
      }
    } else if (config.matchIndex === -1) {
      return false;
    } else {
      const { str, full, next } = matches[matchIndex || 0];
      Object.assign(config, {
        index: next,
        matches,
        pref: pref + str,
      });
      if (full) {
        config.word = config.pref;
      }
      if (matchIndex < matches.length - 1) {
        config.matchIndex = matchIndex + 1;
      } else {
        config.matchIndex = -1;
      }
    }
    return config;
  }
}

export const createTrie = () => new Trie();
