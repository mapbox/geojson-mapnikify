var get = require('./get'),
    constants = require('./constants'),
    blend = require('@mapbox/blend');

/**
 * Load an image from a URL for use as a custom marker.
 *
 * @param {object} options
 * @param {function} callback
 */
module.exports = function(feature, callback) {
    if (!feature.properties) return callback(new Error('Invalid feature'));
    var uri = feature.properties['marker-url'];
    var tint = feature.properties['marker-color'];

    if (tint) {
        // Remove the "#" added by normalizeStyle
        tint = tint.substring(1);

        // Expand hex shorthand (3 chars) to 6, e.g. 333 => 333333.
        // This is not done upstream in `node-tint` as some such
        // shorthand cannot be disambiguated from other tintspec strings,
        // e.g. 123 (rgb shorthand) vs. 123 (hue).
        if (tint.length === 3) tint =
            tint[0] + tint[0] +
            tint[1] + tint[1] +
            tint[2] + tint[2];
        var parsedTint = blend.parseTintString(tint);
    }

    if (uri.substring(0, 4) !== 'http') {
        uri = 'http://' + uri;
    }

    get(uri, function(err, data) {
        if (err) return callback(err);

        // Check for PNG header.
        if (data.toString('binary', 0, 8) !== '\x89\x50\x4E\x47\x0D\x0A\x1A\x0A') {
            return callback({
                message: 'Marker image format is not supported.',
                status: 415
            });
        }

        // Extract width and height from the IHDR. The IHDR chunk must appear
        // first, so the location is always fixed.
        var width = data.readUInt32BE(16),
            height = data.readUInt32BE(20);

        // Check image size. 400x400 square limit.
        if (width * height > constants.MARKER_MAX_SQUARE_PIXELS) {
            return callback({
                message: 'Marker image size must not exceed ' + constants.MARKER_MAX_SQUARE_PIXELS + ' pixels.',
                status: 415
            });
        }

        if (!parsedTint) {
            return callback(null, data);
        }

        blend([{
            buffer:data,
            tint: parsedTint
        }], {}, function(err, tinted) {
            if (err) return callback(err);
            return callback(null, tinted);
        });
    });
};
