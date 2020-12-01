[![Build Status](https://travis-ci.com/mapbox/geojson-mapnikify.svg?branch=master)](https://travis-ci.com/mapbox/geojson-mapnikify)
[![Coverage Status](https://coveralls.io/repos/mapbox/geojson-mapnikify/badge.png)](https://coveralls.io/r/mapbox/geojson-mapnikify)
[![Code Climate](https://codeclimate.com/github/mapbox/geojson-mapnikify/badges/gpa.svg)](https://codeclimate.com/github/mapbox/geojson-mapnikify)

# geojson-mapnikify

Transform [GeoJSON](http://geojson.org/) objects into [Mapnik](http://mapnik.org/)
XML stylesheets with embedded GeoJSON data and [simplestyle-spec](https://github.com/mapbox/simplestyle-spec)-derived
styles.

## install

As a dependency:

    npm install --save @mapbox/geojson-mapnikify

As a binary:

    npm install -g @mapbox/geojson-mapnikify

## api

Assumptions:

* GeoJSON is valid, and in EPSG:4326
* Styles, if any, are expressed in simplestyle-spec
* Mapnik **3.x** is the rendering engine

## binary

If you install `-g`, you can use `geojson-mapnikify` as a binary that takes
a single GeoJSON file as an argument and writes a Mapnik XML stylesheet
to stdout.

```
$ geojson-mapnikify test/data/point-retina.geojson > stylesheet.xml
$ geojson-mapnikify test/data/point-retina.geojson retina > stylesheet-retina.xml
```

### `mapnikify(geojson, retina, callback)`

Transform GeoJSON into Mapnik XML.

* `geojson` is a GeoJSON object.
* `retina` is true or false for whether the style should be optimized for 2x rendering.
* `callback` called with `(err, xml)` where xml is a string

### url markers

If your GeoJSON object has one or more features with a `marker-url` property, `mapnikify()` will write the images found at the url into a file in a temporary directory and use that path in the Mapnik XML. This uses the [needle library](https://www.npmjs.com/package/needle) to handle the http file fetching.

By default the request will attempt to fetch binary data from the specified url. Mapnikify will use [agentkeepalive](https://www.npmjs.com/package/agentkeepalive) to speed up requesting multiple images. There is also a default timeout of 5 seconds.

You can customize the defaults passed to `needle()` . Simply set a custom wrapper defined with `needle.defaults` . See [needle's documentation on defaults](https://www.npmjs.com/package/needle#overriding-defaults) for more information. For a quick example, this will set a longer timeout:

```javascript
var mapnikify = require('mapnikify');
var myRequest = require('needle').defaults({
  timeout: 10000,
  followRedirect: false
});
mapnikify.setRequestClient(myRequest);

mapnikify(geojson, retina, callback);

mapnikify.setRequestClient(null); // return to mapnikify defaults
```
