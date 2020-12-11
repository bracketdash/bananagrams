// TODO: Revisit after all uses are written

class Tray {
  constructor(str) {
    this.str = str;
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
