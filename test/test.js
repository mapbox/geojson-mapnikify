var test = require('tap').test,
    fs = require('fs'),
    generatexml = require('../');

function normalize(_) {
    return _.replace(/file="([^\"])+"/g, 'file="TMP"');
}

function generates(t, retina, name) {
    t.test(name, function(t) {
        generatexml(JSON.parse(fs.readFileSync(__dirname + '/data/' + name + '.geojson')), retina, function(err, xml) {
            t.equal(err, null, name + ' no error returned');
            t.pass('is generated');
            t.equal(
                normalize(xml),
                normalize(fs.readFileSync(__dirname + '/data/' + name + '.xml', 'utf8')), name);
            t.end();
        });
    });
}

test('generatexml', function(t) {
    generates(t, false, 'example');
    generates(t, false, 'point');
    generates(t, true, 'point-retina');
    generates(t, true, 'example-retina');
    generates(t, false, 'stroked');
    t.end();
});
