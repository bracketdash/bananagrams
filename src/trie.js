class Trie {
  constructor() {
    const compressed = "TODO: compressed trie";
    // TODO: uncompress `compressed`
    // to get array of words: Object.keys(efrt.unpack(packd));
    // would be nice if we can somehow extract the trie itself from words.txt instead of using efrt.unpack
    // -- one less dependency
    // -- we can get the trie itself instead of getting the array of words
    this.trie = new Map();
    // TODO: populate `this.trie`
  }

  getMap() {
    return this.trie;
  }
}

export const createTrie = () => new Trie();
