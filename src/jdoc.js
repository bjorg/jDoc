/*
 * jDoc 0.2 - Turn JSON objects into queryable documents
 * Copyright (C) 2010, 2011  Steve Bjorg <steveb at mindtouch dot com>
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
     *   json - object to wrap
     * -OR-
     *   nodes - list of selected nodes
     *   index - index of selected node
     * Returns:
     *   jDoc - jDoc wrapper
     */
    var jDoc = function(json) {
    
        /*
         * Property: _list
         *   List of selected values.
         *
         * Property: _index
         *   Index of currently selected value.
         *
         * Property: json
         *   Current value to operate on
         */
        // check if simple or compound constructor was passed in
        if (arguments.length === 2) {
            if (!(this instanceof jDoc)) {
                return new jDoc(arguments[0], arguments[1]);
            }
            var list = arguments[0];
            var index = arguments[1];
            this._list = list;
            this._index = index;
        } else {
            if (!(this instanceof jDoc)) {
                return new jDoc(json);
            }
            
            // simple assignment
            this._list = (json !== null) ? [json] : [];
            this._index = 0;
        }
    };

	// Current version.
	jDoc.VERSION = '0.2.0';
    
    // Export the jDoc object for **CommonJS**, with backwards-compatibility
    // for the old `require()` API. If we're not in CommonJS, add `_` to the
    // global object.
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = jDoc;
    } else {
        root.jDoc = jDoc;
    }
    
    // define empty jDoc instance
    var _empty = new jDoc(null);
    
    // private jDoc functions
    var _push = function(array, json) {
        var i;
        if (typeof json === 'object' && json !== null && typeof json.length === 'number') {
            for (i = 0; i < json.length; ++i) {
                array.push(json[i]);
            }
        } else {
            array.push(json);
        }
    };
    
    var _match = function(jdoc, condition, recurse, result) {
        jdoc.each(function(jdoc) {
            var json = jdoc.value();
            var key;
            for (key in json) {
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
                        if (typeof value === 'object' && value !== null) {
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
    
    var _createPatternCheck = function(pattern) {
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
    
    var _compiledSelectors = {};
    
    var _createSelectorExpression = function(selector) {
        if (typeof selector !== 'string' || selector === '') {
            throw new Error('invalid selector');
        }
        var parts = selector.split('/');
        var deep = false;
        var code = 'this';
        var i;
        for (i = 0; i < parts.length; ++i) {
            var part = parts[i];
            switch (part) {
            case '':
                
                // skip empty segment if it is the first entry
                if (i === 0) {
                    continue;
                }
                
                // check if we have three consecutive slashes (i.e. ///)
                if (deep) {
                    throw new Error('invalid selector');
                }
                deep = true;
                continue;
            case '.':
                
                // nothing to do
                break;
            case '..':
                
                throw new Error('unsupported .. operation in selector');
            case '*':
                if (deep) {
                    code += '.match(/^[^@#].*$/, true)';
                } else {
                    code += '.match(/^[^@#].*$/)';
                }
                break;
            case '@*':
                if (deep) {
                    code += '.match(/^@.+$/, true)';
                } else {
                    code += '.match(/^@.+$/)';
                }
                break;
            default:
                if (deep) {
                    code += '.match("' + part.replace('"', '\\"') + '", true)';
                } else {
                    code += '.match("' + part.replace('"', '\\"') + '")';
                }
                break;
            }
            deep = false;
        }
        
        // check if we have a trailing slash (e.g. foo/)
        if (deep) {
            throw new Error('invalid selector');
        }
        return code;
    };
    
    //--- Collection Methods ---
    
    /*
     * Method: any
     *   Returns true if the jDoc object has a non-empty selection
     * Return:
     *   boolean - true if the jDoc object has a non-empty selection
     */
    jDoc.prototype.any = function() {
        return this._list.length > 0;
    };
    
    /*
     * Method: first
     *   Returns the first jDoc object in the selection or an empty jDoc object
     *   if the selection is empty
     * Return:
     *   jDoc - first jDoc object or an empty jDoc object
     */
    jDoc.prototype.first = function() {
        return new jDoc(this._list, 0);
    };
    
    /*
     * Method: next
     *   Returns the next jDoc object in the selection or an empty jDoc object
     *   if no more items are available
     * Return:
     *   jDoc - next jDoc object or an empty jDoc object
     */
    jDoc.prototype.next = function() {
        if (!this.exists()) {
            return this;
        }
        var nextIndex = this._index + 1;
        if (nextIndex < this._list.length) {
            return new jDoc(this._list, nextIndex);
        }
        return _empty;
    };
    
    /*
     * Method: each
     *   Iterates over all jDoc objects in the selection.
     * Parameters:
     *   callback - function to invoke on each jDoc object (return false to abort iteration)
     *   context - context for function invocation
     */
    jDoc.prototype.each = function(callback, context) {
        var i, value;
        for (i = 0, value = this._list[0]; typeof value !== 'undefined' && callback.call(context, new jDoc(value)) !== false; value = this._list[++i]) {
        
            // empty body
        }
    };
    
    /*
     * Method: count
     *   Returns the count of jDoc objects in the selection.
     * Return:
     *   number - number of jDoc object in the selection
     */
    jDoc.prototype.count = function() {
        return this._list.length;
    };
    
    /*
     * Method: get
     *   Returns the jDoc object at the given position in the selection.
     * Parameters:
     *   index - index of jDoc object to return from selection
     * Return:
     *   jDoc - jDoc object at index or an empty jDoc object
     */
    jDoc.prototype.get = function(index) {
        if (index >= 0 && index < this._list.length) {
            return new jDoc([this._list[index]], 0);
        }
        return _empty;
    };
    
    /*
     * Method: where
     *   Return filtered selection based on condition callback.
     * Parameters:
     *   condition - function to determine if jDoc object should be kept in selection
     *   context - context for function invocation
     * Return:
     *   jDoc - filtered selection based on condition callback
     */
    jDoc.prototype.where = function(condition, context) {
        var result = [];
        this.each(function(jdoc) {
            if (condition.call(context, jdoc)) {
                _push(result, jdoc.value());
            }
        });
        return new jDoc(result, 0);
    };
    
    /*
     * Method: union
     *   Returns union of two selections.
     * Parameters:
     *   jDoc - other selection
     * Return:
     *   jDoc - union of two selections
     */
    jDoc.prototype.union = function(jdoc) {
        if (!this.any()) {
            return jdoc;
        }
        if (!jdoc.any()) {
            return this;
        }
        return new jDoc(this._list.concat(jdoc._list), 0);
    };
    
    /*
     * Method: select
     *   Returns the array of values produced by the callback function when
     *   applied to each jDoc object in the selection.
     * Parameters:
     *   callback - function to invoke for each object
     *   context - context for function invocation
     * Return:
     *   array - the array of values produced by the callback function
     */
    jDoc.prototype.map = function(callback, context) {
        var result = [];
        this.each(function(jdoc) {
            result.push(callback.call(context, jdoc));
        });
        return result;
    };
    
    //--- Item Methods ---
    
    /*
     * Method: exists
     *   Returns true if a value is selected.
     * Parameters:
     *   selector - (undefined) check current node
     *              (string) check node found by the selector
     * Return:
     *   boolean - true if a value is selected
     */
    jDoc.prototype.exists = jDoc.prototype.hasValue = function(selector) {
        var node = this;
        if (typeof selector === 'string') {
            node = this.select(selector);
        }
        return node._index < node._list.length;
    };
    
    /*
     * Method: value
     *   Returns current or selected value.
     * Parameters:
     *   selector - (undefined) get value of current node
     *              (string) get value of first node found by the selector
     * Return:
     *   any - current or selected value
     */
    jDoc.prototype.value = function(selector) {
        var node = this;
        if (typeof selector === 'string') {
            node = this.select(selector);
        }
        if (!node.exists()) {
            return null;
        }
        return node._list[this._index];
    };
    
    /*
     * Method: text
     *   Returns the text value of the current or selected node
     * Parameters:
     *   selector - (undefined) get text of current node
     *              (string) get text of first node found by the selector
     * Return:
     *   string - text value of the current or selected node
     */
    jDoc.prototype.text = function(selector) {
        var json = this.value(selector);
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
    };
    
    /*
     * Method: match
     *    Returns selection of all matching properties in current jDoc selection.
     * Parameters:
     *    pattern - (string) literal string used to match on property names
     *              (regexp) regular expression used to match on property names
     *              (function) function invoked with property name to determine the match
     *    recursive - match properties at any nesting level in current jDoc selection
     * Return:
     *    jDoc - selection of all matching properties
     */
    jDoc.prototype.match = function(pattern, recursive) {
        if (!this.exists()) {
            return this;
        }
        
        // collect matching fields
        var result = [];
        _match(this, _createPatternCheck(pattern), recursive || false, result);
        return new jDoc(result, 0);
    };
    
    /*
     * Method: attributes
     *   Returns selection of all attributes on current jDoc object.
     * Return:
     *   selection of all attributes on current jDoc object
     */
    jDoc.prototype.attributes = function() {
        return this.match(/^@.+$/);
    };
    
    /*
     * Method: nodes
     *   Returns selection of all elements on current jDoc object.
     * Return:
     *   selection of all elements on current jDoc object
     */
    jDoc.prototype.elements = function() {
        return this.match(/^[^@#].*$/);
    };
    
    /*
     * Method: select
     *   Returns a selection of matching properties based on the selector.
     * Return:
     *   jDoc - selection of matched values
     */
    jDoc.prototype.select = function(selector) {
        var code;
        if (typeof(code = _compiledSelectors[selector]) === 'undefined') {
        
            // compile new selection function
            _compiledSelectors[selector] = code = new Function('return ' + _createSelectorExpression(selector));
        }
        return code.call(this);
    };
})();
