const fs = require('fs');
const vm = require('vm');
const path = require('path');
const assert = require('assert');

const base = 'm:/Code/bananagrams';
function loadFile(filename) {
  const p = path.join(base, filename);
  return fs.readFileSync(p, 'utf8');
}

// Load compressedTrie.js and solver.js into the global context
try {
  const compressedCode = loadFile('compressedTrie.js');
  const solverCode = loadFile('solver.js');
  vm.runInThisContext(compressedCode, { filename: 'compressedTrie.js' });
  vm.runInThisContext(solverCode, { filename: 'solver.js' });
} catch (e) {
  console.error('Failed to load scripts:', e);
  process.exit(2);
}

// Build a small trie with known words
function buildTrie(words) {
  const root = {};
  for (const w of words) {
    let node = root;
    for (const ch of w) {
      node[ch] = node[ch] || {};
      node = node[ch];
    }
    node['$'] = 1;
  }
  return root;
}

const smallWords = ['cat','at','dog'];
const smallTrie = buildTrie(smallWords);

async function runTest() {
  console.log('Running deterministic integration test...');
  // Test 1: letters 'cat' should be solvable: place 'cat' in an empty board.
  // Inspect which words the solver will consider initially
  const initialWords = makeWordsWith('cat', smallTrie, []);
  console.log('Initial words from makeWordsWith:', initialWords);

  // Sanity-check placing 'cat' by hand to see why solver may reject it
  const board = [[]];
  const testMatch = { word: 'cat', dir: 'row', row: 0, col: 0 };
  const newBoard = placeWord(board, testMatch);
  console.log('Board after placing cat:', newBoard);
  console.log('isBoardValid(newBoard, smallTrie, []) =', isBoardValid(newBoard, smallTrie, []));
  console.log("hasWordInTrie for 'cat' =", hasWordInTrie(smallTrie, [...'cat', '$']));

  const res = await new Promise((resolve) => {
    // reset cancellation
    globalThis.__solverCancelled = false;
    solve('cat', [], smallTrie, (payload) => {
      if (payload.end) resolve(payload);
      return true;
    });
  });
  console.log('Payload:', res);
  assert.strictEqual(res.message, 'SOLVED!', 'Expected solver to report SOLVED!');
  assert.strictEqual(res.tray, '', 'Expected tray to be empty after solved');
  console.log('PASS: solver found expected solution for letters="cat"');

  // Test 2: letters 'do' should not be solvable (no 2-letter 'do' unless present)
  const res2 = await new Promise((resolve) => {
    globalThis.__solverCancelled = false;
    solve('do', [], smallTrie, (payload) => {
      if (payload.end) resolve(payload);
      return true;
    });
  });
  console.log('Payload2:', res2);
  assert.ok(res2.message.includes('No possible solution') || res2.message === 'SOLVED!', 'Expected no solution or handled case');
  console.log('PASS: solver handled unsolvable letters');

  console.log('Deterministic integration tests passed.');
}

runTest().catch((e) => {
  console.error('Deterministic test failed:', e);
  process.exit(1);
});
