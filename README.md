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

Usage
-----
	var jdoc = new jDoc(json);
	// select all title nodes inside of all book nodes
	var title = jdoc.match('book').match('title');
	// obtain the text of all matched titles
	for (; title.hasValue(); title = title.next()) {  
 		var text = somevalue.text();
	}

Item Methods
------------
* obj.hasValue()
* obj.$(selector)
* obj.match(string | regexp | function)
* obj.deepMatch(string | regexp | function)
* obj.json()
* obj.text()
* obj.attributes()
* obj.elements()

Collection Methods
------------------
* obj.any()
* obj.first()
* obj.next()
* obj.each(function(jdoc), context)
* obj.get(index)
* obj.count()
* obj.where(function(jdoc))
* obj.union(jdoc)
* obj.select(function(jdoc), context)

Compatibility
-------------
* Firefox
* IE
* Chrome

Update Log
----------
* 0.1 - Initial release
