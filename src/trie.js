import words from "./words.txt";

class Trie {
  constructor() {
    this.trie = new Map();
    // TODO: reverse engineer `efrt.unpack` to unpack JUST the trie from `words` (instead of unpacking to an array of words)
    // TODO: note - we got rid of the leading "true" in words.txt
    // TODO: instead of unpacking into a normal object-based ({}) trie, populate this.trie
  }

  getMap() {
    return this.trie;
  }
}

export const createTrie = () => new Trie();
