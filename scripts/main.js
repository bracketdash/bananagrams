/*
TODO:
- BUGS:
    - WECUTOUTYOURDAEMONNOTYOURBRAIN
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
        solveBtnText: 'Solve',
        solved: false
    },
    methods: {
        solve: function() {
            var self = this;
            self.solveBtnText = 'Solving...';
            solve(this.letters, [], trie, function(board, letters) {
                self.board = board;
                self.lettersLeft = letters || '';
            }).then(function(answer) {
                self.board = answer.board;
                self.lettersLeft = answer.letters || '';
                if (self.solved) {
                    self.solveBtnText = 'Solved! :)';
                } else {
                    self.solveBtnText = 'Unsolved :(';
                }
            });
        }
    },
    mounted: function() {
        trie = getTrie();
    }
});
