var defaultFilled = {
    fill: '#555555',
    'fill-opacity': 0.6
};

var defaultStroked = {
    stroke: '#555555',
    'stroke-width': 2,
    'stroke-opacity': 1,
};

module.exports = {
    LineString: defaultStroked,
    MultiLineString: defaultStroked,
    Polygon: defaultFilled,
    MultiPolygon: defaultFilled
};
