jDoc (v0.2)
===========
*Turn JSON objects into queryable documents*

jDoc is a lightweight Javascript class which provides querying capabilities over JSON objects.

Features
--------
* recursive pattern matching
* selection filtering
* selection iterating
* document navigation

Using jDoc
-----------
jDoc uses a fluid interface to query for nested objects in a JSON document.  Selections can
be refined by filtering and then iterated over.

Example 1: Getting the text value of the first selected node
------------------------------------------------------------
	var jdoc = new jDoc(json);
	
	// obtain the text of the first title node inside a book node
	var result = jdoc.select('book/title').text();
	
	// or you can use the shorthand form
	var result = jdoc.text('book/title');

Example 2: Finding the text value of all selected nodes
-------------------------------------------------------
	var jdoc = new jDoc(json);
	
	// obtain the text of all title nodes inside of all book nodes
	var result = '';
	jdoc.select('book/title').each(function(cur) {
		result += 'title: '  + cur.text() + '\n';
	});

Selection Methods
-----------------
* jdoc.select(selector)
* jdoc.match(string | regexp | function, [recursive])
* jdoc.attributes()
* jdoc.elements()

Item Methods
------------
* jdoc.exists([selector])
* jdoc.value([selector])
* jdoc.text([selector])

Collection Methods
------------------
* jdoc.any()
* jdoc.first()
* jdoc.next()
* jdoc.each(function(jdoc) [, context])
* jdoc.get(index)
* jdoc.count()
* jdoc.where(function(jdoc) [, context])
* jdoc.union(jdoc)
* jdoc.map(function(jdoc) [, context])

Compatibility
-------------
* Firefox
* IE
* Chrome

Update Log
----------
* 0.1 - Initial release
* 0.2 - Additionanl overloads which take selector; removed jQuery dependency; improved method names:
        'map()' instead of 'select()', 'exists()' instead of 'hasValue()', 'value()' instead of 'json()', and 'select()' instead of '$()' 
