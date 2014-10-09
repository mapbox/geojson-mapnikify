var test = require('tape');
var normalizeStyle = require('../lib/normalizestyle.js');

test('normalizeStyle point', function(t) {
    function checkPoint(properties, expected, message) {
        t.deepEqual(normalizeStyle({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [0, 0] },
            properties: properties,
        }).properties, expected, message);
    }
    checkPoint({ 'marker-size': 'HUGE' }, {}, 'point: marker-size HUGE => undefined');
    checkPoint({ 'marker-size': 'small' }, { 'marker-size': 'small' }, 'point: marker-size small => small');
    checkPoint({ 'marker-color': 'red' }, {}, 'point: marker-color red => undefined');
    checkPoint({ 'marker-color': 'ffff' }, {}, 'point: marker-color ffff => undefined');
    checkPoint({ 'marker-color': '' }, {}, 'point: marker-color "" => undefined');
    checkPoint({ 'marker-color': '#ff0000' }, { 'marker-color': '#ff0000' }, 'point: marker-color #ff0000 => #ff0000');
    checkPoint({ 'marker-color': 'ff0000' }, { 'marker-color': '#ff0000' }, 'point: marker-color ff0000 => #ff0000');
    checkPoint({ 'marker-color': '#f00' }, { 'marker-color': '#f00' }, 'point: marker-color #f00 => #f00');
    checkPoint({ 'marker-color': 'f00' }, { 'marker-color': '#f00' }, 'point: marker-color f00 => #f00');
    t.end();
});

test('normalizeStyle fill', function(t) {
    function checkFill(properties, expected, message) {
        t.deepEqual(normalizeStyle({
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: [[0, 0]] },
            properties: properties,
        }).properties, expected, message);
    }

    checkFill({ 'stroke': 'red' }, {}, 'fill: stroke red => undefined');
    checkFill({ 'stroke': 'ffff' }, {}, 'fill: stroke ffff => undefined');
    checkFill({ 'stroke': '' }, {}, 'fill: stroke "" => undefined');
    checkFill({ 'stroke': '#ff0000' }, { 'stroke': '#ff0000' }, 'fill: stroke #ff0000 => #ff0000');
    checkFill({ 'stroke': 'ff0000' }, { 'stroke': '#ff0000' }, 'fill: stroke ff0000 => #ff0000');
    checkFill({ 'stroke': '#f00' }, { 'stroke': '#f00' }, 'fill: stroke #f00 => #f00');
    checkFill({ 'stroke': 'f00' }, { 'stroke': '#f00' }, 'fill: stroke f00 => #f00');
    checkFill({ 'stroke-width': 'red' }, {}, 'fill: stroke-width red => undefined');
    checkFill({ 'stroke-width': 1.5 }, { 'stroke-width': 1.5 }, 'fill: stroke-width 1.5 => 1.5');
    checkFill({ 'stroke-width': '1.5' }, { 'stroke-width': 1.5 }, 'fill: stroke-width "1.5" => 1.5');
    checkFill({ 'stroke-opacity': 'red' }, {}, 'fill: stroke-opacity red => undefined');
    checkFill({ 'stroke-opacity': 0.5 }, { 'stroke-opacity': 0.5 }, 'fill: stroke-opacity 0.5 => 0.5');
    checkFill({ 'stroke-opacity': '0.5' }, { 'stroke-opacity': 0.5 }, 'fill: stroke-opacity "0.5" => 0.5');

    checkFill({ 'fill': 'red' }, {}, 'fill: fill red => undefined');
    checkFill({ 'fill': 'ffff' }, {}, 'fill: fill ffff => undefined');
    checkFill({ 'fill': '' }, {}, 'fill: fill "" => undefined');
    checkFill({ 'fill': '#ff0000' }, { 'fill': '#ff0000' }, 'fill: fill #ff0000 => #ff0000');
    checkFill({ 'fill': 'ff0000' }, { 'fill': '#ff0000' }, 'fill: fill ff0000 => #ff0000');
    checkFill({ 'fill': '#f00' }, { 'fill': '#f00' }, 'fill: fill #f00 => #f00');
    checkFill({ 'fill': 'f00' }, { 'fill': '#f00' }, 'fill: fill f00 => #f00');
    checkFill({ 'fill-opacity': 'red' }, {}, 'fill: fill-opacity red => undefined');
    checkFill({ 'fill-opacity': 0.5 }, { 'fill-opacity': 0.5 }, 'fill: fill-opacity 0.5 => 0.5');
    checkFill({ 'fill-opacity': '0.5' }, { 'fill-opacity': 0.5 }, 'fill: fill-opacity "0.5" => 0.5');


    t.end();
});
