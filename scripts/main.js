/*
TODO:
BUG: "SOMEREALISTICTILES" solution has just one "S" (I think because we're taking away letters based on word matched and not letters added to the board)
Show progress info, like status, indexes, etc.
Add button to stop processing (and autostop if they hit the solve button again)
Add support for disallowed words
*/

var app = new Vue({
    el: '#app',
    data: {
        letters: '',
        board: [[]],
        lettersLeft: '',
        solved: false
    },
    methods: {
        solve: function() {
            var self = this;
            window.solve(this.letters, [], function(board, letters) {
                self.board = board;
                self.lettersLeft = letters;
            }).then(function(answer) {
                self.board = answer.board;
                self.lettersLeft = answer.letters;
            });
        }
    }
});

setTimeout(function() {
    // TODO: move this to the mount event of the vue app
    window.trie = getTrie();
});
