// some vars
var letters, history, board, uid;

// build the dictionary
var all = JSON.parse('{'+all.replace(/([a-z])/g,"\"$1\":{").replace(/([0-9])/g, function($1){
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

// subtract one array from another, leaving leftover duplicates
var differenceLeaveDupes = function(arrayA,arrayB){
	arrayA = arrayA.slice();
	arrayB = arrayB.slice();
	$.each(arrayA, function(indexA,valueA){
		$.each(arrayB, function(indexB, valueB){
			if(valueA == valueB){
				arrayA[indexA] = null;
				arrayB[indexB] = null;
				return false;        
			}
		});
	});
	var arrayC = [];
	$.each(arrayA,function(idx,val){
		if(val != null){
			arrayC.push(val);
		}
	});
	return arrayC;
}

var getPattern = function(x, y, dir){
	
	// TODO: build a constraining pattern for a given starting point and direction
	
}

var getWords = function(x, y, dir){
	
	// TODO #1
	// must return wordlist like this:
	// [{word:'disaster',x:3,y:0,dir:'down'}, ...]
	
	// TODO #2
	// the args have changed to (x, y, dir, pattern)
	
	// define our vars
	var result = [];
	
	// the looper function
	function looper(object, traypart, prefix){
		_.forOwn(object, function(val, key){
			var traytray = traypart.slice();
			if(key == '0'){
				result.push(prefix);
			}
			if(traytray.indexOf(key) != -1){
				traytray.splice(traytray.indexOf(key),1);
				looper(val, traytray, prefix + key);
			}
		});
	}
	
	// run the looper function
	looper(all, letters, '');
	
	// sort the words by length, longest first
	result.sort(function(a,b){
		if(a.length < b.length){
			return 1;
		} else if(a.length > b.length){
			return -1;
		}
		return 0;
	});
	
	// return the word list
	return result;
}

// generate and display the board
var processBoard = function(){
	
	// TODO
	// arguments have been removed
	// need to build the board based on history
	
	// define our vars
	var board = [], hm = [], vm = [];
	
	// get the vertical and horizontal maximums from tracker
	for(var x=0,xx=tracker.length;x<xx;x++){
		var horizMax = tracker[x][1] + 1, verticMax = tracker[x][2] + 1;
		if(tracker[x][3] == 1){
			horizMax = horizMax + words[tracker[x][0]].length - 1;
		} else {
			verticMax = verticMax + words[tracker[x][0]].length - 1;
		}
		hm.push(horizMax);
		vm.push(verticMax);
	}
	
	// sort the maximums to find the highest
	hm.sort(function(a,b){
		if(a>b){
			return 1;
		} else if(a<b){
			return -1;
		}
		return 0;
	});
	vm.sort(function(a,b){
		if(a>b){
			return 1;
		} else if(a<b){
			return -1;
		}
		return 0;
	});
	
	// build a blank board with appropriate dimensions
	for(var y=0,yy=vm[0];y<yy;y++){
		board.push([]);
		for(var x=0,xx=hm[0];x<xx;x++){
			board[y].push(' ');
		}
	}
	
	// place the words on the blank board
	for(var x=0,xx=tracker.length;x<xx;x++){
		for(var y=0,yy=words[tracker[x][0]].length;y<yy;y++){
			var coordX = tracker[x][1], coordY = tracker[x][2];
			if(tracker[x][3] == 1){
				coordX = coordX + y;
			} else {
				coordY = coordY + y;
			}
			board[coordY][coordX] = words[tracker[x][0]][y];
		}
	}
	
	// generate the markup
	var markup = '<table>';
	for(var x=0,xx=board.length;x<xx;x++){
		markup += '<tr><td>' + board[x].join('</td><td>') + '</td></tr>';
	}
	markup += '</table>';
	$('#board').html(markup);
}

// solve the board
var solve = function(id){
	
	// exit if id conflict
	if(id != uid){
		return;
	}
	
	var words;
	if(board.length){
		// the board is not blank
		words = [];
		_.each(board, function(rowObject, row){
			_.each(row, function(cellObject, cell){
				words = words.concat(getWords(row, cell, 'down'), getWords(row, cell, 'right'));
			});
		});
	} else {
		// the board is blank
		words = getWords(0, 0, 'right');
	}
	
	if(words.length){
		// sort the words from longest to shortest
		words.sort(function(a,b){
			if(a.word.length < b.word.length){
				return 1;
			} else if(a.word.length > b.word.length){
				return -1;
			}
			return 0;
		});
	}
	
	// add the wordlist to history
	history.push(words);
	
	// process words
	processWords(id);
}

var processWords = function(id){
	
	// exit if id conflict
	if(id != uid){
		return;
	}
	
	if(!history[history.length-1].length){
		// current wordlist is empty
		if(history.length === 1){
			// tell the user to try a dump or wait for a peel
			$('#remaining').empty();
			$('#board').html('<p class="text-error">No words could be formed with the provided letters. Try a dump or wait for a peel.</p>');
		} else {
			// step back and try a different word
			history.splice(history.length-1,1);
			history[history.length-1].splice(0,1);
			
			// process the board
			processBoard();
			$('#remaining').removeClass('muted').html(letters.join(' '));
			
			// process words again
			setTimeout(function(){
				processWords(id);
			}, 500);
		}
		$('#crunching').hide();
		return;
	}
	
	// get the remaining letters
	letters = differenceLeaveDupes(letters, history[history.length-1][0].word);
	
	if(letters.length){
		// there are still letters on the rack
		$('#remaining').removeClass('muted').html(letters.join(' '));
		setTimeout(function(){
			solve(id);
		}, 500);
	} else {
		// all the letters are used
		$('#remaining').addClass('muted').html('None! Hurray!');
	}
	
	// process the board
	processBoard();
}

$(function(){
	$('input').focus().keyup(function(e){
		$(this).val($(this).val().replace(/[^a-z]/gi, '').toLowerCase());
		if(e.keyCode == 13){
			$('#crunching').show();
			letters = $(this).val().split('');
			history = [];
			board = [];
			uid = _.uniqueId();
			solve(uid);
		}
	});
	$('#crunching').hide();
});
