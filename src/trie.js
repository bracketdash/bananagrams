class Trie {
  constructor() {
    const compressed = "TODO: compressed trie";
    // TODO: uncompress `compressed`
    // to get array of words: Object.keys(efrt.unpack(packd));
    this.trie = new Map();
    // TODO: populate `this.trie`
  }

  getMap() {
    return this.trie;
  }
}

export const createTrie = () => new Trie();
