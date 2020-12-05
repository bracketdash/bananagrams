import { fromAlphaCode } from "./alpha";
import words from "./words.txt";

class Trie {
  constructor() {
    const trie = {
      nodes: str.split(';'),
      syms: [],
      symCount: 0,
    }
    const pattern = new RegExp('([0-9A-Z]+):([0-9A-Z]+)');
    trie.nodes.forEach((node, i) => {
      const m = pattern.exec(node);
      if (!m) {
        trie.symCount = i;
        break;
      }
      trie.syms[fromAlphaCode(m[1])] = fromAlphaCode(m[2]);
    });
    trie.nodes = trie.nodes.slice(trie.symCount, trie.nodes.length);
    this.trie = trie;
  }

  getMap() {
    return this.trie;
  }
}

export const createTrie = () => new Trie();
