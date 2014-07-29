var normalize = require('geojson-normalize'),
    strxml = require('strxml'),
    xtend = require('xtend'),
    makizushi = require('makizushi'),
    queue = require('queue-async'),
    path = require('path'),
    fs = require('fs'),
    sigmund = require('sigmund'),
    typedDefaults = require('./lib/defaults'),
    cachepath = require('./lib/cachepath'),
    loadURL = require('./lib/urlmarker'),
    constants = require('./lib/constants'),
    collectSymbolizers = require('./lib/collectsymbolizers');

var tagClose = strxml.tagClose,
    tag = strxml.tag;

module.exports = function generateXML(data, retina, callback) {
    var gj = normalize(data),
        q = queue(1),
        styleCache = {};

    if (!gj) return callback(new Error('invalid GeoJSON'));

    gj.features.forEach(function(feat, i) {
        q.defer(convertFeature, feat, retina, i, styleCache);
    });

    q.awaitAll(done);

    function done(err, ls) {
        if (err) return callback(err);
        return callback(null, constants.HEADER +
            ls.map(function(_) { return _.style; }).join('\n') +
            ls.map(function(_) { return _.layer; }).join('\n') +
            constants.FOOTER);
    }
};

function convertFeature(feature, retina, i, styleCache, callback) {
    generateStyle(feature, retina, i, styleCache, function(err, style, styleId) {
        if (err) return callback(err);
        return callback(null, {
            style: style,
            layer: generateLayer(feature, i, styleId)
        });
    });
}

function generateStyle(feature, retina, i, styleCache, callback) {
    if (!feature.geometry) return callback(null, '');

    var key = cacheKey(retina, feature.properties, feature.geometry.type);

    if (styleCache[key] !== undefined) {
        return callback(null, null, styleCache[key]);
    } else {
        styleCache[key] = i;
    }

    var defaults = typedDefaults[feature.geometry.type] || {},
        props = pairs(xtend({}, defaults, feature.properties || {}));

    var symbolizerGroups = props.reduce(collectSymbolizers, {}),
        resources = [];

    if (retina &&
        symbolizerGroups.LineSymbolizer &&
        symbolizerGroups.LineSymbolizer['stroke-width']) {
        symbolizerGroups.LineSymbolizer['stroke-width'] *= 2;
    }

    if (feature.geometry.type === 'Point' ||
        feature.geometry.type === 'MultiPoint') {
        if (markerURL(feature)) {

            var path = cachepath(markerURL(feature)) + '.png';

            var written = function(err) {
                if (err) return callback(err);
                callback(null, makeStyle(tagClose('PointSymbolizer', [
                    ['file', path],
                    ['allow-overlap', 'true'],
                    ['ignore-placement', 'true']
                ])), i);
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

        } else {
            getMarker(feature, retina, function(err, path) {
                if (err) return callback(err);
                callback(null, makeStyle(tagClose('PointSymbolizer', [
                    ['file', path],
                    ['allow-overlap', 'true'],
                    ['ignore-placement', 'true']
                ])), i);
            });
        }
    } else {
        return callback(null, makeStyle(''), i);
    }

    function makeStyle(markerString) {
        return tag('Style',
            tag('Rule',
            pairs(symbolizerGroups)
                .sort(function(symbolizer) {
                    if (symbolizer[0] === 'PointSymbolizer') return 0;
                    if (symbolizer[0] === 'LineSymbolizer') return 1;
                    if (symbolizer[0] === 'PolygonSymbolizer') return 2;
                })
                .map(function(symbolizer) {
                    return tagClose(symbolizer[0], pairs(symbolizer[1]));
                }).join('\n') + markerString),
                [['name', 'style-' + i]]);
    }
}

function getMarker(feature, retina, callback) {
    var fp = feature.properties || {},
        size = (fp['marker-size'] || 'm')[0],
        symbol = (fp['marker-symbol']) ? fp['marker-symbol'] : '',
        color = (fp['marker-color'] || '7e7e7e').replace('#', '');

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
        if (err) return callback(err);
        else callback(null, path);
    }
}

function generateLayer(feature, i, styleId) {
    if (!feature.geometry) return null;
    return tag('Layer',
        tag('StyleName', 'style-' + styleId) +
        tag('Datasource',
            [
                ['type', 'csv'],
                ['inline', "geojson\n'" + JSON.stringify(feature.geometry) + "'"]
            ].map(function(a) {
                return tag('Parameter', a[1], [['name', a[0]]]);
            }).join('\n')), [
                ['name', 'layer-' + i],
                ['srs', constants.WGS84]
            ]);
}

function pairs(o) {
    return Object.keys(o).map(function(k) {
        return [k, o[k]];
    });
}

function markerURL(feature) {
    return (feature.properties || {})['marker-url'];
}

function cacheKey(retina, properties, type) {
    return retina + sigmund(properties) + type;
}
