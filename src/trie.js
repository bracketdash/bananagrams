import { fromAlphaCode } from "./alpha";
import words from "./words.txt";

const parseSymbols = function(t) {
  const reSymbol = new RegExp('([0-9A-Z]+):([0-9A-Z]+)');
  for (let i = 0; i < t.nodes.length; i++) {
    const m = reSymbol.exec(t.nodes[i]);
    if (!m) {
      t.symCount = i;
      break;
    }
    t.syms[fromAlphaCode(m[1])] = fromAlphaCode(m[2]);
  }
  t.nodes = t.nodes.slice(t.symCount, t.nodes.length);
}

const unpack = function(str) {
  const trie = {
    nodes: str.split(';'),
    syms: [],
    symCount: 0,
  }
  parseSymbols(trie);
  return trie;
}

class Trie {
  constructor() {
    this.trie = unpack(words);
  }

  getMap() {
    return this.trie;
  }
}

export const createTrie = () => new Trie();
