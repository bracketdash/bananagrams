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
function solve(string){
	
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

// show the possible words
function showPossible(){
	var words = solve(_.difference($('input').val().split(''), $('#chosen').text().split('')).join('')),
		markup = '';
	if(words.length){
		for(var x=0,xx=words.length;x<xx;x++){
			markup += '<div>' + words[x] + '</div>';
		}
	} else {
		markup = '<span class="muted">No words could be formed with the available letter(s): '+_.difference($('input').val().split(''), $('#chosen').text().split('')).join(', ')+'</span>';
	}
	$('#possible').html(markup);
	$('#crunching').hide();
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
			showPossible();
		},500);
	});
	$(document).on('click','#chosen div',function(){
		$(this).remove();
		$('#crunching').show();
		setTimeout(showPossible,1);
	});
	$(document).on('click','#possible div',function(){
		$('#chosen').append($(this));
		$('#crunching').show();
		setTimeout(showPossible,1);
	});
	$('#crunching').hide();
});
