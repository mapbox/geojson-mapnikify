var test = require('tap').test,
    fs = require('fs'),
    cachepath = require('../lib/cachepath.js'),
    urlmarker = require('../lib/urlmarker.js'),
    generatexml = require('../'),
    mapnik = require('mapnik'),
    path = require('path');

mapnik.register_datasource(path.join(mapnik.settings.paths.input_plugins,'geojson.input'));
mapnik.register_datasource(path.join(mapnik.settings.paths.input_plugins,'csv.input'));

function normalize(_) {
    return _.replace(/file="([^\"])+"/g, 'file="TMP"');
}

function render(xml, cb) {
    var map = new mapnik.Map(600,400);
    var im = new mapnik.Image(map.width,map.height);
    map.fromString(xml,{strict:true}, function(err,map) {
        if (err) return cb(err);
        try {
            map.zoomAll();
            var e = map.extent;
            // inflate bbox slightly in order to show single points
            var pad = 1;
            map.extent = [e[0]-pad,e[1]-pad,e[2]+pad,e[3]+pad];
            map.render(im,{},cb);
        } catch (err) {
            return cb(err);
        }
    });
}


// Use Mapnik 3.x features to render with minimal xml
function render3(geojson,opts,cb) {
    var map = new mapnik.Map(600,400);
    var im = new mapnik.Image(map.width,map.height);
    var template_xml = fs.readFileSync(__dirname + '/data/template.xml').toString("utf-8");
    template_xml = template_xml.replace('{{geojson}}',geojson);
    map.fromString(template_xml, {strict:true, base:__dirname}, function(err,map) {
        if (err) return cb(err);
        try {
            map.zoomAll();
            var e = map.extent;
            // inflate bbox slightly in order to show single points
            var pad = 1;
            map.extent = [e[0]-pad,e[1]-pad,e[2]+pad,e[3]+pad];
            map.render(im,opts,cb);
        } catch (err) {
            return cb(err);
        }
    });
}

function generates(t, retina, name) {
    t.test(name, function(t) {
        var file_path = __dirname + '/data/' + name + '.geojson';
        generatexml(JSON.parse(fs.readFileSync(file_path)), retina, function(err, xml) {
            t.equal(err, null, name + ' no error returned');
            t.pass('is generated');
            if (process.env.UPDATE) {
                fs.writeFileSync(__dirname + '/data/' + name + '.xml', xml);
            }
            t.equal(
                normalize(xml),
                normalize(fs.readFileSync(__dirname + '/data/' + name + '.xml', 'utf8')), name);
            render(xml, function(err,im) {
                if (err) throw err;
                var expected_image = file_path + '.png';
                if (process.env.UPDATE) {
                    im.save(expected_image,"png32");
                }
                t.equal(0,im.compare(new mapnik.Image.open(expected_image)));
                var opts = {};
                if (file_path.indexOf('retina') > -1) {
                    // TODO - pass 2x for retina?
                    // will need to adapt template
                    // or just replace `marker-size` with actual pixels
                    //opts.scale = 2;
                }
                render3(file_path, opts, function(err,im2) {
                    if (err) throw err;
                    var expected_image2 = file_path + '2.png';
                    if (process.env.UPDATE) {
                        im2.save(expected_image2,"png32");
                    }
                    t.equal(0,im2.compare(new mapnik.Image.open(expected_image2)));
                    t.end();
                })
            });
        });
    });
}

test('generatexml', function(t) {
    generates(t, false, 'example');
    generates(t, false, 'point');
    generates(t, true, 'point-retina');
    generates(t, true, 'dedup');
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
