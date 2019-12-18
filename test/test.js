var test = require('tape'),
    fs = require('fs'),
    os = require('os'),
    path = require('path'),
    glob = require('glob'),
    nock = require('nock'),
    mapnik = require('mapnik'),
    cachepath = require('../lib/cachepath.js'),
    urlmarker = require('../lib/urlmarker.js'),
    needle = require('needle'),
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
    generates(t, false, 'multipoint');
    generates(t, true, 'point-retina');
    generates(t, true, 'dedup');
    generates(t, true, 'point-retina');
    generates(t, true, 'example-retina');
    generates(t, true, 'feature-nullproperties');
    generates(t, false, 'stroked');
    generates(t, false, 'hashless');
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
    var file = fs.readFileSync(path.resolve(__dirname, 'data', 'too-large.png'));
    var scope = nock('http://devnull.mapnik.org')
        .get(/.*/)
        .reply(200, file, { 'content-type': 'image/png' });

    urlmarker({
        properties: {
            'marker-url': 'http://devnull.mapnik.org/too-large.png'
        }
    }, function(err, res) {
            t.equal(err.message, 'Marker image size must not exceed 160000 pixels.');
            nock.cleanAll();
            t.end();
        });
});

test('urlmarker-jpg', function(t) {
    var file = fs.readFileSync(path.resolve(__dirname, 'data', 'mountain.jpg'));
    var scope = nock('https://devnull.mapnik.org')
        .get(/.*/)
        .reply(200, file, { 'content-type': 'image/jpg' });

    urlmarker({
        properties: {
            'marker-url': 'https://devnull.mapnik.org/mountain.jpg'
        }
    }, function(err, res) {
            t.equal(err.message, 'Marker image format is not supported.');
            nock.cleanAll()
            t.end();
        });
});

test('urlmarker-custom-client', function(t) {
    var client = needle.defaults({ response_timeout: 100 });
    var file = fs.readFileSync(path.resolve(__dirname, 'data', 'rocket.png'));
    var scope = nock('http://devnull.mapnik.org')
        .get(/.*/)
        .delay(300)
        .reply(200, file, { 'content-type': 'image/png' });

    generatexml.setRequestClient(client);
    urlmarker({
        properties: {
            'marker-url': 'http://devnull.mapnik.org/rocket.png'
        }
    }, function(err, res) {
            t.equal(err.message, 'Unable to load marker from URL.');
            t.equal(err.originalError.code, 'ECONNRESET');
            generatexml.setRequestClient(null);
            nock.cleanAll();
            t.end();
        });
});

test('urlmarker-too-large-custom-client', function(t) {
    var client = needle.defaults({ timeout: 100 });
    var file = fs.readFileSync(path.resolve(__dirname, 'data', 'html-page.png'));
    var scope = nock('http://devnull.mapnik.org')
        .get(/.*/)
        .reply(200, file, { 'content-type': 'text/html' });

    generatexml.setRequestClient(client);
    urlmarker({
        properties: {
            'marker-url': 'http://devnull.mapnik.org/html-page.png'
        }
    }, function(err, res) {
            t.equal(err.message, 'Marker loaded from URL is too large.');
            generatexml.setRequestClient(null);
            nock.cleanAll();
            t.end();
        });
});

// ensure generatexml.setRequestClient(null) returns to default client
test('urlmarker-uncustomize-client', function(t) {
    var file = fs.readFileSync(path.resolve(__dirname, 'data', 'rocket.png'));
    var scope = nock('http://devnull.mapnik.org', { reqheaders: {'accept-encoding': 'binary'}})
        .get(/.*/)
        .delay(300)
        .reply(200, file, { 'content-type': 'image/png' });

    urlmarker({
        properties: {
            'marker-url': 'http://devnull.mapnik.org/rocket.png'
        }
    }, function(err, res) {
            t.ifErr(err);
            nock.cleanAll();
            t.end();
        });
});
