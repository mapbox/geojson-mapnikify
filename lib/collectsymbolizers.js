var styleMap = {
    'stroke': ['LineSymbolizer', 'stroke'],
    'stroke-opacity': ['LineSymbolizer', 'stroke-opacity'],
    'stroke-width': ['LineSymbolizer', 'stroke-width'],
    'fill': ['PolygonSymbolizer', 'fill'],
    'fill-opacity': ['PolygonSymbolizer', 'fill-opacity']
};

/**
 * @param {object} mem
 * @param {array} prop
 * @returns {object}
 */
module.exports = function collectSymbolizers(mem, prop) {
    var mapped = styleMap[prop[0]];
    if (mapped) {
        if (!mem[mapped[0]]) mem[mapped[0]] = {};
        mem[mapped[0]][mapped[1]] = prop[1];
    }
    return mem;
};
