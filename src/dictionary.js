import { createTrie } from "./trie";

class Dictionary {
  constructor() {
    this.trie = createTrie();
    this.trie.downloadAndBuild().then(() => {
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
  
  getPossiblePlacements(tray, blacklist, segments) {
    const placements = new Set();
    this.trie.traverse({
      onFullWord: (word) => {
        if (!this.canBeMadeFromTray(tray, word) || blacklist.has(word)) {
          return;
        }
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
            const overlap = false;
            let valid = true;
            wordLetters.forEach((letter, letterIndex) => {
              if (!valid) {
                return;
              }
              if (tiles[pos + letterIndex] !== " ") {
                if (tiles[pos + letterIndex] !== letter) {
                  valid = false;
                } else if (!overlap) {
                  overlap = true;
                }
              }
            });
            if (!valid || !overlap) {
              return;
            }
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
          });
        });
      },
      prefixGate: (prefix) => this.canBeMadeFromTray(tray, prefix)
    });
    return placements;
  }
  
  isAWord(possibleWord) {
    let isAWord = false;
    this.trie.traverse({
      onFullWord: (word) => {
        if (word === possibleWord) {
          isAWord = true;
        }
      },
      prefixGate: (prefix) => possibleWord.startsWith(prefix)
    });
    return isAWord;
  }

  onReady(callback) {
    this.readyCallback = callback;
  }
}

export const createDictionary = () => new Dictionary();
