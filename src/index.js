import "./styles.css";
import React, { useState } from "React";
import ReactDOM from "react-dom";
import createSolver from "./solver";

const App = () => {
  const [blacklist, setBlacklist] = useState("");
  const [board, setBoard] = useState([[]]);
  const [letters, setLetters] = useState("");
  const [message, setMessage] = useState("");
  const [tray, setTray] = useState("");
  
  const solver = createSolver();
  
  const updateBlacklistAndSolve = (e) => {
    const newBlacklist = e.target.value.replace(/[^A-Z]/gi, "").toLowerCase();
    setBlacklist(newBlacklist);
    solver.solve(letters, newBlacklist);
  };
  const updateLettersAndSolve = (e) => {
    const newLetters = e.target.value.replace(/[^A-Z]/gi, "").toLowerCase();
    setLetters(newLetters);
    solver.solve(newLetters, blacklist);
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
};

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("app")
);
