import "./assets/styles.css";
import React, { useState } from "react";
import ReactDOM from "react-dom";
import { createSolver } from "./solver";

const solver = createSolver();

const App = () => {
  const [blacklist, setBlacklist] = useState("");
  const [board, setBoard] = useState([[" "]]);
  const [letters, setLetters] = useState("");
  const [message, setMessage] = useState("Loading...");
  const [ready, setReady] = useState(false);
  const [tray, setTray] = useState("");

  const updateBlacklistAndSolve = (e) => {
    const newBlacklist = e.target.value.replace(/[^A-Z,]/gi, "").toLowerCase();
    setBlacklist(newBlacklist);
    solver.solve(letters, newBlacklist);
  };
  const updateLettersAndSolve = (e) => {
    const newLetters = e.target.value.replace(/[^A-Z]/gi, "").toLowerCase();
    setLetters(newLetters);
    solver.solve(newLetters, blacklist);
  };
  
  solver.onReady(() => {
    setReady(true);
  });

  solver.onUpdate(({ tray, message, board }) => {
    setTray(tray);
    setMessage(message);
    setBoard(board);
  });

  return (
    <div>
      <div className="header">
        <h1>Bananagrams Helper</h1>
      </div>
      <div className="letterbox">
        <input type="text" placeholder="yourtileshere" value={letters} onInput={updateLettersAndSolve} disabled={!ready} />
      </div>
      <div className="controls">
        <div>
          <label>Word Blacklist</label>
          <small>(Comma-separated)</small>
        </div>
        <div>
          <input type="text" value={blacklist} onInput={updateBlacklistAndSolve} disabled={!ready} />
        </div>
      </div>
      <div className="boardbox">
        <div className="board">
          {board.map((row, rowIndex) => (
            <div key={rowIndex} className="row">
              {row.map((cell, cellIndex) => (
                <div key={cellIndex} className={cell === " " ? "cell empty" : "cell"}>{cell}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="tray">{tray}</div>
      <div className="message">{message}</div>
    </div>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("app")
);
