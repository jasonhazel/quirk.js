(function(){
	var Quirk = function(selector){
		if(selector != undefined){
			var type = selector.charAt(0);
			var element = selector.substring(1,selector.length);

			switch(type){
				case '#':
					return new QuirkObject(document.getElementById(element));
				break;
				case '.':
					return new QuirkCollection(document.getElementsByClassName(element));
				break;
				case '<':
					if(element.charAt(element.length - 1) == '>')
						return new QuirkObject(document.createElement(selector.substring(1,element.length)));
					else
						return new QuirkCollection();
				break;
				default:
					e = document.getElementsByTagName(selector);
					if(e.length > 1)
						return new QuirkCollection(e);
					else
						return (e[0] == undefined ? new QuirkCollection() : new QuirkObject(e[0]));
				break;
			}
		}
	}

	Quirk.ready 		= function(func){
		if(Quirk.ready.queue == undefined)
			Quirk.ready.queue = []
		Quirk.ready.queue.push(func);
	}
	
	//utility methods
	Quirk.isArray = function(variable){ 
		return (variable instanceof Array); 
	}

	Quirk.isNodeList = function(variable){ 
		return (variable instanceof NodeList); 
	}
	Quirk.isList = function(variable){ 
		return Quirk.isArray(variable) || Quirk.isNodeList(variable); 
	}

	Quirk.objectMerge = function(first, second)
	{
		for(item in second){
			if(!first.hasOwnProperty(item))
				first[item] = second[item];
		}
		return first;
	}


	Quirk.objectJoin = function(object, glue)
	{
		var result = []
		for(item in object)
			result.push(object[item]);
		
		return result.join(glue);
	}

	Quirk.ajax = function(options, success, failure)
	{
		if(!options.hasOwnProperty('url'))
			return null;

		var defaults = {
			type: 'GET',
			async: true,
			query: {}
		}



		options = Quirk.objectMerge(options, defaults);

		options.type.toUpperCase();

		if(typeof(options.query) == 'object')
			if(options.type == 'GET')
				options.url = options.url + '?' + Quirk.objectJoin(options.query, '&');
			else
				options.query = Quirk.objectJoin(options.query, '&');

		var xhr = new XMLHttpRequest();

		if(options.async !== true)
			success(xhr.responseText);
		else{
				xhr.onreadystatechange = function(){
					if(xhr.readyState == 4 && xhr.status == 200)
						if(success != undefined) success(xhr.responseText);
					else
						if(failure != undefined) failure({status: xhr.status, text: xhr.responseText});
			}
		}

		xhr.open(options.type, options.url, options.async);
		xhr.send((options.type != 'GET' ? options.query : null));
	}

	// QuirkCollections - basically, an array of QuirkObjects.  Gives some additional functionality.
	var QuirkCollection = function(elements){
		var collection = []
		if(Quirk.isNodeList(elements)){
			for(var i=0;i<elements.length;i++)
				collection.push(new QuirkObject(elements[i]));
		}

		this.position = 0;
		this.length = collection.length;

		this.each = function(func){
			for(item in collection)
				func(collection[item]);
			return this;
		}

		this.next = function(){
			return collection[this.position++] || null;
		}

		this.reset = function(){
			this.position = 0;
			return this;
		}

		this.remove = function(){
			this.each(function(e){e.remove();})
			return this;
		}
	}


	var QuirkObject = function(e){
		var _element = e;
		var _type 	= _element.tagName.toLowerCase() || undefined;
		var _events 	= []		
		this.element = _element;

		switch(_type){
			case 'a': // only for anchors.
				this.href 	= function(url)		{ return this.attr('href',url);				}
				this.target = function(target)	{ return this.attr('target',target);		} 
			break;
		}
		
		this.data 	= function(key, value){ 
			return this.attr('data-' + key, value); 	
		}
		this.id 	= function(id){ 
			return this.attr('id', id);				
		}
		
		//event listener
		this.on = function(action, func){
			if(_events[action] == undefined)
				_events[action] = []

			_events[action].push(func);
			_element.addEventListener(action, func, false);
			return this;
		}

		//I don't like calling this off. needs a better name.
		this.off = function(action){
			for(func in _events[action])
				_element.removeEventListener(action, _events[action][func]);
			return this;
		}

		this.attr = function(key, value){
			if(key != undefined && value != undefined)
				_element.setAttribute(key, value);
			else if (key != undefined)
				return _element.getAttribute(key);
			return this;
		}

		this.addClass = function(className){
			_element.classList.add(className);
			return this;
		}

		this.removeClass = function(className){
			_element.classList.remove(className);
			return this;;
		}

		this.toggleClass = function(className){
			_element.classList.toggle(className);
			return this;
		}

		this.hasClass = function(className){
			return _element.classList.contains(className);
		}

		this.hasProperty = function(property){
			return _element.hasOwnProperty(property);
		}

		this.text = function(value){
			var field = (this.hasProperty('value') ? 'value' : 'innerHTML');
			if(value != undefined)
				_element[field] = value;
			else
				return _element[field];
			return this;
		}

		this.remove = function(){
			_element.parentNode.removeChild(_element);
		}

		this.append = function(child){
			_element.appendChild((child instanceof QuirkObject ? child.element : child));
			return this;
		}

		this.appendTo = function(parent){
			(parent instanceof QuirkObject ? parent.element : parent).appendChild(this.element);
		}

		this.prepend = function(child){
			_element.insertBefore((child instanceof QuirkObject ? child.element : child) , _element.firstChild);
		}

		this.prependTo = function(parent){
			var parent = (parent instanceof QuirkObject ? parent.element : parent)
			parent.insertBefore(_element, parent.firstChild);
		}

		this.hide = function(){
			_element.style.visibility = 'hidden';
		}

		this.show = function(){
			_element.style.visibility = 'visible';
		}

		this.toggle = function(){
			_element.style.visibility = (_element.style.visibility == 'hidden' ? 'visible' : 'hidden');
		}

		this.load = function(options){
			Quirk.ajax(options, function(data){
				this.text(data);
			}, function(data){
				this.text(data.text);
			})


		}
	}

	document.addEventListener('DOMContentLoaded', function(){for(var i=0; i < Quirk.ready.queue.length; i++) Quirk.ready.queue[i]();}, false);
	if(!window.Q || !window.Quirk){window.Quirk = window.Q = Quirk;}
})();