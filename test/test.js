var test = require('tape'),
    fs = require('fs'),
    os = require('os'),
    glob = require('glob'),
    cachepath = require('../lib/cachepath.js'),
    urlmarker = require('../lib/urlmarker.js'),
    generatexml = require('../');

function normalize(_) {
    return _.replace(/"marker-path":"([^\"])+"/g, '"marker-path":"TMP"');
}

function generates(t, retina, name, message) {
    t.test(name, function(t) {
        generatexml(JSON.parse(fs.readFileSync(__dirname + '/data/' + name + '.geojson')), retina, function(err, xml) {
            if (message !== undefined) {
                t.equal(err.message, message, name + ' error returned');
                t.end();
                return;
            }
            t.equal(err, null, name + ' no error returned');
            t.pass('is generated');
            if (process.env.UPDATE) {
                fs.writeFileSync(__dirname + '/data/' + name + '.xml', normalize(xml));
            }
            t.equal(
                normalize(xml),
                normalize(fs.readFileSync(__dirname + '/data/' + name + '.xml', 'utf8')), name);
            t.end();
        });
    });
}

test('clean tmp', function(t) {
    glob.sync(os.tmpdir() + 'geojson-mapnikify*').forEach(function(f) {
        fs.unlinkSync(f);
    });
    t.end();
});

test('generatexml', generateXML);

test('generatexml - cached', generateXML);

function generateXML(t) {
    generates(t, false, 'example');
    generates(t, false, 'point');
    generates(t, true, 'point-retina');
    generates(t, true, 'dedup');
    generates(t, true, 'point-retina');
    generates(t, true, 'url-marker');
    generates(t, true, 'url-marker-no-http');
    generates(t, true, 'url-marker-invalid', 'Unable to load marker from URL.');
    generates(t, true, 'example-retina');
    generates(t, true, 'feature-nullgeom');
    generates(t, true, 'feature-nullproperties');
    generates(t, false, 'stroked');
    t.end();
}

test('corners', function(t) {
    generatexml(null, false, function(err, xml) {
        t.deepEqual(err, new Error('invalid GeoJSON'));
        t.end();
    });
});

test('cachepath', function(t) {
    t.equal(typeof cachepath('foo'), 'string');
    t.end();
});

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
