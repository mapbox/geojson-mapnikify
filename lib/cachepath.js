var crypto = require('crypto'),
    tmpdir = require('os').tmpdir(),
    path = require('path');

module.exports = function(str) {
    var md5 = crypto.createHash('md5');
    md5.update(str);
    return path.join(tmpdir, 'geojson-mapnikify-' + md5.digest('hex'));
};
