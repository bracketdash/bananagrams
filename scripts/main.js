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
            if (window.stop) {
                this.board = [[]];
                this.message = '';
                this.tray = '';
            } else {
                window.stop = true;
            }
        },
        filterLetters: function() {
            this.letters = this.letters.replace(/[^A-Z]/gi, '');
        },
        solve: function() {
            var self = this;
            window.stop = true;
            self.message = '';
            setTimeout(function() {
                window.stop = false;
                solve(self.letters, [], trie, function(clientState) {
                    self.board = clientState.board;
                    if (clientState.end) {
                        self.message = clientState.message;
                    }
                    self.tray = clientState.letters;
                });
            }, 10);
        },
        solveAll: function() {
            var self = this;
            var letterSetsSolved = 0;
            var incrementLetters = function(letters, zindex) {
                var ll = letters.length;
                var inrementedLetterSet = letters;
                if (zindex === ll+1) {
                    inrementedLetterSet = _.repeat('a', ll+1);
                } else if (letters[ll-zindex] == 'z') {
                    inrementedLetterSet = incrementLetters(letters, zindex+1);
                } else if (zindex === 1) {
                    inrementedLetterSet = letters.substring(0, ll-1) + String.fromCharCode(letters[ll-1].charCodeAt(0) + 1);
                } else {
                    inrementedLetterSet = letters.substring(0, ll-zindex+1);
                    inrementedLetterSet = inrementedLetterSet.substring(0, inrementedLetterSet.length-1) + String.fromCharCode(inrementedLetterSet[inrementedLetterSet.length-1].charCodeAt(0) + 1);
                    inrementedLetterSet += _.repeat('a', zindex-1);
                }
                return inrementedLetterSet;
            };
            var loop = function(letters) {
                self.letters = letters;
                solve(letters, [], trie, function(clientState) {
                    var to = 0;
                    self.board = clientState.board;
                    self.tray = clientState.letters;
                    if (clientState.end) {
                        if (clientState.message === 'SOLVED!') {
                            letterSetsSolved += 1;
                            self.message = 'Solved for ' + letterSetsSolved + ' letter sets!';
                            to = 500;
                        }
                        setTimeout(function() {
                            loop(incrementLetters(self.letters, 1));
                        }, to);
                    }
                });
            };
            window.stop = true;
            setTimeout(function() {
                window.stop = false;
                loop('abracadabra');
            }, 10);
        }
    },
    mounted: function() {
        trie = getTrie();
    }
});
