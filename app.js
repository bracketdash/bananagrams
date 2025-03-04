const tilesInput = document.getElementById("tiles");
const blacklistInput = document.getElementById("blacklist");
const solveButton = document.getElementById("solve");
const boardBox = document.getElementById("board");
const trayBox = document.getElementById("tray");
const messageBox = document.getElementById("message");

const trie = JSON.parse(
  "{" +
    compressedTrie
      .replace(/([a-z])/g, '"$1":{')
      .replace(/([0-9]+)/g, (num) => "}".repeat(parseInt(num)))
      .replace(/_/g, '"_":1')
);

function solveBoard() {
  const currLetters = tilesInput.value.replace(/[^A-Z]/gi, "").toLowerCase();
  tilesInput.value = currLetters;
  const currBlacklist = blacklistInput.value
    .replace(/[^,A-Z]/gi, "")
    .toLowerCase();
  blacklistInput.value = currBlacklist;
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
      return true;
    }
  );
}

function handleEnter(event) {
  if (event.key === "Enter") {
    solveBoard();
  }
}

tilesInput.addEventListener("keydown", handleEnter);
blacklistInput.addEventListener("keydown", handleEnter);
solveButton.addEventListener("click", solveBoard);
