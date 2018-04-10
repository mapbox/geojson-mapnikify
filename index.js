var normalize = require('@mapbox/geojson-normalize'),
    makizushi = require('@mapbox/makizushi'),
    queue = require('queue-async'),
    path = require('path'),
    fs = require('fs'),
    sigmund = require('sigmund'),
    enforceDefaults = require('./lib/defaults.js'),
    normalizeStyle = require('./lib/normalizestyle.js'),
    cachepath = require('./lib/cachepath.js'),
    loadURL = require('./lib/urlmarker.js'),
    get = require('./lib/get.js');

var template = fs.readFileSync(__dirname + '/lib/template.xml', 'utf8');

module.exports = generateXML;

function generateXML(data, retina, callback) {
    var gj = normalize(data),
        q = queue(1);

    if (!gj) return callback(new Error('invalid GeoJSON'));

    for (var i = 0; i < gj.features.length; i++) {
        gj.features[i] = !markerURL(gj.features[i]) ? enforceDefaults(normalizeStyle(gj.features[i])) : normalizeStyle(gj.features[i]);
    }

    gj.features.filter(isPoint).forEach(function(feat, i) {
        if (markerURL(feat)) {
            q.defer(getRemote, feat, retina);
        } else {
            q.defer(getMarker, feat, retina);
        }
    });

    q.awaitAll(done);

    function done(err, ls) {
        if (err) return callback(err);
        return callback(null,
            template.replace('{{geojson}}', JSON.stringify(gj)));
    }
}

function getRemote(feature, retina, callback) {
    var path = cachepath(markerURL(feature) + feature.properties['marker-color']) + '.png';

    var written = function(err) {
        if (err) return callback(err);
        feature.properties['marker-path'] = path;
        callback(null, path);
    };

    fs.exists(path, function(exists) {
        if (exists) {
            return written(null);
        } else {
            loadURL(feature, function urlLoaded(err, data) {
                if (err) return callback(err);
                fs.writeFile(path, data, written);
            });
        }
    });
}

function getMarker(feature, retina, callback) {
    var fp = feature.properties || {},
        size = fp['marker-size'][0],
        symbol = fp['marker-symbol'] ? fp['marker-symbol'] : '',
        color = fp['marker-color'].replace('#', '');

    var options = {
        tint: color,
        base: 'pin',
        symbol: symbol,
        retina: retina,
        size: size
    };

    var path = cachepath(JSON.stringify(options)) + '.png';

    fs.exists(path, function(exists) {
        if (exists) {
            feature.properties['marker-path'] = path;
            return callback(null, path);
        } else {
            makizushi(options, rendered);
        }
    });

    function rendered(err, data) {
        if (err) return callback(err);
        fs.writeFile(path, data, written);
    }

    function written(err) {
        if (err) {
            return callback(err);
        } else {
            feature.properties['marker-path'] = path;
            callback(null, path);
        }
    }
}

function isPoint(feature) {
    return feature.geometry &&
        (feature.geometry.type === 'Point' ||
         feature.geometry.type === 'MultiPoint');
}

function markerURL(feature) {
    return (feature.properties || {})['marker-url'];
}

function setRequestClient(requestClient){
    get.requestClient = requestClient;
}

module.exports.setRequestClient = setRequestClient;
