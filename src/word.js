import { BRANCHES_KEY, FINISHES_WORD, PARENT_BRANCH } from "./symbols";

class Word {
  constructor({ blacklist, branch, segment, tray, trie, word }) {
    this.blacklist = blacklist;
    this.branch = branch;
    this.segment = segment;
    this.tray = tray;
    this.trie = trie;
    this.word = word;
  }
  getNext() {
    const result = this.getNextValidWord();
    if (!result) {
      return false;
    }
    const { blacklist, segment, tray, trie } = this;
    return new Word({
      blacklist,
      branch: result.branch,
      segment,
      tray,
      trie,
      word: result.word,
    });
  }
  getNextValidWord() {
    // TODO: traverse branches until we find a word that meets all criteria (blacklist, segment, tray)
    // let branch = this.branch || this.trie.getData();
    // while () {}
  }
  getString() {
    return this.word;
  }
  init() {
    const result = this.getNextValidWord();
    if (!result) {
      return false;
    }
    this.branch = result.branch;
  }
}

export const createWord = ({ blacklist, segment, tray, trie }) => {
  const word = new Word({ blacklist, segment, tray, trie });
  if (!word.init()) {
    return false;
  }
  return word;
};
