const tilesInput = document.getElementById("tiles");
const blacklistInput = document.getElementById("blacklist");
const solveButton = document.getElementById("solve");
const boardBox = document.getElementById("board");
const trayBox = document.getElementById("tray");
const messageBox = document.getElementById("message");

function printBoard(board) {
  let boardHtml = "";
  board.forEach((row) => {
    boardHtml += '<div class="row">';
    row.forEach((cell) => {
      boardHtml += `<div class="cell${
        cell === " " ? " empty" : ""
      }">${cell}</div>`;
    });
    boardHtml += "</div>";
  });
  boardBox.innerHTML = boardHtml;
}

function handleSolveTick({
  blacklist,
  board,
  currBlacklist,
  currLetters,
  end,
  message,
  originalLetters,
  tray,
}) {
  if (
    !end &&
    (currLetters != originalLetters || currBlacklist != blacklist.join(","))
  ) {
    return false;
  }
  printBoard(board);
  trayBox.innerHTML = tray;
  messageBox.innerHTML = end ? message : "";
  return true;
}

const trie = JSON.parse(
  "{" +
    compressedTrie
      .replace(/([a-z])/g, '"$1":{')
      .replace(/([0-9]+)/g, (num) => "}".repeat(parseInt(num)))
      .replace(/_/g, '"_":1')
);

function solveBoard() {
  const currLetters = tilesInput.value.replace(/[^A-Z]/gi, "");
  tilesInput.value = currLetters;

  const currBlacklist = blacklistInput.value.replace(/[^,A-Z]/gi, "");
  blacklistInput.value = currBlacklist;

  solve(currLetters, currBlacklist.split(","), trie, (state) =>
    handleSolveTick({ ...state, currLetters, currBlacklist })
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
