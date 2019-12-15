/*
TODO:
- (getMatches.js) BUG: Pattern ignores words that start after the first tile or end before the last tile in the strip
- Add button to stop processing (and autostop if they hit the solve button again)
- Add support for disallowed words
*/

var trie = {};

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
            solve(this.letters, [], trie, function(board, letters) {
                self.board = board;
                self.lettersLeft = letters || '';
            }).then(function(answer) {
                self.board = answer.board;
                self.lettersLeft = answer.letters || '';
            });
        }
    },
    mounted: function() {
        trie = getTrie();
    }
});
