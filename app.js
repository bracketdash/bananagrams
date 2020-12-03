/*

TODO:

- make a new project using create-react-app
- redesign to make status messages prominent until a solution is found
- maybe turn dictionary and board into classes?
- maybe use a compressed version of the dictionary that unpacks on load?
- store board state as a rows Map() and a columns Map() (i.e. `rows: new Map([ [1, { start: 2, tiles: "c-t" }] ])`)
- store state history as a Map() (i.e. `history: new Map([ [1, boardState ] ])`)
- store the word list as a Map() (i.e. `words: new Map([ [1, "word" ] ])`)
- create a new Map() of (alphabetized tray letters) => Set(indexes that reference words that can be made with the tray letters)
- create a new Map() of (`${position of letter in word}:${letter}`) => Set(indexes that reference words with the provided letter at the given position)
- use the changes above to optimize the solver for speed; goals:
    - >80% of solutions in <0.4s
    - >95% of solutions in <1.0s
    - For the <5% of solutions that may take >1.0s, update status message to let them know the engine is still processing

*/

var trie = {};

var app = new Vue({
    el: "#app",
    data: {
        blacklist: "",
        board: [[]],
        letters: "",
        message: "",
        tray: ""
    },
    methods: {
        solve: function() {
            var self = this;
            this.letters = this.letters.replace(/[^A-Z]/gi, "");
            this.blacklist = this.blacklist.replace(/[^,A-Z]/gi, "");
            this.message = "";
            solve(self.letters, self.blacklist.split(","), trie, function(clientState) {
                if (clientState.end) {
                    self.message = clientState.message;
                } else if (
                    self.letters != clientState.originalLetters ||
                    self.blacklist != clientState.blacklist.join(",")
                ) {
                    return false;
                }
                self.board = clientState.board;
                self.tray = clientState.tray;
                return true;
            });
        }
    },
    mounted: function() {
        trie = getTrie();
    }
});
