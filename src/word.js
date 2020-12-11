class Word {
  constructor({ blacklist, segment, tray, trie }) {
    this.blacklist = blacklist;
    this.segment = segment;
    this.tray = tray;
    this.trie = trie;
    // TODO
  }
  getNext() {
    // TODO
  }
  getString() {
    // TODO
  }
}

export const createWord = (config) => new Word(config);
