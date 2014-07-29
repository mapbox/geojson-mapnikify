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
            if (process.env.UPDATE) {
                fs.writeFileSync(__dirname + '/data/' + name + '.xml', xml);
            }
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
    generates(t, true, 'point-retina');
    generates(t, true, 'example-retina');
    generates(t, true, 'feature-nullgeom');
    generates(t, true, 'feature-nullproperties');
    generates(t, false, 'stroked');
    t.end();
});

test('corners', function(t) {
    generatexml(null, false, function(err, xml) {
        t.deepEqual(err, new Error('invalid GeoJSON'));
        t.end();
    });
});
