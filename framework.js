(function(){  
	var Quirk = function(selector)
	{		
		var type = selector.charAt(0);
		var element = selector.substring(1,selector.length);

		switch(type)
		{
			case '#':
				return Quirk.select.id(element);
			break;
			case '.':
				return Quirk.select.class(element);
			break;
			case '<':
				return Quirk.select.new(selector);
			break;
			default:
				return document.getElementsByTagName(selector)[0];
			break;
		}
	}

	// add a function to the wait queue.
	Quirk.ready = function(func)
	{
		Quirk.ready.wait.push(func);
	}

	Quirk.ready.wait = []

	Quirk.select = {
		cache : {}, 
		id : function(selector)
		{
			if(!Quirk.select.cache[selector])
				Quirk.select.cache[selector] = document.getElementById(selector);
			
			return Quirk.select.cache[selector];
		},
		class : function(selector){


		},
		new : function(selector){
			if(selector.charAt(selector.length - 1) == '>')
			{
				element = selector.substring(1,selector.length - 1);
				return document.createElement(element);
			}
		}

	}

	//once document is loaded, loop through the wait list and execute and functions.
	document.onreadystatechange = function()
	{
		if(document.readyState == 'complete')
		{
			for(var i=0; i < Quirk.ready.wait.length; i++)
				Quirk.ready.wait[i]();
		}
	}

   	if(!window.$q){window.$q = window.Quirk = Quirk;}
})();

//usage tests
$q.ready(function(){
	console.debug($q('#header').innerHTML);
	var body = $q('body');

	var X = $q('<a>');
	X.href = 'test';
	X.innerHTML = 'Testing';
	body.appendChild(X);

});

