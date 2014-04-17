var test = require('tap').test,
    fs = require('fs'),
    urlmarker = require('../lib/urlmarker.js');

test('urlmarker-too-large', function(t) {
    urlmarker({
        properties: {
            'marker-url': 'http://farm6.staticflickr.com/5497/9183359573_62e78cf675_o.png'
        }
    }, function(err, res) {
        t.equal(err.message, 'Marker image size must not exceed 160000 pixels.');
        t.end();
    });
});

test('urlmarker-jpg', function(t) {
    urlmarker({
        properties: {
            'marker-url': 'https://farm4.staticflickr.com/3763/13561719523_ac1f3a2a77_s.jpg'
        }
    }, function(err, res) {
        t.equal(err.message, 'Marker image format is not supported.');
        t.end();
    });
});
