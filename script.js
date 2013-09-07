var bh = angular.module('bh', []);

bh.controller('bhCtrl', function($scope){
	
	var utilities = {
		buildDictionary: function(){
			all = JSON.parse('{'+all.replace(/([a-z])/g,"\"$1\":{").replace(/([0-9])/g, function($1){
				var a = parseFloat($1), b = '';
				if(a > 0){
					for(var x=0;x<a;x++){
						b += '}';
					}
				}
				return '"0":1'+b+',';
			}).replace(/([A-Z])/g, function($1){
				var a = $1.charCodeAt()-55, b = '';
				for(var x=0;x<a;x++){
					b += '}';
				}
				return '"0":1'+b+',';
			})+'"0":1}}}}}}}}');
		},
		findConnectingWords: _.throttle(function(){
			if($scope.m.activeCell.length === 0){
				return;
			}
			// TODO: search for words that can connect to the active board cell
			
			/*
			
			Game plan:
			
			- for each possible word section (see below):
				- create regex patterns possible words must adhere to
				- make a temporary variable that has all the remaining letters
					AND the letters that are part of the regex pattern
				- get all the words that match the regex pattern
			- then, for each word that makes other words on the board, if any:
				- remove any words that make invalid words
			
			What constitutes a possible word section?
			
			Take the following example board:
			
			WORDS
			 R  O
			 DEN
			 I
			 NAUGHT
			 A  R
			 R  A
			 Y  PIE
			    E
			
			If the user selects the "A" in "ORDINARY"...
			
			These would be the regex patterns for the possible word sections to loop over:
			
			- .*a.
			- .*a.{2}r.*
			- .r.*
			
			Once all possible words given those patterns are found, loop through them and
				make sure they don't create any invalid words by accident
			
			*/
			
			
		}, 500, {
			leading: false,
			trailing: true
		}),
		findInitialWordlist: _.throttle(function(){
			var words = [];
			function looper(object, traypart, prefix){
				_.forOwn(object, function(val, key){
					var traytray = traypart.slice();
					if(key == '0'){
						words.push({word:prefix, x:0, y:0, dir:'down'});
					} else if(traytray.indexOf(key) != -1){
						traytray.splice(traytray.indexOf(key),1);
						looper(val, traytray, prefix + key);
					}
				});
			}
			looper(all, $scope.m.letters, '');
			if(words.length){
				words.sort(function(a,b){
					if(a.word.length < b.word.length){
						return 1;
					} else if(a.word.length > b.word.length){
						return -1;
					}
					return 0;
				});
				if(words.length > 100){
					$scope.m.wordlistmsg = 'Found more than 100 words:';
					words = words.slice(0,100);
				} else {
					$scope.m.wordlistmsg = 'Found ' + words.length + ' words:';
				}
			} else {
				$scope.m.wordlistmsg = 'No words could be found.';
			}
			$scope.m.wordlist = words;
			$scope.$$phase || $scope.$digest();
		}, 500, {
			leading: false,
			trailing: true
		}),
		processBoard: function(){
			var hm = [], vm = [], board = [];
			if($scope.m.board.length){
				_.each($scope.m.board, function(wordObj){
					var horizMax = wordObj.x + 1,
						verticMax = wordObj.y + 1;
					if(wordObj.dir == 'right'){
						horizMax += wordObj.word.length - 1;
					} else {
						verticMax += wordObj.word.length - 1;
					}
					hm.push(horizMax);
					vm.push(verticMax);
				});
				hm.sort(function(a,b){
					if(a>b){
						return -1;
					} else if(a<b){
						return 1;
					}
					return 0;
				});
				vm.sort(function(a,b){
					if(a>b){
						return -1;
					} else if(a<b){
						return 1;
					}
					return 0;
				});
				for(var y=0,yy=vm[0];y<yy;y++){
					board.push([]);
					for(var x=0,xx=hm[0];x<xx;x++){
						board[y].push({letter:''});
					}
				}
				_.each($scope.m.board, function(wordObj, wordIndex){
					for(var y=0,yy=wordObj.word.length;y<yy;y++){
						var coordX = wordObj.x,
							coordY = wordObj.y;
						if(wordObj.dir == 'right'){
							coordX += y;
						} else {
							coordY += y;
						}
						if(board[coordY][coordX].letter == ''){
							board[coordY][coordX] = {letter: wordObj.word[y], words: [wordIndex]};
						} else {
							board[coordY][coordX].words.push(wordIndex);
						}
					}
				});
			}
			var lettersOnBoard = _.pluck(_.filter(_.flatten(board), function(cell){
				return cell.letter != '';
			}), 'letter');
			var allletters = $scope.m.allletters.slice();
			$.each(allletters, function(indexA, valueA){
				$.each(lettersOnBoard, function(indexB, valueB){
					if(valueA == valueB){
						allletters[indexA] = null;
						lettersOnBoard[indexB] = null;
						return false;        
					}
				});
			});
			var remainingLetters = [];
			$.each(allletters, function(idx,val){
				if(val != null){
					remainingLetters.push(val);
				}
			});
			$scope.m.letters = remainingLetters;
			$scope.m.boardArr = board;
		}
	};
	
	$scope.m = {
		activeCell: [],
		allletters: [],
		board: [],
		boardArr: [],
		emptyboardmsg: 'Enter your initial set of letters to get started.',
		initialset: '',
		letters: [],
		step: 1,
		wordlist: [],
		wordlistmsg: 'Waiting for letters...'
	};
	
	$scope.addWordToBoard = function(word){
		$scope.m.board.push(word);
		$scope.m.wordlist = [];
		$scope.m.wordlistmsg = 'Select a letter on the board.';
		$scope.m.activeCell = [];
	}
	
	$scope.removeLetter = function(index, letter){
		$scope.m.letters.splice(index, 1);
		$scope.m.allletters.splice(_.indexOf($scope.m.allletters, letter), 1);
	}
	
	$scope.removeWords = function(cell){
		if(cell.letter == ''){
			return false;
		}
		_.each(cell.words, function(wordIndex){
			$scope.m.board[wordIndex] = null;
		});
		_.each($scope.m.board, function(word, index){
			if(word == null){
				$scope.m.board.splice(index, 1);
			}
		});
		if($scope.m.board.length === 0){
			$scope.m.wordlistmsg = 'Processing...';
			utilities.findInitialWordlist();
		}
		$scope.m.activeCell = [];
	}
	
	$scope.selectLetter = function(r, c, cell){
		if(cell.letter == ''){
			return false;
		}
		$scope.m.activeCell = [r, c];
		utilities.findConnectingWords();
	}
	
	$scope.submitInitial = function(){
		if($scope.m.initialset.length == 0){
			return false;
		}
		$scope.m.step = 2;
		$scope.m.wordlistmsg = 'Processing...';
		$scope.m.letters = $scope.m.initialset.split('');
		$scope.m.allletters = $scope.m.letters;
		$scope.m.emptyboardmsg = 'Select a word to the left to place it on the board.';
		utilities.findInitialWordlist();
	}
	
	$scope.$watch(function(){
		return $scope.m.initialset;
	}, function(){
		$scope.m.initialset = $scope.m.initialset.toLowerCase().replace(/[^a-z]/gi, '');
	});
	
	$scope.$watch(function(){
		return $scope.m.board.length;
	}, function(){
		utilities.processBoard();
	});
	
	$(function(){
		$('input').focus();
		$('body').keydown(function(e){
			if($scope.m.step > 1){
				var inp = String.fromCharCode(e.keyCode);
				if(/[a-zA-Z]/.test(inp)){
					$scope.m.letters.push(inp.toLowerCase());
					$scope.m.allletters.push(inp.toLowerCase());
					if($scope.m.board.length === 0 || $scope.m.activeCell.length){
						$scope.m.wordlist = [];
						$scope.m.wordlistmsg = 'Processing...';
						if($scope.m.board.length === 0){
							setTimeout(function(){
								utilities.findInitialWordlist();
							},0);
						} else {
							utilities.findConnectingWords();
						}
					}
					$scope.$$phase || $scope.$digest();
				}
			}
		});
		utilities.buildDictionary();
	});
	
});