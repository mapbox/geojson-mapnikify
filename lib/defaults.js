var xtend = require('xtend');

var defaultFilled = {
    fill: '#555555',
    'fill-opacity': 0.6,
    stroke: '#555555',
    'stroke-width': 2,
    'stroke-opacity': 1
};

var defaultStroked = {
    stroke: '#555555',
    'stroke-width': 2,
    'stroke-opacity': 1
};

var defaultPoint = {
    'marker-color': '7e7e7e',
    'marker-size': 'medium',
    'symbol': '-'
};

var typed = {
    LineString: defaultStroked,
    MultiLineString: defaultStroked,
    Polygon: defaultFilled,
    MultiPolygon: defaultFilled,
    Point: defaultPoint,
    MultiPoint: defaultPoint
};

module.exports = enforceDefaults;

function enforceDefaults(feature) {
    if (!feature || !feature.properties || !feature.geometry) {
        return feature;
    }
    var def = typed[feature.geometry.type];
    feature.properties = xtend({}, def, feature.properties);
    return feature;
}
