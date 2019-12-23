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
        solve: function() {
            var self = this;
            this.letters = this.letters.replace(/[^A-Z]/gi, '');
            this.blacklist = this.blacklist.replace(/[^,A-Z]/gi, '');
            this.message = '';
            solve(
                self.letters,
                self.blacklist.split(','),
                trie,
                function(clientState) {
                    if (clientState.end) {
                        self.message = clientState.message;
                    } else if (
                        self.letters != clientState.originalLetters ||
                        self.blacklist != clientState.blacklist.join(',')
                    ) {
                        return false;
                    }
                    self.board = clientState.board;
                    self.tray = clientState.tray;
                    return true;
                }
            );
        }
    },
    mounted: function() {
        trie = getTrie();
    }
});
