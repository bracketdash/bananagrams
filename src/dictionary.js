import { createTrie } from "./trie";

/* Example of how to read/traverse the trie:

const toArray = function(trie) {
  const all = []
  const crawl = (index, pref) => {
    let node = trie.nodes[index]
    if (node[0] === '!') {
      all.push(pref)
      node = node.slice(1) //ok, we tried. remove it.
    }
    const matches = node.split(/([A-Z0-9,]+)/g)
    for (let i = 0; i < matches.length; i += 2) {
      const str = matches[i]
      const ref = matches[i + 1]
      if (!str) {
        continue
      }

      const have = pref + str
      //branch's end
      if (ref === ',' || ref === undefined) {
        all.push(have)
        continue
      }
      const newIndex = indexFromRef(trie, ref, index)
      crawl(newIndex, have)
    }
  }
  crawl(0, '')
  return all
}

*/

class Dictionary {
  constructor() {
    const trie = createTrie();
    this.trie = trie.getMap();
  }

  getPossiblePlacements({ tray, rowSegments, colSegments }) {
    const placements = new Set();
    const words = this.getWordsFromTray(tray);
    // TODO: for each segment, match a regex against `words`
    // TODO: for each matching word, create a "placement" object and add it to `placements`
    return placements;
  }

  getWordsFromTray(tray) {
    // TODO
  }

  has(trie, key) {
    return !!trie && (key.length > 1 ? this.has(trie.get(key[0]), key.slice(1)) : trie.has(key));
  }

  isAWord(str) {
    const chars = str.split("");
    chars.push("_");
    return this.has(this.trie, chars);
  }
}

export const createDictionary = () => new Dictionary();
