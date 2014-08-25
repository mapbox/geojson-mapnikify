var test = require('tape'),
    fs = require('fs'),
    defaults = require('../lib/defaults.js');

test('defaults', function(t) {
    t.deepEqual(defaults({
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [0, 0]
        },
        properties: {}
    }),
    {
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [0, 0]
        },
        properties: {
          "marker-color" : "7e7e7e",
          "marker-size" : "medium",
          "symbol" : "-"
        }
    }
    , 'point');


    t.deepEqual(defaults({
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [0, 0]
        },
        properties: {
            'marker-color': '#f00'
        }
    }),
    {
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [0, 0]
        },
        properties: {
          "marker-color" : "#f00",
          "marker-size" : "medium",
          "symbol" : "-"
        }
    }
    , 'point');

    t.deepEqual(defaults({
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [0, 0]
        },
        properties: {
            'marker-size': 'small'
        }
    }),
    {
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [0, 0]
        },
        properties: {
          "marker-color" : "7e7e7e",
          "marker-size" : "small",
          "symbol" : "-"
        }
    }
    , 'point');

    t.deepEqual(defaults({
        type: 'Feature',
        geometry: {
            type: 'LineString',
            coordinates: [[0, 0], [20, 20]]
        },
        properties: {
        }
    }),
    {
        type: 'Feature',
        geometry: {
            type: 'LineString',
            coordinates: [[0, 0], [20, 20]]
        },
        properties: {
          "stroke" : "#555555", // != undefined
          "stroke-width" : 2, // != undefined
          "stroke-opacity" : 1 // != undefined
        }
    }
    , 'linestring');

    t.deepEqual(defaults({
        type: 'Feature',
        geometry: {
            type: 'Polygon',
            coordinates: [[[0, 0], [20, 20]]]
        },
        properties: {
        }
    }),
    {
        type: 'Feature',
        geometry: {
            type: 'Polygon',
            coordinates: [[[0, 0], [20, 20]]]
        },
        properties: {
          "fill" : "#555555", // != undefined
          "fill-opacity" : 0.6 // != undefined
        }
    }
    , 'polygon');

    t.end();
});
