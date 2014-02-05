//     Scout.js
//     (c) 2012 Chris Colinsky
//     Scout.js may be freely distributed under the MIT license.

var Scout = (function() {
	//local properties
	//TODO - make these available to all modules
	var a = [],
		b = "boolean", 
		d = document, 
		f = "function", 
		n = "number", 
		o = "object", 
		s = "string", 
		u = "undefined", 
		w = window;

	//what you end up with
	function Probe(elements) {
		elements = elements || [];
		//because IE has no __proto__
		$.extend(elements, Probe.prototype);
		
		return elements;
	}

	//primary interface
	function $(selector) {
		//error checking
		if( typeof selector === u)
			return Probe();
		//if nothing is passed in
		else if(selector instanceof Array && selector.ready)
			return selector;
		//if a probe is passed in

		var elements;
		if( typeof selector === s)
			elements = selectorEngine(document, selector);
		//selector is a string
		else if(selector.nodeType == 1 || selector.nodeType == 3 || selector.nodeType == 9 || selector === w)
			elements = [selector];
		//selector is the document node, a text node or an element node
		else if(/^\s*<(\w+)[^>]*>/.test(selector))
			elements = createFragment(selector);
		//if a string of valid html is passed in  //TODO - need a better regex
		else if( selector instanceof Array && selector.length == 2)
			elements = selector.every(function(p) {
				return ( typeof p === n)
			}) ? d.elementFromPoint(selector[0], selector[1]) : [];
		//selects element by coordinates - uses viewport coordinates, not document
		return Probe(elements);
	}

	$.VERSION = '0.3.1';

	//core of library
	function selectorEngine(element, selector) {
		var result;
		//engine is optimized by highest performing queries first
		//represents the perferred priority of section types
		//TODO - class selection should be first!
		if(element === d && (/^#([\w-]+)$/.test(selector))) {//select by ID only if from document root
			result = element.getElementById(RegExp.$1);
			return result ? [result] : [];
		} else if(/^\.([\w-]+)$/.test(selector)) {//select by single class identifier
			result = element.getElementsByClassName(RegExp.$1);
		} else if(/^[\w]+$/.test(selector)) {//select by tag name
			result = element.getElementsByTagName(selector);
		} else {//just try to find somehting, usually a nested query.  this is lazy
			if(/^[\w]+:[\w]+/.test(selector)) {//support for namespaces
				//TODO - check compatibility
				result = element.getElementsByTagNameNS(selector);
			} else {
				//TODO - check compatibility
				result = element.querySelectorAll(selector);
			}
		}

		return toArray(result);
	}

	//used to convert a NodeList host object to an Array
	function toArray(nl) {
		var arr = [];
		for(var i = nl.length; i--; arr.unshift(nl[i]));
		return arr;
	}

	//turn water into wine or strings into html
	function createFragment(html) {
		var fragment = d.createElement("div");
		fragment.innerHTML = String(html);
		return a.slice.call(fragment.childNodes,0);
	}

	//dynamically determine an arguments value when a function
	function renderArg(thisobj, arg, index, currVal) {
		return ( typeof arg === f) ? arg.call(thisobj, index, currVal) : arg;
	}

	//pass a single object and scout will be extended
	//pass two objects and the first one will be extend by the second one
	//pass three and same as before but last arg consists of omitted props
	$.extend = function() {
		var dest, src, prop;
		if(arguments.length == 1) {
			dest = $.fn;
			src = arguments[0];
		} else {
			dest = arguments[0];
			src = arguments[1];
		}
		
		for(prop in src) {
			if( typeof src[prop] === o && src[prop] !== null) {
				dest[prop] = dest[prop] || {};
				arguments.callee(dest[prop], src[prop]);
			} else {
				dest[prop] = src[prop];
			}
		}
		
		if(Object.prototype.toString.call( arguments[2] ) === '[object Array]') {
			var rm = arguments[2],
				len = rm.length,
				i;
			for (i=0;i<len;i++) {
				delete dest[rm[i]];
			}
		}
		return dest;
	}
	
	//dom functions
	$.fn = {
		ready : function(callback) {
			var rs = 'readyState', 
				rsc = 'readystatechange',
				dcl = 'DOMContentLoaded';

			function loaded() {
				return /complete|loaded/.test(d[rs]);
			}

			function handler(e) {
				if(loaded()) {
					d.removeEventListener(dcl, handler, false);
					d.removeEventListener(rsc, handler, false);
					callback();
				}
			}

			if(loaded()) { callback();
			} else {
				d.addEventListener(dcl, handler, false);
				d.addEventListener(rsc, handler, false);
			}
			return this;
		},
		each : function(func) {
			//for each element in scout probe, call the desired function in the context of the current element to preserve this
			//preserved jquery signature for this method - would rather pass through foreach callback signature, but added array arg at end to make all foreach args available
			//this added ability to have more visibility within each iteration
			//[].forEach.call(this,function (val,index,array) { func.call(val,index,val,array) });
			this.forEach(function(val, index, array) {
				func.call(val, index, val, array);
			});
			return this;
		},
		map : function(func) {
			var results=[], i;
			for (i=0;i<this.length;i++) {
				var val = func(i,this[i]);
				if (val) results.push(val);
			}
			return Probe(results);
		},
		attr : function(name, value) {
			if(this.length == 0) return undefined;

			if( typeof name === s && typeof value === u) {//no value passed, so just get current value
				return this[0].getAttribute(name);
			} else {
				this.each.call(this,function(index, val, array) {
					if( typeof name === o) {//there is a map
						for(prop in name)
						val.setAttribute(prop, name[prop])
					} else {//there is a value, so let's try and set it
						val.setAttribute(name, renderArg(val, value, index, val.getAttribute(name)));
					}
				});
				return this;
			}
		},
		removeAttr : function() {
			//TODO - implement
		},
		prop : function() {
			//TODO - implement
		},
		removeProp : function() {
			//TODO - implement
		},
		data : function() {
			//TODO - implement
		},
		removeData : function() {
			//TODO - implement
		},
		val : function() {
			if(this.length == 0) return undefined;
			return this[0].value;
		},
		html : function(html) {
			if( typeof html === u) {//nothing was passed in, so retrieve it
				return this[0].innerHTML;
			} else {
				this.each.call(this, function(index, val, array) {
					$(val).empty().append(renderArg(val, html, index));
				});
				return this;
			}
		},
		text : function(text) {
			if( typeof text === u) {//nothing was passed in, so retrieve it
				if(this.length == 0) return undefined;
				else return this[0].textContent;
			} else if (typeof text === s) {
				this.each.call(this, function(index, val, array) {
					val.textContent = text;
				});
			} else if (typeof text === f) {
				this.each.call(this, function(index, val, array) {
					val.textContent = renderArg(this, text, index, val.textContent);
				});
			}
			return this;
		},
		append : function(html) {
			var len = this.length;
			if (len>0) {
				console.log("HEREER!!!!!" + (typeof html === s));
				if (typeof html === s) html = createFragment(html);
				this.each.call(this, function(index, val, array) {
					//insertAdjacentHTML vs insertBefore vs appendChild
					if (html instanceof Array) {
						for (var i=0;i<html.length;i++) {
							val.appendChild(html[i]);
						}
					} else {
						val.appendChild(html);
					}
					
				});
			}
			return this;
		},
		appendTo : function() {
			//TODO - implement
		},
		prepend : function() {
			//TODO - implement
		},
		prependTo : function() {
			//TODO - implement
		},
		before : function(html) {
			var len = this.length;
			if (len>0) {
				if (typeof html === s) html = createFragment(html);
				this.each.call(this, function(index, val, array) {
					for (var i=0;i<html.length;i++) {
						val.parentNode.insertBefore(html[i],val);
					}
				});
			}
			return this;
		},
		after : function() {
			//TODO - implement
		},
		replaceWith : function(html) {
			this.each.call(this, function(index, val, array) {
				$(val).before(html).remove();
			});
			return this;
		},
		empty : function() {
			this.each.call(this, function(index, val, array) {
				val.innerHTML = '';
			});
			return this;
		},
		size : function() {
			return this.length;
		},
		get : function(index) {
			return (typeof index === u)? this : this[index];
		},
		index : function(elem) {
			return (typeof elem === u) ? this.parent().children().indexOf(this[0]) : this.indexOf( $(elem)[0] );
		},
		parent : function() {
			if(this.length == 0) return undefined;
			return $(this[0].parentNode);
		},
		children : function(elem) {
			return Probe(a.slice.call((typeof elem===u?this[0]:$(elem)[0]).children));
		},
		siblings : function() {
			//TODO - implement
		},
		find : function(selector) {
			var result = [];
			if(this.length == 0 || typeof selector === u ) { return Probe(); }
      		else { 
      			this.each.call(this, function(index, val, array) {
					result = result.concat(selectorEngine(val, selector));
				});
      		}
      		return Probe(result);
		},
		closest : function(selector, context) {
			var el = this[0], 
				maybe = selectorEngine(context || d, selector);

			function tst(elem) {
				if (maybe.indexOf(elem) > -1) {
					el = $(elem);
				} else {
					if (elem !== context && elem !== d) el = elem.parentNode;
					tst(el);
				}
			}

			if (maybe.length<1) el = $();
			else tst(el);
			
			return el;
		},
		remove : function() {
			this.each.call(this, function(index, val, array) {
				if (val.parentNode != null) {
          			val.parentNode.removeChild(val);
        		}
			});
			return this;
		},
		css : function(property, value) {
			function getStyle(el,prop) {
				var propVal;
				if (el.currentStyle) {
					propVal = el.currentStyle[prop];
				} else if (w.getComputedStyle) {
					propVal = w.getComputedStyle(el, null).getPropertyValue(prop);
				}
				return propVal;
			}

			if( typeof property === s && typeof value === u) {//no value was passed in, so retrieve single property
				if(this.length == 0) return undefined;
				return w.getComputedStyle(this[0], null).getPropertyValue(property);
			} else {
				var styleDef = "";
      			if (typeof property === s) {
      				styleDef = property + ':' + value + ';';
      			} else {
      				for (var prop in property) {
						styleDef += prop + ':' + property[prop] + ';';
					}
      			}
				this.each.call(this, function(index, val, array) {
					val.style.cssText += ';' + styleDef;
				});
				return this;
			}
		},
		hasClass : function(className) {
			if ("classList" in d.documentElement) {
				return this[0].classList.contains(className);
			} else {
				var cl = this[0].className,
					re = new RegExp(className);
				return re.test(cl);
			}
		},
		addClass : function(className) {
			this.each.call(this, function(index, val, array) {
				if ("classList" in d.documentElement) {
					val.classList.add(className);
				} else {
					if (!$(val).hasClass(className)) {
						var cl = val.className;
						val.className = cl + " " + className;
					}
				}
			});
		},
		removeClass : function(className) {
			this.each.call(this, function(index, val, array) {
				if ("classList" in d.documentElement) {
					val.classList.remove(className);
				} else {
					if ($(val).hasClass(className)) {
						var cl = val.className.split(/\s+/),
							index = cl.indexOf(className),
							newVal;
						cl.splice(index,1);
						newVal = cl.join(" ");
						val.className = newVal;
					}
				}
			});
		},
		toggleClass : function(className) {
			this.each.call(this, function(index, val, array) {
				if ("classList" in d.documentElement) {
					val.classList.toggle(className);
				} else {
					if ($(val).hasClass(className)) {
						$(val).removeClass(className);
					} else {
						$(val).addClass(className);
					}
				}
			});
		},
		height : function() {
			var box,height;
			if(this.length == 0) return undefined;
			
			box = this[0].getBoundingClientRect();
			height = box.height || (box.bottom - box.top);
			return height;
		},
		width : function() {
			var box,width;
			if(this.length == 0) return undefined;
			
			box = this[0].getBoundingClientRect();
			width = box.width || (box.right - box.left);
			return width;
		}
	}
	
	Probe.prototype = $.fn;

	return $;
})();

window.Scout = Scout;
'$' in window || (window.$ = Scout);

//utils
(function($) {
	$.profile = (function() {
		var change = ("onorientationchange" in window),
			evt = (change ? "orientationchange" : "resize"),
			hasTouch = 'ontouchstart' in document.documentElement,
			platformType = "desktop",
			currentVendor = "",
			browserType = 'unknown',
			dpr = 1,
			detect = {os:null,browser:null,version:null},
			ua = window.navigator.userAgent,
			os = [],
			browser = [],
			i,
			len;
			
		os.push({regex:/iphone|ipod|ipad/i,id:"iOS"});
		os.push({regex:/win/i,id:"Windows"});
		os.push({regex:/mac/i,id:"Mac"});
		os.push({regex:/android/i,id:"Android"});
		os.push({regex:/blackberry/i,id:"Blackberry"});
		
		browser.push({regex:/chrome/i,id:"Chrome"});
		browser.push({regex:/crios/i,id:"CriOS",name:"Chrome"});
		browser.push({regex:/apple/i,vn:"Version",id:"Safari"});
		browser.push({regex:/firefox/i,id:"Firefox"});
		browser.push({regex:/msie/i,id:"MSIE"});
		browser.push({regex:/opera/i,id:"Opera"});
		
		len = os.length;
		for (i=0;i<len;i++) {
			var o = os[i];
			if (o.regex.test(ua)) {
				detect.os = o.id;
				break;
			}
		}
		
		len = browser.length;
		for (i=0;i<len;i++) {
			var b = browser[i],
				offset;
			if (b.regex.test(ua)) {
				detect.browser = b.name || b.id;
				offset = ua.indexOf(b.vn || b.id);
				if (offset>0) detect.version = parseFloat( ua.substring( offset + (b.vn || b.id).length + 1) );
				break;
			}
		}

		//what's the best way to detect this?
		if ((hasTouch || detect.os=="Windows") && screen.width<641) {
			platformType = 'mobile';
		} else if (hasTouch && screen.width<1281) {
			platformType = 'tablet';
		}

		//set pixel ration
		if (typeof window.devicePixelRatio !== "undefined") dpr = window.devicePixelRatio;
		else dpr = screen.deviceXDPI / screen.logicalXDPI;

		//determine vendor
		currentVendor = (function() {
			var v = ['Webkit','Moz','O','ms'],
				len = v.length,
				el = document.createElement('div'),
				i;
			
			for (i=0;i<len;i++) {
				if (typeof el.style[v[i]+'Transform']!== "undefined") {
						return v[i].toLowerCase();
				}
			}
			return '';
		})();

		return {
			orientationEvent: evt,
			supportsTouch: hasTouch,
			platform: platformType,
			vendor: currentVendor,
			os: detect.os,
			browser: detect.browser,
			version: detect.version,
			devicePixelRatio: dpr
		}
	})();

	//all of the properties on the destination object are matched up with something on the source object
	$.automap = function(map,src) {
		if (arguments.length!==2)  return;
		var result = {};
		//had to do it this way becuase i coldn't figure out how to clone a function.
		var prop;
		for (prop in src) {
			if (map.hasOwnProperty(prop)) {
				result[prop] = src[prop];
			}
		}
		for (prop in map) {
			if (!result.hasOwnProperty(prop)) {
				result[prop] = map[prop];
			}
		}

		return result;
	}
	
	//utility function, convert css values to numbers
	$.stripPX = function(value) {
		if (typeof value === "number") return value;
		return  Number(value.substring(0,value.indexOf('px')));
	}
	
	//template rendering
	$.renderTemplate = function(template, object) {
		for (var prop in object) {
			var regex = new RegExp('\\$\\{'+prop+'\\}', 'gi');
			s
			//my not need this test
			if (regex.test(template)) {
				template = template.replace(regex,object[prop]);
			}
		}
		return template;
	}

	$.hideURLBar = function() {
		$.defer(this,function() { if (!pageYOffset) window.scrollTo( 0, 1 ); });
	}

	//safe logging
	$.log = function() {
		if (typeof console === 'undefined') {
			$("p.log-output").append(arguments[0]+"<br/>");
		} else if (typeof console.log === 'function') {
			console.log.apply(console,arguments);
		}
	}

	//load a js or css file
	$.loadSrcFile = function(file) {
		var el;

		if (/.css/.test(file)) {
			el = document.createElement('link');
			el.setAttribute("rel", "stylesheet");
  			el.setAttribute("type", "text/css");
  			document.getElementsByTagName('head')[0].appendChild(el);
  			el.setAttribute("href", file);
		} else if (/.js/.test(file)) {
			el = document.createElement('script');
			el.setAttribute("type","text/javascript");
			document.getElementsByTagName("head")[0].appendChild(el);
  			el.setAttribute("src", file);
		}
	}

	//sort of like a worker
	$.defer = (function() {
		var defered = [],
			msgId = "defer-msg";

		function defer(context,fn,args) {
			defered.push({ctx:context,f:fn,a:args});
            window.postMessage(msgId, "*");
		}

		function deferHandler(evt) {
			if (evt.data==msgId) {
				evt.stopPropagation();
                if (defered.length > 0) {
                    var d = defered.shift();
                    d.a = d.a || [];
                    d.f.apply(d.ctx,d.a);
                }
			}
		}

		window.addEventListener("message", deferHandler, true);
		return defer;
	})();
})(Scout);

//ajax
(function($) {
	$.ajax = function(url, options) {
		var xhr = new XMLHttpRequest(),
			defaultOptions = {
				url : null,
				context : xhr,
				method : "GET",
				headers : {},
				responseType : "json",
				data : null,
				timeout : 0,
				timeoutHandler : function(){},
				complete : function(){}
			},
			xhrTimeout,
			p;

		if (typeof url === "string") {
			defaultOptions.url = url;
		} else if (typeof url === "object") {
			options = url;
		}

		defaultOptions.headers["X-Requested-With"] = "XMLHttpRequest";
		defaultOptions.headers["Accept"] = "application/json; charset=utf-8";
		defaultOptions.headers['Content-Type'] = "application/json";
		//defaultOptions.headers["Content-Type"] = "application/x-www-form-urlencoded";

		options = options || defaultOptions;
		options = $.automap(defaultOptions,options);

		if (options.url===null) throw new Error("no url was provided for ajax call");

		xhr.onreadystatechange = function() {
        	if (xhr.readyState!=4) return;
            //alert(xhr.responseText);
			//if (xhr.status==200 || xhr.status==304) {
                
				options.complete.call(options.context,xhr.responseText,xhr.getResponseHeader('Content-Type'));
			//} else if (xhr.status==404 || xhr.status==500) {
			//	throw new Error(xhr.responseText);
			//}
		}

		xhr.open(options.method, url, true);

		xhr.timeout = options.timeout;

		if (options.method=="POST") {
			var headers = options.headers;
			for (p in headers) {
				xhr.setRequestHeader(p,headers[p]);
			}
		}

		xhr.send(options.method=="POST"?options.data:null);

		if (options.timeout>0) {
			xhrTimeout = setTimeout(timeoutHandler,options.timeout);
		}

		return xhr;
	}
})(Scout);

// events
(function($) {
	//TODO - need to be able to set capture phase
	function add(element, event, handler, selector, delegate) {
		var d = delegate && delegate(handler),
			c = d || handler;

		element.addEventListener(event, c, false);	
	}
	
	function remove(element, event, handler) {
		element.removeEventListener(event, handler, false);
	}
	
	$.fn.bind = function(event, callback) {
		this.each.call(this, function(index, val, array) {
			add(val, event, callback);
		});

		return this;
	};
	$.fn.unbind = function(event, callback) {
		this.each.call(this, function(index, val, array) {
			remove(val, event, callback);
		});

		return this;
	};

	$.fn.delegate = function(selector, event, callback){
		this.each.call(this, function(index, val, array) {
			add(val, event, callback, selector, function(handler) {
				return function(evt) {
					var $el = $(evt.target).closest(selector,val);
					if ($el.length) handler.apply($el[0],evt);
				}
			});
		});

		return this;
	}

	$.events = (function() {
		var hasTouch = $.profile.supportsTouch;
		
		function isMouseEvent (evt) {
			return (evt instanceof MouseEvent) ? true : false;
		}

		return {
			start: (hasTouch && $.profile.os!="Blackberry") ? 'touchstart': 'mousedown',
        	move: (hasTouch && $.profile.os!="Blackberry") ? 'touchmove': 'mousemove',
        	end: (hasTouch && $.profile.os!="Blackberry") ? 'touchend': 'mouseup',
        	isMouseEvent: isMouseEvent
		}
	})();
})(Scout);

//touch
(function($) {
	$.fn.touch = function(eventType,callback,options) {
		return this.each.call(this, function(index, val, array) {
			val._touch = (function() {
				var startX,
					startY,
					startTime,
					min_delta_x = 20,
					min_delta_y = 20,
					type = eventType,
					moving = false,
					hasTouch = $.profile.supportsTouch,
					opts = options,
					defaultOptions = {
						preventDefault : false
					};

				opts = opts || defaultOptions;
				opts = $.automap(defaultOptions,opts);

				function createTouch(evt,type) {
			 		var touch = {
			 			touchType: type,
			 			startX: startX,
						startY: startY,
						startTime: startTime,
			 			duration: (new Date().getTime() - startTime)
			 		};
		 			
		 			$.extend(evt,touch);
		 			return evt;
			 	}
			 	
			 	function touchstart(evt) {
			 		if (opts.preventDefault) evt.preventDefault();
			 		//only supporting single touch events
		 			startTime = new Date().getTime();
		 			startX = (hasTouch && !$.events.isMouseEvent(evt)) ? evt.touches[0].pageX : evt.pageX;
    			 	startY = (hasTouch && !$.events.isMouseEvent(evt)) ? evt.touches[0].pageY : evt.pageY;

    			 	$(val).bind($.events.move,touchmove);
		 			$(val).bind($.events.end,touchend);
			 	}
			 	
			 	function touchmove(evt) {
			 		if (opts.preventDefault) evt.preventDefault();
			 		
			 		moving = true;
			 		//only supporting single touch events at this time
		 			var touch,
		 				x = hasTouch ? evt.touches[0].pageX : evt.pageX,
	    		 		y = hasTouch ? evt.touches[0].pageY : evt.pageY,
	    		 		delta_x = startX - x,
	    		 		delta_y = startY - y;
	    		 	
	    		 	if (type=="swipe") {
		    		 	if(Math.abs(delta_x) >= min_delta_x) {
		    		 		if (delta_x > 0) touch = createTouch(evt,"swipeLeft");
		    		 		else touch = createTouch(evt,"swipeRight");
		    		 		cancel();
		    		 		callback.call(val,touch);
		    		 	} else if (Math.abs(delta_y) >= min_delta_y) {
		    		 		if (delta_y > 0) touch = createTouch(evt,"swipeDown");
		    		 		else touch = createTouch(evt,"swipeUp");
		    		 		cancel();
		    		 		callback.call(val,touch);
		    		 	}
					} else { //we only care about taps
						cancel();
					}
			 	}
			 	
			 	function touchend(evt) {
			 		if (opts.preventDefault) evt.preventDefault();
			 		
			 		//finger never moved, just a tap
			 		if (!moving && type!="swipe") callback.call( val, createTouch(evt,"tap") );
			 		cancel();
			 	}
			 	
			 	function cancel() {
			 		moving = false;
			 		startTime = startX = startY = null;

			 		$(val).unbind($.events.move,touchmove);
			 		$(val).unbind($.events.end,touchend);
			 	}
			 	
			 	function removeAll() {
			 		$(val).unbind($.events.start,touchstart);
					$(val).unbind($.events.move,touchmove);
		 			$(val).unbind($.events.end,touchend);
			 	}
			 	
			 	return {
			 		start: touchstart,
			 		move: touchmove,
			 		end: touchend,
			 		destroy: removeAll,
			 		options: opts
			 	};
			})();
			
			$(val).bind($.events.start,val._touch.start);
		});
	}
	
	$.fn.removeTouch = function() {
		return this.each.call(this, function(index, val, array) {
			$(val).unbind($.events.start,val._touch.start);
			$(val).unbind($.events.move,val._touch.move);
	 		$(val).unbind($.events.end,val._touch.end);
		});
	}
})(Scout);

//motion, old school animation
(function($){
	//TODO - need easy way to add/overwrite easing functions
	$.fn.easing = (function(){
		var easeTypes = [];
		easeTypes['linear'] = function(currTime,start,duration) { return (( currTime - start ) / duration).toFixed(2); };
		easeTypes['ease-out'] = function(currTime,start,duration) { 
			var k = (currTime-start)/duration;
			return (k*k*(3-2*k)).toFixed(3); 
		};
		
		return easeTypes;
	})();
	
	$.fn.motion = function(element, options) {
		var startTime,finishTime,
		duration = ((typeof options.duration !== 'undefined') ? options.duration : 0.3)*1000,
		ease = (typeof options.ease !== 'undefined') ? options.ease : 'linear',
		props = $.extend({},options,['duration','ease','complete']),
		values = {},
		$elem = $(element),
		emScale = Math.ceil( Number($elem.css('font-size').replace(/(px|em)$/,'')) ),
		interval,p;
		
		for (p in props) {
			var prop = props[p],
				unit = String(prop).match(/(\D+$)/)!=null?RegExp.$1:'', //unit = String(prop).replace(/^[\-0-9\.]+/,''),
				dest = Number( String(prop).match(/(^\-?\d+(\.\d)?)/)!=null?RegExp.$1:'' ); //dest = Number(String(prop).replace(/(px|em)$/,''));
			props[p] = {
				start: Math.ceil( Number($elem.css(p).replace(/(px)$/,'')) ),
				dest: ((unit==="em") ? dest*emScale : (unit==="%") ? start*(dest/100) : dest),
				unit: RegExp.$1
			}
		}
		
		startTime = +new Date;
		finishTime = startTime + duration;
		interval = setInterval(function motionLoop() {
			var currTime = +new Date,
				position = currTime > finishTime ? 1 : $.fn.easing[ease](currTime,startTime,duration);
				for (p in props) {
					var prop = props[p];
					values[p] = (prop.start+(prop.dest-prop.start)*position) + prop.unit;
				}
				$elem.css(values);
			if (currTime > finishTime) {
				clearInterval(interval);
				if (typeof options.complete === 'function') options.complete.call(element);
			}
		},16);
	};
})(Scout);

(function($) {
	var cssVendorPrefix = false,
		transitionStart = "transitionstart",
		transitionEnd = "transitionend",
		vendors = ['Webkit','Moz','O','ms'],
		test = document.createElement('div');
	
	$.fn.each.call(vendors, function(index,val,array) {
		if (test.style[val + 'TransitionProperty'] !== undefined) {
      		cssVendorPrefix = '-' + val.toLowerCase() + '-';
      		switch (index) {
      			case 0:
      				transitionStart = "webkitTransitionStart";
      				transitionEnd = "webkitTransitionEnd";
      				break;
      			case 1:
      				transitionStart = "transitionstart";
      				transitionEnd = "transitionend";
      				break;
      			case 2:
      				transitionStart = "OTransitionStart";
      				transitionEnd = "OTransitionEnd";
      				break;
      			case 3:
      				transitionStart = "MSTransitionStart";
      				transitionEnd = "MSTransitionEnd";
      				break;
      		}
    	}
	});
	
	//$.fn.animate = function(properties, duration, ease, delay, complete){
	$.fn.animate = function(properties, duration, options){
		var defaultOptions = {
			ease : "ease-out",
			delay : 0,
			complete: function(){},
			rAF: false
		};

		duration = duration || 0.3;
		options = options || defaultOptions;
		options = $.automap(defaultOptions,options);

		if (cssVendorPrefix) {
			return this.each.call(this, function(index, val, array) {
				var transOptions = ' ' + duration + 's ' + options.ease + ' '+options.delay + 's',
					newProps = [],
					eventHandler;
				if (typeof properties === 'string') {//assume that a single string is a named animation
					newProps[cssVendorPrefix + 'animation'] =  properties+ transOptions;
				} else {
					newProps[cssVendorPrefix + 'transition'] = 'all' + transOptions;
					for (var prop in properties) newProps[prop] = properties[prop];
				}

				$(val).css(newProps);
				
				eventHandler = function() {
					this.removeEventListener(transitionEnd, eventHandler, false);
					if (typeof options.complete === 'function') options.complete.call(val);
				};
				val.addEventListener(transitionEnd, eventHandler, false);
			});
		} else {
			return this.each.call(this, function(index, val, array) {
				var props = {};
				props.duration = duration;
				props = $.extend(props,options,['delay','rAF']);
				props = $.extend(props,properties);
				
				options.delay>0 ? setTimeout(function(){$.fn.motion(val,props)},options.delay*1000) : $.fn.motion(val,props);
			});
		}
	};
})(Scout);