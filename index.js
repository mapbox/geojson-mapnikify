var normalize = require('geojson-normalize'),
    strxml = require('strxml'),
    xtend = require('xtend'),
    makizushi = require('makizushi'),
    queue = require('queue-async'),
    typedDefaults = require('./lib/defaults'),
    cachepath = require('./lib/cachepath'),
    loadURL = require('./lib/urlmarker'),
    path = require('path'),
    fs = require('fs'),
    constants = require('./lib/constants');

var tagClose = strxml.tagClose,
    tag = strxml.tag;

var styleMap = {
    'stroke': ['LineSymbolizer', 'stroke'],
    'stroke-opacity': ['LineSymbolizer', 'stroke-opacity'],
    'stroke-width': ['LineSymbolizer', 'stroke-width'],
    'fill': ['PolygonSymbolizer', 'fill'],
    'fill-opacity': ['PolygonSymbolizer', 'fill-opacity']
};

/**
 * @param {object} data a geojson object
 * @returns {string} a mapnik style
 */
module.exports = function generateXML(data, retina, callback) {
    var gj = normalize(data);
    if (!gj) return null;

    var q = queue(1);

    gj.features.forEach(function(feat, i) {
        q.defer(convertFeature, feat, retina, i);
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

/**
 * @param {object} feature
 * @returns {string}
 */
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

    makizushi(options, rendered);
    function rendered(err, data) {
        if (err) return callback(err);
        fs.writeFile(path, data, written);
    }
    function written(err) {
        if (err) return callback(err);
        else callback(null, path);
    }
}

/**
 * @param {object} feature
 * @returns {string}
 */
function markerURL(feature) {
    return (feature.properties || {})['marker-url'];
}

/**
 * @param {object} feature geojson feature
 * @returns {object}
 */
function convertFeature(feature, retina, i, callback) {
    generateStyle(feature, i, retina, styled);

    function styled(err, style) {
        if (err) return callback(err);
        return callback(null, {
            style: style,
            layer: generateLayer(feature, i)
        });
    }
}


/**
 * @param {object} feature geojson feature
 * @returns {string}
 */
function generateStyle(feature, i, retina, callback) {
    var defaults = typedDefaults[feature.geometry.type] || {},
        props = pairs(xtend({}, defaults, feature.properties || {})),
        symbolizerGroups = props.reduce(collectSymbolizers, {}),
        resources = [];

    if (retina &&
        symbolizerGroups.LineSymbolizer &&
        symbolizerGroups.LineSymbolizer['stroke-width']) {
        symbolizerGroups.LineSymbolizer['stroke-width'] *= 2;
    }


    if (feature.geometry.type === 'Point' ||
        feature.geometry.type === 'MultiPoint') {
        if (markerURL(feature)) {
            loadURL(feature, function urlLoaded(err, data) {
                if (err) return callback(err);
                var path = cachepath(markerURL(feature)) + '.png';
                fs.writeFile(path, data, function written(err) {
                    if (err) return callback(err);
                    callback(null, makeStyle(tagClose('PointSymbolizer', [
                        ['file', path],
                        ['allow-overlap', 'true']
                    ])));
                });
            });
        } else {
            getMarker(feature, retina, function(err, path) {
                if (err) return callback(err);
                callback(null, makeStyle(tagClose('PointSymbolizer', [
                    ['file', path],
                    ['allow-overlap', 'true']
                ])));
            });
        }
    } else {
        return callback(null, makeStyle(''));
    }

    function makeStyle(markerString) {
        return tag('Style',
            tag('Rule',
            pairs(symbolizerGroups)
                .map(function(symbolizer) {
                    return tagClose(symbolizer[0], pairs(symbolizer[1]));
                }).join('\n') + markerString),
                [['name', 'style-' + i]]);
    }
}

/**
 * @param {object} mem
 * @param {array} prop
 * @returns {object}
 */
function collectSymbolizers(mem, prop) {
    var mapped = styleMap[prop[0]];
    if (mapped) {
        if (!mem[mapped[0]]) mem[mapped[0]] = {};
        mem[mapped[0]][mapped[1]] = prop[1];
    }
    return mem;
}

/**
 * @param {object} feature geojson feature
 * @returns {string}
 */
function generateLayer(feature, i) {
    if (!feature.geometry) return null;
    return tag('Layer',
        tag('StyleName', 'style-' + i) +
        tag('Datasource',
            [
                ['type', 'ogr'],
                ['layer_by_index', '0'],
                ['driver', 'GeoJson'],
                ['string', JSON.stringify(feature.geometry)]
            ].map(function(a) {
                return tag('Parameter', a[1], [['name', a[0]]]);
            }).join('\n')), [
                ['name', 'layer-' + i],
                ['srs', constants.WGS84]
            ]);
}

/**
 * @param {object} o
 * @returns {array}
 */
function pairs(o) {
    return Object.keys(o).map(function(k) {
        return [k, o[k]];
    });
}
