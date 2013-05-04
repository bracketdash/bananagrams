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
	
	TODO:
	1. create a list of candidate words (see below) [IN PROGRESS]
	2. store a history of the board so we can step back and try different words.
	3. try the first candidate word first.
	4. if that word works, continue and try to add another candidate word to the board
	5. if at any point no candidate words can be formed, restore the previous state of the board and try with the next candidate word from the last batch
	6. if all the candidate words have been tried and none of them could produce more candidate words, restore the state before the previous state of the board
	
	Candidate Words
	---------------
	If the board is blank:
	
	1. make a list of words that can be formed from the available letters [DONE]
	
	If the board is not blank:
	
	1. make a collection of attachment points based on the board [IN PROGRESS]
	
	Example: If this is the current board...
	
	   P  T
	   OFFICE
	   N  L
	ICKY  EL
	
	This would be the attachmentPoints array: [
		{direction:'across',part:'p..t',     constraints:['.f','.f']                          },
		{direction:'across',part:'office'                                                     },
		{direction:'across',part:'...n..l..',constraints:['.i','.c','.k','f.','f.','c.l','e.']},
		{direction:'across',part:'icky..el', constraints:['.','.']                            },
		{direction:'down'  ,part:'i'                                                          },
		{direction:'down'  ,part:'c'                                                          },
		{direction:'down'  ,part:'...k',     constraints:['.p','.office','.n']                },
		{direction:'down'  ,part:'pony'                                                       },
		{direction:'down'  ,part:'.f..',     constraints:['p.','n.','icky.']                  },
		{direction:'down'  ,part:'.f..',     constraints:['.t','.l','.el']                    },
		{direction:'down'  ,part:'tile'                                                       },
		{direction:'down'  ,part:'.c.l',     constraints:['t.','l.']                          },
		{direction:'down'  ,part:'e..',      constraints:['.','el.']                          }
	]
	
	2. make a list of words based on the attachment points
	
	Example: For the first attachment point above, assuming available letters (A H B Y E L K)...
		
		1. Find all the words that can be formed with the letters A H B Y E L K P
			a. The last "P" can only be the last or second to last letter.
			b. If the last "P" is the second to last letter, the last letter + "F" must also form a valid word.
		
		2. Find all the words that can be formed with the letters A H B Y E L K T
			a. The first "T" can only be the first or second letter.
			b. If the first "T" is the second letter, the first letter + "F" must also form a valid word.
		
		3. Find all the words that can be formed with the letters A H B Y E L K P T
			a. All the words must contain the pattern /p..t/
			b. The first letter between "P" and "T" + "F" must also form a valid word.
			c. The second letter between "P" and "T" + "F" must also form a valid word.
	
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
			tracker = [[0,0,0,0]];
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
