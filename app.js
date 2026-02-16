const tilesInput = document.getElementById("tiles");
const blacklistInput = document.getElementById("blacklist");
const solveButton = document.getElementById("solve");
const boardBox = document.getElementById("board");
const trayBox = document.getElementById("tray");
const messageBox = document.getElementById("message");

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
    globalThis.__solverCancelled = true;
    messageBox.innerHTML = "Cancelling...";
    solveButton.disabled = false;
    solveBoard._pending = false;
  }
});
