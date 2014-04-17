var test = require('tap').test,
    fs = require('fs'),
    cachepath = require('../lib/cachepath.js');

test('cachepath', function(t) {
    t.equal(typeof cachepath('foo'), 'string');
    t.end();
});
