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

  getPossiblePlacements(tray, blacklist, segments) {
    const placements = new Set();
    this.getWordsFromTray(tray, blacklist).forEach((word) => {
      if (!segments.size) {
        placements.add({
          row: 0,
          col: 0,
          down: true,
          word,
        });
        return;
      }
      segments.forEach(({ row, col, down, tiles, patterns }) => {
        if (!patterns.test(word)) {
          return;
        }
        const firstPosition = -(word.length - 1);
        const wordLetters = word.split("");
        [...Array(word.length * 2 + tiles.length - 4).keys()].forEach((index) => {
          const pos = firstPosition + index;
          const overlap = new Set();
          let valid = true;
          wordLetters.forEach((letter, letterIndex) => {
            if (tiles[pos + letterIndex] !== " " && tiles[pos + letterIndex] !== letter) {
              valid = false;
            }
          });
          if (!overlap.size) {
            valid = false;
          }
          if (valid) {
            let rowAdd = 0;
            let colAdd = 0;
            if (down) {
              rowAdd = pos;
            } else {
              colAdd = pos;
            }
            placements.add({
              row: row + rowAdd,
              col: col + colAdd,
              down,
              word,
            });
          }
        });
      });
    });
    return placements;
  }

  getWordsFromTray(tray, blacklist) {
    const words = new Set();
    this.traverse({
      onFullWord: (word) => {
        if (this.canBeMadeFromTray(tray, word) && !blacklist.includes(word)) {
          words.add(word);
        }
        return true;
      },
      onPrefix: (prefix) => {
        // TODO: make sure we aren't crawling branches we don't have to
      }
    });
    return words;
  }

  indexFromRef(ref, index) {
    const dnode = this.fromAlphaCode(ref);
    if (dnode < this.trie.symCount) {
      return this.trie.syms.get(dnode);
    }
    return index + dnode + 1 - this.trie.symCount;
  }
  
  isAWord(possibleWord) {
    let isAWord = false;
    this.traverse({
      onFullWord: (word) => {
        if (word === possibleWord) {
          isAWord = true;
          return false;
        }
        return true;
      },
      onPrefix: (prefix) => {
        // TODO: make sure we aren't crawling branches we don't have to
      }
    });
    return isAWord;
  }

  onReady(callback) {
    this.readyCallback = callback;
  }
  
  traverse({ onPrefix, onFullWord }) {
    const loop = (index, pref) => {
      if (pref && !onPrefix(pref)) {
        return;
      }
      let node = this.trie.nodes.get(index);
      if (node[0] === "!") {
        if (!onFullWord(pref)) {
          return;
        }
        node = node.slice(1);
      }
      const matches = node.split(/([A-Z0-9,]+)/g);
      for (let i = 0; i < matches.length; i += 2) {
        const str = matches[i];
        if (!str) {
          return;
        }
        const ref = matches[i + 1];
        const have = pref + str;
        if (ref === "," || ref === undefined) {
          if (!onFullWord(have)) {
            return;
          }
          return;
        }
        loop(this.indexFromRef(ref, index), have);
      }
    };
    loop(0, "");
  }
}

export const createDictionary = () => new Dictionary();
