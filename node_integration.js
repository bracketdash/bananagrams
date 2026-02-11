const fs = require('fs');
const vm = require('vm');
const path = require('path');

const base = 'm:/Code/bananagrams';
function loadFile(filename) {
  const p = path.join(base, filename);
  return fs.readFileSync(p, 'utf8');
}

// Load compressedTrie.js and solver.js into the global context
try {
  const compressedCode = loadFile('compressedTrie.js');
  const solverCode = loadFile('solver.js');
  // Run compressedTrie first
  vm.runInThisContext(compressedCode, { filename: 'compressedTrie.js' });
  vm.runInThisContext(solverCode, { filename: 'solver.js' });
} catch (e) {
  console.error('Failed to load scripts:', e);
  process.exit(2);
}

// Now `solve` should be available in the global context
if (typeof solve !== 'function') {
  console.error('solve() not found after loading solver.js');
  process.exit(2);
}

function runSolveOnce(letters, timeoutMs = 15000) {
  return new Promise((resolve) => {
    const start = Date.now();
    let finished = false;
    const timer = setTimeout(() => {
      if (!finished) {
        finished = true;
        resolve({ letters, ok: false, reason: 'timeout', time: Date.now() - start });
      }
    }, timeoutMs);

    try {
      // reset cancellation flag
      globalThis.__solverCancelled = false;
      solve(letters, [], trie, (payload) => {
        if (finished) return false;
        if (payload.end) {
          finished = true;
          clearTimeout(timer);
          resolve({ letters, ok: true, payload, time: Date.now() - start });
        } else {
          // continue
          return true;
        }
      });
    } catch (err) {
      if (!finished) {
        finished = true;
        clearTimeout(timer);
        resolve({ letters, ok: false, reason: String(err), time: Date.now() - start });
      }
    }
  });
}

(async () => {
  console.log('Running integration solves (this may take a few seconds)...');
  const cases = ['train', 'abcdefg', 'stoplearn', 'quartz', 'triangle'];
  for (const letters of cases) {
    const res = await runSolveOnce(letters, 20000);
    if (res.ok) {
      console.log(`SOLVE ${letters}: success in ${res.time}ms; tray='${res.payload.tray}' message='${res.payload.message || ''}'`);
    } else {
      console.log(`SOLVE ${letters}: FAILED in ${res.time}ms; reason=${res.reason}`);
    }
  }
  console.log('Integration run complete.');
})();
