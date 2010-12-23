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
    
    var testCompile = function(path, expected) {
        test(path, function() {
            var value = jPath.compile(path, true).toString();
            value = value.replace('function anonymous(', 'function(');
            
            equal(value, expected);
        });
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
            result.push(current.json);
        }
        
        deepEqual(result, ['Harry Potter', 'Brief History of time', 'Lord of the Rings']);
    });
    
    test("iterating with .count() and .get()", function() {
        var jdoc = new jDoc(library).deepMatch('title');
        
        var result = [];
        for (var index = 0; index < jdoc.count(); ++index) {
            result.push(jdoc.get(index).json);
        }
        
        deepEqual(result, ['Harry Potter', 'Brief History of time', 'Lord of the Rings']);
    });
    
    test("iterating with .each()", function() {
        var jdoc = new jDoc(library).deepMatch('title');
        
        var result = [];
        jdoc.each(function(json) {
            result.push(json);
        });
        
        deepEqual(result, ['Harry Potter', 'Brief History of time', 'Lord of the Rings']);
    });
    
    test("new jDoc(library).deepMatch('title').where(...)", function() {
        var jdoc = new jDoc(library).deepMatch('title').where(function(jdoc) {
            return jdoc.text().split(' ').length > 3;
        });
        
        var result = [];
        jdoc.each(function(json) {
            result.push(json);
        });
        
        deepEqual(result, ['Brief History of time', 'Lord of the Rings']);
    });
    
    test("new jDoc(library).deepMatch('title').union(new jDoc(library).deepMatch('name'))", function() {
        var titles = new jDoc(library).deepMatch('title');
        var names = new jDoc(library).deepMatch('name');
        var union = titles.union(names);
        
        var result = [];
        union.each(function(json) {
            result.push(json);
        });
        
        deepEqual(result, ['Harry Potter', 'Brief History of time', 'Lord of the Rings', 'My Library', 'Childrens', 'Science', 'Fiction']);
    });
    
    test("new jDoc(library).deepMatch('title').select(...)", function() {
        var result = new jDoc(library).deepMatch('title').select(function(json) {
            return json.length;
        });
        
        deepEqual(result, [12, 21, 17]);
    });
});
