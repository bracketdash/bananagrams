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

// get a list of possible words given a set of letters
function getWords(letters){
	
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

// generate the board
function generateBoard(words, tracker){
	
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
	
	return board;
}

// subtract one array from another, leaving leftover duplicates
function differenceLeaveDupes(arrayA,arrayB){
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

// solve the board
function solve(letters, tracker, board, uid){
	
	// exit out if this is not the most current instance
	if(window.uniqueId != uid){
		return false;
	}
	
	/*
	
	PROCEDURE
	---------
	
	BLANK BOARD (start here):
	
	1. make an array of words that can be formed from the available letters
	
	2. save them to the HISTORY ARRAY as the first WORDLIST
	
	2. add the longest word to the board
	
	3. if all the letters are used, the puzzle is SOLVED
	
	4. if there are still letters in the rack, create a new WORDLIST and continue to NON-BLANK BOARD
	
	NON-BLANK BOARD:
	
	1. Loop through each cell on the board...
	
		a. generate the CONSTRAINT PATTERN for candidate words to match
	
		b. make a list of words with the available letters that match the pattern
		
		c. add each word to the current WORDLIST
		
	2. if the WORDLIST is not empty, sort the words from longest to shortest
	
	3. if the WORDLIST is empty...
		
		a. if this is the first WORDLIST, stop here and run UNSOLVABLE
		
		b. if this is not the first WORDLIST, remove the current WORDLIST
		
		c. remove the last played word from both the board and the current WORDLIST
		
		d. repeat NON-BLANK BOARD from step 3
	
	4. add the first word from the current WORDLIST to the appropriate place on the board
	
	5. if all the letters are used, the puzzle is SOLVED
	
	6. if there are still letters in the rack, create a new WORDLIST and repeat NON-BLANK BOARD
	
	UNSOLVABLE:
	
	1. Inform the user that not all the letters could used
	
	2. Encourage the user to do a "DUMP!" (put one letter back and take three in return)
	
	
	CONCEPTS
	--------
	
	HISTORY ARRAY:
	
	This is an array to keep track of which words are available at each board state.
	
	Example:
	
	var history = [
		// first WORDLIST
		[{word:'aardvark',x:0,y:0,dir:'right'}, {word:'bark',x:0,y:0,dir:'right'}, ...],
		// second WORDLIST
		[{word:'disaster',x:3,y:0,dir:'down'}, ...]
	];
	
	In the above example, the board currently has one word on it, "aardvark"
	and the app has generated a list of possible words for the second word.
	It will try all permutations after playing "disaster", then "danger" and so on.
	If none of them work out, it will remove the entire array for the second board state
	and "aardvark" from the first board state's array, making the only word on the board "bark"
	
	
	CONSTRAINT PATTERN:
	
	This is the magical sauce of the app. I am still figuring this part out. Hang tight.
	
	*/
	
	// create a space for markup to queue
	var markup = '';
	
	// tracker template: [word index, first letter x, first letter y, 0=down/1=right]
	
	if(tracker.length){
		// the board is not blank
		// make the attachmentPoints collection
		var attachmentPoints = [];
		
		// UNDER CONSTRUCTION
		
		// TODO: remove this once this section works without returning false
		console.log('Board is not blank. This piece is still under construction.');
		return false;
	} else {
		// the board is blank
		var words = getWords(letters);
		if(words.length){
			
			// SECTION
			// NOTE: this section will have to be replaced once we start doing history stuff
			tracker = [[0,0,0,1]];
			letters = differenceLeaveDupes(letters, words[0].split(''));
			// /SECTION
			
			board = generateBoard(words, tracker);
			markup = '<table>';
			for(var x=0,xx=board.length;x<xx;x++){
				markup += '<tr><td>' + board[x].join('</td><td>') + '</td></tr>';
			}
			markup += '</table>';
		} else {
			markup = '<p class="text-error">No words could be formed with the provided letters. Try a dump or wait for a peel.</p>';
		}
	}
	
	// do some DOM stuff
	if(letters.length){
		$('#remaining').removeClass('muted').html(letters.join(' '));
	} else {
		$('#remaining').addClass('muted').html('None! Hurray!');
	}
	$('#board').html(markup);
	$('#crunching').hide();
	
	// go again
	setTimeout(function(){
		if(letters.length){
			solve(letters, tracker, board, uid);
		} else {
			console.log('The board is solved!');
		}
	},100);
}

$(function(){
	$('input').focus().keyup(function(e){
		var $t = $(this);
		if(typeof timer != 'undefined'){
			clearTimeout(timer);
		}
		$('#crunching').show();
		window.timer = setTimeout(function(){
			$t.val($t.val().replace(/[^a-z]/gi, '').toLowerCase());
			window.uniqueId = _.uniqueId();
			solve($t.val().split(''), [], [], uniqueId);
		},500);
	});
	$('#crunching').hide();
});
