var test = require('tape'),
    fs = require('fs'),
    os = require('os'),
    glob = require('glob'),
    mapnik = require('mapnik'),
    cachepath = require('../lib/cachepath.js'),
    urlmarker = require('../lib/urlmarker.js'),
    generatexml = require('../');

mapnik.register_default_input_plugins();

function normalize(_) {
    return _.replace(/"marker-path":"([^\"])+"/g, '"marker-path":"TMP"');
}

function render(xml, cb) {
    var map = new mapnik.Map(600, 400);
    var im = new mapnik.Image(map.width, map.height);

    map.fromString(xml, {
        strict: true
    }, function(err, map) {
        if (err) return cb(err);
        try {
            map.zoomAll();
            var e = map.extent;
            // inflate bbox slightly in order to show single points
            var pad = 1;
            map.extent = [e[0] - pad, e[1] - pad, e[2] + pad, e[3] + pad];
            map.render(im, {}, cb);
        } catch (err) {
            return cb(err);
        }
    });
}

function generates(t, retina, name, message) {
    t.test(name, function(t) {
        var file_path = __dirname + '/data/' + name + '.geojson';
        generatexml(JSON.parse(fs.readFileSync(file_path)), retina, function(err, xml) {
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

            render(xml, function(err, im) {
                var expected_image = file_path + '.png';
                t.equal(err, null);
                t.ok(im, 'creates image');
                if (process.env.UPDATE) {
                    fs.writeFileSync(__dirname + '/data/' + name + '.xml', xml);
                    im.save(expected_image, 'png32');
                }
                t.equal(0, im.compare(new mapnik.Image.open(expected_image)));
                t.end();
            });
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
