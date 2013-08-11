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
var differenceLeaveDupes = function(arrayA, arrayB){
	arrayA = arrayA.split('');
	arrayB = arrayB.split('');
	$.each(arrayA, function(indexA, valueA){
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

// TODO: CHANGE NEEDED
// we also want to find words that might start before a filled cell
// accomodate for all x values before x if searching for horizontal words
// accomodate for all y values before y if searching for vertical words

var getWords = function(rc, dir){
	if(board.length){
		// console.log('board is not blank: get a pattern');
		// TODO
		var pattern = new RegExp();
	}
	
	// TODO
	// the below works if the board is blank
	// we need to change it so if the board is not blank
	// it will look for words that fit in with the existing word(s)
	
	var words = [];
	function looper(object, traypart, prefix){
		_.forOwn(object, function(val, key){
			var traytray = traypart.slice();
			if(key == '0'){
				words.push({word:prefix, x:0, y:0, dir:'right'});
			} else if(traytray.indexOf(key) != -1){
				traytray.splice(traytray.indexOf(key),1);
				looper(val, traytray, prefix + key);
			}
		});
	}
	
	// console.log('run the looper function');
	looper(all, letters, '');
	
	// console.log('returning ' + words.length + ' words');
	return words;
}

// generate and display the board
var processBoard = function(){
	
	var hm = [],
		vm = [];
	
	// console.log('get the vertical and horizontal maximums from history');
	_.each(history, function(wordlist, step){
		var wordObj = wordlist[0],
			horizMax = wordObj.x + 1,
			verticMax = wordObj.y + 1;
		if(wordObj.dir == 'right'){
			horizMax += wordObj.word.length - 1;
		} else {
			verticMax += wordObj.word.length - 1;
		}
		hm.push(horizMax);
		vm.push(verticMax);
	});
	
	// console.log('sort the maximums to find the highest');
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
	
	// console.log('build a blank board with appropriate dimensions');
	board = [];
	for(var y=0,yy=vm[0];y<yy;y++){
		board.push([]);
		for(var x=0,xx=hm[0];x<xx;x++){
			board[y].push(' ');
		}
	}
	
	// console.log('board is ' + vm[0] + ' tall and ' + hm[0] + ' wide');
	
	// console.log('place the words on the blank board');
	_.each(history, function(wordlist, step){
		var wordObj = wordlist[0];
		for(var y=0,yy=wordObj.word.length;y<yy;y++){
			var coordX = wordObj.x,
				coordY = wordObj.y;
			if(wordObj.dir == 'right'){
				coordX += y;
			} else {
				coordY += y;
			}
			// console.log('setting (' + coordY + ', ' + coordX + ') to ' + wordObj.word[y]);
			board[coordY][coordX] = wordObj.word[y];
		}
	});
	
	// console.log('get the remaining letters');
	var lettersOnBoard = _.flatten(board).join('').replace(/ /g,'');
	letters = differenceLeaveDupes($('input').val(), lettersOnBoard);
	
	// console.log('generate the markup');
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
		// console.log('the board is not blank');
		words = [];
		_.each(board, function(rowObject, row){
			words = words.concat(getWords(row, 'right'));
		});
		_.each(board[0], function(cellObject, cell){
			words = words.concat(getWords(cell, 'down'));
		});
	} else {
		// console.log('the board is blank');
		words = getWords(0, 'right');
	}
	
	if(words.length){
		// console.log('sort the words from longest to shortest');
		words.sort(function(a,b){
			if(a.word.length < b.word.length){
				return 1;
			} else if(a.word.length > b.word.length){
				return -1;
			}
			return 0;
		});
	}
	
	// console.log('add the wordlist to history');
	history.push(words);
	
	// console.log('process words');
	processWords(id);
}

var processWords = function(id){
	
	// exit if id conflict
	if(id != uid){
		return;
	}
	
	if(!history[history.length-1].length){
		// console.log('current wordlist is empty');
		if(history.length === 1){
			// console.log('tell the user to try a dump or wait for a peel');
			$('#remaining').empty();
			$('#board').html('<p class="text-error">No words could be formed with the provided letters. Try a dump or wait for a peel.</p>');
		} else {
			// console.log('step back and try a different word');
			history.splice(history.length-1,1);
			history[history.length-1].splice(0,1);
			
			// console.log('trying another of a remaining ' + history[history.length-1].length + ' words');
			
			// console.log('process the board');
			processBoard();
			$('#remaining').removeClass('muted').html(letters.join(' '));
			
			// console.log('process words again');
			setTimeout(function(){
				processWords(id);
			}, 250);
		}
		$('#crunching').hide();
		return;
	}
	
	// console.log('process the board');
	processBoard();
	
	if(letters.length){
		// console.log('there are still letters on the rack');
		$('#remaining').removeClass('muted').html(letters.join(' '));
		setTimeout(function(){
			solve(id);
		}, 250);
	} else {
		// console.log('all the letters are used');
		$('#remaining').addClass('muted').html('None! Hurray!');
	}
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
