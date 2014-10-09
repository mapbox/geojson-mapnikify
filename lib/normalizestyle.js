module.exports = normalizeStyle;

var hexcolor = /^#?([0-f]{3}|[0-f]{6})$/;
var markersize = /^(small|medium|large)$/

var typed = {
    LineString: normalizeFilled,
    MultiLineString: normalizeFilled,
    Polygon: normalizeFilled,
    MultiPolygon: normalizeFilled,
    Point: normalizePoint
};

function normalizeStyle(feature) {
    if (!feature || !feature.properties || !feature.geometry || !typed[feature.geometry.type]) {
        return feature;
    }
    feature.properties = typed[feature.geometry.type](feature.properties);
    return feature;
}

function normalizeFilled(properties) {
    if (!hexcolor.test(properties.stroke)) delete properties.stroke;
    if (properties.stroke && properties.stroke[0] !== '#') properties.stroke = '#' + properties.stroke;
    if (isNaN(properties['stroke-width'])) delete properties['stroke-width'];
    if (isNaN(properties['stroke-opacity'])) delete properties['stroke-opacity'];

    if (!hexcolor.test(properties.fill)) delete properties.fill;
    if (properties.fill && properties.fill[0] !== '#') properties.fill = '#' + properties.fill;
    if (isNaN(properties['fill-opacity'])) delete properties['fill-opacity'];

    return properties;
}

function normalizePoint(properties) {
    if (!markersize.test(properties['marker-size'])) delete properties['marker-size'];
    if (!hexcolor.test(properties['marker-color'])) delete properties['marker-color'];
    if (properties['marker-color'] && properties['marker-color'][0] !== '#') properties['marker-color'] = '#' + properties['marker-color'];
    return properties;
}

