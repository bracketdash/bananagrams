import { fromAlphaCode } from "./alpha";
import words from "./words.txt";

class Trie {
  constructor() {
    const nodesArr = words.split(";");
    const pattern = new RegExp('([0-9A-Z]+):([0-9A-Z]+)');
    const syms = new Map();
    let symCount = 0;
    
    nodesArr.forEach((node, index) => {
      const match = pattern.exec(node);
      if (!match) {
        symCount = index;
        break;
      }
      syms.set(fromAlphaCode(match[1])], fromAlphaCode(match[2]);
    });
    
    const nodes = new Map(nodesArr.slice(symCount, nodesArr.length).map((val, index) => {
      return [index, val];
    }));
    
    this.trie = { nodes, syms, symCount };
  }

  getMap() {
    return this.trie;
  }
}

export const createTrie = () => new Trie();
