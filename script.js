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

// solve function
function solve(string){
	
	// define our vars
	var result = [];
	
	// the looper function
	var count = 0;
	function looper(object, traypart, prefix){
		
		count++;
		
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
	
	// return the word list
	return result;
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