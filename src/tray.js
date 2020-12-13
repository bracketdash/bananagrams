// Instantiated once per solve (each time the user changes the tray or blacklist)

class Tray {
  constructor(str) {
    this.str = str;
    this.counts = str.split("").reduce((counts, letter) => {
      counts.set(letter, counts.has(letter) ? counts.get(letter) + 1 : 1);
      return counts;
    }, new Map());
  }
  getCountsWith(segment) {
    const counts = new Map();
    this.counts.forEach((count, letter) => {
      counts[letter] = count;
    });
    segment.getCounts().forEach((count, letter) => {
      counts.set(letter, this.counts.has(letter) ? this.counts.get(letter) + count : count);
    });
    return counts;
  }
  getNext(tilesToRemove) {
    let newTrayStr = this.str;
    tilesToRemove.forEach((tileToRemove) => {
      newTrayStr = newTrayStr.replace(tileToRemove, "");
    });
    return new Tray(newTrayStr);
  }
  getString() {
    return this.str;
  }
  isEmpty() {
    return !this.str;
  }
}

export const createTray = (str) => new Tray(str);
