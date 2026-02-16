try {
  importScripts("compressedTrie.js", "solver.js");
} catch (e) {
  self.postMessage({ type: "error", error: String(e) });
}

self.onmessage = function (ev) {
  const data = ev.data;
  if (!data) return;
  if (data.cmd === "solve") {
    globalThis.__solverCancelled = false;
    if (typeof narrowCache !== "undefined") narrowCache.clear();
    if (typeof patternCache !== "undefined") patternCache.clear();

    const letters = data.letters || "";
    const blacklist = data.blacklist || [];

    try {
      solve(letters, blacklist, trie, (payload) => {
        self.postMessage({ type: "update", payload });
      });
      self.postMessage({ type: "done" });
    } catch (err) {
      self.postMessage({ type: "error", error: String(err) });
    }
  } else if (data.cmd === "cancel") {
    globalThis.__solverCancelled = true;
    self.postMessage({ type: "cancelled" });
  }
};
