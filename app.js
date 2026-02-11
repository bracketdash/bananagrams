const tilesInput = document.getElementById("tiles");
const blacklistInput = document.getElementById("blacklist");
const solveButton = document.getElementById("solve");
const cancelButton = document.getElementById("cancel");
const boardBox = document.getElementById("board");
const trayBox = document.getElementById("tray");
const messageBox = document.getElementById("message");

// Try to spin up a web worker for solving so heavy computations don't block UI.
let solverWorker = null;
try {
  solverWorker = new Worker('solver.worker.js');
  solverWorker.onmessage = (ev) => {
    const data = ev.data;
    if (!data) return;
      if (data.type === 'update') {
      const { blacklist, board, end, message, originalLetters, tray } = data.payload;
      // Same guard as before: ignore stale updates if inputs changed.
      // Note: originalLetters and blacklist come from the solver's callback.
      // Update UI with payload.
      boardBox.innerHTML = board
        .map(
          (row) =>
            `<div class="row">${row
              .map(
                (cell) =>
                  `<div class="cell${
                    cell === " " ? " empty" : ""
                  }">${cell}</div>`
              )
              .join("")}
        </div>`
        )
        .join("");
      trayBox.innerHTML = tray;
      messageBox.innerHTML = end ? message : "";
      if (end) solveButton.disabled = false;
      } else if (data.type === 'done') {
        // Worker indicates it's finished.
        solveButton.disabled = false;
      } else if (data.type === 'cancelled') {
        messageBox.innerHTML = 'Cancelled';
        solveButton.disabled = false;
      } else if (data.type === 'error') {
        messageBox.innerHTML = 'Solver worker error: ' + data.error;
        solveButton.disabled = false;
      }
  };
} catch (e) {
  // Worker not available -- we'll fall back to in-thread solver.
  solverWorker = null;
}

function solveBoard() {
  const currLetters = tilesInput.value.replace(/[^A-Z]/gi, "").toLowerCase();
  tilesInput.value = currLetters;
  const currBlacklist = blacklistInput.value
    .replace(/[^,A-Z]/gi, "")
    .toLowerCase();
  blacklistInput.value = currBlacklist;
  // Show solving indicator and run solver async so the UI can update.
  messageBox.innerHTML = "Solving...";
  // Small debounce to avoid repeated clicks
  if (solveBoard._pending) return;
  solveBoard._pending = true;
  solveButton.disabled = true;

  // Use worker if available.
  if (solverWorker) {
    // reset cancellation flag in case a previous cancel was issued on main thread
    if (typeof globalThis.__solverCancelled !== 'undefined') globalThis.__solverCancelled = false;
    solverWorker.postMessage({ cmd: 'solve', letters: currLetters, blacklist: currBlacklist.split(',') });
    // We'll re-enable button when worker signals end.
    // Allow a short time to re-enable pending flag to prevent double-clicks.
    setTimeout(() => {
      solveBoard._pending = false;
    }, 50);
    return;
  }

  // Fallback: run in main thread asynchronously to allow paint.
  setTimeout(() => {
    // reset cancellation flag for a fresh run
    globalThis.__solverCancelled = false;
    solve(
      currLetters,
      currBlacklist.split(","),
      trie,
      ({ blacklist, board, end, message, originalLetters, tray }) => {
        if (
          !end &&
          (currLetters != originalLetters || currBlacklist != blacklist.join(","))
        ) {
          return false;
        }
        boardBox.innerHTML = board
          .map(
            (row) =>
              `<div class="row">${row
                .map(
                  (cell) =>
                    `<div class="cell${
                      cell === " " ? " empty" : ""
                    }">${cell}</div>`
                )
                .join("")}
        </div>`
          )
          .join("");
        trayBox.innerHTML = tray;
        messageBox.innerHTML = end ? message : "";
        solveBoard._pending = false;
        solveButton.disabled = false;
        return true;
      }
    );
  }, 10);
}

function handleEnter(event) {
  if (event.key === "Enter") {
    solveBoard();
  }
}

tilesInput.addEventListener("keydown", handleEnter);
blacklistInput.addEventListener("keydown", handleEnter);
solveButton.addEventListener("click", solveBoard);
// Visible cancel button for users
if (cancelButton) {
  cancelButton.addEventListener('click', () => {
    if (solverWorker) {
      solverWorker.postMessage({ cmd: 'cancel' });
      messageBox.innerHTML = 'Cancelling...';
      // The worker will post back 'cancelled'.
    } else {
      // Cooperative cancel on main thread fallback.
      globalThis.__solverCancelled = true;
      messageBox.innerHTML = 'Cancelling...';
      solveButton.disabled = false;
      solveBoard._pending = false;
    }
  });
}

// Allow cancelling a running worker by pressing Escape.
window.addEventListener('keydown', (ev) => {
  if (ev.key === 'Escape') {
    if (typeof solverWorker !== 'undefined' && solverWorker) {
      solverWorker.postMessage({ cmd: 'cancel' });
      messageBox.innerHTML = 'Cancelling...';
      solveButton.disabled = false;
      solveBoard._pending = false;
    }
  }
});
