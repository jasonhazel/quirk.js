(function(){
	var Quirk = function(selector)
	{
		var type = selector.charAt(0);
		var element = selector.substring(1,selector.length);
		switch(type)
		{
			case '#':
				return new qObj(document.getElementById(element));
			break;
			case '.':
				return new qCollection(document.getElementsByClassName(element));
			break;
			case '<':
				if(element.charAt(element.length - 1) == '>')
					return new qObj(document.createElement(selector.substring(1,element.length)));
				else
					return new qCollection();
			break;
			default:
				e = document.getElementsByTagName(selector);
				if(e.length > 1)
					return new qCollection(e);
				else
					return (e[0] == undefined ? new qCollection() : new qObj(e[0]));
			break;
		}
	}

	// add a function to the wait queue.
	Quirk.ready = function(func) { Quirk.ready.queue.push(func); }

Quirk.ready.queue = []
	var qCollection = function(elements)
	{
		if(elements == undefined) elements = []
		var collection = []
		this.position = 0;

		for(var item = 0; item < elements.length; item++)
		{
			if(elements[item] != undefined)
				collection.push(new qObj(elements[item]));
		}	

		this.each = function(func)
		{
			for(var item = 0; item < collection.length; item++)
				func(collection[item]);	
		}

		this.next = function()
		{
			if(this.position >= this.length)
				return null;
			else
				return collection[this.position++];
		}

		this.reset = function()
		{
			position = 0;
		}

		this.length = collection.length;
	}

	// this is where most of the magic happens.
	var qObj = function(element)
	{
		// kinda hacky right now.
		this.element 	= element;
		this.type 		= this.element.tagName.toLowerCase();
		this.events 	= []

		// not all objects require all methods.  Here we provided object specific methods.
		switch(this.type)
		{
			case 'a':
				this.href 	= function(url) 	{ return this.attr('href', url); }
				this.target = function(target) 	{ return this.attr('target', target); }
			break;
		}

		this.id 	= function(id)			{ return this.attr('id',id); }
		this.data 	= function(item, value)	{ return this.attr('data-' + item, value); }

		//event listener
		this.on = function(action, func)
		{
			if(this.events[action] == undefined)
				this.events[action] = []

			this.events[action].push(func);
			this.element.addEventListener(action, func , false);
			return this;
		}

		//I don't like calling this off. needs a better name.
		this.off = function(action) 
		{
			for(func in this.events[action])
				this.element.removeEventListener(action, this.events[action][func]);
			return this;
		}

		// I'm sure there is a better way to do this.
		this.text = function(value)
		{
			if(this.type != 'input')
			{
				if(value != undefined)
					this.element.innerHTML = value;
				else
					return this.element.innerHTML;
			}
			else 
			{
				if(value != undefined)
					this.element.value = value;
				else
					return this.element.value;
			}
			return this;
		}
		
		this.attr = function(key, value)
		{
			if(value != undefined && key != undefined)
			{
				this.element.setAttribute(key, value);
				return this;
			}
			else if (key != undefined)
			{
				return this.element.getAttribute(key);
			}
			else
				return this;
		}
		
		this.addClass = function(klass)
		{
			this.element.classList.add(klass);
			return this;
		}
		
		this.removeClass = function(klass)
		{
			this.element.classList.remove(klass);
			return this;
		}
		
		this.append = function(child)
		{
			if(child instanceof qObj)
				this.element.appendChild(child.element);
			else
				this.element.appendChild(child);
			return this;
		}
		
		this.appendTo = function(parent)
		{
			if(parent instanceof qObj)
				parent.append(this.element);
			else
				parent.appendChild(this.element);
			return this;
		}

		this.hide = function()
		{
			this.element.style.visibility = 'hidden';
			return this;
		}

		this.show = function()
		{
			this.element.style.visibility = 'visible';
			return this;
		}

		this.toggle = function()
		{
			this.element.style.visibility = (this.element.style.visibility == 'hidden' ? 'visible' : 'hidden');
			return this;
		}

		this.remove = function()
		{
			this.element.parentNode.removeChild(this.element);
			return this;
		}

	}

	//once document is loaded, loop through the wait list and execute and functions.
	document.onreadystatechange = function()
	{
		if(document.readyState == 'complete')
		{
			for(var i=0; i < Quirk.ready.queue.length; i++)
				Quirk.ready.queue[i]();
		}
	}

	if(!window.Q || !window.Quirk){window.Quirk = window.Q = Quirk;}
})();

