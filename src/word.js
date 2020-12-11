class Word {
  constructor({ blacklist, index, matchIndex, pref, segment, tray, trie, word }) {
    this.blacklist = blacklist;
    this.segment = segment;
    this.tray = tray;
    this.trie = trie;
    if (typeof this.index !== "undefined") {
      this.index = index;
      this.matchIndex = matchIndex;
      this.pref = pref;
      this.word = word;
    }
  }
  getNext() {
    const result = this.getNextValidWord();
    if (!result) {
      return false;
    }
    const { blacklist, segment, tray, trie } = this;
    return new Word({
      blacklist,
      index: result.index,
      matchIndex: result.matchIndex,
      pref: result.pref,
      segment,
      tray,
      trie,
      word: result.word,
    });
  }
  getNextValidWord() {
    // TODO: this.trie.step() until we get a full word that meets the criteria
    // TODO: first step is: this.trie.step({}) // => { index, matchIndex, pref, word }
    // TODO: (word will be `false` if this step did not produce a full word)
  }
  getString() {
    return this.word;
  }
  init() {
    const result = this.getNextValidWord();
    if (!result) {
      return false;
    }
    this.index = result.index;
    this.matchIndex = result.matchIndex;
    this.pref = result.pref;
    this.word = result.word;
  }
}

export const createWord = ({ blacklist, segment, tray, trie }) => {
  const word = new Word({ blacklist, segment, tray, trie });
  if (!word.init()) {
    return false;
  }
  return word;
};
