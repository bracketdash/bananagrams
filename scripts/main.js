/*
TODO:
- (getMatches.js) pattern ignores words that start after the first tile or end before the last tile in the strip
-  Add support for disallowed words
*/

var trie = {};

var app = new Vue({
    el: '#app',
    data: {
        letters: '',
        board: [[]],
        solved: false,
        tray: ''
    },
    methods: {
        cancel: function() {
            window.stop = true;
        },
        filterLetters: function() {
            this.letters = this.letters.replace(/[^A-Z]/gi, '');
        },
        reset: function() {
            window.stop = true;
            this.letters = '';
            this.board = [[]];
            this.solved = false;
            this.tray = '';
        },
        solve: function() {
            var self = this;
            window.stop = false;
            solve(this.letters, [], trie, function(board, letters) {
                self.board = board;
                self.tray = letters || '';
            }).then(function(answer) {
                self.board = answer.board;
                self.tray = answer.letters || '';
            });
        }
    },
    mounted: function() {
        trie = getTrie();
    }
});
