var test = require('tap').test,
    fs = require('fs'),
    os = require('os'),
    generatexml = require('../');

var TMP = '/tmp/tl-overlay';

try {
    fs.mkdirSync(TMP);
} catch(e) { }

function generates(t, retina, name) {
    t.equal(
        generatexml(JSON.parse(fs.readFileSync(__dirname + '/data/' + name + '.geojson')), TMP).xml,
            fs.readFileSync(__dirname + '/data/' + name + '.xml', 'utf8'), name);
}

test('generatexml', function(t) {
    generates(t, false, 'example');
    generates(t, false, 'point');
    generates(t, true, 'point-retina');
    generates(t, true, 'example-retina');
    t.end();
});
