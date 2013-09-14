/*

TODO:

- lots of testing with a bunch of different initial letter sets, words, etc.
	- logic to determine search direction is buggy
	- still experiencing conflicting overwrites
- when the user hovers over a word, show a ghost of it on the board
- right now we're only searching for connecting words in one direction
	- what if they select a letter that can have connecting words in both directions?

*/

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
			
			console.log('Finding connecting words...');
			
			if($scope.m.activeCell.length === 0){
				return;
			}
			
			console.log('Setting up some variables...');
			
			var ba = $scope.m.boardArr,
				ac = $scope.m.activeCell,
				dir = 'down',
				words = [],
				lineofsight = [],
				selectedletter = ac[0];
			
			console.log('Figuring out the basics...');
			// TODO: this logic is still kinda faulty--deserves a second look and lots of testing
			
			if(ac[1] > 0 && ba[ac[1]-1][ac[1]] != '' && ac[1] < ba.length-1 && ba[ac[1]+1][ac[0]] != ''){
				if(ac[0] > 0 && ba[ac[1]][ac[0]-1] != '' && ac[0] < ba[0].length-1 && ba[ac[1]][ac[0]+1] != ''){
					$scope.m.wordlist = [];
					$scope.m.wordlistmsg = 'No words could be found.';
					$scope.$$phase || $scope.$digest();
					
					console.log('No words found.');
					
					return;
				}
				dir = 'right';
				lineofsight = _.pluck(ba[ac[1]], 'letter');
				selectedletter = ac[0];
			} else {
				lineofsight = _.pluck(_.pluck(ba, ac[0]), 'letter');
			}
			
			console.log('dir: ', dir);
			console.log('Creating lineofsight...');
			
			var templetters = lineofsight.join('').split(''),
				lettersfound = 0, lineofsightoffset = 0;
			_.each(lineofsight, function(letter, index){
				if(letter == ''){
					if(lettersfound == 0 || lettersfound == templetters.length){
						lineofsight.splice(index,1);
						if(lettersfound == 0){
							lineofsightoffset++;
							selectedletter--;
						}
					}
				} else {
					lettersfound++;
				}
			});
			
			console.log('lineofsight:', lineofsight, 'selectedletter:', selectedletter);
			console.log('Creating segments...');
			
			var blanks = 0, segments = [];
			_.each(lineofsight, function(letter, index){
				if(letter == ''){
					blanks++;
				} else {
					segments.push({
						letter: letter,
						leadingBlanks: blanks,
						beforeSelected: index <= selectedletter,
						afterSelected: index >= selectedletter
					});
					blanks = 0;
				}
			});
			
			console.log('segments:');
			console.log(segments);
			console.log('Creating patterns...');
			
			var patterns = [];
			_.each(_.where(segments, {beforeSelected: true}), function(preSegment, preIndex){
				_.each(_.where(segments, {afterSelected: true}), function(postSegment, postIdx){
					var pattern = '',
						postIndex = postIdx + selectedletter,
						letters = [];
					if(preIndex > 0){
						pattern = '^';
					}
					_.each(segments.slice(preIndex, postIndex+1), function(workingSegment, workingIdx){
						var leadingBlanks = workingSegment.leadingBlanks;
						if(workingIdx == 0){
							if(preIndex > 0 && leadingBlanks > 1){
								leadingBlanks--;
								pattern += '.';
								if(leadingBlanks > 1){
									pattern += '{0,' + leadingBlanks + '}';
								}
							}
						} else if(leadingBlanks > 0){
							pattern += '.';
							if(leadingBlanks > 1){
								pattern += '{' + leadingBlanks + '}';
							}
						}
						pattern += workingSegment.letter;
						if(postIndex == workingIdx + preIndex && postIndex < segments.length-1){
							var followingBlanks = segments[workingIdx + preIndex + 1].leadingBlanks - 1;
							pattern += '.';
							if(leadingBlanks > 1){
								pattern += '{0,' + leadingBlanks + '}';
							}
						}
						letters.push(workingSegment.letter);
					});
					if(postIndex < segments.length-1){
						pattern += '$';
					}
					var offset = 0;
					if(!preSegment.afterSelected){
						offset = _.each(segments.slice(preIndex+1, _.indexOf(_.findWhere(segments, {beforeSelected: true, afterSelected: true}))+1), function(segment){
							offset += segement.leadingBlanks + 1;
						});
					}
					patterns.push({letters: letters, pattern: new RegExp(pattern, 'g'), offset: offset});
				});
			});
			
			console.log(patterns);
			console.log('Creating wordlist...');
			
			var wordlist = [];
			function getPath(obj, ks){
				if (obj === undefined) return void 0;
				if (ks.length === 0) return obj;
				if (obj === null) return void 0;
				return getPath(obj[_.first(ks)], _.rest(ks));
			}
			function looper(object, pattern, traypart, prefix){
				_.forOwn(object, function(val, key){
					var traytray = traypart.slice();
					if(key == '0'){
						if(_.indexOf(prefix, lineofsight[selectedletter]) > 0){
							var matches = prefix.match(pattern.pattern);
							if(matches != null && matches.length){
								_.each(matches, function(match, index){
									var boardOffset = lineofsightoffset + selectedletter - (prefix.split(match, index+1).join(match).length + pattern.offset),
										word = {word: prefix, dir: dir}, pass = true;
									if(dir == 'right'){
										word.x = boardOffset;
										word.y = ac[1];
									} else {
										word.x = ac[0];
										word.y = boardOffset;
									}
									for(var y=0,yy=word.word.length;y<yy;y++){
										var coordX = word.x, coordY = word.y, pline = [], peripheral = [];
										if(dir == 'right'){
											coordX += y;
											if($scope.m.boardArr[0].length > coordX){
												pline = $scope.m.boardArr[coordY];
												if(coordX > 0 && pline[coordX-1].letter != ''){
													_.each(_.first(pline, coordX-1).reverse(), function(letter){
														if(letter.letter == ''){
															return false;
														}
														peripheral.push(letter.letter);
													});
													peripheral.reverse();
												}
												peripheral.push(pline[coordX]);
												if(coordX > 0 && coordX < pline.length-1 && pline[coordX+1].letter != ''){
													_.each(_.rest(pline, coordX+1), function(letter){
														if(letter.letter == ''){
															return false;
														}
														peripheral.push(letter.letter);
													});
												}
											}
										} else {
											coordY += y;
											if($scope.m.boardArr.length > coordY){
												pline = _.pluck($scope.m.boardArr, coordX);
												if(coordY > 0 && pline[coordY-1].letter != ''){
													_.each(_.first(pline, coordY-1).reverse(), function(letter){
														if(letter.letter == ''){
															return false;
														}
														peripheral.push(letter.letter);
													});
													peripheral.reverse();
												}
												peripheral.push(pline[coordY]);
												if(coordY > 0 && coordY < pline.length-1 && pline[coordY+1].letter != ''){
													_.each(_.rest(pline, coordY+1), function(letter){
														if(letter.letter == ''){
															return false;
														}
														peripheral.push(letter.letter);
													});
												}
											}
										}
										if(peripheral.length && typeof getPath(all, peripheral) == 'undefined'){
											pass == false;
										}
									}
									if(pass){
										words.push(word);
									}
								});
							}
						}
					} else if(traytray.indexOf(key) != -1){
						traytray.splice(traytray.indexOf(key),1);
						looper(val, pattern, traytray, prefix + key);
					}
				});
			}
			_.each(patterns, function(pattern, index){
				var tray = $scope.m.letters.slice().concat(pattern.letters);
				console.log('Running original looper...');
				looper(all, pattern, tray, '');
			});
			
			console.log('Wordlist:');
			console.log(words);
			
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
		if(word.x < 0){
			var absx = Math.abs(word.x);
			_.each($scope.m.board, function(word){
				word.x += absx;
			});
			word.x = 0;
		}if(word.y < 0){
			var absy = Math.abs(word.y);
			_.each($scope.m.board, function(word){
				word.y += absy;
			});
			word.y = 0;
		}
		$scope.m.board.push(word);
		$scope.m.wordlist = [];
		$scope.m.wordlistmsg = 'Select a letter on the board.';
		$scope.m.activeCell = [];
	}
	
	$scope.cellClass = function(r, c, cell){
		var sclass = '', ac = $scope.m.activeCell;
		if(cell.letter != ''){
			sclass += 'letter';
		}
		if(cell.letter != '' && ac.length && ac[0] == r && ac[1] == c){
			sclass += ' ';
		}
		if(ac.length && ac[0] == r && ac[1] == c){
			sclass += 'active';
		}
		return sclass;
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
		$scope.m.activeCell = [c, r];
		utilities.findConnectingWords();
	}
	
	$scope.submitInitial = function(){
		if($scope.m.initialset.length == 0){
			return false;
		}
		$scope.m.step = 2;
		$scope.m.wordlistmsg = 'Processing...';
		$scope.m.letters = $scope.m.initialset.split('');
		$scope.m.allletters = $scope.m.letters.slice();
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
