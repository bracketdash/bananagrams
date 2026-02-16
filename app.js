const tilesInput = document.getElementById("tiles");
const blacklistInput = document.getElementById("blacklist");
const solveButton = document.getElementById("solve");
const boardBox = document.getElementById("board");
const trayBox = document.getElementById("tray");
const messageBox = document.getElementById("message");

let solverWorker = null;
try {
  solverWorker = new Worker("solver.worker.js");
  solverWorker.onmessage = (ev) => {
    const data = ev.data;
    if (!data) return;
    if (data.type === "update") {
      const { blacklist, board, end, message, originalLetters, tray } =
        data.payload;
      boardBox.innerHTML = board
        .map(
          (row) =>
            `<div class="row">${row
              .map(
                (cell) =>
                  `<div class="cell${
                    cell === " " ? " empty" : ""
                  }">${cell}</div>`,
              )
              .join("")}
        </div>`,
        )
        .join("");
      trayBox.innerHTML = tray;
      messageBox.innerHTML = end ? message : "";
      if (end) solveButton.disabled = false;
    } else if (data.type === "done") {
      solveButton.disabled = false;
    } else if (data.type === "cancelled") {
      messageBox.innerHTML = "Cancelled";
      solveButton.disabled = false;
    } else if (data.type === "error") {
      messageBox.innerHTML = "Solver worker error: " + data.error;
      solveButton.disabled = false;
    }
  };
} catch (e) {
  solverWorker = null;
}

function solveBoard() {
  const currLetters = tilesInput.value.replace(/[^A-Z]/gi, "").toLowerCase();
  tilesInput.value = currLetters;
  const currBlacklist = blacklistInput.value
    .replace(/[^,A-Z]/gi, "")
    .toLowerCase();
  blacklistInput.value = currBlacklist;
  messageBox.innerHTML = "Solving...";
  if (solveBoard._pending) return;
  solveBoard._pending = true;
  solveButton.disabled = true;

  if (solverWorker) {
    if (typeof globalThis.__solverCancelled !== "undefined")
      globalThis.__solverCancelled = false;
    solverWorker.postMessage({
      cmd: "solve",
      letters: currLetters,
      blacklist: currBlacklist.split(","),
    });
    setTimeout(() => {
      solveBoard._pending = false;
    }, 50);
    return;
  }

  setTimeout(() => {
    globalThis.__solverCancelled = false;
    solve(
      currLetters,
      currBlacklist.split(","),
      trie,
      ({ blacklist, board, end, message, originalLetters, tray }) => {
        if (
          !end &&
          (currLetters != originalLetters ||
            currBlacklist != blacklist.join(","))
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
                    }">${cell}</div>`,
                )
                .join("")}
        </div>`,
          )
          .join("");
        trayBox.innerHTML = tray;
        messageBox.innerHTML = end ? message : "";
        solveBoard._pending = false;
        solveButton.disabled = false;
        return true;
      },
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

window.addEventListener("keydown", (ev) => {
  if (ev.key === "Escape") {
    if (typeof solverWorker !== "undefined" && solverWorker) {
      solverWorker.postMessage({ cmd: "cancel" });
      messageBox.innerHTML = "Cancelling...";
      solveButton.disabled = false;
      solveBoard._pending = false;
    }
  }
});
