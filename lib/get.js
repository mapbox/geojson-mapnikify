var xtend = require('xtend'),
    url = require('url'),
    request = require('request'),
    agent = new (require('agentkeepalive'))({
        maxSockets: 128,
        maxKeepAliveRequests: 0,
        maxKeepAliveTime: 30000
    });

module.exports = get;

/**
 * @param {string} uri
 * @param {function} callback
 */
function get(uri, key, callback) {

    // This might load the same file multiple times, but the overhead should
    // be very little.
    request({
        uri: uri,
        timeout: 5000,
        headers: { 'accept-encoding': 'binary' },
        encoding: 'binary',
        // Don't use keepalive agent for https.
        agent: uri.indexOf('https') === 0 ? null : agent
    }, function(err, resp, data) {
        // Use err.status of 400 as it's not an unexpected application error,
        // but likely due to a bad request. Catches ECONNREFUSED,
        // getaddrinfo ENOENT, etc.
        if (err || !data || !resp || resp.statusCode != 200) {
            return callback('Unable to load marker from URL.');
        }

        // request 2.2.x *always* returns the response body as a string.
        // @TODO remove this once request is upgraded.
        if (!(data instanceof Buffer)) data = new Buffer(data, 'binary');

        // Restrict data length.
        if (data.length > 32768) return callback(400);

        var headers = resp.headers;

        callback(null, data);
    });
}
