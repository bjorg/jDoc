jDoc
====
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
	var result = jdoc.$('book/title').text();
	
	// or you can use the shorthand form
	var result = jdoc.text('book/title');

Example 2: Finding the text value of all selected nodes
-------------------------------------------------------
	var jdoc = new jDoc(json);
	
	// obtain the text of all title nodes inside of all book nodes
	var result = '';
	jdoc.$('book/title').each(function(cur) {
		result += 'title: '  + cur.text() + '\n';
	});

Selection Methods
-----------------
* obj.$(selector)
* obj.match(string | regexp | function)
* obj.deepMatch(string | regexp | function)
* obj.attributes()
* obj.elements()

Item Methods
------------
* obj.hasValue()
* obj.json([selector])
* obj.text([selector])

Collection Methods
------------------
* obj.any()
* obj.first()
* obj.next()
* obj.each(function(jdoc) [, context])
* obj.get(index)
* obj.count()
* obj.where(function(jdoc) [, context])
* obj.union(jdoc)
* obj.select(function(jdoc) [, context])

Compatibility
-------------
* Firefox
* IE
* Chrome

Update Log
----------
* 0.1 - Initial release
