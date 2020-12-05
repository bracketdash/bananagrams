import words from "./words.txt";

// TODO: START REFACTOR

const BASE = 36;

const seq = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const cache = seq.split('').reduce(function(h, c, i) {
  h[c] = i
  return h
}, {});

const fromAlphaCode = function(s) {
  if (cache[s] !== undefined) {
    return cache[s]
  }
  let n = 0
  let places = 1
  let range = BASE
  let pow = 1

  for (; places < s.length; n += range, places++, range *= BASE) {}
  for (let i = s.length - 1; i >= 0; i--, pow *= BASE) {
    let d = s.charCodeAt(i) - 48
    if (d > 10) {
      d -= 7
    }
    n += d * pow
  }
  return n
}

const parseSymbols = function(t) {
  //... process these lines
  const reSymbol = new RegExp('([0-9A-Z]+):([0-9A-Z]+)')
  for (let i = 0; i < t.nodes.length; i++) {
    const m = reSymbol.exec(t.nodes[i])
    if (!m) {
      t.symCount = i
      break
    }
    t.syms[fromAlphaCode(m[1])] = fromAlphaCode(m[2])
  }
  //remove from main node list
  t.nodes = t.nodes.slice(t.symCount, t.nodes.length)
}

// References are either absolute (symbol) or relative (1 - based)
const indexFromRef = function(trie, ref, index) {
  const dnode = fromAlphaCode(ref)
  if (dnode < trie.symCount) {
    return trie.syms[dnode]
  }
  return index + dnode + 1 - trie.symCount
}

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

//PackedTrie - Trie traversal of the Trie packed-string representation.
const unpack = function(str) {
  const trie = {
    nodes: str.split(';'), //that's all ;)!
    syms: [],
    symCount: 0
  }
  //process symbols, if they have them
  if (str.match(':')) {
    parseSymbols(trie)
  }
  // TODO: we want to return the trie itself so we can work with it in dictionary.js
  return toArray(trie)
}

// TODO: END REFACTOR

class Trie {
  constructor() {
    this.trie = unpack(words);
  }

  getMap() {
    return this.trie;
  }
}

export const createTrie = () => new Trie();
