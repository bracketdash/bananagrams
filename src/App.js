function App() {
  return (
    <div className="App">
      <header className="App-header">
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a className="App-link" href="https://reactjs.org" target="_blank" rel="noopener noreferrer">
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;

/*

HTML from old Vue app:

<div id="app">
    <div class="header">
        <h1>Bananagrams Solver</h1>
    </div>
    <div class="letterbox">
        <input type="text" placeholder="yourtileshere" v-model="letters" @keyup="solve" />
    </div>
    <div class="controls">
        <div>
            <label>Word Blacklist</label>
            <small>(Comma-separated)</small>
        </div>
        <div>
            <input type="text" v-model="blacklist" @keyup="solve" />
        </div>
    </div>
    <div class="boardbox">
        <div class="board">
            <div class="row" v-for="row in board">
                <div class="cell" v-for="cell in row" :class="cell == ' ' ? 'empty' : ''">
                    {{cell}}
                </div>
            </div>
        </div>
    </div>
    <div class="tray">{{tray}}</div>
    <div class="message">{{message}}</div>
</div>

*/
