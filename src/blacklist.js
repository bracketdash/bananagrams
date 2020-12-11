class Blacklist {
  constructor(str) {
    this.words = new Set(str.split(/\s*,\s*/));
  }
  allows(word) {
    return this.words.has(word);
  }
}
export const createBlacklist = (str) => new Blacklist(str);
