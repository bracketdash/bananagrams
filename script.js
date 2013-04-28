// build the dictionary
var all = JSON.parse('{'+all.replace(/([a-z])/g,"\"$1\":{")
	.replace(/([0-9])/g, function($1){
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

var counts = {
	rootExists: 0,
	isWholeWord: 0,
	countTest: 0
};

// check if a root exists in the dictionary
function rootExists(word){
	counts.rootExists++;
	var members = word.split('');
	var currentMember = all;
	for(var i = 0, ii = members.length; i < ii; i++){
		if(currentMember.hasOwnProperty(members[i])){
			currentMember = currentMember[members[i]];
		} else {
			return false;
		}
	}
	return true;
}

function isWholeWord(word){
	counts.isWholeWord++;
	var members = word.split('');
	var currentMember = all;
	for(var i = 0, ii = members.length; i < ii; i++){
		currentMember = currentMember[members[i]];
		if(i == members.length - 1 && !currentMember.hasOwnProperty('0')){
			return false;
		}
	}
	return true;
}

// solve function
function solve(string){
	
	var start = new Date().getTime();
	
	// define out vars
	var result = [];
	
	// get counts for tray
	var trayCounts = function(){
		var i = string.length, trayCounts = {};
		while (i){
			trayCounts[string[--i]] = (trayCounts[string[i]] || 0) + 1;
		}
		return trayCounts;
	}();
	
	// run a count test
	function countTest(word){
		counts.countTest++;
		
		// get counts for word
		var i = word.length, wordCounts = {};
		while (i){
			wordCounts[word[--i]] = (wordCounts[word[i]] || 0) + 1;
		}
		
		// run the test
		var pass = true;
		_.forOwn(wordCounts, function(val, key){
			if(val > trayCounts[key]){
				pass = false;
			}
		});
		return pass;
	}
	
	// the looper function
	function loop(depth,prefix){
		for(var i=0; i<string.length; i++){
			var next = prefix+string[i];
			if(rootExists(next)){
				if(depth > 0){
					loop(depth-1,next);
				} else if(result.indexOf(next) == -1 && isWholeWord(next) && countTest(next)){
					result.push(next);
				}
			}
		}
	}
	
	// run the looper function
	for(var i=0; i<string.length; i++){
		loop(i,'');
	}
	
	console.log('Took '+(new Date().getTime() - start)+'ms');
	
	// return the word list
	return result;
}

$(function(){
	$('input').focus().keyup(function(e){
		$(this).val($(this).val().replace(/[^a-z]/gi, '').toLowerCase());
		if(e.keyCode == 13){
			var words = solve($(this).val()), markup = '';
			for(var x=0,xx=words.length;x<xx;x++){
				markup += '<div>' + words[x] + '</div>';
			}
			$('#board').html(markup);
		}
	});
});