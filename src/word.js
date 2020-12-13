import { BRANCHES_KEY, FINISHES_WORD, PARENT_BRANCH } from "./symbols";

class Word {
  constructor({ blacklist, branch, parts, segment, tray, trie, word }) {
    this.blacklist = blacklist;
    this.branch = branch;
    this.parts = parts;
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
      parts: result.parts,
      segment,
      tray,
      trie,
      word: result.word,
    });
  }
  getNextValidWord() {
    const loop = (parts, branch) => {
      // TODO: currently, we are only doing 0:0 => 0:0:0 and 0:0 => 0
      // TODO: need to add 0:0 => 0:1
      if (branch.has(BRANCHES_KEY)) {
        branch.get(BRANCHES_KEY).some((childBranch, part) => {
          if (this.partMeetsCriteria(part)) {
            parts.push(part);
            branch = childBranch;
            return true;
          }
          return false;
        });
      } else {
        parts.pop();
        if (branch.has(PARENT_BRANCH)) {
          branch = branch.get(PARENT_BRANCH);
        } else {
          return false;
        }
      }
      const word = parts.join("");
      if (branch.has(FINISHES_WORD) && this.blacklist.allows(word)) {
        const { blacklist, segment, tray, trie } = this;
        return new Word({ blacklist, branch, parts, segment, tray, trie, word });
      } else {
        return loop(parts.slice(), branch);
      }
    };
    return loop(this.parts.slice() || ["a"], this.branch || this.trie.getData().get("a"));
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
    this.parts = result.parts;
    this.word = result.word;
  }
  partMeetsCriteria(part) {
    const counts = this.tray.getCountsWith(this.segment);
    while (part.length > 0) {
      const letter = part[0];
      let instances = 0;
      part = part.replaceAll(letter, () => {
        instances++;
        return "";
      });
      if (!counts.has(letter) || counts.get(letter) < instances) {
        return false;
      }
    }
    return true;
  }
}

export const createWord = ({ blacklist, segment, tray, trie }) => {
  const word = new Word({ blacklist, segment, tray, trie });
  if (!word.init()) {
    return false;
  }
  return word;
};
