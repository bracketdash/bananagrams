var trie = {};

var app = new Vue({
    el: '#app',
    data: {
        blacklist: '',
        board: [[]],
        letters: '',
        message: '',
        tray: ''
    },
    methods: {
        filterLetters: function() {
            this.letters = this.letters.replace(/[^A-Z]/gi, '');
        },
        solve: function() {
            var self = this;
            self.message = '';
            solve(self.letters, self.blacklist.replace(/[^,A-Z]/gi, '').split(','), trie, function(clientState) {
                self.board = clientState.board;
                if (clientState.end) {
                    self.message = clientState.message;
                }
                self.tray = clientState.letters;
            });
        }
    },
    mounted: function() {
        trie = getTrie();
    }
});
