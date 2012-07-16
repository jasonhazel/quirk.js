(function(){
	var Quirk = function(selector)
	{
		var type = selector.charAt(0);
		var element = selector.substring(1,selector.length);


		switch(type)
		{
			case '#':
				e = Quirk.select.id(element);
			break;
			case '.':
				e = Quirk.select.class(element);
			break;
			case '<':
				e = Quirk.select.new(selector);
			break;
			default:
				e = document.getElementsByTagName(selector)[0];
			break;
		}
		return new qObj(e);
	}

	// add a function to the wait queue.
	Quirk.ready = function(func)
	{
		Quirk.ready.queue.push(func);
	}

	Quirk.ready.queue = []

	//once document is loaded, loop through the wait list and execute and functions.
	document.onreadystatechange = function()
	{
		if(document.readyState == 'complete')
		{
			for(var i=0; i < Quirk.ready.queue.length; i++)
				Quirk.ready.queue[i]();
		}
	}

	Quirk.select = {
		cache : {}, 
		id : function(selector)
		{
			if(!this.cache[selector])
				this.cache[selector] = document.getElementById(selector);
			
			return this.cache[selector];
		},
		class : function(selector){
			// TODO
		},
		new : function(selector){
			if(selector.charAt(selector.length - 1) == '>')
			{
				element = selector.substring(1,selector.length - 1);
				return document.createElement(element);
			}
		}

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
				this.href 	= function(url) 	{ this.attr('href',url); 		return this;}
				this.target = function(target) 	{ this.attr('target',target); 	return this;}
			break;
		}

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
		
		this.attr = function()
		{
			switch(arguments.length)
			{
				case 1:
					return this.element.getAttribute(arguments[0]);
				break;
				case 2:
					this.element.setAttribute(arguments[0], arguments[1]);
					return this;
				break;
			}
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

	if(!window.Q || !window.Quirk){window.Quirk = window.Q = Quirk;}
})();

