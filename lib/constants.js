var PROJ = "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0.0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs +over";
module.exports.WGS84 = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
module.exports.HEADER = '<?xml version="1.0" encoding="utf-8"?>' +
    '<Map srs="' + PROJ + '">';
module.exports.FOOTER = '</Map>';
