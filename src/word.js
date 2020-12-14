import { BRANCHES_KEY, FINISHES_WORD, PARENT_BRANCH } from "./symbols";

class Word {
  constructor({ branch, parts, placement, segment, state, word }) {
    this.blacklist = state ? state.getSolve().getBlacklist() : placement.getState().getSolve().getBlacklist();
    this.branch = branch;
    this.parts = parts;
    this.segment = segment;
    this.tray = state ? state.getTray() : placement.getState().getTray();
    this.trie = state ? state.getSolve().getSolver().getTrie() : placement.getState().getSolve().getSolver().getTrie();
    this.word = word;
  }
  getNext() {
    const result = this.getNextValidWord();
    if (!result) {
      return false;
    }
    return new Word({
      branch: result.branch,
      parts: result.parts,
      placement: this.placement,
      segment: this.segment,
      state: this.state,
      word: result.word,
    });
  }
  getNextValidWord() {
    const loop = (parts, branch) => {
      if (branch.has(BRANCHES_KEY)) {
        branch.get(BRANCHES_KEY).some((childBranch, part) => {
          if (this.partMeetsCriteria(part)) {
            parts.push(part);
            branch = childBranch;
            return true;
          }
          return false;
        });
      } else if (branch.has(PARENT_BRANCH)) {
        let gotABranch = false;
        let lastPart = false;
        while (gotABranch === false) {
          branch = branch.get(PARENT_BRANCH);
          lastPart = parts.pop();
          gotABranch = branch.get(BRANCHES_KEY).some((childBranch, part) => {
            if (lastPart) {
              if (lastPart === part) {
                lastPart = false;
              }
              return false;
            }
            if (this.partMeetsCriteria(part)) {
              parts.push(part);
              branch = childBranch;
              return true;
            }
            return false;
          });
        }
      } else {
        return false;
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

export const createWord = ({ placement, segment, state }) => {
  const word = new Word({ placement, segment, state });
  if (!word.init()) {
    return false;
  }
  return word;
};
