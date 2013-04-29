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

// get a list of possible words
function wordlist(string){
	
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
	looper(all, string.split(''), '');
	
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

// try all the different words on the board
function placeWords(words, tracker){
	
	// TODO: figure out an arrangement of words that will use all of the letters
	
	// generate the board based on tracker
	var board = generateBoard(words, tracker);
	
	// remove this for production
	console.log(board);
}

// solve function
function solve(string){
	
	// get the possible words
	var words = wordlist(string);
	
	// place the words
	// [word index, first letter x, first letter y, 0=down/1=right]
	var boardArr = placeWords(words, [[0,0,0,0]]);
	
	// return the word list, for now
	// TODO: change this to return boardArr
	return words;
}

$(function(){
	$('input').focus().keyup(function(e){
		if(e.keyCode == 13){
			$(this).val($(this).val().replace(/[^a-z]/gi, '').toLowerCase());
			var words = solve($(this).val()), markup = '';
			for(var x=0,xx=words.length;x<xx;x++){
				markup += '<div>' + words[x] + '</div>';
			}
			$('#board').html(markup);
		}
	});
});
