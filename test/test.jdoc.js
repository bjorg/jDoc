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
    
    test("jDoc(library)", function() {
        var jdoc = jDoc(library);
        
        equal(jdoc.any(), true, 'any');
        equal(jdoc.count(), 1, 'count');
    });
    
    test("match('name')", function() {
        var jdoc = jDoc(library).match('name');
        
        equal(jdoc.any(), true, 'any');
        equal(jdoc.count(), 1, 'count');
        equal(jdoc.text(), 'My Library', 'text')
    });
    
    test("text('name')", function() {
        equal(jDoc(library).text('name'), 'My Library', 'text')
    });
    
    test("value('not-found')", function() {
        equal(jDoc(library).value('not-found'), null, 'json')
    });
    
    test("text('not-found')", function() {
        equal(jDoc(library).text('not-found'), null, 'text')
    });
    
    test("match('address').match('street')", function() {
        var jdoc = jDoc(library).match('address').match('street');
        
        equal(jdoc.any(), true, 'any');
        equal(jdoc.count(), 1, 'count');
        equal(jdoc.text(), 'Mockingbird Lane', 'text')
    });
    
    test("match('books')", function() {
        var jdoc = jDoc(library).match('books');
        
        equal(jdoc.any(), true, 'any');
        equal(jdoc.count(), 3, 'count');
    });
    
    test("match('books').match('chapters')", function() {
        var jdoc = jDoc(library).match('books').match('chapters');
        
        equal(jdoc.any(), true, 'any');
        equal(jdoc.count(), 6, 'count');
    });
    
    test("match('chapters', true)", function() {
        var jdoc = jDoc(library).match('chapters', true);
        
        equal(jdoc.any(), true, 'any');
        equal(jdoc.count(), 6, 'count');
    });
    
    test("match('chapters')", function() {
        var jdoc = jDoc(library).match('chapters');
        
        equal(jdoc.any(), false, 'any');
        equal(jdoc.count(), 0, 'count');
    });
    
    test("match(/books/).match(/chapters/)", function() {
        var jdoc = jDoc(library).match(/books/).match(/chapters/);
        
        equal(jdoc.any(), true, 'any');
        equal(jdoc.count(), 6, 'count');
    });
    
    test("match('does-not-exist')", function() {
        var jdoc = jDoc(library).match('does-not-exist');
        
        equal(jdoc.any(), false, 'any');
        equal(jdoc.count(), 0, 'count');
    });
    
    test("iterating with .first() and .next()", function() {
        var jdoc = jDoc(library).match('title', true);
        
        var result = [];
        for (var current = jdoc.first(); current.exists(); current = current.next()) {
            result.push(current.value());
        }
        
        deepEqual(result, ['Harry Potter', 'Brief History of time', 'Lord of the Rings']);
    });
    
    test("iterating with .count() and .get()", function() {
        var jdoc = jDoc(library).match('title', true);
        
        var result = [];
        for (var index = 0; index < jdoc.count(); ++index) {
            result.push(jdoc.get(index).value());
        }
        
        deepEqual(result, ['Harry Potter', 'Brief History of time', 'Lord of the Rings']);
    });
    
    test("iterating with .each()", function() {
        var jdoc = jDoc(library).match('title', true);
        
        var result = [];
        jdoc.each(function(jdoc) {
            result.push(jdoc.value());
        });
        
        deepEqual(result, ['Harry Potter', 'Brief History of time', 'Lord of the Rings']);
    });
    
    test("match('title', true).where(...)", function() {
        var jdoc = jDoc(library).match('title', true).where(function(jdoc) {
            return jdoc.text().split(' ').length > 3;
        });
        
        var result = [];
        jdoc.each(function(jdoc) {
            result.push(jdoc.value());
        });
        
        deepEqual(result, ['Brief History of time', 'Lord of the Rings']);
    });
    
    test("match('title', true).union(jDoc(library).match('name', true))", function() {
        var titles = jDoc(library).match('title', true);
        var names = jDoc(library).match('name', true);
        var union = titles.union(names);
        
        var result = [];
        union.each(function(jdoc) {
            result.push(jdoc.value());
        });
        
        deepEqual(result, ['Harry Potter', 'Brief History of time', 'Lord of the Rings', 'My Library', 'Childrens', 'Science', 'Fiction']);
    });
    
    test("match('title', true).map(...)", function() {
        var result = jDoc(library).match('title', true).map(function(jdoc) {
            return jdoc.text().length;
        });
        
        deepEqual(result, [12, 21, 17]);
    });
	
	test("attributes()", function() {
		var result = jDoc(library).attributes();
        
		equal(result.any(), true, 'any');
		equal(result.count(), 1, 'count');
		equal(result.text(), '2007-17-7', 'text');
	});
	
	test("elements()", function() {
		var result = jDoc(library).elements();
        
		equal(result.any(), true, 'any');
		equal(result.count(), 8, 'count');
	});
	
	test("select('.')", function() {
        var jdoc = jDoc(library).select('.');
        
        equal(jdoc.any(), true, 'any');
        equal(jdoc.count(), 1, 'count');
	});
	
    test("select('name')", function() {
        var jdoc = jDoc(library).select('name');
        
        equal(jdoc.any(), true, 'any');
        equal(jdoc.count(), 1, 'count');
        equal(jdoc.text(), 'My Library', 'text')
    });
	
    test("select('/name')", function() {
        var jdoc = jDoc(library).select('/name');
        
        equal(jdoc.any(), true, 'any');
        equal(jdoc.count(), 1, 'count');
        equal(jdoc.text(), 'My Library', 'text')
    });
    
    test("select('address/street')", function() {
        var jdoc = jDoc(library).select('address/street');
        
        equal(jdoc.any(), true, 'any');
        equal(jdoc.count(), 1, 'count');
        equal(jdoc.text(), 'Mockingbird Lane', 'text')
    });
    
    test("select('books')", function() {
        var jdoc = jDoc(library).select('books');
        
        equal(jdoc.any(), true, 'any');
        equal(jdoc.count(), 3, 'count');
    });
    
    test("select('books/chapters')", function() {
        var jdoc = jDoc(library).select('books/chapters');
        
        equal(jdoc.any(), true, 'any');
        equal(jdoc.count(), 6, 'count');
    });
    
    test("select('//chapters')", function() {
        var jdoc = jDoc(library).select('//chapters');
        
        equal(jdoc.any(), true, 'any');
        equal(jdoc.count(), 6, 'count');
    });
    
    test("select('chapters')", function() {
        var jdoc = jDoc(library).select('chapters');
        
        equal(jdoc.any(), false, 'any');
        equal(jdoc.count(), 0, 'count');
    });
    
    test("select('does-not-exist')", function() {
        var jdoc = jDoc(library).select('does-not-exist');
        
        equal(jdoc.any(), false, 'any');
        equal(jdoc.count(), 0, 'count');
    });
	
	test("select('@*')", function() {
		var result = jDoc(library).select('@*');
        
		equal(result.any(), true, 'any');
		equal(result.count(), 1, 'count');
		equal(result.text(), '2007-17-7', 'text');
	});
	
	test("select('//@*')", function() {
		var result = jDoc(library).select('//@*');
        
		equal(result.any(), true, 'any');
		equal(result.count(), 2, 'count');
		equal(result.text(), '2007-17-7', 'text');
		equal(result.next().text(), 'true', 'next.text');
	});
	
	test("select('*')", function() {
		var result = jDoc(library).select('*');
        
		equal(result.any(), true, 'any');
		equal(result.count(), 8, 'count');
	});
	
	test("select('//*')", function() {
		var result = jDoc(library).select('//*');
        
		equal(result.any(), true, 'any');
		equal(result.count(), 72, 'count');
	});
	
	test("select('//*') cached", function() {
		var result = jDoc(library).select('//*');
        
		equal(result.any(), true, 'any');
		equal(result.count(), 72, 'count');
	});
});
