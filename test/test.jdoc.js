$(function() {
    module('jDoc');
    
    var library = {
        'name': 'My Library',
        '@open': '2007-17-7',
        'address': {
            'city': 'Springfield',
            'zip': '12345',
            'state': 'MI',
            'street': {
                '@primary': 'true',
                '#text': 'Mockingbird Lane'
            }
        },
        'books': [{
            'title': 'Harry Potter',
            'isbn': '1234-1234',
            'category': 'Childrens',
            'available': '3',
            'chapters': ['Chapter 1', 'Chapter 2']
        }, {
            'title': 'Brief History of time',
            'isbn': '1234-ABCD',
            'category': 'Science',
            'chapters': ['1', '2']
        }, {
            'title': 'Lord of the Rings',
            'isbn': '1234-PPPP',
            'category': 'Fiction',
            'chapters': ['Section 1', 'Section 2']
        }],
        'categories': [{
            'name': 'Childrens',
            'description': 'Childrens books'
        }, {
            'name': 'Science',
            'description': 'Books about science'
        }, {
            'name': 'Fiction',
            'description': 'Fiction books'
        }]
    };
    
    test("new jDoc(library)", function() {
        var jdoc = new jDoc(library);
        
        equal(jdoc.any(), true, 'any');
        equal(jdoc.count(), 1, 'count');
    });
    
    test("new jDoc(library).match('name')", function() {
        var jdoc = new jDoc(library).match('name');
        
        equal(jdoc.any(), true, 'any');
        equal(jdoc.count(), 1, 'count');
        equal(jdoc.text(), 'My Library', 'text')
    });
    
    test("new jDoc(library).text('name')", function() {
        equal(new jDoc(library).text('name'), 'My Library', 'text')
    });
    
    test("new jDoc(library).match('address').match('street')", function() {
        var jdoc = new jDoc(library).match('address').match('street');
        
        equal(jdoc.any(), true, 'any');
        equal(jdoc.count(), 1, 'count');
        equal(jdoc.text(), 'Mockingbird Lane', 'text')
    });
    
    test("new jDoc(library).match('books')", function() {
        var jdoc = new jDoc(library).match('books');
        
        equal(jdoc.any(), true, 'any');
        equal(jdoc.count(), 3, 'count');
    });
    
    test("new jDoc(library).match('books').match('chapters')", function() {
        var jdoc = new jDoc(library).match('books').match('chapters');
        
        equal(jdoc.any(), true, 'any');
        equal(jdoc.count(), 6, 'count');
    });
    
    test("new jDoc(library).deepMatch('chapters')", function() {
        var jdoc = new jDoc(library).deepMatch('chapters');
        
        equal(jdoc.any(), true, 'any');
        equal(jdoc.count(), 6, 'count');
    });
    
    test("new jDoc(library).match('chapters')", function() {
        var jdoc = new jDoc(library).match('chapters');
        
        equal(jdoc.any(), false, 'any');
        equal(jdoc.count(), 0, 'count');
    });
    
    test("new jDoc(library).match(/books/).match(/chapters/)", function() {
        var jdoc = new jDoc(library).match(/books/).match(/chapters/);
        
        equal(jdoc.any(), true, 'any');
        equal(jdoc.count(), 6, 'count');
    });
    
    test("new jDoc(library).match('does-not-exist')", function() {
        var jdoc = new jDoc(library).match('does-not-exist');
        
        equal(jdoc.any(), false, 'any');
        equal(jdoc.count(), 0, 'count');
    });
    
    test("iterating with .first() and .next()", function() {
        var jdoc = new jDoc(library).deepMatch('title');
        
        var result = [];
        for (var current = jdoc.first(); current.hasValue(); current = current.next()) {
            result.push(current.json());
        }
        
        deepEqual(result, ['Harry Potter', 'Brief History of time', 'Lord of the Rings']);
    });
    
    test("iterating with .count() and .get()", function() {
        var jdoc = new jDoc(library).deepMatch('title');
        
        var result = [];
        for (var index = 0; index < jdoc.count(); ++index) {
            result.push(jdoc.get(index).json());
        }
        
        deepEqual(result, ['Harry Potter', 'Brief History of time', 'Lord of the Rings']);
    });
    
    test("iterating with .each()", function() {
        var jdoc = new jDoc(library).deepMatch('title');
        
        var result = [];
        jdoc.each(function(jdoc) {
            result.push(jdoc.json());
        });
        
        deepEqual(result, ['Harry Potter', 'Brief History of time', 'Lord of the Rings']);
    });
    
    test("new jDoc(library).deepMatch('title').where(...)", function() {
        var jdoc = new jDoc(library).deepMatch('title').where(function(jdoc) {
            return jdoc.text().split(' ').length > 3;
        });
        
        var result = [];
        jdoc.each(function(jdoc) {
            result.push(jdoc.json());
        });
        
        deepEqual(result, ['Brief History of time', 'Lord of the Rings']);
    });
    
    test("new jDoc(library).deepMatch('title').union(new jDoc(library).deepMatch('name'))", function() {
        var titles = new jDoc(library).deepMatch('title');
        var names = new jDoc(library).deepMatch('name');
        var union = titles.union(names);
        
        var result = [];
        union.each(function(jdoc) {
            result.push(jdoc.json());
        });
        
        deepEqual(result, ['Harry Potter', 'Brief History of time', 'Lord of the Rings', 'My Library', 'Childrens', 'Science', 'Fiction']);
    });
    
    test("new jDoc(library).deepMatch('title').select(...)", function() {
        var result = new jDoc(library).deepMatch('title').select(function(jdoc) {
            return jdoc.text().length;
        });
        
        deepEqual(result, [12, 21, 17]);
    });
	
	test("new jDoc(library).attributes()", function() {
		var result = new jDoc(library).attributes();
        
		equal(result.any(), true, 'any');
		equal(result.count(), 1, 'count');
		equal(result.text(), '2007-17-7', 'text');
	});
	
	test("new jDoc(library).elements()", function() {
		var result = new jDoc(library).elements();
        
		equal(result.any(), true, 'any');
		equal(result.count(), 8, 'count');
	});
	
	test("new jDoc(library).$('.')", function() {
        var jdoc = new jDoc(library).$('.');
        
        equal(jdoc.any(), true, 'any');
        equal(jdoc.count(), 1, 'count');
	});
	
    test("new jDoc(library).$('name')", function() {
        var jdoc = new jDoc(library).$('name');
        
        equal(jdoc.any(), true, 'any');
        equal(jdoc.count(), 1, 'count');
        equal(jdoc.text(), 'My Library', 'text')
    });
	
    test("new jDoc(library).$('/name')", function() {
        var jdoc = new jDoc(library).$('/name');
        
        equal(jdoc.any(), true, 'any');
        equal(jdoc.count(), 1, 'count');
        equal(jdoc.text(), 'My Library', 'text')
    });
    
    test("new jDoc(library).$('address/street')", function() {
        var jdoc = new jDoc(library).$('address/street');
        
        equal(jdoc.any(), true, 'any');
        equal(jdoc.count(), 1, 'count');
        equal(jdoc.text(), 'Mockingbird Lane', 'text')
    });
    
    test("new jDoc(library).$('books')", function() {
        var jdoc = new jDoc(library).$('books');
        
        equal(jdoc.any(), true, 'any');
        equal(jdoc.count(), 3, 'count');
    });
    
    test("new jDoc(library).$('books/chapters')", function() {
        var jdoc = new jDoc(library).$('books/chapters');
        
        equal(jdoc.any(), true, 'any');
        equal(jdoc.count(), 6, 'count');
    });
    
    test("new jDoc(library).$('//chapters')", function() {
        var jdoc = new jDoc(library).$('//chapters');
        
        equal(jdoc.any(), true, 'any');
        equal(jdoc.count(), 6, 'count');
    });
    
    test("new jDoc(library).$('chapters')", function() {
        var jdoc = new jDoc(library).$('chapters');
        
        equal(jdoc.any(), false, 'any');
        equal(jdoc.count(), 0, 'count');
    });
    
    test("new jDoc(library).$('does-not-exist')", function() {
        var jdoc = new jDoc(library).$('does-not-exist');
        
        equal(jdoc.any(), false, 'any');
        equal(jdoc.count(), 0, 'count');
    });
	
	test("new jDoc(library).$('@*')", function() {
		var result = new jDoc(library).$('@*');
        
		equal(result.any(), true, 'any');
		equal(result.count(), 1, 'count');
		equal(result.text(), '2007-17-7', 'text');
	});
	
	test("new jDoc(library).$('//@*')", function() {
		var result = new jDoc(library).$('//@*');
        
		equal(result.any(), true, 'any');
		equal(result.count(), 2, 'count');
		equal(result.text(), '2007-17-7', 'text');
		equal(result.next().text(), 'true', 'next.text');
	});
	
	test("new jDoc(library).$('*')", function() {
		var result = new jDoc(library).$('*');
        
		equal(result.any(), true, 'any');
		equal(result.count(), 8, 'count');
	});
	
	test("new jDoc(library).$('//*')", function() {
		var result = new jDoc(library).$('//*');
        
		equal(result.any(), true, 'any');
		equal(result.count(), 72, 'count');
	});
	
	test("new jDoc(library).$('//*') cached", function() {
		var result = new jDoc(library).$('//*');
        
		equal(result.any(), true, 'any');
		equal(result.count(), 72, 'count');
	});
});
