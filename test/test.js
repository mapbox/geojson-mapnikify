var test = require('tap').test,
    fs = require('fs'),
    generatexml = require('../');

function generates(t, retina, name) {
    t.test(name, function(t) {
        generatexml(JSON.parse(fs.readFileSync(__dirname + '/data/' + name + '.geojson')), false, function(err, xml) {
            t.equal(err, null, 'no error returned');
            t.pass('is generated');
            // t.equal(xml,
            //     fs.readFileSync(__dirname + '/data/' + name + '.xml', 'utf8'), name);
            t.end();
        });
    });
}

test('generatexml', function(t) {
    generates(t, false, 'example');
    generates(t, false, 'point');
    generates(t, true, 'point-retina');
    generates(t, true, 'example-retina');
    t.end();
});
