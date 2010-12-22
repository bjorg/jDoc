jDoc
====
*JSON document*

jDoc is a lightweight Javascript class which provides querying capabilities over JSON objects.

Features
--------
* basic node selection
* element index selection
* unlimited, nested predicate selections via inline javascript functions
* 2 methods of querying, chained javascript functions or traditional XPath query string
* root, parent, global node selections
* predicate functions [ last(), position(), count() ]
* boolean operators

* selection filtering and iterating

Using jDoc
-----------
There are two syntactic methods to using jDoc - chained method calls or an XPath query.

Chained method calls offers the most control but with a high level of complexity. 
XPath query is a lot easier to use but with the caveat that it's considered beta 
and rather limited as far as Javascript features go.

Usage
-----
	var jpath = new jDoc( myjsonobj );
 	var somevalue = jpath.$('book/title').json;  //results in title
		//or
	var somevalue = jpath.query('book/title');   //results in title

Supported selector syntax:
	tagname
	/tagname
	//tagname

Selection Methods
-----------------
obj.$(string) /* NOT IMPLEMENTED */
obj.hasValue()
obj.match(string | regexp | function)
obj.where(function(jdoc))

Collection Methods
------------------
obj.any()
obj.get(index)
obj.count()
obj.first()
obj.next()
obj.each(function(json), context)

Access Methods
--------------
obj.text()
obj.root()
obj.parent()

Compatibility
-------------
* Firefox
* IE
* Chrome

Update Log
----------
1.0
        First release
