// best to keep this a secret from vue (really big)
var trie = {};

var app = new Vue({
    el: '#app',
    data: {
        board: [[]],
        letters: '',
        message: '',
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
            this.board = [[]];
            this.letters = '';
            this.message = '';
            this.tray = '';
        },
        solve: function() {
            var self = this;
            window.stop = false;
            solve(this.letters, [], trie, function(clientState) {
                self.board = clientState.board;
                self.message = clientState.message;
                self.tray = clientState.letters;
            });
        }
    },
    mounted: function() {
        trie = getTrie();
    }
});
