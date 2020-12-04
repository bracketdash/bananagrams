import { useState } from "React";
import createSolver from "./solver";

function App() {
  const [blacklist, setBlacklist] = useState("");
  const [board, setBoard] = useState([[]]);
  const [letters, setLetters] = useState("");
  const [message, setMessage] = useState("");
  const [tray, setTray] = useState("");
  
  const solver = createSolver();
  
  const updateBlacklistAndSolve = (e) => {
    setBlacklist(e.target.value);
    solver.solve(letters, e.target.value);
  };
  const updateLettersAndSolve = (e) => {
    setLetters(e.target.value);
    solver.solve(e.target.value, blacklist);
  };
  
  solver.onUpdate(({ tray, message, board }) => {
    setTray(tray);
    setMessage(message);
    setBoard(board);
  });
  
  return (
      <div>
          <div class="header">
              <h1>Bananagrams Solver</h1>
          </div>
          <div class="letterbox">
              <input type="text" placeholder="yourtileshere" value={letters} onInput={updateLettersAndSolve} />
          </div>
          <div class="controls">
              <div>
                  <label>Word Blacklist</label>
                  <small>(Comma-separated)</small>
              </div>
              <div>
                  <input type="text" value={blacklist} onInput={updateBlacklistAndSolve} />
              </div>
          </div>
          <div class="boardbox">
              <div class="board">
                  {board.map((row) => (
                      <div class="row">
                          {row.map((cell) => (
                              <div class="cell" class={cell === " " ? "empty" : ""}>{cell}</div>
                          ))}
                      </div>
                  ))}
              </div>
          </div>
          <div class="tray">{tray}</div>
          <div class="message">{message}</div>
      </div>
  );
}

export default App;
