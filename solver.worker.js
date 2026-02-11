// Worker script: runs the solver off the main thread and posts updates back.
// It imports the trie and solver implementation via importScripts.

// importScripts will load compressedTrie.js and solver.js which define
// `compressedTrie`, `decompress`, and the solver API (solve, getMatches, etc.).
try {
  importScripts('compressedTrie.js', 'solver.js');
} catch (e) {
  // If importScripts fails (path issue), notify the main thread.
  self.postMessage({ type: 'error', error: String(e) });
}

self.onmessage = function (ev) {
  const data = ev.data;
  if (!data) return;
  if (data.cmd === 'solve') {
    // Reset cancellation flag for a fresh run.
    globalThis.__solverCancelled = false;
    // Defensive: clear caches that may persist across runs in this worker.
    if (typeof narrowCache !== 'undefined') narrowCache.clear();
    if (typeof patternCache !== 'undefined') patternCache.clear();

    const letters = data.letters || '';
    const blacklist = data.blacklist || [];

    // Wrap the solver callback to forward messages to the main thread.
    try {
      solve(letters, blacklist, trie, (payload) => {
        // Post the payload back to the main thread for UI updates.
        self.postMessage({ type: 'update', payload });
      });
      // When solve returns (completed or no solution), notify end.
      self.postMessage({ type: 'done' });
    } catch (err) {
      self.postMessage({ type: 'error', error: String(err) });
    }
  } else if (data.cmd === 'cancel') {
    // Cooperative cancellation: set a global flag that solver functions check.
    globalThis.__solverCancelled = true;
    self.postMessage({ type: 'cancelled' });
  }
};
