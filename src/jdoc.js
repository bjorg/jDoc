/*
 * jDoc 1.0 - json document
 * Copyright (C) 2010  Steve Bjorg <steveb at mindtouch dot com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
(function() {
    var root = this;
    
    // jDoc definition
    
    /*
     * Constructor: jDoc
     *   Wrap a JSON object in a jDoc object.
     * Parameters:
     * 	 json - object to wrap
     * -OR-
     *   nodes - list of selected nodes
     *   index - index of selected node
     *   parent - parent jDoc object
     * Returns:
     *   object - jDoc wrapper
     */
    var jDoc = root.jDoc = function(json) {
        /*
         * Property: _list
         *   List of selected object.
         *
         * Property: _index
         *   Index of currently selected object.
         *
         * Property: json
         *   Current object to operate on
         */
        // check if simple or compound constructor was passed in
        if (arguments.length === 2) {
            var list = arguments[0];
            var index = arguments[1];
            
            this._list = list;
            this._index = index;
        } else {
        
            // simple assignment
            this._list = (json !== null) ? [json] : [];
            this._index = 0;
        }
    };
    
    var _empty = new jDoc(null);
    
    // private jDoc functions	
    var _push = function(array, json) {
        if (typeof json === 'object' && typeof json.length === 'number') {
            for (var i = 0; i < json.length; ++i) {
                array.push(json[i]);
            }
        } else {
            array.push(json);
        }
    };
    
    var _match = function(jdoc, condition, recurse, result) {
        jdoc.each(function(jdoc) {
            var json = jdoc.json();
            for (var key in json) {
                var value = json[key];
                
                // skip functions
                if (typeof(value) !== 'function') {
                
                    // check if key is a match
                    if (condition(key)) {
                        _push(result, value);
                    }
                    
                    // check if we need to recurse into current value
                    if (recurse) {
                    
                        // only recurse into objects
                        if (typeof value === 'object') {
                            if (typeof value.length === 'number') {
                                _match(new jDoc(value, 0), condition, recurse, result);
                            } else {
                                _match(new jDoc(value), condition, recurse, result);
                            }
                        }
                    }
                }
            }
        });
    };
    
    var _makePatternCheck = function(pattern) {
        if (typeof pattern === 'function') {
            return pattern;
        } else if (pattern instanceof RegExp) {
            return function(key) {
                return pattern.test(key);
            };
        } else {
            return function(key) {
                return key === pattern;
            };
        }
    };
    
    // public jDoc methods
    $.extend(jDoc.prototype, {
    
        //--- Collection Methods ---
        
        /*
         * Method: any
         *   Returns true if the jdoc object has a non-empty selection
         * Return:
         *   boolean - true if the jdoc object has a non-empty selection
         */
        any: function() {
            return this._list.length > 0;
        },
        
        /*
         * Method: first
         *   Returns the first jdoc object in the selection or an empty jdoc object
         *   if the selection is empty
         * Return:
         *   jdoc - first jdoc object or an empty jdoc object
         */
        first: function() {
            return new jDoc(this._list, 0);
        },
        
        /*
         * Method: next
         *   Returns the next jdoc object in the selection or an empty jdoc object
         *   if no more items are available
         * Return:
         *   jdoc - next jdoc object or an empty jdoc object
         */
        next: function() {
            if (!this.hasValue()) {
                return this;
            }
            var nextIndex = this._index + 1;
            if (nextIndex < this._list.length) {
                return new jDoc(this._list, nextIndex);
            }
            return _empty;
        },
        
        /*
         * Method: each
         *   Iterates over all objects in the selection.
         * Parameters:
         *   callback - function to invoke on each object (return false to abort iteration)
         *   context - context for function invocation
         */
        each: function(callback, context) {
            for (var i = 0, value = this._list[0]; typeof value !== 'undefined' && callback.call(context, new jDoc(value)) !== false; value = this._list[++i]) {
            }
        },
        
        /*
         * Method: count
         *   Returns the count of jdoc objects in the selection.
         * Return:
         *   number - number of jdoc object in the selection
         */
        count: function() {
            return this._list.length;
        },
        
        /*
         * Method: get
         *   Returns the jdoc object at the given position in the selection.
         * Parameters:
         *   index - index of jdoc object to return from selection
         * Return:
         *   jdoc - jdoc object at index or an empty jdoc object
         */
        get: function(index) {
            if (index >= 0 && index < this._list.length) {
                return new jDoc([this._list[index]], 0);
            }
            return _empty;
        },
        
        /*
         * Method: where
         *   Return filtered selection based on condition callback.
         * Parameters:
         *   condition - function to determine if jdoc object should be kept in selection
         *   context - context for function invocation
         * Return:
         *   jdoc - filtered selection based on condition callback
         */
        where: function(condition, context) {
            var result = [];
            this.each(function(jdoc) {
                if (condition.call(context, jdoc)) {
                    _push(result, jdoc.json());
                }
            });
            return new jDoc(result, 0);
        },
        
        /*
         * Method: union
         *   Returns union of two selections.
         * Parameters:
         *   jdoc - other selection
         * Return:
         *   jdoc - union of two selections
         */
        union: function(jdoc) {
            if (!this.any()) {
                return jdoc;
            }
            if (!jdoc.any()) {
                return this;
            }
            return new jDoc(this._list.concat(jdoc._list), 0);
        },
        
        /*
         * Method: select
         *   Returns the array of objects produced by the callback function when
         *   applied to each object in the selection.
         * Parameters:
         *   callback - function to invoke for each object
         *   context - context for function invocation
         * Return:
         *   array - the array of objects produced by the callback function
         */
        select: function(callback, context) {
            var result = [];
            this.each(function(jdoc) {
                result.push(callback.call(context, jdoc));
            });
            return result;
        },
		
		$: function(path) {
			var parts = path.split('/');
			for(var i = 0; i < parts.length; ++i) {
				var part = parts[i];
				if(part === '' && i === 0) {
					
					
					continue;
				}
			}
		},

        //--- Item Methods ---
        
        /*
         * Method: hasValue
         *   Returns true if an object is selected
         * Return:
         *   boolean - true if an object is selected
         */
        hasValue: function() {
            return this._index < this._list.length;
        },
        
        /*
         * Method: json
         *   Returns currently selected value.
         * Return:
         *   object - currently selected value
         */
        json: function() {
            if (!this.hasValue()) {
                throw new Exception("jDoc has no value");
            }
            return this._list[this._index];
        },
        
        /*
         * Method: text
         *   Returns the text value of the current node
         * Return:
         *   string - text value of the current node
         */
        text: function() {
            var json = this.json();
            while (json !== null) {
                switch (typeof(json)) {
                case 'boolean':
                case 'number':
                    return json.toString();
                case 'string':
                    return json;
                case 'object':
                    if (typeof json.length === 'undefined') {
                        var text = json['#text'];
                        return (typeof text !== 'undefined') ? text : null;
                    } else if (json.length > 0) {
                        json = json[0];
                    } else {
                        return null;
                    }
                    break;
                default:
                    return null;
                }
            }
            return null;
        },
        
        /*
         * Method: match
         *    Returns selection of all matching properties in current jdoc selection.
         * Parameters:
         *    pattern - (string) literal string used to match on property names
         *              (regexp) regular expression used to match on property names
         *              (function) function invoked with property name to determine the match
         * Return:
         *    jdoc - selection of all matching properties in current jdoc selection
         */
        match: function(pattern) {
            if (!this.hasValue()) {
                return this;
            }
            
            // collect matching fields
            var result = [];
            _match(this, _makePatternCheck(pattern), false, result);
            return new jDoc(result, 0);
        },
        
        /*
         * Method: deepMatch
         *    Returns selection of all matching properties at any nesting level in current jdoc selection.
         * Parameters:
         *    pattern - (string) literal string used to match on property names
         *              (regexp) regular expression used to match on property names
         *              (function) function invoked with property name to determine the match
         * Return:
         *    jdoc - selection of all matching properties at any nesting level in current jdoc selection
         */
        deepMatch: function(pattern) {
            if (!this.hasValue()) {
                return this;
            }
            
            // collect matching fields
            var result = [];
            _match(this, _makePatternCheck(pattern), true, result);
            return new jDoc(result, 0);
        },
		
		/*
		 * Method: attributes
		 *   Returns selection of all attributes on current object.
		 * Return:
		 *   selection of all attributes on current object
		 */
		attributes: function() {
			return this.match(/^@.+$/);
		},
				
		/*
		 * Method: nodes
		 *   Returns selection of all elements on current object.
		 * Return:
		 *   selection of all elements on current object
		 */
		elements: function() {
			return this.match(/^[^@#].*$/);
		}
    });
})();
