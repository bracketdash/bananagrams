class Tray {
  constructor(str) {
    this.asString = str;
    this.asArray = str.split("");
    this.asCounts = new Map();
    // TODO
  }
  getNext(tilesToRemove) {
    return new Tray(/* TODO */);
  }
  // TODO
}
export const createTray = (str) => new Tray(str);
