import { BRANCHES_KEY, FINISHES_WORD, PARENT_BRANCH } from "./symbols";
import wordsTxt from "./assets/words.txt";

// Instantiated once per app

const codes = new Map("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((c, n) => [c, n]));

const decode = (code) => {
  if (codes.has(code)) {
    return codes.get(code);
  }
  const base = 36;
  const codeLength = code.length;
  let num = 0;
  let places = 1;
  let pow = 1;
  let range = base;
  while (places < codeLength) {
    num += range;
    places++;
    range *= base;
  }
  for (let i = codeLength - 1; i >= 0; i--) {
    let d = code.charCodeAt(i) - 48;
    if (d > 10) {
      d -= 7;
    }
    num += d * pow;
    pow *= base;
  }
  codes.set(code, num);
  return num;
};

class Trie {
  getData() {
    return this.data;
  }
  init() {
    return new Promise((resolve) => {
      fetch(wordsTxt.slice(1)).then(async (response) => {
        const pattern = new RegExp("([0-9A-Z]+):([0-9A-Z]+)");
        const syms = new Map();
        let nodes = (await response.text()).split(";");
        nodes.some((node) => {
          const symParts = pattern.exec(node);
          if (!symParts) {
            return true;
          }
          syms.set(symParts[1], decode(symParts[2]));
          return false;
        });
        nodes = nodes.slice(syms.size);
        const processNode = (index, parentBranch) => {
          let node = nodes[index];
          const branch = new Map();
          const branches = new Map();
          branch.set(BRANCHES_KEY, branches);
          if (parentBranch) {
            branch.set(PARENT_BRANCH, parentBranch);
          }
          if (node[0] === "!") {
            branch.set(FINISHES_WORD, true);
            node = node.slice(1);
          }
          const matches = node.split(/([A-Z0-9,]+)/g);
          let i = 0;
          while (i < matches.length) {
            const part = matches[i];
            if (!part) {
              i += 2;
              continue;
            }
            const ref = matches[i + 1];
            if (ref === "," || ref === undefined) {
              branches.set(part, new Map([[FINISHES_WORD, true]]));
              i += 2;
              continue;
            }
            branches.set(part, processNode(syms.has(ref) ? syms.get(ref) : index + decode(ref) + 1 - syms.size, branch));
            i += 2;
          }
          return branch;
        };
        this.data = processNode(0);
        resolve();
      });
    });
  }
}

export const createTrie = () => new Trie();
